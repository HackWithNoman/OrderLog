import { ChevronLeft, ChevronRight } from "lucide-react";

const ELLIPSIS_LEFT = "ellipsis-left";
const ELLIPSIS_RIGHT = "ellipsis-right";

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

/**
 * Page numbers to render, with ellipses when the range is wide.
 * Example: 1 … 4 5 6 … 20
 */
function getPageItems(currentPage, totalPages) {
  const pageNeighbours = 1;
  const totalPageNumbers = pageNeighbours + 5;

  if (totalPages <= totalPageNumbers) {
    return range(1, totalPages);
  }

  const leftSibling = Math.max(currentPage - pageNeighbours, 1);
  const rightSibling = Math.min(currentPage + pageNeighbours, totalPages);

  const showLeftEllipsis = leftSibling > 3;
  const showRightEllipsis = rightSibling < totalPages - 2;

  if (!showLeftEllipsis && showRightEllipsis) {
    return [...range(1, 3 + pageNeighbours * 2), ELLIPSIS_RIGHT, totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    return [
      1,
      ELLIPSIS_LEFT,
      ...range(totalPages - (3 + pageNeighbours * 2) + 1, totalPages),
    ];
  }

  return [
    1,
    ELLIPSIS_LEFT,
    ...range(leftSibling, rightSibling),
    ELLIPSIS_RIGHT,
    totalPages,
  ];
}

/**
 * Pagination footer for the order list.
 * Props: `page`, `pageSize`, `totalItems`, `pageSizeOptions`,
 * `onPageChange(page)` and `onPageSizeChange(size)`.
 */
export default function Pagination({
  page,
  pageSize,
  totalItems,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const pageItems = getPageItems(page, totalPages);

  return (
    <nav
      aria-label="Order pagination"
      className="card bg-base-100 shadow-sm border border-base-200"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3">
        <p
          className="text-xs text-base-content/70 order-2 sm:order-1"
          aria-live="polite"
          aria-atomic="true"
        >
          Showing{" "}
          <span className="font-semibold text-base-content/90">
            {start}–{end}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-base-content/90">
            {totalItems}
          </span>{" "}
          orders
        </p>

        <div className="flex items-center gap-3 order-1 sm:order-2">
          <label className="flex items-center gap-1.5 text-xs text-base-content/70">
            Rows
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="select select-bordered select-xs rounded-lg"
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <div className="join">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="join-item btn btn-sm btn-ghost"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>

            <span className="join-item flex h-8 min-w-16 items-center justify-center border border-base-300 bg-base-200 px-2.5 text-xs font-medium tabular-nums sm:hidden">
              {page} / {totalPages}
            </span>

            {pageItems.map((item) => {
              if (item === ELLIPSIS_LEFT || item === ELLIPSIS_RIGHT) {
                return (
                  <span
                    key={item}
                    className="join-item btn btn-sm btn-disabled hidden sm:inline-flex"
                    aria-hidden="true"
                  >
                    …
                  </span>
                );
              }

              const isCurrent = item === page;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onPageChange(item)}
                  aria-label={`Page ${item}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`join-item btn btn-sm hidden sm:inline-flex ${
                    isCurrent
                      ? "btn-active font-bold"
                      : "btn-ghost text-base-content/70"
                  }`}
                >
                  {item}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="join-item btn btn-sm btn-ghost"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
