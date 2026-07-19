import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal } from "../common/Modal";

export const InventoryFormModal = ({ isOpen, onClose, onSubmit, inventoryData = null, loading = false }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      totalStock: 0,
      availableStock: 0,
      reservedStock: 0
    }
  });

  useEffect(() => {
    if (inventoryData) {
      reset({
        totalStock: inventoryData.totalStock || 0,
        availableStock: inventoryData.availableStock || 0,
        reservedStock: inventoryData.reservedStock || 0
      });
    }
  }, [inventoryData, reset, isOpen]);

  const handleFormSubmit = (data) => {
    onSubmit(inventoryData.productId, {
      totalStock: Number(data.totalStock),
      availableStock: Number(data.availableStock),
      reservedStock: Number(data.reservedStock)
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Inventory: ${inventoryData?.productId || ""}`}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        
        {/* Total Stock */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
            Total Warehouse Stock *
          </label>
          <input
            type="number"
            min="0"
            {...register("totalStock", { required: "Total stock is required" })}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {errors.totalStock && <p className="text-xs text-red-500 mt-1">{errors.totalStock.message}</p>}
        </div>

        {/* Available Stock */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
            Available Stock (For Sale) *
          </label>
          <input
            type="number"
            min="0"
            {...register("availableStock", { required: "Available stock is required" })}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {errors.availableStock && <p className="text-xs text-red-500 mt-1">{errors.availableStock.message}</p>}
        </div>

        {/* Reserved Stock */}
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-slate-300 uppercase mb-1">
            Reserved Stock (In Orders)
          </label>
          <input
            type="number"
            min="0"
            {...register("reservedStock")}
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 rounded-lg text-sm transition-all shadow-md disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Stock Levels"}
          </button>
        </div>

      </form>
    </Modal>
  );
};
