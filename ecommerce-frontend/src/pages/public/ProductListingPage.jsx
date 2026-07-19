import React from "react";
import { Filter, SlidersHorizontal, Search } from "lucide-react";
import { useProducts } from "../../contexts/ProductContext";
import { ProductCard } from "../../components/cards/ProductCard";
import { ProductCardSkeleton } from "../../components/common/SkeletonLoader";
import { EmptyState } from "../../components/common/EmptyState";

export const ProductListingPage = () => {
  const {
    filteredProducts,
    categories,
    inventoryMap,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy
  } = useProducts();

  return (
    <div className="space-y-6">
      
      {/* Search Header Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white">
            {selectedCategory === "All" ? "All Products" : `${selectedCategory} Products`}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Showing <span className="font-bold text-gray-800 dark:text-slate-200">{filteredProducts.length}</span> items
          </p>
        </div>

        {/* Sorting & Search Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Quick Search */}
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="relevance">Sort by: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
              <option value="discount">Highest Discount</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Grid & Category Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Category Filters Sidebar */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-5 rounded-xl border border-gray-100 dark:border-slate-700/80 shadow-xs h-fit space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-3">
            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center">
              <Filter className="w-4 h-4 mr-2 text-blue-600" /> Filters
            </h3>
            {(selectedCategory !== "All" || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Category List */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Categories</h4>
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-md text-xs font-semibold transition-colors flex items-center justify-between ${
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <span className="text-[10px] font-extrabold">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id || product.productId}
                  product={product}
                  stockInfo={inventoryMap[product.id || product.productId]}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon="search"
              title="No Products Found"
              description={`We couldn't find any products matching "${searchQuery || selectedCategory}". Try adjusting your filters.`}
              actionText="Reset Filters"
              actionLink="#"
            />
          )}
        </div>

      </div>

    </div>
  );
};
