'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Download, FileText, CheckCircle, Clock, AlertCircle, X, Eye, Columns, CheckSquare, RefreshCw, DollarSign } from 'lucide-react';
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { adminApi } from '@/lib/api';
import { appToast } from '@/lib/toast';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminKpiCard from '@/components/admin/AdminKpiCard';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface OrderInvoice {
  id: string;
  orderNumber: string;
  customer: string;
  email: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  items: { name: string; quantity: number; price: number }[];
  orderId: string;
}

const statusConfig = {
  paid: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Paid' },
  pending: { icon: Clock, color: 'text-yellow-700', bg: 'bg-yellow-50', label: 'Pending' },
  overdue: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Overdue' },
  draft: { icon: FileText, color: 'text-gray-500', bg: 'bg-gray-100', label: 'Draft' },
};

export default function InvoicesPage() {
  const { token } = useAuthStore();
  const [invoices, setInvoices] = useState<OrderInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<OrderInvoice | null>(null);
  const [error, setError] = useState('');
  const [colOpen, setColOpen] = useState(false);

  type ColKey = 'customer' | 'email' | 'amount' | 'date' | 'status' | 'itemCount';
  const ALL_COLS: { key: ColKey; label: string }[] = [
    { key: 'customer',  label: 'Customer' },
    { key: 'email',     label: 'Email' },
    { key: 'amount',    label: 'Amount' },
    { key: 'date',      label: 'Date' },
    { key: 'status',    label: 'Status' },
    { key: 'itemCount', label: 'Items' },
  ];
  const DEFAULT_COLS: ColKey[] = ['customer', 'amount', 'date', 'status'];
  const [visibleCols, setVisibleCols] = useState<ColKey[]>(DEFAULT_COLS);
  useEffect(() => {
    try { const s = localStorage.getItem('admin_invoices_cols'); if (s) setVisibleCols(JSON.parse(s)); } catch { /* ignore */ }
  }, []);
  const toggleCol = (key: ColKey) => setVisibleCols((prev) => {
    const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
    localStorage.setItem('admin_invoices_cols', JSON.stringify(next)); return next;
  });
  const col = (key: ColKey) => visibleCols.includes(key);

  // Fetch orders and convert to invoices
  const fetchInvoices = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getOrders(token, { limit: '100' });
      const orders = data.orders || [];
      
      // Convert orders to invoice format
      const orderInvoices: OrderInvoice[] = orders.map((order: any) => ({
        id: `INV-${order.orderNumber}`,
        orderNumber: order.orderNumber,
        customer: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || 'Unknown',
        email: order.user?.email || 'N/A',
        amount: order.totalPrice || 0,
        date: order.createdAt,
        status: mapOrderStatusToInvoiceStatus(order.status),
        items: order.items?.map((item: any) => ({
          name: item.name || item.product?.name || 'Unknown Item',
          quantity: item.quantity,
          price: item.price,
        })) || [],
        orderId: order.id,
      }));
      
      setInvoices(orderInvoices);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // Map order status to invoice status
  function mapOrderStatusToInvoiceStatus(orderStatus: string): 'paid' | 'pending' | 'overdue' | 'draft' {
    switch (orderStatus) {
      case 'PAID':
      case 'COMPLETED':
        return 'paid';
      case 'PENDING':
        return 'pending';
      case 'CANCELLED':
        return 'draft';
      case 'PROCESSING':
      case 'SHIPPED':
        return 'pending';
      default:
        return 'pending';
    }
  }

  const downloadInvoice = async (invoice: OrderInvoice) => {
    if (!token) return;
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
      const response = await fetch(`${API_URL}/admin/orders/${invoice.orderId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate invoice');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Failed to download invoice:', error);
      appToast.error(error.message || 'Failed to generate invoice. Please try again.');
    }
  };

  const filtered = invoices.filter((i) =>
    i.customer.toLowerCase().includes(search.toLowerCase()) || i.id.toLowerCase().includes(search.toLowerCase())
  );
  const totalOutstanding = invoices.filter((i) => i.status === 'pending' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0);
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalOverdue = invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Invoices"
        description="Invoices generated from customer orders"
        actions={
          <>
          <div className="relative">
            <Button type="button" variant="secondary" size="sm" onClick={() => setColOpen((o) => !o)}>
              <Columns className="h-4 w-4" /> Columns
            </Button>
            {colOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setColOpen(false)} />
                <div className="absolute right-0 top-10 z-20 w-44 bg-white border border-gray-300 rounded-xl shadow-xl overflow-hidden">
                  <div className="py-1">
                    {ALL_COLS.map(({ key, label }) => (
                      <button key={key} onClick={() => toggleCol(key)} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                        <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${col(key) ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                          {col(key) && <CheckSquare className="w-3 h-3 text-gray-900" />}
                        </span>
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-300 flex">
                    <button onClick={() => { const all = ALL_COLS.map(c => c.key); setVisibleCols(all); localStorage.setItem('admin_invoices_cols', JSON.stringify(all)); }} className="flex-1 py-2 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">Show all</button>
                    <div className="w-px bg-gray-700" />
                    <button onClick={() => { setVisibleCols(DEFAULT_COLS); localStorage.setItem('admin_invoices_cols', JSON.stringify(DEFAULT_COLS)); }} className="flex-1 py-2 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">Reset</button>
                  </div>
                </div>
              </>
            )}
          </div>
          <Button type="button" variant="outline" size="icon" onClick={fetchInvoices} title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          </>
        }
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminKpiCard
          label="Outstanding"
          value={formatPrice(totalOutstanding)}
          icon={DollarSign}
          tone="slate"
          showArrow={false}
        />
        <AdminKpiCard
          label="Paid"
          value={formatPrice(totalPaid)}
          icon={CheckCircle}
          tone="emerald"
          showArrow={false}
        />
        <AdminKpiCard
          label="Overdue"
          value={formatPrice(totalOverdue)}
          icon={AlertCircle}
          tone="red"
          showArrow={false}
        />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoices..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary" />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white/50 overflow-hidden">
        <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-200 bg-white/80">
                <TableHead className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Invoice</TableHead>
                {col('customer')  && <TableHead className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</TableHead>}
                {col('email')     && <TableHead className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Email</TableHead>}
                {col('amount')    && <TableHead className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Amount</TableHead>}
                {col('date')      && <TableHead className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</TableHead>}
                {col('status')    && <TableHead className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</TableHead>}
                {col('itemCount') && <TableHead className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Items</TableHead>}
                <TableHead className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    <TableCell className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-28" /></TableCell>
                    {col('customer')  && <TableCell className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-28" /></TableCell>}
                    {col('email')     && <TableCell className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-36" /></TableCell>}
                    {col('amount')    && <TableCell className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-20" /></TableCell>}
                    {col('date')      && <TableCell className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-28" /></TableCell>}
                    {col('status')    && <TableCell className="px-4 py-3"><div className="h-5 bg-gray-100 rounded-full w-16" /></TableCell>}
                    {col('itemCount') && <TableCell className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-8" /></TableCell>}
                    <TableCell className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-16" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.map((invoice) => {
                const Ic = statusConfig[invoice.status].icon;
                return (
                  <TableRow key={invoice.id} className="hover:bg-gray-100/50 transition-colors">
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">{invoice.id}</span>
                      </div>
                    </TableCell>
                    {col('customer') && (
                      <TableCell className="px-4 py-3">
                        <p className="text-sm text-gray-900">{invoice.customer}</p>
                      </TableCell>
                    )}
                    {col('email')     && <TableCell className="px-4 py-3 text-xs text-gray-500">{invoice.email}</TableCell>}
                    {col('amount')    && <TableCell className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(invoice.amount)}</TableCell>}
                    {col('date')      && <TableCell className="px-4 py-3 text-sm text-gray-500">{formatDateTime(invoice.date)}</TableCell>}
                    {col('status') && (
                      <TableCell className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[invoice.status].bg} ${statusConfig[invoice.status].color}`}>
                          <Ic className="w-3 h-3" />{statusConfig[invoice.status].label}
                        </span>
                      </TableCell>
                    )}
                    {col('itemCount') && <TableCell className="px-4 py-3 text-sm text-gray-500 text-center">{invoice.items.length}</TableCell>}
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelectedInvoice(invoice)} className="p-1.5 text-gray-500 hover:text-primary rounded-lg hover:bg-gray-100 transition-colors" title="View Details"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => downloadInvoice(invoice)} className="p-1.5 text-gray-500 hover:text-emerald-600 rounded-lg hover:bg-gray-100 transition-colors" title="Download Invoice"><Download className="w-4 h-4" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        {filtered.length === 0 && !loading && <div className="text-center py-12"><p className="text-gray-500 text-sm">No invoices found. Orders will appear here when customers place them.</p></div>}
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-gray-300 rounded-2xl w-full max-w-2xl my-8 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">Invoice {selectedInvoice.id}</h2>
              <button onClick={() => setSelectedInvoice(null)} className="p-1.5 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-100/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase">Order Number</p>
                  <p className="text-sm text-gray-900 font-medium">{selectedInvoice.orderNumber}</p>
                </div>
                <div className="bg-gray-100/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 uppercase">Date</p>
                  <p className="text-sm text-gray-900">{formatDateTime(selectedInvoice.date)}</p>
                </div>
              </div>

              <div className="bg-gray-100/50 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase mb-2">Customer</p>
                <p className="text-sm text-gray-900 font-medium">{selectedInvoice.customer}</p>
                <p className="text-sm text-gray-500">{selectedInvoice.email}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 uppercase mb-2">Items</p>
                <Table>
                  <TableHeader className="text-xs text-gray-500 border-b border-gray-300">
                    <TableRow>
                      <TableHead className="text-left py-2">Item</TableHead>
                      <TableHead className="text-center py-2">Qty</TableHead>
                      <TableHead className="text-right py-2">Price</TableHead>
                      <TableHead className="text-right py-2">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100">
                    {selectedInvoice.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="py-2 text-gray-900">{item.name}</TableCell>
                        <TableCell className="py-2 text-center text-gray-500">{item.quantity}</TableCell>
                        <TableCell className="py-2 text-right text-gray-500">R{item.price.toFixed(2)}</TableCell>
                        <TableCell className="py-2 text-right text-gray-900">R{(item.price * item.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="border-t border-gray-300">
                      <TableCell colSpan={3} className="py-2 text-right font-medium text-gray-700">Total:</TableCell>
                      <TableCell className="py-2 text-right font-bold text-emerald-600">R{selectedInvoice.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setSelectedInvoice(null)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-700 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors">Close</button>
              <button onClick={() => downloadInvoice(selectedInvoice)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition-colors">
                <Download className="w-4 h-4" /> Download Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
