import { Check, Clock } from 'lucide-react';
import { STATUS, STATUS_LABELS } from '../../constants';

/**
 * Colored status pill. Not interactive: status changes use the explicit
 * Finish/Undo actions so the affordance is unambiguous.
 * Props: `status`.
 */
export default function StatusBadge({ status }) {
  const isFinished = status === STATUS.FINISHED;
  const classes = isFinished
    ? 'badge-success text-success-content'
    : 'badge-warning text-warning-content';

  return (
    <span className={`badge badge-sm gap-1 whitespace-nowrap ${classes}`}>
      {isFinished ? (
        <Check className="w-3 h-3" aria-hidden="true" />
      ) : (
        <Clock className="w-3 h-3" aria-hidden="true" />
      )}
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
