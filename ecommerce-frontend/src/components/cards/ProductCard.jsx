import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Zap, Star, ShieldCheck } from "lucide-react";
import { formatCurrency, calculateDiscountPercentage } from "../../utils/formatters";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";

export const ProductCard = ({ product, stockInfo }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const discountPercent = calculateDiscountPercentage(product.price, product.discountPrice);
  const displayPrice = product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price;

  // Determine stock availability
  const availableStock = stockInfo?.availableStock !== undefined ? stockInfo.availableStock : 10;
  const isOutOfStock = availableStock <= 0 || product.status === "INACTIVE";

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setLoading(true);
    try {
      await addToCart(product, 1);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      await addToCart(product, 1);
      navigate("/checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group bg-white dark:bg-slate-800 rounded-md border border-gray-100 dark:border-slate-700/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      
      <Link to={`/products/${product.id || product.productId}`} className="p-4 block flex-1">
        
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-3 left-3 bg-[#388e3c] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm z-10 shadow-xs">
            {discountPercent}% OFF
          </span>
        )}

        {/* Product Image */}
        <div className="w-full h-48 flex items-center justify-center overflow-hidden mb-3 bg-gray-50 dark:bg-slate-900/40 rounded">
          <img
            src={product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"}
            alt={product.name}
            className="h-full object-contain group-hover:scale-105 transition-transform duration-300 p-2"
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400";
            }}
          />
        </div>

        {/* Brand & Title */}
        {product.brand && (
          <p className="text-[11px] font-bold text-gray-400 dark:text-slate-400 uppercase tracking-wider mb-0.5">
            {product.brand}
          </p>
        )}
        
        <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
          {product.name}
        </h3>

        {/* Flipkart Rating Badge Mockup */}
        <div className="flex items-center space-x-2 mt-2">
          <span className="inline-flex items-center bg-[#388e3c] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
            4.4 <Star className="w-2.5 h-2.5 ml-0.5 fill-white" />
          </span>
          <span className="text-[11px] text-gray-400 font-medium">
            (1,248)
          </span>
          {product.status === "ACTIVE" && (
            <span className="inline-flex items-center text-[10px] text-blue-600 dark:text-blue-400 font-semibold ml-auto">
              <ShieldCheck className="w-3 h-3 mr-0.5" /> Assured
            </span>
          )}
        </div>

        {/* Pricing */}
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-base font-extrabold text-gray-900 dark:text-white">
            {formatCurrency(displayPrice)}
          </span>
          {product.discountPrice && product.discountPrice < product.price && (
            <span className="text-xs text-gray-400 line-through">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>

        {/* Stock Status Indicator */}
        <div className="mt-2">
          {isOutOfStock ? (
            <span className="text-xs font-bold text-red-500">Out of Stock</span>
          ) : availableStock <= 5 ? (
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Only {availableStock} left in stock!
            </span>
          ) : (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              In Stock
            </span>
          )}
        </div>

      </Link>

      {/* Action Buttons */}
      <div className="px-4 pb-4 pt-1 grid grid-cols-2 gap-2">
        <button
          disabled={isOutOfStock || loading}
          onClick={handleAddToCart}
          className="w-full bg-amber-400 hover:bg-amber-500 text-gray-900 text-xs font-bold py-2 rounded-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-xs"
        >
          <ShoppingCart className="w-3.5 h-3.5 mr-1" /> Cart
        </button>

        <button
          disabled={isOutOfStock || loading}
          onClick={handleBuyNow}
          className="w-full bg-[#fb641b] hover:bg-orange-600 text-white text-xs font-bold py-2 rounded-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center shadow-xs"
        >
          <Zap className="w-3.5 h-3.5 mr-1" /> Buy Now
        </button>
      </div>

    </div>
  );
};
