import React from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import { useCart } from "../../contexts/CartContext";

export const CartItemCard = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleIncrement = () => {
    updateQuantity(item.productId, Number(item.quantity) + 1);
  };

  const handleDecrement = () => {
    if (Number(item.quantity) > 1) {
      updateQuantity(item.productId, Number(item.quantity) - 1);
    } else {
      removeFromCart(item.productId);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700/80 shadow-xs mb-3 gap-4">
      
      {/* Product Thumbnail & Details */}
      <div className="flex items-center space-x-4 w-full sm:w-auto">
        <img
          src={item.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200"}
          alt={item.productName}
          className="w-20 h-20 object-contain bg-gray-50 dark:bg-slate-900 rounded p-1 shrink-0"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200";
          }}
        />

        <div>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2">
            {item.productName}
          </h4>
          <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">
            Unit Price: {formatCurrency(item.price)}
          </p>
          <span className="inline-block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded mt-1">
            In Stock
          </span>
        </div>
      </div>

      {/* Quantity Stepper & Subtotal */}
      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-6">
        
        {/* Quantity Controls */}
        <div className="flex items-center border border-gray-300 dark:border-slate-700 rounded-md bg-gray-50 dark:bg-slate-900">
          <button
            onClick={handleDecrement}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 transition-colors"
            title="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          
          <span className="w-10 text-center text-xs font-bold text-gray-900 dark:text-white">
            {item.quantity}
          </span>
          
          <button
            onClick={handleIncrement}
            className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 transition-colors"
            title="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Subtotal */}
        <div className="text-right">
          <p className="text-xs text-gray-400 dark:text-slate-400">Total</p>
          <p className="text-sm font-extrabold text-gray-900 dark:text-white">
            {formatCurrency(item.subtotal || item.price * item.quantity)}
          </p>
        </div>

        {/* Delete Button */}
        <button
          onClick={() => removeFromCart(item.productId)}
          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>

      </div>

    </div>
  );
};
