import React, { useState } from "react";
import { Plus, Edit2, Trash2, ShieldCheck } from "lucide-react";
import { useProducts } from "../../contexts/ProductContext";
import { DataTable } from "../../components/tables/DataTable";
import { ProductFormModal } from "../../components/forms/ProductFormModal";
import { ConfirmationDialog } from "../../components/common/ConfirmationDialog";
import { formatCurrency, formatDate } from "../../utils/formatters";

export const AdminProductsPage = () => {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handleCreateOrUpdate = async (formData) => {
    setActionLoading(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id || editingProduct.productId, formData);
      } else {
        await createProduct(formData);
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setActionLoading(true);
    try {
      await deleteProduct(deleteId);
      setDeleteId(null);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: "Product",
      key: "name",
      sortable: true,
      render: (row) => (
        <div className="flex items-center space-x-3">
          <img
            src={row.imageUrl || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"}
            alt={row.name}
            className="w-10 h-10 object-contain bg-gray-50 dark:bg-slate-900 rounded p-1"
          />
          <div>
            <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{row.name}</p>
            <p className="text-[11px] text-gray-400 font-mono">ID: {row.id || row.productId}</p>
          </div>
        </div>
      )
    },
    {
      header: "Brand & Category",
      key: "brand",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-gray-800 dark:text-slate-200">{row.brand}</span>
          <p className="text-[11px] text-gray-400">{row.category}</p>
        </div>
      )
    },
    {
      header: "Price",
      key: "price",
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-gray-900 dark:text-white">
            {formatCurrency(row.discountPrice || row.price)}
          </span>
          {row.discountPrice && row.discountPrice < row.price && (
            <span className="text-[11px] text-gray-400 line-through ml-1">
              {formatCurrency(row.price)}
            </span>
          )}
        </div>
      )
    },
    {
      header: "Status",
      key: "status",
      sortable: true,
      render: (row) => (
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
            row.status === "ACTIVE"
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
          }`}
        >
          {row.status}
        </span>
      )
    },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setEditingProduct(row);
              setIsModalOpen(true);
            }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded transition-colors"
            title="Edit product"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteId(row.id || row.productId)}
            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-slate-700 rounded transition-colors"
            title="Delete product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Product Catalogue Manager
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Add, update, or remove products across DynamoDB tables
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs flex items-center shadow-md transition-all"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Add New Product
        </button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        searchPlaceholder="Search products by title, brand or category..."
      />

      {/* Product Create/Edit Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleCreateOrUpdate}
        initialData={editingProduct}
        loading={actionLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message="Are you sure you want to delete this product? This will permanently remove it from the product catalog."
        loading={actionLoading}
      />

    </div>
  );
};
