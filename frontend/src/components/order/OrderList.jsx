import EmptyState from '../ui/EmptyState';
import OrderTable from './OrderTable';
import OrderCard from './OrderCard';

/**
 * Renders the order collection: an empty state, or a desktop table plus a
 * mobile card list.
 * Props: `orders`, `onToggleStatus(id)`, `onDelete(id)`, `emptyTitle`,
 * `emptyDescription`.
 */
export default function OrderList({
  orders,
  onToggleStatus,
  onDelete,
  emptyTitle,
  emptyDescription,
}) {
  if (orders.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <>
      <div className="block lg:hidden space-y-3">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
          />
        ))}
      </div>

      <OrderTable
        orders={orders}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
      />
    </>
  );
}
