import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { LogIn, Lock, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await login(data.email, data.password);
      if (res.success) {
        if (res.user.isAdmin) {
          navigate("/admin/dashboard");
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (error) {
      // Toast handles error message
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/80 shadow-2xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-5">
        
        {/* Left Flipkart Style Banner */}
        <div className="md:col-span-2 bg-[#2874f0] p-8 text-white flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-black italic tracking-wide">Login</h2>
            <p className="text-sm text-blue-100 mt-3 font-medium leading-relaxed">
              Get access to your Orders, Wishlist and Recommendations
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
              <ShieldCheck className="w-8 h-8 text-yellow-300 mb-2" />
              <p className="text-xs text-blue-100">
                Secured by AWS Cognito Identity Provider & JWT Authentication tokens.
              </p>
            </div>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="md:col-span-3 p-8 sm:p-10 flex flex-col justify-center">
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                Enter Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }
                  })}
                  placeholder="e.g. user@example.com"
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                Enter Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  {...register("password", { required: "Password is required" })}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <p className="text-[11px] text-gray-400">
              By continuing, you agree to E-BUY's Terms of Use and Privacy Policy.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#fb641b] hover:bg-orange-600 text-white font-extrabold py-3 rounded-lg text-sm uppercase tracking-wider shadow-md transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? "Authenticating..." : <><LogIn className="w-4 h-4 mr-2" /> Login</>}
            </button>

          </form>

          <div className="mt-8 text-center border-t border-gray-100 dark:border-slate-700 pt-6">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              New to E-BUY?{" "}
              <Link to="/signup" className="text-blue-600 dark:text-blue-400 font-extrabold hover:underline">
                Create an account
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
