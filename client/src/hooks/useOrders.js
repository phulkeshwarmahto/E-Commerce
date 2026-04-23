import { useCallback, useEffect, useState } from "react";
import { createOrderRequest, getOrdersRequest } from "../api/orders.api";

export function useOrders(token) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!token) {
      setOrders([]);
      return;
    }

    setLoading(true);
    try {
      const data = await getOrdersRequest();
      setOrders(data.orders);
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

  return { orders, loading, placeOrder, reload: loadOrders };
}
