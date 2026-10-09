import { Search, X, FileSpreadsheet } from 'lucide-react';
import { STATUS_FILTERS } from '../../constants';

/**
 * Search box, status filter tabs and the export button.
 * Props: search/filter state, their change handlers, `onExport` and the
 * number of orders currently available to export (`notDoneCount`).
 */
export default function OrderToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onFilterChange,
  onExport,
  notDoneCount,
}) {
  const canExport = notDoneCount > 0;

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-base-content/50" />
            <input
              type="text"
              placeholder="Search by name, phone, address..."
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              className="input input-bordered input-md w-full pl-10 text-sm rounded-xl"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="btn btn-xs btn-circle btn-ghost absolute right-2 top-2.5"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-base-200 p-1 rounded-xl self-start sm:self-auto w-full sm:w-auto">
            {STATUS_FILTERS.map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => onFilterChange(status)}
                className={`flex-1 sm:flex-none btn btn-xs sm:btn-sm border-none rounded-lg text-xs ${
                  statusFilter === status
                    ? 'bg-base-100 text-base-content font-bold shadow-sm'
                    : 'btn-ghost text-base-content/70'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end mt-1">
          <button
            type="button"
            onClick={onExport}
            disabled={!canExport}
            className="btn btn-success text-white btn-sm gap-2 rounded-xl disabled:opacity-50"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export {notDoneCount > 0 ? `(${notDoneCount})` : ''} to Excel
          </button>
        </div>
      </div>
    </div>
  );
}
