import { Banknote, CheckCircle2, Clock, ShoppingBag } from 'lucide-react';
import { formatAmount, formatCount } from '../../lib/format';

/**
 * Summary cards shown at the top of the page.
 * Props: `total`, `notDone`, `finished` counts and `totalAmount` (number).
 */
export default function Stats({ total, notDone, finished, totalAmount }) {
  return (
    <section
      aria-label="Order summary"
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
    >
      <StatCard
        icon={ShoppingBag}
        title="Total Orders"
        value={formatCount(total)}
        tone="text-primary"
        tint="bg-primary/10"
        hint="All orders"
      />
      <StatCard
        icon={Clock}
        title="Not Done"
        value={formatCount(notDone)}
        tone="text-warning"
        tint="bg-warning/10"
        hint="Ready to export"
      />
      <StatCard
        icon={CheckCircle2}
        title="Finished"
        value={formatCount(finished)}
        tone="text-success"
        tint="bg-success/10"
        hint="Already exported"
      />
      <StatCard
        icon={Banknote}
        title="Total Value"
        value={formatAmount(totalAmount)}
        tone="text-info"
        tint="bg-info/10"
        hint="Not done orders"
      />
    </section>
  );
}

function StatCard({ icon: Icon, title, value, tone, tint, hint }) {
  return (
    <div className="stat bg-base-100 rounded-2xl p-4 shadow-sm border border-base-200">
      <div className="flex items-start justify-between gap-2">
        <div className="stat-title text-xs sm:text-sm font-medium">{title}</div>
        <span
          className={`rounded-lg p-1.5 ${tint} ${tone}`}
          aria-hidden="true"
        >
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <div className={`stat-value text-lg sm:text-2xl mt-1 tabular-nums break-words ${tone}`}>
        {value}
      </div>
      <div className="stat-desc text-xs mt-1 text-base-content/70">{hint}</div>
    </div>
  );
}
