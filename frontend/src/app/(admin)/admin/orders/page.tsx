'use client';

// Admin Orders Page - Updated with Clock import
import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, Search, RefreshCw, ChevronLeft, ChevronRight, AlertTriangle, X, Package, Clock, Trash2, Columns, CheckSquare } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils';

const STATUS_OPTIONS = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

const statusStyles: Record<string, string> = {
  PENDING:    'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
  PAID:       'bg-blue-500/15 text-blue-400 border-blue-500/25',
  PROCESSING: 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  SHIPPED:    'bg-sky-500/15 text-sky-400 border-sky-500/25',
  COMPLETED:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  CANCELLED:  'bg-red-500/15 text-red-400 border-red-500/25',
};

export default function AdminOrdersPage() {
  const { token } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [fetchError, setFetchError] = useState<string>('');
  const [deleteConfirm, setDeleteConfirm] = useState<any | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [colOpen, setColOpen] = useState(false);

  type ColKey = 'customer' | 'date' | 'items' | 'subtotal' | 'shipping' | 'total' | 'payment' | 'paymentRef' | 'status' | 'updatedAt';
  const ALL_COLS: { key: ColKey; label: string }[] = [
    { key: 'customer',   label: 'Customer' },
    { key: 'date',       label: 'Date Placed' },
    { key: 'items',      label: 'Items' },
    { key: 'subtotal',   label: 'Subtotal' },
    { key: 'shipping',   label: 'Shipping' },
    { key: 'total',      label: 'Total' },
    { key: 'payment',    label: 'Payment Method' },
    { key: 'paymentRef', label: 'Payment Ref' },
    { key: 'status',     label: 'Status' },
    { key: 'updatedAt',  label: 'Last Updated' },
  ];
  const DEFAULT_COLS: ColKey[] = ['customer', 'date', 'items', 'total', 'status'];
  const [visibleCols, setVisibleCols] = useState<ColKey[]>(DEFAULT_COLS);
  useEffect(() => {
    try { const s = localStorage.getItem('admin_orders_cols'); if (s) setVisibleCols(JSON.parse(s)); } catch { /* ignore */ }
  }, []);
  const toggleCol = (key: ColKey) => setVisibleCols((prev) => {
    const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
    localStorage.setItem('admin_orders_cols', JSON.stringify(next)); return next;
  });
  const col = (key: ColKey) => visibleCols.includes(key);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setFetchError('');
    try {
      const params: Record<string, string> = { limit: '20', page: String(page) };
      if (statusFilter) params.status = statusFilter;
      const data = await adminApi.getOrders(token, params);
      setOrders(data.orders || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setOrders([]);
      setFetchError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { setPage(1); }, [statusFilter]);

  const handleDelete = async (order: any) => {
    if (!token) return;
    setBusy(true);
    setDeleteError('');
    try {
      await adminApi.deleteOrder(token, order.id);
      setDeleteConfirm(null);
      setSelected(null);
      fetchOrders();
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete order');
    } finally {
      setBusy(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!token) return;
    setBusy(true);
    try {
      await adminApi.updateOrderStatus(token, orderId, newStatus);
      fetchOrders();
    } catch { /* ignore */ }
    finally { setBusy(false); }
  };

  const filtered = search
    ? orders.filter((o) =>
        o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
        `${o.user?.firstName} ${o.user?.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        o.user?.email?.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Orders</h1>
          <p className="text-slate-500 text-sm mt-0.5">{orders.length} orders</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button onClick={() => setColOpen((o) => !o)} className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition-colors">
              <Columns className="w-4 h-4" /> Columns
            </button>
            {colOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setColOpen(false)} />
                <div className="absolute right-0 top-10 z-20 w-48 bg-[#1a1d27] border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                  <div className="py-1">
                    {ALL_COLS.map(({ key, label }) => (
                      <button key={key} onClick={() => toggleCol(key)} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                        <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${col(key) ? 'bg-violet-600 border-violet-500' : 'border-slate-600'}`}>
                          {col(key) && <CheckSquare className="w-3 h-3 text-white" />}
                        </span>
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-700 flex">
                    <button onClick={() => { const all = ALL_COLS.map(c => c.key); setVisibleCols(all); localStorage.setItem('admin_orders_cols', JSON.stringify(all)); }} className="flex-1 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Show all</button>
                    <div className="w-px bg-slate-700" />
                    <button onClick={() => { setVisibleCols(DEFAULT_COLS); localStorage.setItem('admin_orders_cols', JSON.stringify(DEFAULT_COLS)); }} className="flex-1 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">Reset</button>
                  </div>
                </div>
              </>
            )}
          </div>
          <button onClick={fetchOrders} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error */}
      {fetchError && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm">
          <p className="font-medium">Error loading orders</p>
          <p className="text-red-300/70">{fetchError}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by order # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 focus:outline-none focus:border-violet-500"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Order #</th>
                {col('customer')   && <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>}
                {col('date')       && <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>}
                {col('items')      && <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>}
                {col('subtotal')   && <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtotal</th>}
                {col('shipping')   && <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Shipping</th>}
                {col('total')      && <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>}
                {col('payment')    && <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Payment</th>}
                {col('paymentRef') && <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ref</th>}
                {col('status')     && <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>}
                {col('updatedAt')  && <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Updated</th>}
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-3 bg-slate-800 rounded w-24" /></td>
                    {col('customer')   && <td className="px-5 py-4"><div className="h-3 bg-slate-800 rounded w-32" /></td>}
                    {col('date')       && <td className="px-5 py-4"><div className="h-3 bg-slate-800 rounded w-24" /></td>}
                    {col('items')      && <td className="px-5 py-4"><div className="h-3 bg-slate-800 rounded w-8" /></td>}
                    {col('subtotal')   && <td className="px-5 py-4"><div className="h-3 bg-slate-800 rounded w-16" /></td>}
                    {col('shipping')   && <td className="px-5 py-4"><div className="h-3 bg-slate-800 rounded w-12" /></td>}
                    {col('total')      && <td className="px-5 py-4"><div className="h-3 bg-slate-800 rounded w-16" /></td>}
                    {col('payment')    && <td className="px-5 py-4"><div className="h-3 bg-slate-800 rounded w-16" /></td>}
                    {col('paymentRef') && <td className="px-5 py-4"><div className="h-3 bg-slate-800 rounded w-20" /></td>}
                    {col('status')     && <td className="px-5 py-4"><div className="h-5 bg-slate-800 rounded-full w-20" /></td>}
                    {col('updatedAt')  && <td className="px-5 py-4"><div className="h-3 bg-slate-800 rounded w-24" /></td>}
                    <td className="px-5 py-4"><div className="h-8 bg-slate-800 rounded w-24" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-5 py-16 text-center">
                    <ShoppingCart className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No orders found</p>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} onClick={() => setSelected(order)} className="hover:bg-slate-800/40 transition-colors cursor-pointer">
                    <td className="px-5 py-4 font-mono text-xs text-slate-300">{order.orderNumber}</td>
                    {col('customer') && (
                      <td className="px-5 py-4">
                        <p className="text-slate-200 text-sm">{order.user?.firstName} {order.user?.lastName}</p>
                        <p className="text-slate-500 text-xs">{order.user?.email}</p>
                      </td>
                    )}
                    {col('date')       && <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">{formatDateTime(order.createdAt)}</td>}
                    {col('items')      && <td className="px-5 py-4 text-slate-400 text-sm">{order.items?.length ?? '—'}</td>}
                    {col('subtotal')   && <td className="px-5 py-4 text-slate-300 text-sm">{formatPrice(order.subtotal || 0)}</td>}
                    {col('shipping')   && <td className="px-5 py-4 text-slate-400 text-sm">{formatPrice(order.shippingCost || 0)}</td>}
                    {col('total')      && <td className="px-5 py-4 text-white font-semibold text-sm">{formatPrice(order.totalPrice || 0)}</td>}
                    {col('payment')    && <td className="px-5 py-4 text-slate-400 text-xs">{order.paymentMethod || '—'}</td>}
                    {col('paymentRef') && <td className="px-5 py-4 text-slate-500 text-xs font-mono">{order.paymentRef || '—'}</td>}
                    {col('status') && (
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full border ${statusStyles[order.status] || 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                          {order.status}
                        </span>
                      </td>
                    )}
                    {col('updatedAt')  && <td className="px-5 py-4 text-slate-500 text-xs">{formatDate(order.updatedAt)}</td>}
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={(e) => {
                          if (e.target.value === '__DELETE__') { setDeleteConfirm(order); }
                          else { handleStatusChange(order.id, e.target.value); }
                        }}
                        disabled={busy}
                        className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-violet-500 disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                        <option disabled>──────────</option>
                        <option value="__DELETE__">🗑 Delete Order</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800">
            <p className="text-xs text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Order Detail Drawer */}
      {selected && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelected(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#13151c] border-l border-slate-800 z-50 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div>
                <p className="text-xs text-slate-500 font-mono">{selected.orderNumber}</p>
                <h2 className="text-base font-semibold text-white mt-0.5">
                  {selected.user?.firstName} {selected.user?.lastName}
                </h2>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Status badge + changer */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${statusStyles[selected.status] || 'bg-slate-700 text-slate-400 border-slate-600'}`}>
                  {selected.status}
                </span>
                <select
                  value={selected.status}
                  onChange={(e) => { handleStatusChange(selected.id, e.target.value); setSelected((p: any) => ({ ...p, status: e.target.value })); }}
                  disabled={busy}
                  className="px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-violet-500 disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Order Info */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Order Details</p>
                <p className="text-sm text-white">Order #: <span className="font-mono">{selected.orderNumber}</span></p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Placed: {formatDateTime(selected.createdAt)}
                </p>
                {selected.updatedAt !== selected.createdAt && (
                  <p className="text-xs text-slate-500">
                    Last updated: {formatDateTime(selected.updatedAt)}
                  </p>
                )}
              </div>

              {/* Customer info */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Customer</p>
                <p className="text-sm text-white">{selected.user?.firstName} {selected.user?.lastName}</p>
                <p className="text-xs text-slate-400">{selected.user?.email}</p>
                {selected.user?.phone && <p className="text-xs text-slate-400">{selected.user.phone}</p>}
              </div>

              {/* Delivery address */}
              {selected.address && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Delivery Address</p>
                  <p className="text-sm text-slate-300">{selected.address.street}</p>
                  <p className="text-sm text-slate-300">{selected.address.city}, {selected.address.province}</p>
                  <p className="text-sm text-slate-300">{selected.address.postalCode}</p>
                </div>
              )}

              {/* Order items */}
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Items ({selected.items?.length ?? 0})</p>
                <div className="space-y-2">
                  {(selected.items || []).map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
                      <div className="w-9 h-9 bg-slate-800 rounded-lg shrink-0 overflow-hidden border border-slate-700 flex items-center justify-center">
                        {item.product?.images?.[0]?.url
                          ? <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                          : <Package className="w-4 h-4 text-slate-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{item.product?.name || item.name || 'Product'}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                          {item.warehouseLocation && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                              item.warehouseLocation === 'CPT' ? 'bg-green-500/15 text-green-400' :
                              item.warehouseLocation === 'JHB' ? 'bg-blue-500/15 text-blue-400' :
                              'bg-orange-500/15 text-orange-400'
                            }`}>
                              <span className={`w-1 h-1 rounded-full ${
                                item.warehouseLocation === 'CPT' ? 'bg-green-400' :
                                item.warehouseLocation === 'JHB' ? 'bg-blue-400' : 'bg-orange-400'
                              }`} />
                              {item.warehouseLocation === 'CPT' ? 'Cape Town' : item.warehouseLocation === 'JHB' ? 'Johannesburg' : 'Durban'}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-white shrink-0">{formatPrice((item.unitPrice || item.price || 0) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-slate-200">{formatPrice(selected.subtotal || 0)}</span>
                </div>
                {selected.shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Shipping</span>
                    <span className="text-slate-200">{formatPrice(selected.shippingCost)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold border-t border-slate-800 pt-2 mt-2">
                  <span className="text-white">Total</span>
                  <span className="text-white">{formatPrice(selected.totalPrice || 0)}</span>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1.5">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Payment</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Method</span>
                  <span className="text-slate-200">{selected.paymentMethod || '—'}</span>
                </div>
                {selected.paymentRef && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Ref</span>
                    <span className="text-slate-200 font-mono text-xs">{selected.paymentRef}</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-600 text-center">Placed {formatDate(selected.createdAt)}</p>
            </div>

            {/* Delete button footer */}
            <div className="px-5 py-4 border-t border-slate-800">
              <button
                onClick={() => setDeleteConfirm(selected)}
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold rounded-lg border border-red-500/25 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> Delete Order
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-red-500/40 rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">Delete Order</h3>
                <p className="text-slate-400 text-sm">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm mb-1">
              Delete order <span className="font-mono text-white">{deleteConfirm.orderNumber}</span>?
            </p>
            <p className="text-slate-500 text-xs mb-4">This will be recorded with your admin account.</p>
            {deleteError && <p className="text-red-400 text-xs mb-3">{deleteError}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteConfirm(null); setDeleteError(''); }}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={busy}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {busy ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
