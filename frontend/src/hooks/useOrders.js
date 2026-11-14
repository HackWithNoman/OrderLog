import { useCallback, useEffect, useRef, useState } from "react";
import { STATUS } from "../constants";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
  /\/+$/,
  "",
);
const CACHE_KEY = "orderlog:orders:v1";

/** Re-fetch while the tab is visible so changes from other devices show up. */
const REFRESH_INTERVAL_MS = 60_000;

/** Normalize an order coming from the API or the cache. */
function normalizeOrder(order) {
  return { ...order, amount: String(order.amount) };
}

/**
 * Read the last-seen orders from localStorage so a reload can paint instantly.
 * Returns null when there is no usable cache.
 */
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.orders)) return null;

    return {
      orders: parsed.orders.map(normalizeOrder),
      savedAt: Number(parsed.savedAt) || 0,
    };
  } catch {
    return null;
  }
}

/** Persist the latest list. Best-effort: storage may be full or disabled. */
function writeCache(orders) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ savedAt: Date.now(), orders }),
    );
  } catch {
    // Caching is only an optimization; never break the app over it.
  }
}

async function fetchOrders(signal) {
  const response = await fetch(`${API_URL}/orders`, { signal });

  if (!response.ok) {
    throw new Error("Failed to load orders");
  }

  return (await response.json()).map(normalizeOrder);
}

/**
 * Owns the list of orders and exposes the operations the UI needs.
 *
 * The last list is cached in localStorage so mounts/reloads render it
 * immediately, then a background request refreshes it (stale-while-revalidate).
 */
export function useOrders() {
  const [cached] = useState(readCache);
  const [orders, setOrders] = useState(cached?.orders ?? []);
  const [loading, setLoading] = useState(!cached);

  const ordersRef = useRef(orders);
  const inFlightRef = useRef(null);
  const mutationSeq = useRef(0);
  const retryCount = useRef(0);
  const retryTimer = useRef(null);

  useEffect(() => {
    ordersRef.current = orders;
    writeCache(orders);
  }, [orders]);

  /** Fetch the latest orders. Concurrent callers share the same request. */
  const refresh = useCallback(function refresh() {
    if (inFlightRef.current) return inFlightRef.current.promise;

    const controller = new AbortController();
    const seq = mutationSeq.current;

    const promise = (async () => {
      try {
        const nextOrders = await fetchOrders(controller.signal);

        // A local mutation happened while this request was in flight; its
        // result is newer than this response, so don't overwrite it.
        if (seq !== mutationSeq.current) return;

        retryCount.current = 0;
        if (retryTimer.current) {
          window.clearTimeout(retryTimer.current);
          retryTimer.current = null;
        }

        setOrders(nextOrders);
      } catch (error) {
        if (error.name === "AbortError") return;

        console.error("Could not load orders:", error);

        // The API may still be warming up on app start; retry a few times.
        if (retryCount.current < 3) {
          retryCount.current += 1;
          retryTimer.current = window.setTimeout(refresh, 2000);
        }
      } finally {
        if (inFlightRef.current?.controller === controller) {
          inFlightRef.current = null;

          // Keep the skeleton up while retrying an initial failed load.
          if (retryCount.current === 0 || retryCount.current >= 3) {
            setLoading(false);
          }
        }
      }
    })();

    inFlightRef.current = { controller, promise };
    return promise;
  }, []);

  useEffect(() => {
    refresh();

    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };

    const timer = window.setInterval(refreshIfVisible, REFRESH_INTERVAL_MS);

    document.addEventListener("visibilitychange", refreshIfVisible);
    window.addEventListener("focus", refreshIfVisible);
    window.addEventListener("online", refreshIfVisible);

    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshIfVisible);
      window.removeEventListener("focus", refreshIfVisible);
      window.removeEventListener("online", refreshIfVisible);

      inFlightRef.current?.controller.abort();
      inFlightRef.current = null;

      if (retryTimer.current) {
        window.clearTimeout(retryTimer.current);
        retryTimer.current = null;
      }
    };
  }, [refresh]);

  /**
   * Mark in-flight reads as stale after a mutation, so they can't clobber the
   * mutation's result. The next refresh starts a fresh request.
   */
  const invalidateInFlight = useCallback(() => {
    mutationSeq.current += 1;
    inFlightRef.current = null;
  }, []);

  const addOrder = useCallback(
    async (draft) => {
      const response = await fetch(`${API_URL}/orders`, {
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

      const savedOrder = normalizeOrder(await response.json());

      const order = {
        ...savedOrder,
        status: STATUS.NOT_DONE,
      };

      invalidateInFlight();
      setOrders((previous) => [order, ...previous]);

      return order;
    },
    [invalidateInFlight],
  );

  const deleteOrder = useCallback(
    async (id) => {
      const response = await fetch(`${API_URL}/orders/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete order");
      }

      invalidateInFlight();
      setOrders((previous) => previous.filter((order) => order.id !== id));
    },
    [invalidateInFlight],
  );

  const toggleStatus = useCallback(
    async (id) => {
      const order = ordersRef.current.find((item) => item.id === id);

      if (!order) return;

      const newStatus =
        order.status === STATUS.FINISHED ? STATUS.NOT_DONE : STATUS.FINISHED;

      const response = await fetch(
        `${API_URL}/orders/${id}/status`,
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

      const updatedOrder = normalizeOrder(await response.json());

      invalidateInFlight();
      setOrders((previous) =>
        previous.map((item) => (item.id === id ? updatedOrder : item)),
      );
    },
    [invalidateInFlight],
  );

  /** Mark the given order ids as finished (used after a successful export). */

  const markFinished = useCallback(
    async (ids) => {
      await Promise.all(
        ids.map(async (id) => {
          const response = await fetch(
            `${API_URL}/orders/${id}/status`,
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

      invalidateInFlight();
      setOrders((previous) =>
        previous.map((order) =>
          ids.includes(order.id) ? { ...order, status: STATUS.FINISHED } : order,
        ),
      );
    },
    [invalidateInFlight],
  );

  return { orders, loading, addOrder, deleteOrder, toggleStatus, markFinished };
}
