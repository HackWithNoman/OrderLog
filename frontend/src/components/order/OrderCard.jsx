import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  MapPin,
  Phone,
  StickyNote,
  Trash2,
} from 'lucide-react';
import { STATUS } from '../../constants';
import { formatAmount } from '../../lib/format';
import StatusBadge from '../ui/StatusBadge';

/**
 * Mobile card for a single order with an expandable address/note section.
 * Props: `order`, `onToggleStatus(id)`, `onDelete(id)`, `updating`.
 */
export default function OrderCard({
  order,
  onToggleStatus,
  onDelete,
  updating = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const isFinished = order.status === STATUS.FINISHED;
  const detailsId = `order-details-${order.id}`;

  return (
    <article className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-base text-base-content break-words">
              {order.name}
            </h3>
            <div className="flex items-center gap-2 text-xs text-base-content/70 mt-0.5">
              <Phone className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span className="tabular-nums">{order.phone}</span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="font-mono font-bold text-base text-success block tabular-nums">
              {formatAmount(order.amount)}
            </span>
            <div className="mt-1">
              <StatusBadge status={order.status} />
            </div>
          </div>
        </div>

        <div
          id={detailsId}
          className="text-xs text-base-content/70 bg-base-200/50 p-2.5 rounded-lg space-y-1.5"
        >
          <div className="flex items-start gap-2">
            <MapPin
              className="w-3.5 h-3.5 text-base-content/50 shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p className={expanded ? 'break-words' : 'line-clamp-1'}>
              {order.address || '—'}
            </p>
          </div>
          {expanded && order.note && (
            <div className="flex items-start gap-2">
              <StickyNote
                className="w-3.5 h-3.5 text-base-content/50 shrink-0 mt-0.5"
                aria-hidden="true"
              />
              <p className="break-words">{order.note}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-base-200">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            aria-controls={detailsId}
            className="btn btn-ghost btn-xs text-base-content/70 gap-1 pl-0"
          >
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            {expanded ? 'Less details' : 'More details'}
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleStatus(order.id)}
              disabled={updating}
              aria-label={
                isFinished
                  ? `Mark order for ${order.name} as not done`
                  : `Mark order for ${order.name} as finished`
              }
              className={`btn btn-xs rounded-lg gap-1 ${
                isFinished ? 'btn-outline btn-warning' : 'btn-success'
              }`}
            >
              {updating && (
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
        </div>
      </div>
    </article>
  );
}
