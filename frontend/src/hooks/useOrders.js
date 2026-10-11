import { useCallback, useState } from "react";
import { STATUS } from "../constants";
import { useEffect } from "react";

/** Stable unique id for a new order. */
function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Owns the list of orders and exposes the operations the UI needs.
 * Orders are kept in memory only and reset on refresh.
 */
export function useOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch("http://localhost:5000/orders");

        if (!response.ok) {
          throw new Error("Failed to load orders");
        }

        const data = await response.json();

        setOrders(
          data.map((order) => ({
            ...order,
            amount: String(order.amount),
          })),
        );
      } catch (error) {
        console.error("Could not load orders:", error);
      }
    }

    loadOrders();
  }, []);

  const addOrder = useCallback(async (draft) => {
    const response = await fetch("http://localhost:5000/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: (draft.name || "").trim(),
        address: (draft.address || "").trim(),
        phone: (draft.phone || "").trim(),
        amount: Number(draft.amount || 0),
        note: (draft.note || "").trim(),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save order");
    }

    const savedOrder = await response.json();

    const order = {
      ...savedOrder,
      amount: String(savedOrder.amount),
      status: STATUS.NOT_DONE,
    };

    setOrders((previous) => [order, ...previous]);

    return order;
  }, []);

  const deleteOrder = useCallback(async (id) => {
    const response = await fetch(`http://localhost:5000/orders/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete order");
    }

    setOrders((previous) => previous.filter((order) => order.id !== id));
  }, []);

  const toggleStatus = useCallback(
    async (id) => {
      const order = orders.find((item) => item.id === id);

      if (!order) return;

      const newStatus =
        order.status === STATUS.FINISHED ? STATUS.NOT_DONE : STATUS.FINISHED;

      const response = await fetch(
        `http://localhost:5000/orders/${id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      const updatedOrder = await response.json();

      setOrders((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...updatedOrder,
                amount: String(updatedOrder.amount),
              }
            : item,
        ),
      );
    },
    [orders],
  );

  /** Mark the given order ids as finished (used after a successful export). */

  const markFinished = useCallback(async (ids) => {
    await Promise.all(
      ids.map(async (id) => {
        const response = await fetch(
          `http://localhost:5000/orders/${id}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: STATUS.FINISHED }),
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to update order ${id}`);
        }
      }),
    );

    setOrders((previous) =>
      previous.map((order) =>
        ids.includes(order.id) ? { ...order, status: STATUS.FINISHED } : order,
      ),
    );
  }, []);

  return { orders, addOrder, deleteOrder, toggleStatus, markFinished };
}
