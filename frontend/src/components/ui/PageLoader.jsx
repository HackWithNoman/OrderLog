import { ShoppingBag } from "lucide-react";

/**
 * Full-page loader shown while the first batch of orders is being fetched
 * (i.e. when there is no cached list to paint immediately).
 * Props: optional `label`.
 */
export default function PageLoader({ label = "Loading orders…" }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-base-200/95 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
        <ShoppingBag className="w-5 h-5 text-primary absolute" aria-hidden="true" />
      </div>

      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-base-content/80">{label}</p>
        <p className="text-xs text-base-content/70">
          Connecting to the database…
        </p>
      </div>
    </div>
  );
}
