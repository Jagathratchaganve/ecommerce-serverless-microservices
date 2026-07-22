const fs = require("fs");
const path = require("path");
const { spawn, execSync } = require("child_process");

const rootDir = __dirname;
const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";
const isCoverageMode = process.argv.includes("--coverage");

// Helper to parse coverage final json and calculate percentage
function getCoverageStats(coverageJsonPath) {
  if (!fs.existsSync(coverageJsonPath)) {
    return null;
  }
  try {
    const data = JSON.parse(fs.readFileSync(coverageJsonPath, "utf8"));
    let totalStmts = 0, coveredStmts = 0;
    let totalFns = 0, coveredFns = 0;
    let totalBranches = 0, coveredBranches = 0;
    let totalLines = 0, coveredLines = 0;

    for (const file of Object.values(data)) {
      // Statements
      const stmts = file.statementMap;
      const s = file.s;
      totalStmts += Object.keys(stmts).length;
      coveredStmts += Object.values(s).filter(count => count > 0).length;

      // Functions
      const fns = file.fnMap;
      const f = file.f;
      totalFns += Object.keys(fns).length;
      coveredFns += Object.values(f).filter(count => count > 0).length;

      // Branches
      const branches = file.branchMap;
      const b = file.b;
      for (const [branchId, branchInfo] of Object.entries(branches)) {
        const counts = b[branchId] || [];
        totalBranches += branchInfo.locations.length;
        coveredBranches += counts.filter(count => count > 0).length;
      }

      // Lines
      const lines = {};
      for (const [stmtId, count] of Object.entries(s)) {
        const stmt = stmts[stmtId];
        if (!stmt) continue;
        const lineNum = stmt.start.line;
        if (lines[lineNum] === undefined) {
          lines[lineNum] = 0;
        }
        if (count > 0) {
          lines[lineNum] += count;
        }
      }
      totalLines += Object.keys(lines).length;
      coveredLines += Object.values(lines).filter(c => c > 0).length;
    }

    return {
      statements: totalStmts ? Number((coveredStmts / totalStmts * 100).toFixed(2)) : 100,
      branches: totalBranches ? Number((coveredBranches / totalBranches * 100).toFixed(2)) : 100,
      functions: totalFns ? Number((coveredFns / totalFns * 100).toFixed(2)) : 100,
      lines: totalLines ? Number((coveredLines / totalLines * 100).toFixed(2)) : 100
    };
  } catch (err) {
    console.error("Error parsing coverage stats:", err);
    return null;
  }
}

// Function to run a service's tests and stream output
function runServiceTests(serviceDir, cmd, args) {
  return new Promise((resolve) => {
    const child = spawn(npmCmd, [cmd, ...args], {
      cwd: serviceDir,
      shell: true
    });

    let stdoutData = "";
    let stderrData = "";

    child.stdout.on("data", (data) => {
      const str = data.toString();
      stdoutData += str;
      process.stdout.write(str);
    });

    child.stderr.on("data", (data) => {
      const str = data.toString();
      stderrData += str;
      process.stderr.write(str);
    });

    child.on("close", (code) => {
      resolve({
        code,
        stdout: stdoutData,
        stderr: stderrData
      });
    });
  });
}

