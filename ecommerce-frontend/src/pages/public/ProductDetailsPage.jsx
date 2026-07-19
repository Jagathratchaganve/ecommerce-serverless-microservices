import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ShoppingCart,
  Zap,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Boxes,
  ArrowLeft
} from "lucide-react";
import { productService } from "../../services/productService";
import { inventoryService } from "../../services/inventoryService";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import { formatCurrency, calculateDiscountPercentage } from "../../utils/formatters";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";

export const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [stockInfo, setStockInfo] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const prod = await productService.getProductById(id);
        if (prod) {
          setProduct(prod);
          try {
            const stock = await inventoryService.getInventoryByProductId(prod.productId || prod.id);
            setStockInfo(stock);
          } catch (invErr) {
            console.warn("Stock fetch error:", invErr);
          }
        } else {
          toast.error("Product not found");
        }
      } catch (error) {
        console.error("Error loading product details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading product details..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product Not Found</h2>
        <Link to="/products" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  const availableStock = stockInfo?.availableStock !== undefined ? stockInfo.availableStock : 10;
  const isOutOfStock = availableStock <= 0 || product.status === "INACTIVE";
  const discountPercent = calculateDiscountPercentage(product.price, product.discountPrice);
  const displayPrice = product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price;

  const handleAddToCart = async () => {
    if (isOutOfStock) return;
    setActionLoading(true);
    try {
      await addToCart(product, quantity);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setActionLoading(true);
    try {
      await addToCart(product, quantity);
      navigate("/checkout");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Search
      </button>

      {/* Main Details Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/80 shadow-md p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Image Preview */}
        <div className="flex flex-col items-center">
          <div className="w-full h-80 sm:h-96 bg-gray-50 dark:bg-slate-900/60 rounded-xl p-6 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-slate-800">
            <img
              src={product.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"}
              alt={product.name}
              className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";
              }}
            />
          </div>
        </div>

        {/* Right Column: Product Meta & Purchasing */}
        <div className="space-y-6 flex flex-col justify-between">
          
          <div className="space-y-3">
            
            {/* Category & Brand Badges */}
            <div className="flex items-center space-x-2">
              {product.brand && (
                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                  {product.brand}
                </span>
              )}
              <span className="bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-300 text-xs font-semibold px-2.5 py-0.5 rounded">
                {product.category}
              </span>
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Flipkart Rating & Assured Badge */}
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center bg-[#388e3c] text-white text-xs font-bold px-2 py-0.5 rounded">
                4.5 <Star className="w-3 h-3 ml-1 fill-white" />
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                2,410 Ratings & 380 Reviews
              </span>
              <span className="inline-flex items-center text-xs font-bold text-blue-600 dark:text-blue-400">
                <ShieldCheck className="w-4 h-4 mr-1" /> E-BUY Assured
              </span>
            </div>

            {/* Price Breakdown */}
            <div className="pt-2 flex items-baseline space-x-3">
              <span className="text-3xl font-black text-gray-900 dark:text-white">
                {formatCurrency(displayPrice)}
              </span>
              {product.discountPrice && product.discountPrice < product.price && (
                <>
                  <span className="text-base text-gray-400 line-through">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock Level Tag */}
            <div className="pt-2">
              {isOutOfStock ? (
                <span className="text-sm font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-3 py-1 rounded">
                  Out of Stock
                </span>
              ) : availableStock <= 5 ? (
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded">
                  Hurry, Only {availableStock} items left!
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded flex items-center w-fit">
                  <Boxes className="w-4 h-4 mr-1.5" /> In Stock ({availableStock} units available)
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-3 border-t border-gray-100 dark:border-slate-700">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Description
                </h4>
                <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="pt-3 flex items-center space-x-3">
                <label className="text-xs font-bold text-gray-700 dark:text-slate-300 uppercase">
                  Quantity:
                </label>
                <div className="flex items-center border border-gray-300 dark:border-slate-700 rounded-md">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 text-sm font-bold hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-sm font-bold text-gray-900 dark:text-white">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= availableStock}
                    onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                    className="px-3 py-1 text-sm font-bold hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-gray-100 dark:border-slate-700 grid grid-cols-2 gap-4">
            <button
              disabled={isOutOfStock || actionLoading}
              onClick={handleAddToCart}
              className="w-full bg-amber-400 hover:bg-amber-500 text-gray-950 font-extrabold py-3.5 rounded-md text-sm uppercase tracking-wide shadow-md transition-all disabled:opacity-40 flex items-center justify-center"
            >
              <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
            </button>

            <button
              disabled={isOutOfStock || actionLoading}
              onClick={handleBuyNow}
              className="w-full bg-[#fb641b] hover:bg-orange-600 text-white font-extrabold py-3.5 rounded-md text-sm uppercase tracking-wide shadow-md transition-all disabled:opacity-40 flex items-center justify-center"
            >
              <Zap className="w-4 h-4 mr-2" /> Buy Now
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
