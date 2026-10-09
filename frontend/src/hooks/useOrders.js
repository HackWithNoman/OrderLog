import { useCallback, useState } from 'react';
import { STATUS } from '../constants';

/** Stable unique id for a new order. */
function createId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
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

  const addOrder = useCallback((draft) => {
    const order = {
      id: createId(),
      name: (draft.name || '').trim(),
      address: (draft.address || '').trim(),
      phone: (draft.phone || '').trim(),
      amount: String(draft.amount || '').trim(),
      note: (draft.note || '').trim(),
      status: STATUS.NOT_DONE,
      createdAt: new Date().toISOString(),
    };
    setOrders((previous) => [order, ...previous]);
    return order;
  }, []);

  const deleteOrder = useCallback((id) => {
    setOrders((previous) => previous.filter((order) => order.id !== id));
  }, []);

  const toggleStatus = useCallback((id) => {
    setOrders((previous) =>
      previous.map((order) =>
        order.id === id
          ? {
              ...order,
              status:
                order.status === STATUS.FINISHED
                  ? STATUS.NOT_DONE
                  : STATUS.FINISHED,
            }
          : order,
      ),
    );
  }, []);

  /** Mark the given order ids as finished (used after a successful export). */
  const markFinished = useCallback((ids) => {
    const finishedIds = new Set(ids);
    setOrders((previous) =>
      previous.map((order) =>
        finishedIds.has(order.id) ? { ...order, status: STATUS.FINISHED } : order,
      ),
    );
  }, []);

  return { orders, addOrder, deleteOrder, toggleStatus, markFinished };
}
