import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { KeyRound, Mail, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export const ConfirmSignupPage = () => {
  const { confirmSignup } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const initialEmail = location.state?.email || "";

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: initialEmail,
      confirmationCode: ""
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await confirmSignup(data.email, data.confirmationCode);
      if (res.success) {
        navigate("/login");
      }
    } catch (error) {
      // Toast handles error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-10 px-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700/80 shadow-2xl p-8 max-w-md w-full text-center">
        
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
          Verify Your Email
        </h2>
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-6 leading-relaxed">
          Please enter the 6-digit confirmation code sent by AWS Cognito to your email address.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          
          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                {...register("email", { required: "Email is required" })}
                className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
            </div>
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Confirmation Code */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
              Confirmation Code *
            </label>
            <input
              type="text"
              {...register("confirmationCode", { required: "Verification code is required" })}
              placeholder="e.g. 123456"
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-center tracking-widest text-lg font-mono font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.confirmationCode && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmationCode.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2874f0] hover:bg-blue-700 text-white font-extrabold py-3 rounded-lg text-sm uppercase tracking-wider shadow-md transition-all disabled:opacity-50 flex items-center justify-center mt-2"
          >
            {loading ? "Verifying..." : <><CheckCircle2 className="w-4 h-4 mr-2" /> Verify & Activate</>}
          </button>

        </form>

      </div>
    </div>
  );
};