async function main() {
  // Discover services
  const items = fs.readdirSync(rootDir);
  const services = [];

  for (const item of items) {
    const itemPath = path.join(rootDir, item);
    if (fs.statSync(itemPath).isDirectory()) {
      const packageJsonPath = path.join(itemPath, "package.json");
      if (fs.existsSync(packageJsonPath)) {
        if (["node_modules", "coverage", ".nyc_output", ".git"].includes(item)) {
          continue;
        }
        services.push(item);
      }
    }
  }
  services.sort();

  console.log(`Discovered ${services.length} backend services: ${services.join(", ")}`);

  const results = [];
  let overallFailed = false;
  let totalTestsCount = 0;
  let totalPassedTests = 0;
  let totalFailedTests = 0;

  for (const service of services) {
    const serviceDir = path.join(rootDir, service);
    console.log(`\n=====================================`);
    console.log(`Testing ${service}`);
    console.log(`=====================================`);

    const cmd = isCoverageMode ? "run" : "test";
    const args = isCoverageMode ? ["coverage"] : [];

    const res = await runServiceTests(serviceDir, cmd, args);
    const passed = res.code === 0;

    if (!passed) {
      overallFailed = true;
    }

    // Parse test counts from output
    const combinedOutput = res.stdout + res.stderr;
    const testRegex = /Tests:\s+(?:(\d+)\s+failed,\s+)?(?:(\d+)\s+passed,\s+)?(\d+)\s+total/;
    const match = combinedOutput.match(testRegex);
    let serviceTotal = 0;
    let serviceFailed = 0;
    let servicePassed = 0;

    if (match) {
      serviceTotal = parseInt(match[3], 10);
      if (match[1]) {
        serviceFailed = parseInt(match[1], 10);
        servicePassed = serviceTotal - serviceFailed;
      } else if (match[2]) {
        servicePassed = parseInt(match[2], 10);
      } else {
        servicePassed = serviceTotal;
      }
    } else {
      // Fallback if no regex match but process failed/succeeded
      serviceTotal = passed ? 1 : 0;
      servicePassed = passed ? 1 : 0;
      serviceFailed = passed ? 0 : 1;
    }

    totalTestsCount += serviceTotal;
    totalPassedTests += servicePassed;
    totalFailedTests += serviceFailed;

    // Read coverage final json
    const coverageJsonPath = path.join(serviceDir, "coverage", "coverage-final.json");
    const stats = getCoverageStats(coverageJsonPath);

    results.push({
      name: service,
      passed,
      stats,
      tests: {
        total: serviceTotal,
        passed: servicePassed,
        failed: serviceFailed
      }
    });

    console.log(`\n${passed ? "PASS" : "FAIL"}`);
    if (stats) {
      console.log(`\nCoverage:`);
      console.log(`Statements: ${stats.statements}%`);
      console.log(`Branches: ${stats.branches}%`);
      console.log(`Functions: ${stats.functions}%`);
      console.log(`Lines: ${stats.lines}%`);
    } else {
      console.log(`\nCoverage: N/A`);
    }
  }

  // Combined coverage consolidation
  let combinedStats = null;
  if (isCoverageMode) {
    console.log(`\n=====================================`);
    console.log(`Consolidating Backend Coverage Reports...`);
    console.log(`=====================================`);

    const combinedCoverage = {};
    for (const service of services) {
      const coverageFinalJsonPath = path.join(rootDir, service, "coverage", "coverage-final.json");
      if (fs.existsSync(coverageFinalJsonPath)) {
        try {
          const data = JSON.parse(fs.readFileSync(coverageFinalJsonPath, "utf8"));
          for (const [filePath, fileCoverage] of Object.entries(data)) {
            combinedCoverage[filePath] = fileCoverage;
          }
        } catch (err) {
          console.error(`Error reading coverage-final.json for ${service}:`, err);
        }
      }
    }

    // Create .nyc_output folder
    const nycOutputDir = path.join(rootDir, ".nyc_output");
    if (!fs.existsSync(nycOutputDir)) {
      fs.mkdirSync(nycOutputDir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(nycOutputDir, "out.json"),
      JSON.stringify(combinedCoverage, null, 2),
      "utf8"
    );

    // Calculate consolidated coverage stats from object
    combinedStats = getCoverageStats(path.join(nycOutputDir, "out.json"));

    // Run nyc report to generate index.html report
    try {
      execSync("npx nyc report --reporter=html --reporter=text-summary --reporter=json-summary --report-dir=coverage", {
        cwd: rootDir,
        stdio: "inherit"
      });
      console.log(`\nConsolidated coverage report successfully generated under:`);
      console.log(`file:///${path.join(rootDir, "coverage", "index.html").replace(/\\/g, "/")}`);
    } catch (err) {
      console.error("Failed to run nyc report to consolidate coverage:", err);
    }
  }

  // Final Summary Output
  console.log(`\n=====================================`);
  console.log(`Backend Summary`);
  console.log(`=====================================`);

  const passedServices = results.filter(r => r.passed).map(r => r.name);
  const failedServices = results.filter(r => !r.passed).map(r => r.name);

  console.log(`Services Passed: ${passedServices.length ? passedServices.join(", ") : "None"}`);
  console.log(`Services Failed: ${failedServices.length ? failedServices.join(", ") : "None"}`);
  console.log(`Total Tests: ${totalTestsCount} (${totalPassedTests} passed, ${totalFailedTests} failed)`);

  if (isCoverageMode && combinedStats) {
    console.log(`Total Coverage:`);
    console.log(`  Statements: ${combinedStats.statements}%`);
    console.log(`  Branches: ${combinedStats.branches}%`);
    console.log(`  Functions: ${combinedStats.functions}%`);
    console.log(`  Lines: ${combinedStats.lines}%`);
  }

  console.log(`=====================================`);

  if (overallFailed) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main().catch(err => {
  console.error("Fatal error running master tests:", err);
  process.exit(1);
});
