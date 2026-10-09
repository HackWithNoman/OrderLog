import { useMemo, useState } from 'react';
import { STATUS, EMPTY_ORDER_DRAFT } from './constants';
import { parseOrderText } from './lib/parseOrder';
import { exportOrdersToXlsx, buildExportFilename } from './lib/exportXlsx';
import { useOrders } from './hooks/useOrders';
import { useToast } from './hooks/useToast';
import Header from './components/layout/Header';
import Stats from './components/layout/Stats';
import Toast from './components/ui/Toast';
import PasteOrderBox from './components/order/PasteOrderBox';
import OrderForm from './components/order/OrderForm';
import OrderToolbar from './components/order/OrderToolbar';
import OrderList from './components/order/OrderList';

export default function App() {
  const { orders, addOrder, deleteOrder, toggleStatus, markFinished } = useOrders();
  const { toast, showToast, dismissToast } = useToast();

  const [theme, setTheme] = useState('light');
  const [draft, setDraft] = useState(EMPTY_ORDER_DRAFT);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  /* ---------------------------- derived values ---------------------------- */
  const notDoneOrders = useMemo(
    () => orders.filter((order) => order.status === STATUS.NOT_DONE),
    [orders],
  );
  const finishedCount = orders.length - notDoneOrders.length;

  const totalValue = useMemo(
    () => notDoneOrders.reduce((sum, order) => sum + Number(order.amount || 0), 0),
    [notDoneOrders],
  );

  const visibleOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        !term ||
        [order.name, order.phone, order.address, order.note]
          .join(' ')
          .toLowerCase()
          .includes(term);
      const matchesStatus =
        statusFilter === 'All' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  /* ------------------------------- handlers ------------------------------- */
  const handleParsed = (text) => {
    const parsed = parseOrderText(text);
    setDraft(parsed);

    const found = [parsed.name, parsed.phone, parsed.address, parsed.amount].filter(
      Boolean,
    ).length;
    if (found === 0) {
      showToast('Could not read any fields. Please fill the form manually.', 'error');
    } else {
      showToast('Parsed. Review the fields below before adding.', 'info');
    }
  };

  const handleFieldChange = (field, value) => {
    setDraft((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!draft.name.trim() || !draft.phone.trim()) {
      showToast('Name and phone are required.', 'error');
      return;
    }
    const order = addOrder(draft);
    setDraft(EMPTY_ORDER_DRAFT);
    showToast(`Order for ${order.name} added.`, 'success');
  };

  const handleDelete = (id) => {
    const order = orders.find((item) => item.id === id);
    deleteOrder(id);
    showToast(order ? `Order for ${order.name} deleted.` : 'Order deleted.', 'info');
  };

  const handleExport = async () => {
    if (notDoneOrders.length === 0) return;
    try {
      await exportOrdersToXlsx(notDoneOrders, buildExportFilename());
      markFinished(notDoneOrders.map((order) => order.id));
      showToast(
        `Exported ${notDoneOrders.length} order(s). Marked as finished.`,
        'success',
      );
    } catch {
      showToast('Export failed. Please try again.', 'error');
    }
  };

  /* -------------------------------- render -------------------------------- */
  return (
    <div
      data-theme={theme}
      className="min-h-screen bg-base-200/60 p-3 sm:p-6 lg:p-8 transition-colors duration-200"
    >
      <Toast toast={toast} onDismiss={dismissToast} />

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <Header
          theme={theme}
          onToggleTheme={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
        />

        <Stats
          total={orders.length}
          notDone={notDoneOrders.length}
          finished={finishedCount}
          totalAmount={totalValue}
        />

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="card bg-base-100 shadow-sm border border-base-200 lg:sticky lg:top-6">
              <div className="card-body p-4 sm:p-6">
                <h2 className="card-title text-lg font-bold border-b pb-3 mb-1">
                  Add New Order
                </h2>
                <PasteOrderBox onParsed={handleParsed} />
                <div className="divider my-1 text-xs text-base-content/50">
                  or edit manually
                </div>
                <OrderForm
                  value={draft}
                  onChange={handleFieldChange}
                  onSubmit={handleSubmit}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <OrderToolbar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onFilterChange={setStatusFilter}
              onExport={handleExport}
              notDoneCount={notDoneOrders.length}
            />

            <OrderList
              orders={visibleOrders}
              onToggleStatus={toggleStatus}
              onDelete={handleDelete}
              emptyTitle="No orders found"
              emptyDescription={
                searchTerm || statusFilter !== 'All'
                  ? 'Try adjusting your search or status filter.'
                  : 'Paste an order above to get started.'
              }
            />
          </div>
        </main>
      </div>
    </div>
  );
}
