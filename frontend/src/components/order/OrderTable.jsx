import { Loader2, Trash2 } from 'lucide-react';
import { STATUS } from '../../constants';
import { formatAmount } from '../../lib/format';
import StatusBadge from '../ui/StatusBadge';

/**
 * Desktop table of orders.
 * Props: `orders`, `onToggleStatus(id)`, `onDelete(id)`, `updatingIds`.
 */
export default function OrderTable({
  orders,
  onToggleStatus,
  onDelete,
  updatingIds,
}) {
  return (
    <div className="hidden lg:block card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
      <div className="overflow-x-auto overscroll-x-contain">
        <table className="table table-md w-full">
          <caption className="sr-only">Orders</caption>
          <thead>
            <tr className="bg-base-200/50 text-xs text-base-content/70">
              <th scope="col">Name</th>
              <th scope="col">Address</th>
              <th scope="col">Phone</th>
              <th scope="col">Amount</th>
              <th scope="col">Note</th>
              <th scope="col">Status</th>
              <th scope="col" className="text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const isFinished = order.status === STATUS.FINISHED;
              const isUpdating = updatingIds?.has(order.id) ?? false;

              return (
                <tr
                  key={order.id}
                  className="hover:bg-base-200/30 transition-colors text-sm"
                >
                  <td className="font-semibold text-base-content">
                    <div className="max-w-[12rem] truncate" title={order.name}>
                      {order.name}
                    </div>
                  </td>
                  <td>
                    <div
                      className="max-w-xs text-xs text-base-content/80 line-clamp-2"
                      title={order.address || undefined}
                    >
                      {order.address || '—'}
                    </div>
                  </td>
                  <td className="whitespace-nowrap text-xs tabular-nums">
                    {order.phone}
                  </td>
                  <td className="font-mono font-bold text-success whitespace-nowrap tabular-nums">
                    {formatAmount(order.amount)}
                  </td>
                  <td>
                    <div
                      className="max-w-[10rem] text-xs text-base-content/70 line-clamp-1"
                      title={order.note || undefined}
                    >
                      {order.note || '—'}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(order.id)}
                        disabled={isUpdating}
                        aria-label={
                          isFinished
                            ? `Mark order for ${order.name} as not done`
                            : `Mark order for ${order.name} as finished`
                        }
                        className="btn btn-ghost btn-xs text-base-content/70 hover:text-primary gap-1"
                      >
                        {isUpdating && (
                          <Loader2
                            className="w-3.5 h-3.5 animate-spin"
                            aria-hidden="true"
                          />
                        )}
                        {isFinished ? 'Undo' : 'Finish'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(order.id)}
                        aria-label={`Delete order for ${order.name}`}
                        title="Delete order"
                        className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
