import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Home } from "lucide-react";

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-4 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full mb-4">
        <AlertCircle className="w-16 h-16" />
      </div>
      <h1 className="text-6xl font-black text-gray-900 dark:text-white mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200 mb-2">Page Not Found</h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center bg-[#2874f0] hover:bg-blue-700 text-white font-extrabold px-6 py-3 rounded-lg text-sm shadow-md"
      >
        <Home className="w-4 h-4 mr-2" /> Back to Home
      </Link>
    </div>
  );
};
