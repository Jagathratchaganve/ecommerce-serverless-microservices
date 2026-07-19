import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "../components/common/Header";
import { Navbar } from "../components/common/Navbar";
import { Footer } from "../components/common/Footer";

export const UserLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200">
      <Header />
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
