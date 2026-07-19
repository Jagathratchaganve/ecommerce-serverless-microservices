import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartService } from "../services/cartService";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const [loading, setLoading] = useState(false);

  // Fetch cart whenever authenticated state changes
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], subtotal: 0 });
      return;
    }
    setLoading(true);
    try {
      const cartData = await cartService.getMyCart();
      if (cartData) {
        setCart(cartData);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add Item To Cart
  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart.");
      return;
    }

    const productId = product.productId || product.id;
    const productName = product.name;
    const imageUrl = product.imageUrl;
    const price = product.price;

    setLoading(true);
    try {
      const updatedCart = await cartService.addItemToCart({
        productId,
        quantity,
        productName,
        imageUrl,
        price
      });
      setCart(updatedCart);
      toast.success(`${productName} added to cart!`);
      return updatedCart;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to add item to cart.";
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update Cart Item Quantity
  const updateQuantity = async (productId, newQuantity) => {
    setLoading(true);
    try {
      const updatedCart = await cartService.updateCartItem(productId, newQuantity);
      setCart(updatedCart);
      return updatedCart;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to update item quantity.";
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Remove Item From Cart
  const removeFromCart = async (productId) => {
    setLoading(true);
    try {
      const updatedCart = await cartService.removeCartItem(productId);
      setCart(updatedCart);
      toast.success("Item removed from cart.");
      return updatedCart;
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to remove item.";
      toast.error(msg);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Clear Cart Local & Server
  const clearCart = async (userId, productIds = []) => {
    try {
      const res = await cartService.removePurchasedItems(userId, productIds);
      if (res.cart) {
        setCart(res.cart);
      } else {
        setCart({ items: [], subtotal: 0 });
      }
    } catch (error) {
      setCart({ items: [], subtotal: 0 });
    }
  };

  const itemCount = cart.items ? cart.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0) : 0;
  const subtotal = cart.subtotal || (cart.items ? cart.items.reduce((sum, i) => sum + Number(i.subtotal || 0), 0) : 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems: cart.items || [],
        itemCount,
        subtotal,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
