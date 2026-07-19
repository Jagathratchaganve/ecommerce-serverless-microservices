import React from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed? This action cannot be undone.",
  confirmText = "Delete",
  confirmVariant = "danger",
  loading = false
}) => {
  const buttonVariants = {
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-amber-600 hover:bg-amber-700 text-white",
    primary: "bg-blue-600 hover:bg-blue-700 text-white"
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start space-x-4">
        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          disabled={loading}
          onClick={onClose}
          className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          disabled={loading}
          onClick={onConfirm}
          className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-xs transition-colors flex items-center ${buttonVariants[confirmVariant] || buttonVariants.danger}`}
        >
          {loading ? "Processing..." : confirmText}
        </button>
      </div>
    </Modal>
  );
};
