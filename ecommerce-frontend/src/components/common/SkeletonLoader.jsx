import React from "react";

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-slate-700 animate-shimmer space-y-3">
      <div className="w-full h-48 bg-gray-200 dark:bg-slate-700 rounded-md"></div>
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
      </div>
    </div>
  );
};

export const TableRowSkeleton = ({ columns = 5 }) => {
  return (
    <tr className="animate-shimmer border-b border-gray-100 dark:border-slate-800">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
        </td>
      ))}
    </tr>
  );
};
