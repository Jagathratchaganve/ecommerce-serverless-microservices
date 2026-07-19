import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "../common/Modal";

export const ProductFormModal = ({ isOpen, onClose, onSubmit, initialData = null, loading = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: "",
      brand: "",
      category: "Electronics",
      description: "",
      price: 0,
      discountPrice: 0,
      imageUrl: "",
      status: "ACTIVE"
    }
  });

  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        brand: initialData.brand || "",
        category: initialData.category || "Electronics",
        description: initialData.description || "",
        price: initialData.price || 0,
        discountPrice: initialData.discountPrice || 0,
        imageUrl: initialData.imageUrl || "",
        status: initialData.status || "ACTIVE"
      });
    } else {
      reset({
        name: "",
        brand: "",
        category: "Electronics",
        description: "",
        price: 0,
        discountPrice: 0,
        imageUrl: "",
        status: "ACTIVE"
      });
    }
  }, [initialData, reset, isOpen]);

  const handleFormSubmit = (data) => {
    onSubmit({
      ...data,
      price: Number(data.price),
      discountPrice: Number(data.discountPrice || 0)
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Product" : "Add New Product"}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
              Product Title *
            </label>
            <input
              type="text"
              {...register("name", { required: "Product title is required" })}
              placeholder="e.g. iPhone 15 Pro Max"
              className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Brand */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
              Brand Name *
            </label>
            <input
              type="text"
              {...register("brand", { required: "Brand name is required" })}
              placeholder="e.g. Apple"
              className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand.message}</p>}
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
              Category *
            </label>
            <select
              {...register("category", { required: "Category is required" })}
              className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Mobiles">Mobiles</option>
              <option value="Electronics">Electronics</option>
              <option value="Fashion">Fashion</option>
              <option value="Beauty">Beauty</option>
              <option value="Home">Home & Living</option>
              <option value="Appliances">Appliances</option>
              <option value="Watches">Watches</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
              Status *
            </label>
            <select
              {...register("status")}
              className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Original Price */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
              Original Price (₹) *
            </label>
            <input
              type="number"
              min="0"
              step="1"
              {...register("price", { required: "Price is required", min: 0 })}
              className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
          </div>

          {/* Discount Price */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
              Discounted Price (₹)
            </label>
            <input
              type="number"
              min="0"
              step="1"
              {...register("discountPrice")}
              placeholder="Optional sale price"
              className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

        </div>

        {/* Image URL */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
            Image URL *
          </label>
          <input
            type="url"
            {...register("imageUrl", { required: "Image URL is required" })}
            placeholder="https://images.unsplash.com/..."
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {errors.imageUrl && <p className="text-xs text-red-500 mt-1">{errors.imageUrl.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
            Description
          </label>
          <textarea
            rows={3}
            {...register("description")}
            placeholder="Key product features and details..."
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 dark:border-slate-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg text-sm transition-all shadow-md disabled:opacity-50"
          >
            {loading ? "Saving..." : initialData ? "Update Product" : "Create Product"}
          </button>
        </div>

      </form>
    </Modal>
  );
};
