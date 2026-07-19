import React from "react";
import { User, Mail, ShieldCheck, Key, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export const ProfilePage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/80 shadow-md p-8 text-center space-y-4">
        
        {/* User Avatar */}
        <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-4xl font-black mx-auto shadow-lg">
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>

        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            {user?.name || "Valued User"}
          </h2>
          <p className="text-xs font-semibold text-gray-400 mt-0.5">{user?.email}</p>
          <span className="inline-block mt-2 bg-yellow-400 text-blue-950 text-xs font-black px-3 py-0.5 rounded-full uppercase tracking-wider">
            {user?.role || "User"}
          </span>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-slate-700 text-left">
          
          <div className="p-4 bg-gray-50 dark:bg-slate-900/60 rounded-xl border border-gray-100 dark:border-slate-800">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center">
              <Key className="w-3.5 h-3.5 mr-1 text-blue-600" /> User Unique Identifier
            </p>
            <p className="text-xs font-mono font-bold text-gray-800 dark:text-slate-200 truncate">
              {user?.userId || "N/A"}
            </p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-slate-900/60 rounded-xl border border-gray-100 dark:border-slate-800">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Security Provider
            </p>
            <p className="text-xs font-bold text-gray-800 dark:text-slate-200">
              AWS Cognito User Pool
            </p>
          </div>

        </div>

        {/* Logout Button */}
        <div className="pt-4">
          <button
            onClick={() => logout()}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-extrabold px-8 py-3 rounded-lg text-sm shadow-md transition-all inline-flex items-center justify-center"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout Account
          </button>
        </div>

      </div>

    </div>
  );
};
