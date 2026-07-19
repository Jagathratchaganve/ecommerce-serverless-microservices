import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { CartItemCard } from "../../components/cards/CartItemCard";
import { formatCurrency } from "../../utils/formatters";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";

export const CartPage = () => {
  const { cartItems, itemCount, subtotal, loading } = useCart();
  const navigate = useNavigate();

  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Fetching your cart..." />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <EmptyState
        icon="bag"
        title="Your Cart is Empty!"
        description="Explore our wide range of products and add your favorite items to the cart."
        actionText="Start Shopping"
        actionLink="/products"
      />
    );
  }

  const shippingCharge = subtotal > 499 ? 0 : 40;
  const totalAmount = subtotal + shippingCharge;

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center">
          <ShoppingBag className="w-6 h-6 mr-2 text-blue-600" /> My Shopping Cart ({itemCount} items)
        </h1>
        <Link to="/products" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
          + Add More Items
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Cart Item List */}
        <div className="lg:col-span-2 space-y-3">
          {cartItems.map((item) => (
            <CartItemCard key={item.productId} item={item} />
          ))}
        </div>

        {/* Right 1 Col: Price Summary Breakdown */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/80 shadow-md p-6 sticky top-24 space-y-5">
            
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-700 pb-3">
              Price Details
            </h3>

            <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
              
              <div className="flex justify-between">
                <span>Price ({itemCount} items)</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {shippingCharge === 0 ? "FREE" : formatCurrency(shippingCharge)}
                </span>
              </div>

              <div className="flex justify-between text-xs text-gray-400">
                <span>Secured AWS Fan-Out</span>
                <span>Included</span>
              </div>

              <div className="border-t border-dashed border-gray-200 dark:border-slate-700 pt-3 flex justify-between text-base font-black text-gray-900 dark:text-white">
                <span>Total Amount</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {formatCurrency(totalAmount)}
                </span>
              </div>

            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-lg flex items-center text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              <ShieldCheck className="w-4 h-4 mr-2 shrink-0" />
              You will save {formatCurrency(shippingCharge === 0 ? 40 : 0)} on delivery fee for this order!
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-[#fb641b] hover:bg-orange-600 text-white font-extrabold py-3.5 rounded-md text-sm uppercase tracking-wider shadow-lg transition-all flex items-center justify-center"
            >
              Place Order <ArrowRight className="w-4 h-4 ml-2" />
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};
