'use client';

import { Download, Printer } from 'lucide-react';

interface ExportBarProps {
  data: any[];
  filename: string;
  columns: { key: string; label: string }[];
}

function toCSV(data: any[], columns: { key: string; label: string }[]) {
  const header = columns.map(c => c.label).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      const val = row[c.key];
      const str = val == null ? '' : String(val);
      return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
    }).join(',')
  );
  return [header, ...rows].join('\n');
}

export function ExportBar({ data, filename, columns }: ExportBarProps) {
  const handleCSV = () => {
    const csv = toCSV(data, columns);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExcel = () => {
    // Excel-compatible CSV with BOM
    const csv = '\uFEFF' + toCSV(data, columns);
    const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCSV}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Download className="w-3.5 h-3.5" /> CSV
      </button>
      <button
        onClick={handleExcel}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Download className="w-3.5 h-3.5" /> Excel
      </button>
      <button
        onClick={handlePrint}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Printer className="w-3.5 h-3.5" /> Print
      </button>
    </div>
  );
}
