import React from "react";
import { Package } from "lucide-react";
import { useOrder } from "../../contexts/OrderContext";
import { OrderCard } from "../../components/cards/OrderCard";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import { EmptyState } from "../../components/common/EmptyState";

export const MyOrdersPage = () => {
  const { orders, loading } = useOrder();

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your order history..." />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="order"
        title="No Orders Placed Yet!"
        description="You haven't placed any orders with us. Explore our catalog and grab the best deals today!"
        actionText="Start Shopping"
        actionLink="/products"
      />
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center">
          <Package className="w-6 h-6 mr-2 text-blue-600" /> My Orders ({orders.length})
        </h1>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.orderId} order={order} />
        ))}
      </div>
    </div>
  );
};
