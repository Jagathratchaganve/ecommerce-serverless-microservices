import React from "react";

export const StatCard = ({ title, value, icon, change, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800"
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-slate-700/80 shadow-xs flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-black text-gray-900 dark:text-white">{value}</h3>
        {change && (
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
            {change}
          </p>
        )}
      </div>

      <div className={`p-3.5 rounded-xl border ${colors[color] || colors.blue}`}>
        {icon}
      </div>
    </div>
  );
};
