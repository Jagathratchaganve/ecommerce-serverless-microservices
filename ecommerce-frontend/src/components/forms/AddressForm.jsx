import React from "react";
import { useForm } from "react-hook-form";

export const AddressForm = ({ onSubmit, defaultValues = {}, loading = false }) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      customerName: defaultValues.customerName || "",
      email: defaultValues.email || "",
      phone: defaultValues.phone || "",
      street: defaultValues.street || "",
      city: defaultValues.city || "",
      state: defaultValues.state || "",
      zipCode: defaultValues.zipCode || "",
      country: defaultValues.country || "India"
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
            Full Name *
          </label>
          <input
            type="text"
            {...register("customerName", { required: "Full name is required" })}
            placeholder="John Doe"
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {errors.customerName && (
            <p className="text-xs text-red-500 mt-1">{errors.customerName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
            Email Address *
          </label>
          <input
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" }
            })}
            placeholder="john@example.com"
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
            Mobile Number *
          </label>
          <input
            type="tel"
            {...register("phone", { required: "Phone number is required" })}
            placeholder="9876543210"
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Country */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
            Country *
          </label>
          <input
            type="text"
            {...register("country", { required: "Country is required" })}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

      </div>

      {/* Street Address */}
      <div>
        <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
          Street Address / Flat No. *
        </label>
        <textarea
          rows={2}
          {...register("street", { required: "Street address is required" })}
          placeholder="House No. 12, Main Street, Block B"
          className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        ></textarea>
        {errors.street && (
          <p className="text-xs text-red-500 mt-1">{errors.street.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* City */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
            City *
          </label>
          <input
            type="text"
            {...register("city", { required: "City is required" })}
            placeholder="Bangalore"
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {errors.city && (
            <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
            State *
          </label>
          <input
            type="text"
            {...register("state", { required: "State is required" })}
            placeholder="Karnataka"
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {errors.state && (
            <p className="text-xs text-red-500 mt-1">{errors.state.message}</p>
          )}
        </div>

        {/* Pincode / Zip Code */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
            Zip / Pincode *
          </label>
          <input
            type="text"
            {...register("zipCode", { required: "Pincode is required" })}
            placeholder="560001"
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {errors.zipCode && (
            <p className="text-xs text-red-500 mt-1">{errors.zipCode.message}</p>
          )}
        </div>

      </div>

      <div className="pt-3 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#fb641b] hover:bg-orange-600 text-white font-bold px-8 py-2.5 rounded-sm shadow-md transition-all text-sm uppercase tracking-wide disabled:opacity-50"
        >
          {loading ? "Saving..." : "Deliver to this Address"}
        </button>
      </div>

    </form>
  );
};
