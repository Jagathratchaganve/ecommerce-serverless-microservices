import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, Home } from "lucide-react";

export const ForbiddenPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-4 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-full mb-4">
        <ShieldAlert className="w-16 h-16" />
      </div>
      <h1 className="text-6xl font-black text-gray-900 dark:text-white mb-2">403</h1>
      <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200 mb-2">Access Forbidden</h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 max-w-md">
        You do not have the required administrator privileges to view this section.
      </p>
      <Link
        to="/"
        className="inline-flex items-center bg-[#2874f0] hover:bg-blue-700 text-white font-extrabold px-6 py-3 rounded-lg text-sm shadow-md"
      >
        <Home className="w-4 h-4 mr-2" /> Return to Store
      </Link>
    </div>
  );
};
