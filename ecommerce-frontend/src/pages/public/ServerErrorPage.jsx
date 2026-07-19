import React from "react";
import { Link } from "react-router-dom";
import { ServerCrash, RefreshCw } from "lucide-react";

export const ServerErrorPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-4 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full mb-4">
        <ServerCrash className="w-16 h-16" />
      </div>
      <h1 className="text-6xl font-black text-gray-900 dark:text-white mb-2">500</h1>
      <h2 className="text-xl font-bold text-gray-800 dark:text-slate-200 mb-2">Internal Backend Error</h2>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 max-w-md">
        Unable to communicate with serverless microservices. Please check if your local backend services are running.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3 rounded-lg text-sm shadow-md"
      >
        <RefreshCw className="w-4 h-4 mr-2" /> Retry Connection
      </button>
    </div>
  );
};
