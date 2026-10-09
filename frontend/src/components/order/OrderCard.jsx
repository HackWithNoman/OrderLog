import { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Phone, StickyNote, Trash2 } from 'lucide-react';
import { STATUS } from '../../constants';
import StatusBadge from '../ui/StatusBadge';

/**
 * Mobile card for a single order with an expandable address/note section.
 * Props: `order`, `onToggleStatus(id)`, `onDelete(id)`.
 */
export default function OrderCard({ order, onToggleStatus, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const isFinished = order.status === STATUS.FINISHED;

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 transition-all">
      <div className="card-body p-4 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-bold text-base text-base-content">{order.name}</h3>
            <div className="flex items-center gap-2 text-xs text-base-content/60 mt-0.5">
              <Phone className="w-3 h-3" />
              <span>{order.phone}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="font-mono font-bold text-base text-success block">
              ৳{Number(order.amount || 0).toLocaleString('en-IN')}
            </span>
            <div className="mt-1">
              <StatusBadge status={order.status} />
            </div>
          </div>
        </div>

        <div className="text-xs text-base-content/70 bg-base-200/50 p-2.5 rounded-lg space-y-1.5">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-base-content/50 shrink-0 mt-0.5" />
            <p className={expanded ? '' : 'line-clamp-1'}>{order.address || '—'}</p>
          </div>
          {expanded && order.note && (
            <div className="flex items-start gap-2">
              <StickyNote className="w-3.5 h-3.5 text-base-content/50 shrink-0 mt-0.5" />
              <p>{order.note}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-base-200">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="btn btn-ghost btn-xs text-base-content/60 gap-1 pl-0"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Less details' : 'More details'}
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleStatus(order.id)}
              className={`btn btn-xs rounded-lg ${
                isFinished ? 'btn-outline btn-warning' : 'btn-success text-white'
              }`}
            >
              {isFinished ? 'Undo' : 'Finish'}
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
        </div>
      </div>
    </div>
  );
}
