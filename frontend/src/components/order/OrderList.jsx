import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import OrderTable from './OrderTable';
import OrderCard from './OrderCard';

/**
 * Renders the order collection: a loading skeleton, an empty state, or a
 * desktop table plus a mobile card list.
 * Props: `orders`, `loading`, `updatingIds`, `onToggleStatus(id)`,
 * `onDelete(id)`, `emptyTitle`, `emptyDescription`.
 */
export default function OrderList({
  orders,
  loading,
  updatingIds,
  onToggleStatus,
  onDelete,
  emptyTitle,
  emptyDescription,
}) {
  if (loading && orders.length === 0) {
    return <Skeleton />;
  }

  if (orders.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <section aria-label="Orders">
      <div className="block lg:hidden space-y-3">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            updating={updatingIds?.has(order.id) ?? false}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
          />
        ))}
      </div>

      <OrderTable
        orders={orders}
        updatingIds={updatingIds}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
      />
    </section>
  );
}
