import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { UserPlus, User, Mail, Lock } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await signup(data.name, data.email, data.password);
      if (res.success) {
        navigate("/confirm-signup", { state: { email: data.email } });
      }
    } catch (error) {
      // Handled by toast in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/80 shadow-2xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-5">
        
        {/* Left Banner */}
        <div className="md:col-span-2 bg-[#2874f0] p-8 text-white flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-black italic tracking-wide">Looks like you're new here!</h2>
            <p className="text-sm text-blue-100 mt-3 font-medium leading-relaxed">
              Sign up with your email to get started on E-BUY Plus
            </p>
          </div>
          <div className="text-xs text-blue-100">
            ✓ 100% Genuine Products<br />
            ✓ Fast & Free Express Delivery<br />
            ✓ Easy Returns & Refunds
          </div>
        </div>

        {/* Right Form */}
        <div className="md:col-span-3 p-8 sm:p-10 flex flex-col justify-center">
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register("name", { required: "Full name is required" })}
                  placeholder="John Doe"
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }
                  })}
                  placeholder="user@example.com"
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" }
                  })}
                  placeholder="Minimum 6 characters"
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#fb641b] hover:bg-orange-600 text-white font-extrabold py-3 rounded-lg text-sm uppercase tracking-wider shadow-md transition-all disabled:opacity-50 flex items-center justify-center mt-2"
            >
              {loading ? "Registering..." : <><UserPlus className="w-4 h-4 mr-2" /> Continue</>}
            </button>

          </form>

          <div className="mt-6 text-center border-t border-gray-100 dark:border-slate-700 pt-4">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 font-extrabold hover:underline">
                Login here
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
