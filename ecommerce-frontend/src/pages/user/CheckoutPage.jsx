import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, CreditCard, MapPin, ShoppingBag, ShieldCheck, Zap } from "lucide-react";
import { useCart } from "../../contexts/CartContext";
import { useOrder } from "../../contexts/OrderContext";
import { useAuth } from "../../contexts/AuthContext";
import { AddressForm } from "../../components/forms/AddressForm";
import { formatCurrency } from "../../utils/formatters";
import toast from "react-hot-toast";

export const CheckoutPage = () => {
  const { cartItems, subtotal } = useCart();
  const { createOrder, processPaymentAndCompleteOrder } = useOrder();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Address, 2: Payment
  const [address, setAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [loading, setLoading] = useState(false);

  const shippingCharge = subtotal > 499 ? 0 : 40;
  const totalAmount = subtotal + shippingCharge;

  const handleAddressSubmit = (data) => {
    setAddress(data);
    setStep(2);
  };

  const handleCompletePayment = async () => {
    if (!address) {
      toast.error("Please provide a valid shipping address.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create Order (Status PENDING)
      const orderPayload = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          productName: item.productName,
          imageUrl: item.imageUrl
        })),
        address: {
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country
        },
        customerName: address.customerName,
        email: address.email,
        phone: address.phone,
        discount: 0,
        tax: 0,
        shippingCharge
      };

      const newOrder = await createOrder(orderPayload);

      // 2. Process Payment & Confirm (Order status becomes PLACED, Cart clears, SNS triggers)
      const result = await processPaymentAndCompleteOrder(newOrder, paymentMethod);

      // 3. Navigate to Order Success Page
      navigate("/order-success", {
        state: {
          order: result.order || newOrder,
          payment: result.payment
        }
      });
    } catch (error) {
      console.error("Checkout process failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !loading) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-4">No items to checkout</h2>
        <button
          onClick={() => navigate("/products")}
          className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-lg text-sm"
        >
          Browse Catalogue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Checkout Stepper Header */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700/80 shadow-xs flex items-center justify-around">
        
        <div className={`flex items-center space-x-2 text-sm font-bold ${step >= 1 ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`}>
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
            1
          </span>
          <span>Delivery Address</span>
        </div>

        <div className="w-12 h-0.5 bg-gray-200 dark:bg-slate-700"></div>

        <div className={`flex items-center space-x-2 text-sm font-bold ${step >= 2 ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}`}>
          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
            2
          </span>
          <span>Payment Gateway</span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Step Panel */}
        <div className="lg:col-span-2 space-y-6">
          
          {step === 1 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/80 shadow-md p-6">
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" /> Enter Shipping Address
              </h3>
              <AddressForm
                onSubmit={handleAddressSubmit}
                defaultValues={{
                  customerName: user?.name || "",
                  email: user?.email || "",
                  country: "India"
                }}
              />
            </div>
          )}

          {step === 2 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/80 shadow-md p-6 space-y-6">
              
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-700 pb-4">
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-blue-600" /> Payment Method
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Delivering to: <span className="font-bold text-gray-800 dark:text-slate-200">{address?.customerName}</span> ({address?.street}, {address?.city})
                  </p>
                </div>

                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  Edit Address
                </button>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                
                <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${
                  paymentMethod === "CARD" ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30" : "border-gray-200 dark:border-slate-700"
                }`}>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      value="CARD"
                      checked={paymentMethod === "CARD"}
                      onChange={() => setPaymentMethod("CARD")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Credit / Debit Card</p>
                      <p className="text-xs text-gray-400">Visa, Mastercard, RuPay, Maestro</p>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-gray-400" />
                </label>

                <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${
                  paymentMethod === "UPI" ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30" : "border-gray-200 dark:border-slate-700"
                }`}>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      value="UPI"
                      checked={paymentMethod === "UPI"}
                      onChange={() => setPaymentMethod("UPI")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">UPI / Instant Bank Transfer</p>
                      <p className="text-xs text-gray-400">Google Pay, PhonePe, Paytm, BHIM</p>
                    </div>
                  </div>
                  <Zap className="w-5 h-5 text-amber-500" />
                </label>

                <label className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${
                  paymentMethod === "COD" ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30" : "border-gray-200 dark:border-slate-700"
                }`}>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={() => setPaymentMethod("COD")}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Cash on Delivery</p>
                      <p className="text-xs text-gray-400">Pay when order arrives at doorstep</p>
                    </div>
                  </div>
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </label>

              </div>

              {/* Complete Purchase Button */}
              <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                <button
                  disabled={loading}
                  onClick={handleCompletePayment}
                  className="w-full bg-[#fb641b] hover:bg-orange-600 text-white font-extrabold py-4 rounded-lg text-base uppercase tracking-wider shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? "Processing Payment & SNS Fan-Out..." : `Pay ${formatCurrency(totalAmount)} & Complete Order`}
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Right Summary Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/80 shadow-md p-6 sticky top-24 space-y-4">
            
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-700 pb-3 flex items-center">
              <ShoppingBag className="w-4 h-4 mr-2 text-blue-600" /> Order Summary
            </h3>

            {/* Item Thumbnails */}
            <div className="space-y-3 max-h-56 overflow-y-auto no-scrollbar pr-1">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    <img
                      src={item.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"}
                      alt={item.productName}
                      className="w-10 h-10 object-contain bg-gray-50 dark:bg-slate-900 rounded p-1"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-gray-800 dark:text-slate-200 truncate">{item.productName}</p>
                      <p className="text-gray-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white shrink-0 ml-2">
                    {formatCurrency(item.subtotal || item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 dark:border-slate-700 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>Items Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>Shipping Fee</span>
                <span>{shippingCharge === 0 ? "FREE" : formatCurrency(shippingCharge)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-slate-700">
                <span>Total Payable</span>
                <span className="text-blue-600 dark:text-blue-400">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
