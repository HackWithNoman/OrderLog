import { Check, Clock } from 'lucide-react';
import { STATUS } from '../../constants';

/**
 * Colored status pill. Clicking it (when `onClick` is given) toggles status.
 * Props: `status` and optional `onClick`.
 */
export default function StatusBadge({ status, onClick }) {
  const isFinished = status === STATUS.FINISHED;
  const classes = isFinished
    ? 'badge-success text-white'
    : 'badge-warning text-warning-content';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`badge badge-sm gap-1 ${classes} ${
        onClick ? 'cursor-pointer transition-transform active:scale-95' : ''
      }`}
    >
      {isFinished ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {status}
    </button>
  );
}
