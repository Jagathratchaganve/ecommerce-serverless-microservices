import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Truck, RefreshCw, Headphones } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-6 border-t border-slate-800">
      
      {/* Features Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-slate-800/60 rounded-xl border border-slate-700/50 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-lg">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Free & Fast Express Delivery</h4>
              <p className="text-xs text-slate-400">On all orders above ₹499</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Genuine Products</h4>
              <p className="text-xs text-slate-400">Verified AWS Cognito & SNS Security</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-amber-600/20 text-amber-400 rounded-lg">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Easy 7-Day Replacement</h4>
              <p className="text-xs text-slate-400">Hassle-free order refunds</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-600/20 text-purple-400 rounded-lg">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">24/7 Customer Support</h4>
              <p className="text-xs text-slate-400">Instant query assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
        
        <div className="col-span-2">
          <Link to="/" className="text-2xl font-black italic tracking-wider text-white">
            E-BUY <span className="text-yellow-400 text-xs not-italic font-bold">Plus</span>
          </Link>
          <p className="mt-3 text-xs text-slate-400 leading-relaxed max-w-sm">
            E-BUY is a modern, high-performance serverless e-commerce platform built on Node.js microservices, AWS Lambda, DynamoDB, SNS, and SQS event fan-out.
          </p>
        </div>

        <div>
          <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">About Us</h5>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            <li><a href="#" className="hover:text-white transition-colors">About E-BUY</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Press & Stories</a></li>
          </ul>
        </div>

        <div>
          <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Help & Info</h5>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><a href="#" className="hover:text-white transition-colors">Payments</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Cancellation & Returns</a></li>
            <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
          </ul>
        </div>

        <div>
          <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Consumer Policy</h5>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Sitemap</a></li>
          </ul>
        </div>

      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
        <p>© {new Date().getFullYear()} E-BUY Inc. All rights reserved. Serverless E-Commerce Platform.</p>
        <p className="mt-2 sm:mt-0 font-mono">React 19 • Vite • AWS Microservices</p>
      </div>

    </footer>
  );
};
