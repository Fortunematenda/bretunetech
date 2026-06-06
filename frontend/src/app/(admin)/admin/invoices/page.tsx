'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Download, FileText, CheckCircle, Clock, AlertCircle, X, Eye } from 'lucide-react';
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { adminApi } from '@/lib/api';

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
  paid: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Paid' },
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Pending' },
  overdue: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Overdue' },
  draft: { icon: FileText, color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Draft' },
};

export default function InvoicesPage() {
  const { token } = useAuthStore();
  const [invoices, setInvoices] = useState<OrderInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<OrderInvoice | null>(null);
  const [error, setError] = useState('');

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
      alert(error.message || 'Failed to generate invoice. Please try again.');
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Invoices</h1>
          <p className="text-sm text-slate-500">Invoices generated from customer orders</p>
        </div>
        <button onClick={fetchInvoices} className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors text-sm">
          <Clock className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm text-slate-400">Outstanding</p>
          <p className="text-2xl font-bold text-white">{formatPrice(totalOutstanding)}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm text-slate-400">Paid</p>
          <p className="text-2xl font-bold text-emerald-400">{formatPrice(totalPaid)}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
          <p className="text-sm text-slate-400">Overdue</p>
          <p className="text-2xl font-bold text-red-400">{formatPrice(totalOverdue)}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoices..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80">
                {['Invoice', 'Customer', 'Amount', 'Date', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-800 rounded w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.map((invoice) => {
                const Ic = statusConfig[invoice.status].icon;
                return (
                  <tr key={invoice.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-white">{invoice.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-200">{invoice.customer}</p>
                      <p className="text-xs text-slate-500">{invoice.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-white">{formatPrice(invoice.amount)}</td>
                    <td className="px-4 py-3 text-sm text-slate-400">{formatDateTime(invoice.date)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[invoice.status].bg} ${statusConfig[invoice.status].color}`}>
                        <Ic className="w-3 h-3" />{statusConfig[invoice.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setSelectedInvoice(invoice)} className="p-1.5 text-slate-400 hover:text-violet-400 rounded-lg hover:bg-slate-800 transition-colors" title="View Details"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => downloadInvoice(invoice)} className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors" title="Download Invoice"><Download className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && !loading && <div className="text-center py-12"><p className="text-slate-400 text-sm">No invoices found. Orders will appear here when customers place them.</p></div>}
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-[#1a1d27] border border-slate-700 rounded-2xl w-full max-w-2xl my-8 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Invoice {selectedInvoice.id}</h2>
              <button onClick={() => setSelectedInvoice(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"><X className="w-4 h-4" /></button>
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 uppercase">Order Number</p>
                  <p className="text-sm text-white font-medium">{selectedInvoice.orderNumber}</p>
                </div>
                <div className="bg-slate-800/50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 uppercase">Date</p>
                  <p className="text-sm text-white">{formatDateTime(selectedInvoice.date)}</p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-500 uppercase mb-2">Customer</p>
                <p className="text-sm text-white font-medium">{selectedInvoice.customer}</p>
                <p className="text-sm text-slate-400">{selectedInvoice.email}</p>
              </div>

              <div>
                <p className="text-xs text-slate-500 uppercase mb-2">Items</p>
                <table className="w-full text-sm">
                  <thead className="text-xs text-slate-500 border-b border-slate-700">
                    <tr>
                      <th className="text-left py-2">Item</th>
                      <th className="text-center py-2">Qty</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {selectedInvoice.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2 text-slate-200">{item.name}</td>
                        <td className="py-2 text-center text-slate-400">{item.quantity}</td>
                        <td className="py-2 text-right text-slate-400">R{item.price.toFixed(2)}</td>
                        <td className="py-2 text-right text-white">R{(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="border-t border-slate-700">
                      <td colSpan={3} className="py-2 text-right font-medium text-slate-300">Total:</td>
                      <td className="py-2 text-right font-bold text-emerald-400">R{selectedInvoice.amount.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={() => setSelectedInvoice(null)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors">Close</button>
              <button onClick={() => downloadInvoice(selectedInvoice)} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition-colors">
                <Download className="w-4 h-4" /> Download Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
