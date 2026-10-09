/**
 * Summary cards shown at the top of the page.
 * Props: `total`, `notDone`, `finished` counts and `totalAmount` (number).
 */
export default function Stats({ total, notDone, finished, totalAmount }) {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <StatCard title="Total Orders" value={total} tone="text-primary" hint="All orders" />
      <StatCard title="Not Done" value={notDone} tone="text-warning" hint="Ready to export" />
      <StatCard title="Finished" value={finished} tone="text-success" hint="Already exported" />
      <StatCard
        title="Total Value"
        value={`৳${Number(totalAmount || 0).toLocaleString('en-IN')}`}
        tone="text-info"
        hint="Not done orders"
      />
    </section>
  );
}

function StatCard({ title, value, tone, hint }) {
  return (
    <div className="stat bg-base-100 rounded-2xl p-4 shadow-sm border border-base-200">
      <div className="stat-title text-xs sm:text-sm font-medium">{title}</div>
      <div className={`stat-value text-xl sm:text-2xl mt-1 ${tone}`}>{value}</div>
      <div className="stat-desc text-xs mt-1">{hint}</div>
    </div>
  );
}
