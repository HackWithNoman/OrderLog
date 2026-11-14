/* Temporary probe of backend write routes. */
const base = 'http://localhost:5000';

async function probe(label, path, init) {
  const response = await fetch(base + path, init);
  const text = await response.text();
  console.log(label, '->', response.status, text.slice(0, 400));
  return { status: response.status, text };
}

// 1. Exactly what the frontend sends.
const created = await probe('POST /orders (frontend shape)', '/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Probe User',
    address: 'Test Address',
    phone: '01700000000',
    amount: 123,
    note: 'probe note',
  }),
});

let createdId = null;
try {
  createdId = JSON.parse(created.text).id;
} catch {
  createdId = null;
}
console.log('created id:', createdId);

if (createdId) {
  await probe('PATCH status', `/orders/${createdId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'FINISHED' }),
  });
  await probe('DELETE', `/orders/${createdId}`, { method: 'DELETE' });
}
