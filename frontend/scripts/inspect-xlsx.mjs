/* Temporary inspection script for the reference workbook. */
import XLSX from 'xlsx';

const file = process.argv[2];
const wb = XLSX.readFile(file);

for (const name of wb.SheetNames) {
  const ws = wb.Sheets[name];
  console.log('=== sheet:', name, '!ref:', ws['!ref']);
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null });
  console.log('rowcount:', rows.length);
  const nonEmpty = rows.filter((row) => row.some((cell) => cell !== null && cell !== ''));
  console.log('non-empty rows:', nonEmpty.length);
  console.log(JSON.stringify(nonEmpty.slice(0, 8), null, 1));
  let maxCol = 0;
  for (const row of rows) {
    for (let i = 0; i < row.length; i += 1) {
      if (row[i] !== null && row[i] !== '') maxCol = Math.max(maxCol, i);
    }
  }
  console.log('max used col index:', maxCol);
}
