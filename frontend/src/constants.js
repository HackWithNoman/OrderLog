/**
 * Shared constants used across the app.
 * Keeping them here avoids magic strings scattered in components.
 */

export const STATUS = {
  NOT_DONE: 'Not Done',
  FINISHED: 'Finished',
};

/** Options shown in the status filter tabs. "All" is a pseudo-status. */
export const STATUS_FILTERS = ['All', STATUS.NOT_DONE, STATUS.FINISHED];

/**
 * Columns of the exported .xlsx file, in order.
 * These names/order MUST match the reference file `tahiya-orders.xlsx` so the
 * export can be consumed by the same system.
 *
 * `key` maps to an order field, `label` is the header cell, `width` is the
 * Excel column width. Fields without an order value are exported blank.
 */
export const EXPORT_COLUMNS = [
  { key: 'invoice', label: 'Invoice', width: 8 },
  { key: 'name', label: 'Name', width: 22 },
  { key: 'address', label: 'Address', width: 50 },
  { key: 'phone', label: 'Phone', width: 16 },
  { key: 'amount', label: 'Amount', width: 10 },
  { key: 'note', label: 'Note', width: 22 },
  { key: 'lot', label: 'Lot', width: 10 },
  { key: 'deliveryType', label: 'Delivery Type', width: 16 },
  { key: 'contactName', label: 'Contact Name', width: 18 },
  { key: 'contactPhone', label: 'Contact Phone', width: 16 },
];

/** A blank order draft, used to reset the add-order form. */
export const EMPTY_ORDER_DRAFT = {
  name: '',
  address: '',
  phone: '',
  amount: '',
  note: '',
};
