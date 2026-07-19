import React, { useState, useEffect } from "react";
import { Boxes, Edit2, RefreshCw } from "lucide-react";
import { inventoryService } from "../../services/inventoryService";
import { DataTable } from "../../components/tables/DataTable";
import { InventoryFormModal } from "../../components/forms/InventoryFormModal";
import { formatDate } from "../../utils/formatters";
import toast from "react-hot-toast";

export const AdminInventoryPage = () => {
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await inventoryService.getAllInventory();
      setInventoryList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdateStock = async (productId, updatedStock) => {
    setActionLoading(true);
    try {
      await inventoryService.updateInventory(productId, updatedStock);
      toast.success("Inventory stock levels updated successfully!");
      setSelectedInventory(null);
      await fetchInventory();
    } catch (error) {
      toast.error(error.message || "Failed to update inventory");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    {
      header: "Product ID",
      key: "productId",
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-gray-900 dark:text-white">
          {row.productId}
        </span>
      )
    },
    {
      header: "Total Warehouse Stock",
      key: "totalStock",
      sortable: true,
      render: (row) => (
        <span className="font-extrabold text-gray-900 dark:text-white">
          {row.totalStock || 0}
        </span>
      )
    },
    {
      header: "Available (For Sale)",
      key: "availableStock",
      sortable: true,
      render: (row) => (
        <span
          className={`font-black px-2.5 py-1 rounded text-xs ${
            Number(row.availableStock) <= 0
              ? "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300"
              : Number(row.availableStock) <= 5
              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
          }`}
        >
          {row.availableStock || 0} units
        </span>
      )
    },
    {
      header: "Reserved (In Orders)",
      key: "reservedStock",
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-gray-600 dark:text-slate-400">
          {row.reservedStock || 0}
        </span>
      )
    },
    {
      header: "Last Updated",
      key: "lastUpdated",
      sortable: true,
      render: (row) => (
        <span className="text-xs text-gray-400">
          {formatDate(row.lastUpdated)}
        </span>
      )
    },
    {
      header: "Actions",
      key: "actions",
      render: (row) => (
        <button
          onClick={() => setSelectedInventory(row)}
          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded transition-colors flex items-center text-xs font-bold"
        >
          <Edit2 className="w-4 h-4 mr-1" /> Adjust Stock
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center">
            <Boxes className="w-6 h-6 mr-2 text-amber-500" /> Inventory Stock Manager
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Monitor and adjust real-time stock levels synchronized with DynamoDB
          </p>
        </div>

        <button
          onClick={fetchInventory}
          className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 text-gray-700 dark:text-slate-200 font-bold px-4 py-2.5 rounded-lg text-xs flex items-center shadow-xs"
        >
          <RefreshCw className="w-4 h-4 mr-1.5" /> Sync Stock Data
        </button>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={inventoryList}
        loading={loading}
        searchPlaceholder="Search inventory by Product ID..."
      />

      {/* Stock Adjustment Modal */}
      {selectedInventory && (
        <InventoryFormModal
          isOpen={!!selectedInventory}
          onClose={() => setSelectedInventory(null)}
          onSubmit={handleUpdateStock}
          inventoryData={selectedInventory}
          loading={actionLoading}
        />
      )}

    </div>
  );
};
