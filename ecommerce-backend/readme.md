# 🛒 Serverless E-Commerce Microservices - Backend Testing Guide

A serverless e-commerce backend built using **Node.js** and **AWS** following **Microservices** and **Event-Driven Architecture** principles.

---

## 📂 Project Structure

```text
ecommerce-backend/
├── package.json                   # Root package.json defining testing tasks
├── run-all-backend-tests.js       # Master backend runner (discovered dynamically)
├── auth-service/                  # AWS Cognito & Identity service
├── product-service/               # Product Catalogue manager
├── inventory-service/             # Stock controller
├── cart-service/                  # User cart service
├── order-service/                 # Order checkout service
├── payment-service/               # Payment log manager
├── inventory-consumer/            # SQS stock consumer
└── email-consumer/                # SQS email dispatcher
```

---

## 🛠️ Root Commands (All Services)

You can execute testing tasks globally across all 8 microservices/consumers from the root `ecommerce-backend` directory.

### 1. Install Dependencies
Before running tests, ensure you have installed the root packages (including `nyc` for reporting):
```bash
npm install
```

### 2. Run All Tests
To run tests sequentially across all backend services:
```bash
npm test
```
This script dynamically discovers all folders with a `package.json`, runs `npm test` inside each, parses test counts, and shows a clean PASS/FAIL summary for each service.

### 3. Generate Consolidated Coverage
To execute tests and output a single consolidated backend coverage folder:
```bash
npm run coverage
```
This runs the coverage suites in each service, merges their raw `coverage-final.json` reports using `nyc`, and compiles a unified report under `ecommerce-backend/coverage/`.

---

## 📊 Viewing Consolidated HTML Coverage

After running `npm run coverage`, you can open the consolidated HTML report in any web browser:

- **Location**: `ecommerce-backend/coverage/index.html`
- **Command (Windows)**: `start coverage/index.html`
- **Command (macOS)**: `open coverage/index.html`

The report shows a merged view of statements, branches, functions, and lines across all microservices.

---

## 📦 Running a Single Service

If you are developing inside a single microservice, you can run commands locally inside that directory:

```bash
# Navigate to the service folder
cd product-service

# Run tests
npm test

# Generate local coverage report
npm run coverage
```

---

## 🔧 Troubleshooting

### 1. `Error: spawn EINVAL` on Windows
The master runner uses `shell: true` inside child processes to properly execute `npm.cmd` wrapper scripts on Windows. If you run into spawning issues, ensure `npm` is added to your system path.

### 2. AWS SDK Mock Warnings / Timeout Logs
When running tests, you may see simulated console errors (e.g. `HTTP Call to Inventory Service failed` or `DynamoDB update error`). These are expected output logs from test cases specifically testing error handling, fallbacks, and mock exception pathways. They do not indicate a failing test suite.

### 3. Missing Coverage Data
Ensure that all services have successfully run their coverage tests and created a local `coverage/coverage-final.json` file. If the file is missing for a service, its metrics will be skipped during consolidation.