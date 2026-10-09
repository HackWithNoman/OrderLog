import { ShoppingBag } from 'lucide-react';

/**
 * Placeholder shown when there are no orders to display.
 * Props: `title` and `description`.
 */
export default function EmptyState({ title, description }) {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 text-center py-12 px-4">
      <div className="card-body items-center">
        <div className="p-4 bg-base-200 rounded-full mb-2">
          <ShoppingBag className="w-10 h-10 text-base-content/30" />
        </div>
        <h3 className="text-lg font-bold text-base-content/80">{title}</h3>
        <p className="text-sm text-base-content/60 max-w-sm">{description}</p>
      </div>
    </div>
  );
}
