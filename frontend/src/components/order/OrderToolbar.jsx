import { FileSpreadsheet, Loader2, Search, X } from 'lucide-react';
import { STATUS_FILTERS, STATUS_LABELS } from '../../constants';
import { formatCount } from '../../lib/format';

/**
 * Search box, status filter tabs and the export button.
 * Props: search/filter state, their change handlers, `onExport`, the number of
 * orders available to export (`notDoneCount`), per-filter `counts`, and the
 * `exporting` flag.
 */
export default function OrderToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onFilterChange,
  onExport,
  notDoneCount,
  counts,
  exporting = false,
}) {
  const canExport = notDoneCount > 0;

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4 sm:p-5 gap-3">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <label htmlFor="order-search" className="sr-only">
              Search orders
            </label>
            <Search
              className="w-4 h-4 absolute left-3.5 top-3.5 text-base-content/50 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="order-search"
              type="search"
              placeholder="Search name, phone, or address…"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              className="input input-bordered input-md w-full pl-10 pr-9 text-sm rounded-xl"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="btn btn-xs btn-circle btn-ghost absolute right-2 top-2.5"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          <div
            role="group"
            aria-label="Filter by status"
            className="flex items-center gap-1 bg-base-200 p-1 rounded-xl self-start sm:self-auto w-full sm:w-auto"
          >
            {STATUS_FILTERS.map((status) => {
              const active = statusFilter === status;
              const label =
                status === 'All' ? 'All' : STATUS_LABELS[status] ?? status;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => onFilterChange(status)}
                  aria-pressed={active}
                  className={`flex-1 sm:flex-none btn btn-xs sm:btn-sm border-none rounded-lg text-xs gap-1.5 ${
                    active
                      ? 'bg-base-100 text-base-content font-bold shadow-sm'
                      : 'btn-ghost text-base-content/70'
                  }`}
                >
                  {label}
                  {counts && (
                    <span className="text-[10px] font-medium tabular-nums opacity-60">
                      {formatCount(counts[status] ?? 0)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-1.5 sm:gap-3">
          <p className="text-[11px] text-base-content/70 sm:text-right">
            Exports not-done orders to Excel and marks them finished.
          </p>
          <button
            type="button"
            onClick={onExport}
            disabled={!canExport || exporting}
            title={!canExport ? 'No not-done orders to export' : undefined}
            className="btn btn-success btn-sm gap-2 rounded-xl disabled:opacity-50 self-end sm:self-auto"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
            )}
            {exporting
              ? 'Exporting…'
              : `Export & Finish${notDoneCount > 0 ? ` (${notDoneCount})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
