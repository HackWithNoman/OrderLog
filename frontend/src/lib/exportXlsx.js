import { EXPORT_COLUMNS } from '../constants.js';

/**
 * Build and download an .xlsx file for the given orders.
 *
 * Columns follow EXPORT_COLUMNS: Name, Address, Phone, Amount, Note.
 * Amount is written as a real number so Excel can sum it.
 *
 * The xlsx library is loaded on demand so it does not bloat the initial bundle.
 */
export async function exportOrdersToXlsx(orders, filename) {
  const XLSX = await import('xlsx');
  const header = EXPORT_COLUMNS.map((column) => column.label);

  const rows = orders.map((order) =>
    EXPORT_COLUMNS.map((column) => {
      if (column.key === 'amount') {
        const value = Number(order.amount);
        return Number.isFinite(value) ? value : '';
      }
      if (column.key === 'deliveryType') {
        return order.deliveryType || 'Home';
      }
      return order[column.key] ?? '';
    }),
  );

  const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
  worksheet['!cols'] = EXPORT_COLUMNS.map((column) => ({ wch: column.width }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, filename);
}

/** Suggested file name for an export, e.g. "orders-2026-10-07.xlsx". */
export function buildExportFilename(date = new Date()) {
  const stamp = date.toISOString().split('T')[0];
  return `orders-${stamp}.xlsx`;
}
