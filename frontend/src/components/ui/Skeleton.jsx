/**
 * Placeholder rows shown while the first batch of orders is loading.
 * Roughly matches the order table's footprint so the layout doesn't jump
 * when the real data arrives.
 */
export default function Skeleton({ rows = 6 }) {
  return (
    <div
      className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading orders…</span>

      <div className="p-4 sm:p-5 space-y-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className="skeleton h-4 w-1/4 max-w-40" />
            <div className="skeleton h-4 w-1/3 max-w-56" />
            <div className="skeleton h-4 w-20 shrink-0" />
            <div className="skeleton h-4 flex-1" />
            <div className="skeleton h-6 w-20 shrink-0 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
