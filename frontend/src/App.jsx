import { useEffect, useMemo, useRef, useState } from "react";
import { STATUS, EMPTY_ORDER_DRAFT } from "./constants";
import { parseOrderText } from "./lib/parseOrder";
import { exportOrdersToXlsx, buildExportFilename } from "./lib/exportXlsx";
import { useOrders } from "./hooks/useOrders";
import { useToast } from "./hooks/useToast";
import Header from "./components/layout/Header";
import Stats from "./components/layout/Stats";
import Toast from "./components/ui/Toast";
import PageLoader from "./components/ui/PageLoader";
import ConfirmDialog from "./components/ui/ConfirmDialog";
import PasteOrderBox from "./components/order/PasteOrderBox";
import OrderForm from "./components/order/OrderForm";
import OrderToolbar from "./components/order/OrderToolbar";
import OrderList from "./components/order/OrderList";
import Pagination from "./components/order/Pagination";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const THEME_STORAGE_KEY = "orderlog:theme";

/** True when `order` matches the toolbar's free-text search. */
function matchesSearch(order, term) {
  const query = term.trim().toLowerCase();
  if (!query) return true;

  return [order.name, order.phone, order.address, order.note]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Read the theme set by the pre-paint script in index.html. */
function getInitialTheme() {
  const fromDom = document.documentElement.dataset.theme;
  if (fromDom === "dark" || fromDom === "light") return fromDom;

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // localStorage may be unavailable; fall through to the system preference.
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function App() {
  const { orders, loading, addOrder, deleteOrder, toggleStatus, markFinished } =
    useOrders();
  const { toast, showToast, dismissToast } = useToast();

  const [theme, setTheme] = useState(getInitialTheme);
  const [draft, setDraft] = useState(EMPTY_ORDER_DRAFT);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [updatingIds, setUpdatingIds] = useState(() => new Set());
  const [confirm, setConfirm] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  const ordersTopRef = useRef(null);
  const pagingRef = useRef({ page: 1, pageSize: 10 });

  /* ---------------------------- derived values ---------------------------- */
  const notDoneOrders = useMemo(
    () => orders.filter((order) => order.status === STATUS.NOT_DONE),
    [orders],
  );
  const finishedCount = orders.length - notDoneOrders.length;

  const totalValue = useMemo(
    () =>
      notDoneOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0),
    [notDoneOrders],
  );

  const visibleOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;
      return matchesSearch(order, searchTerm) && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(visibleOrders.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pagedOrders = useMemo(
    () =>
      visibleOrders.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
      ),
    [visibleOrders, currentPage, pageSize],
  );

  const counts = {
    All: orders.length,
    [STATUS.NOT_DONE]: notDoneOrders.length,
    [STATUS.FINISHED]: finishedCount,
  };

  const hasDraft = Object.values(draft).some(
    (value) => String(value).trim() !== "",
  );

  /* -------------------------------- effects ------------------------------- */
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Persisting the theme is a nice-to-have; ignore storage failures.
    }

    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#1d232a" : "#f7f6f2");
  }, [theme]);

  // Warn before closing the tab while an order draft has unsaved content.
  useEffect(() => {
    if (!hasDraft) return undefined;

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasDraft]);

  // Page changes replace the rows above the footer; bring the list back into
  // view so the new page is visible (and respect reduced-motion preferences).
  useEffect(() => {
    const previous = pagingRef.current;
    if (previous.page === currentPage && previous.pageSize === pageSize) {
      return;
    }

    pagingRef.current = { page: currentPage, pageSize };
    ordersTopRef.current?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  }, [currentPage, pageSize]);

  /* ------------------------------- handlers ------------------------------- */
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPage(1);
  };

  const handleFilterChange = (value) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setPage(1);
  };

  const handleParsed = (text) => {
    const parsed = parseOrderText(text);
    setDraft(parsed);
    setErrors({});

    const found = [
      parsed.name,
      parsed.phone,
      parsed.address,
      parsed.amount,
    ].filter(Boolean).length;
    if (found === 0) {
      showToast(
        "Could not read any fields. Please fill the form manually.",
        "error",
      );
    } else {
      showToast("Parsed. Review the fields below before adding.", "info");
    }
  };

  const handleFieldChange = (field, value) => {
    setDraft((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    const nextErrors = {};
    if (!draft.name.trim()) nextErrors.name = "Enter the customer’s name.";
    if (!draft.phone.trim()) nextErrors.phone = "Enter a phone number.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      document
        .getElementById(nextErrors.name ? "name" : "phone")
        ?.focus();
      showToast("Add the missing order details.", "error");
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const order = await addOrder(draft);
      setDraft(EMPTY_ORDER_DRAFT);

      // New orders go to the top of page 1. If the current filter or search
      // would hide it, reset them so the user actually sees the new row.
      if (statusFilter !== "All" && statusFilter !== order.status) {
        setStatusFilter("All");
      }
      if (!matchesSearch(order, searchTerm)) {
        setSearchTerm("");
      }
      setPage(1);

      showToast(`Order for ${order.name} added.`, "success");
    } catch (error) {
      console.error(error);
      showToast("Couldn’t save the order. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    const order = orders.find((item) => item.id === id);
    if (!order || updatingIds.has(id)) return;

    setUpdatingIds((previous) => {
      const next = new Set(previous);
      next.add(id);
      return next;
    });

    try {
      await toggleStatus(id);
      const wasFinished = order.status === STATUS.FINISHED;
      showToast(
        wasFinished
          ? `Order for ${order.name} marked as not done.`
          : `Order for ${order.name} marked as finished.`,
        "success",
      );
    } catch (error) {
      console.error(error);
      showToast("Couldn’t update the order status. Please try again.", "error");
    } finally {
      setUpdatingIds((previous) => {
        const next = new Set(previous);
        next.delete(id);
        return next;
      });
    }
  };

  const requestDelete = (id) => {
    const order = orders.find((item) => item.id === id);
    if (!order) return;
    setConfirm({ type: "delete", order });
  };

  const requestExport = () => {
    if (notDoneOrders.length === 0) return;
    setConfirm({ type: "export" });
  };

  const handleConfirm = async () => {
    if (!confirm || confirmBusy) return;

    setConfirmBusy(true);

    try {
      if (confirm.type === "delete") {
        await deleteOrder(confirm.order.id);
        showToast(`Deleted order for ${confirm.order.name}.`, "info");
      } else {
        setExporting(true);
        await exportOrdersToXlsx(notDoneOrders, buildExportFilename());
        await markFinished(notDoneOrders.map((order) => order.id));
        showToast(
          `Exported ${notDoneOrders.length} order${
            notDoneOrders.length === 1 ? "" : "s"
          } and marked them finished.`,
          "success",
        );
      }
      setConfirm(null);
    } catch (error) {
      console.error(error);
      showToast(
        confirm.type === "delete"
          ? "Couldn’t delete the order. Please try again."
          : "Export failed. Please try again.",
        "error",
      );
    } finally {
      setConfirmBusy(false);
      setExporting(false);
    }
  };

  /* -------------------------------- render -------------------------------- */
  return (
    <div
      data-theme={theme}
      className="min-h-screen bg-base-200/60 p-3 sm:p-6 lg:p-8 transition-colors duration-200"
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-lg focus:bg-base-100 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Skip to main content
      </a>

      {loading && <PageLoader />}

      <Toast toast={toast} onDismiss={dismissToast} />

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <Header
          theme={theme}
          onToggleTheme={() =>
            setTheme((previous) => (previous === "light" ? "dark" : "light"))
          }
        />

        <Stats
          total={orders.length}
          notDone={notDoneOrders.length}
          finished={finishedCount}
          totalAmount={totalValue}
        />

        <main
          id="main"
          tabIndex={-1}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start scroll-mt-4 focus:outline-none"
        >
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="card bg-base-100 shadow-sm border border-base-200 lg:sticky lg:top-6">
              <div className="card-body p-4 sm:p-6">
                <h2 className="card-title text-lg font-bold border-b pb-3 mb-1">
                  Add New Order
                </h2>
                <PasteOrderBox onParsed={handleParsed} />
                <div className="divider my-1 text-xs text-base-content/70">
                  or edit manually
                </div>
                <OrderForm
                  value={draft}
                  onChange={handleFieldChange}
                  onSubmit={handleSubmit}
                  submitting={saving}
                  errors={errors}
                />
              </div>
            </div>
          </div>

          <div
            ref={ordersTopRef}
            className="lg:col-span-7 xl:col-span-8 space-y-4 scroll-mt-4"
          >
            <OrderToolbar
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              statusFilter={statusFilter}
              onFilterChange={handleFilterChange}
              onExport={requestExport}
              notDoneCount={notDoneOrders.length}
              counts={counts}
              exporting={exporting}
            />

            <OrderList
              orders={pagedOrders}
              loading={loading}
              updatingIds={updatingIds}
              onToggleStatus={handleToggleStatus}
              onDelete={requestDelete}
              emptyTitle="No orders found"
              emptyDescription={
                searchTerm || statusFilter !== "All"
                  ? "Try adjusting your search or status filter."
                  : "Paste an order above to get started."
              }
            />

            {visibleOrders.length > 0 && (
              <Pagination
                page={currentPage}
                pageSize={pageSize}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                totalItems={visibleOrders.length}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </div>
        </main>
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={
          confirm?.type === "export"
            ? `Export ${notDoneOrders.length} order${
                notDoneOrders.length === 1 ? "" : "s"
              }?`
            : "Delete this order?"
        }
        description={
          confirm?.type === "export"
            ? `This exports the ${notDoneOrders.length} not-done order${
                notDoneOrders.length === 1 ? "" : "s"
              } to Excel and marks them as finished.`
            : confirm?.order
              ? `“${confirm.order.name}” will be permanently deleted. This can’t be undone.`
              : ""
        }
        confirmLabel={
          confirm?.type === "export" ? "Export & finish" : "Delete order"
        }
        tone={confirm?.type === "export" ? "warning" : "error"}
        busy={confirmBusy}
        onCancel={() => {
          if (!confirmBusy) setConfirm(null);
        }}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
