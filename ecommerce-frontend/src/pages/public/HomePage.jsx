import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, Zap, ShieldCheck, Flame, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProducts } from "../../contexts/ProductContext";
import { ProductCard } from "../../components/cards/ProductCard";
import { ProductCardSkeleton } from "../../components/common/SkeletonLoader";

export const HomePage = () => {
  const { filteredProducts, inventoryMap, loading } = useProducts();
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroBanners = [
    {
      id: 1,
      title: "Big Summer Savings Spree!",
      subtitle: "Up to 50% Off on Latest Flagship Smartphones & Electronics",
      cta: "Shop Electronics",
      tag: "FLIPKART STYLE DEALS",
      bgGradient: "from-blue-600 to-indigo-800",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800"
    },
    {
      id: 2,
      title: "Next-Gen Audio & Wearables",
      subtitle: "Immersive Noise Cancellation Headphones & Smartwatches",
      cta: "Explore Audio",
      tag: "EXCLUSIVE SALE",
      bgGradient: "from-purple-700 to-pink-600",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"
    },
    {
      id: 3,
      title: "Modern Home & Kitchen Essentials",
      subtitle: "Transform Your Living Space with Premium Smart Appliances",
      cta: "View Home Deals",
      tag: "LIMITED TIME OFFER",
      bgGradient: "from-emerald-700 to-teal-800",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  return (
    <div className="space-y-8">
      
      {/* Hero Carousel Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl min-h-[340px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={heroBanners[currentSlide].id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 bg-gradient-to-r ${heroBanners[currentSlide].bgGradient} p-8 sm:p-12 flex flex-col justify-center text-white`}
          >
            <div className="max-w-xl z-10">
              <span className="inline-flex items-center bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase mb-4 text-yellow-300">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> {heroBanners[currentSlide].tag}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight mb-3">
                {heroBanners[currentSlide].title}
              </h1>
              <p className="text-sm sm:text-base text-blue-100 mb-6 font-medium leading-relaxed">
                {heroBanners[currentSlide].subtitle}
              </p>
              <Link
                to="/products"
                className="inline-flex items-center bg-[#ffe500] hover:bg-yellow-400 text-gray-900 font-extrabold px-6 py-3 rounded-md shadow-lg transition-transform hover:scale-105 text-sm uppercase tracking-wider"
              >
                {heroBanners[currentSlide].cta} <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>

            {/* Banner Image */}
            <div className="absolute right-4 bottom-0 top-0 hidden md:flex items-center w-1/2 justify-end p-6 pointer-events-none">
              <img
                src={heroBanners[currentSlide].image}
                alt="Banner Deals"
                className="max-h-72 object-contain rounded-xl shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500"
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-8 flex space-x-2 z-20">
          {heroBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                currentSlide === idx ? "w-8 bg-yellow-400" : "w-2.5 bg-white/40"
              }`}
            ></button>
          ))}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/80 shadow-xs">
        <div className="flex items-center space-x-3 p-2">
          <Zap className="w-8 h-8 text-amber-500" />
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">Instant Order Processing</h4>
            <p className="text-[11px] text-gray-400">AWS Lambda Microservices</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-2">
          <ShieldCheck className="w-8 h-8 text-blue-500" />
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">Cognito JWT Security</h4>
            <p className="text-[11px] text-gray-400">Encrypted Role Control</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-2">
          <Flame className="w-8 h-8 text-orange-500" />
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">Real-Time Inventory</h4>
            <p className="text-[11px] text-gray-400">DynamoDB Synchronized</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-2">
          <Sparkles className="w-8 h-8 text-purple-500" />
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">Event Fan-Out</h4>
            <p className="text-[11px] text-gray-400">SNS SQS Email Dispatch</p>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center">
              Trending Products <Flame className="w-6 h-6 text-red-500 ml-2 animate-bounce" />
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              Top selling items backed by our serverless inventory system
            </p>
          </div>

          <Link
            to="/products"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center"
          >
            View All Products <ChevronRight className="w-4 h-4 ml-0.5" />
          </Link>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, idx) => <ProductCardSkeleton key={idx} />)
            : filteredProducts.slice(0, 8).map((product) => (
                <ProductCard
                  key={product.id || product.productId}
                  product={product}
                  stockInfo={inventoryMap[product.id || product.productId]}
                />
              ))}
        </div>
      </div>

      {/* Flipkart Style Banner Block */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between shadow-xl">
        <div className="space-y-3 max-w-xl text-center md:text-left">
          <span className="text-xs font-bold uppercase bg-yellow-400 text-blue-950 px-3 py-1 rounded-full">
            Special Offer
          </span>
          <h3 className="text-2xl sm:text-3xl font-black">
            Join E-BUY Plus Today & Unlock Express Delivery
          </h3>
          <p className="text-sm text-blue-100">
            Enjoy priority order fulfillment, early access to sale events, and zero delivery charges across all categories.
          </p>
        </div>

        <Link
          to="/products"
          className="mt-6 md:mt-0 bg-white text-blue-800 font-extrabold px-8 py-3.5 rounded-lg shadow-lg hover:bg-yellow-300 transition-all text-sm uppercase"
        >
          Explore Catalogue
        </Link>
      </div>

    </div>
  );
};
