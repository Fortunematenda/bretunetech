import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

const filePath = process.argv[2];
if (!filePath) { console.error('Usage: ts-node inspect-csv.ts <path-to-csv>'); process.exit(1); }

const buffer = fs.readFileSync(path.resolve(filePath));
const rows = parse(buffer, { columns: true, skip_empty_lines: true, to: 2, bom: true });
if (rows.length === 0) { console.log('No rows found'); process.exit(0); }

console.log('\n=== Raw keys (with char codes) ===');
for (const key of Object.keys(rows[0])) {
  const codes = [...key].map(c => `${c}(${c.charCodeAt(0)})`).join(' ');
  console.log(`  "${key}" => ${codes}`);
}
console.log('\n=== First row values ===');
console.log(JSON.stringify(rows[0], null, 2));
