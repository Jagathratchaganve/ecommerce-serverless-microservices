import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Smartphone,
  Tv,
  Shirt,
  Sparkles,
  Home,
  Watch,
  Headphones,
  Grid
} from "lucide-react";
import { useProducts } from "../../contexts/ProductContext";

export const Navbar = () => {
  const { categories, selectedCategory, setSelectedCategory } = useProducts();
  const navigate = useNavigate();

  const categoryIcons = {
    Mobiles: <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
    Electronics: <Headphones className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
    Fashion: <Shirt className="w-5 h-5 text-pink-600 dark:text-pink-400" />,
    Beauty: <Sparkles className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
    Home: <Home className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
    Appliances: <Tv className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    Watches: <Watch className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
  };

  const handleSelectCategory = (cat) => {
    setSelectedCategory(cat);
    navigate("/products");
  };

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start sm:justify-center space-x-6 sm:space-x-10 py-3 overflow-x-auto no-scrollbar scroll-smooth">
          
          {/* All Category Pill */}
          <button
            onClick={() => handleSelectCategory("All")}
            className={`flex flex-col items-center min-w-max cursor-pointer group transition-transform hover:scale-105 ${
              selectedCategory === "All" ? "text-blue-600 dark:text-blue-400 font-bold" : "text-gray-700 dark:text-slate-300"
            }`}
          >
            <div className={`p-2 rounded-full mb-1 transition-colors ${
              selectedCategory === "All" ? "bg-blue-100 dark:bg-blue-900/50" : "bg-gray-100 dark:bg-slate-800 group-hover:bg-blue-50"
            }`}>
              <Grid className="w-5 h-5 text-gray-700 dark:text-slate-300" />
            </div>
            <span className="text-xs font-semibold">All Categories</span>
          </button>

          {/* Dynamic Categories */}
          {categories.filter(c => c !== "All").map((cat) => (
            <button
              key={cat}
              onClick={() => handleSelectCategory(cat)}
              className={`flex flex-col items-center min-w-max cursor-pointer group transition-transform hover:scale-105 ${
                selectedCategory === cat ? "text-blue-600 dark:text-blue-400 font-bold" : "text-gray-700 dark:text-slate-300"
              }`}
            >
              <div className={`p-2 rounded-full mb-1 transition-colors ${
                selectedCategory === cat ? "bg-blue-100 dark:bg-blue-900/50" : "bg-gray-100 dark:bg-slate-800 group-hover:bg-blue-50"
              }`}>
                {categoryIcons[cat] || <Grid className="w-5 h-5 text-gray-600 dark:text-slate-400" />}
              </div>
              <span className="text-xs font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {cat}
              </span>
            </button>
          ))}

        </div>
      </div>
    </nav>
  );
};
