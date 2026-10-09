import { Trash2 } from 'lucide-react';
import { STATUS } from '../../constants';
import StatusBadge from '../ui/StatusBadge';

/**
 * Desktop table of orders.
 * Props: `orders`, `onToggleStatus(id)`, `onDelete(id)`.
 */
export default function OrderTable({ orders, onToggleStatus, onDelete }) {
  return (
    <div className="hidden lg:block card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table table-md w-full">
          <thead>
            <tr className="bg-base-200/50 text-xs text-base-content/70">
              <th>Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Amount</th>
              <th>Note</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-base-200/30 transition-colors text-sm">
                <td className="font-semibold text-base-content">{order.name}</td>
                <td>
                  <div className="max-w-xs text-xs text-base-content/80" title={order.address}>
                    {order.address || '—'}
                  </div>
                </td>
                <td className="whitespace-nowrap text-xs">{order.phone}</td>
                <td className="font-mono font-bold text-success whitespace-nowrap">
                  ৳{Number(order.amount || 0).toLocaleString('en-IN')}
                </td>
                <td>
                  <div className="max-w-[10rem] text-xs text-base-content/70" title={order.note}>
                    {order.note || '—'}
                  </div>
                </td>
                <td>
                  <StatusBadge
                    status={order.status}
                    onClick={() => onToggleStatus(order.id)}
                  />
                </td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(order.id)}
                      className="btn btn-ghost btn-xs text-base-content/70 hover:text-primary"
                    >
                      {order.status === STATUS.FINISHED ? 'Undo' : 'Finish'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(order.id)}
                      className="btn btn-ghost btn-xs btn-square text-error hover:bg-error/10"
                      title="Delete order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
