const numberFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

/** Format an order amount in BDT, e.g. ৳1,250. */
export function formatAmount(value) {
  return `৳${numberFormatter.format(Number(value) || 0)}`;
}

/** Format an integer count with locale separators, e.g. 1,250. */
export function formatCount(value) {
  return numberFormatter.format(Number(value) || 0);
}
