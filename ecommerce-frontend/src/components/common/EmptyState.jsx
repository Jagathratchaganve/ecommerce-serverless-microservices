import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, PackageX, SearchX, Inbox } from "lucide-react";

export const EmptyState = ({
  icon = "bag",
  title = "No Items Found",
  description = "We couldn't find anything matching your request.",
  actionText = "Continue Shopping",
  actionLink = "/products"
}) => {
  const iconComponents = {
    bag: <ShoppingBag className="w-16 h-16 text-blue-500 stroke-1" />,
    order: <PackageX className="w-16 h-16 text-amber-500 stroke-1" />,
    search: <SearchX className="w-16 h-16 text-purple-500 stroke-1" />,
    inbox: <Inbox className="w-16 h-16 text-gray-400 stroke-1" />
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/60 shadow-xs max-w-md mx-auto my-8">
      <div className="p-4 bg-blue-50 dark:bg-slate-700/50 rounded-full mb-4">
        {iconComponents[icon] || iconComponents.bag}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">{description}</p>
      {actionLink && actionText && (
        <Link
          to={actionLink}
          className="inline-flex items-center px-6 py-2.5 text-sm font-bold text-white bg-[#2874f0] hover:bg-blue-700 rounded-sm shadow-md transition-all hover:scale-105"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
};
