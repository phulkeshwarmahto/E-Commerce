import { useCallback, useEffect, useState } from "react";
import { createOrderRequest, getOrdersRequest } from "../api/orders.api";

export function useOrders(token) {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });
  const [loading, setLoading] = useState(false);

  const loadOrders = useCallback(async (page = 1, limit = 10) => {
    if (!token) {
      setOrders([]);
      return;
    }

    setLoading(true);
    try {
      const data = await getOrdersRequest(page, limit);
      setOrders(data.orders);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadOrders().catch(() => {});
  }, [loadOrders]);

  const placeOrder = async (payload) => {
    const data = await createOrderRequest(payload);
    setOrders((current) => [data.order, ...current]);
    return data.order;
  };

  const cancelOrder = async (orderId) => {
    const data = await cancelOrderRequest(orderId);
    setOrders((current) =>
      current.map((o) => (o.id === orderId ? data.order : o))
    );
    return data.order;
  };

  return {
    orders,
    pagination,
    loading,
    placeOrder,
    cancelOrder,
    reload: loadOrders,
  };
}
