'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, User, Mail, Phone, ShoppingBag, CreditCard, MapPin,
  Calendar, Clock, Package, ChevronRight, StickyNote, XCircle,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { adminApi } from '@/lib/api';
import { formatPrice, formatDate, formatDateTime } from '@/lib/utils';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminStatusBadge from '@/components/admin/AdminStatusBadge';
import AdminKpiCard from '@/components/admin/AdminKpiCard';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

type TabKey = 'overview' | 'orders' | 'addresses' | 'notes';

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'overview',  label: 'Overview',  icon: User },
  { key: 'orders',    label: 'Orders',    icon: ShoppingBag },
  { key: 'addresses', label: 'Addresses', icon: MapPin },
  { key: 'notes',     label: 'Notes',     icon: StickyNote },
];

export default function CustomerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const fetchCustomer = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    try {
      const data = await adminApi.getCustomer(token, id as string);
      setCustomer(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  }, [token, id]);

  useEffect(() => { fetchCustomer(); }, [fetchCustomer]);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 animate-pulse space-y-6">
      <div className="h-6 bg-gray-100 rounded w-48" />
      <div className="h-32 bg-gray-100 rounded-2xl" />
      <div className="h-10 bg-gray-100 rounded-xl w-96" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-gray-100 rounded-2xl" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    </div>
  );

  if (error || !customer) return (
    <div className="max-w-7xl mx-auto px-4 py-16 text-center">
      <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <p className="text-gray-700 font-medium mb-4">{error || 'Customer not found'}</p>
      <button onClick={() => router.push('/admin/customers')} className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </button>
    </div>
  );

  const totalSpent = customer.orders?.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0) || 0;
  const orderCount = customer._count?.orders || customer.orders?.length || 0;
  const lastOrder = customer.orders?.[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => router.push('/admin/customers')} className="hover:text-gray-800 transition-colors">Customers</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-800 font-medium">{customer.firstName} {customer.lastName}</span>
      </div>

      {/* Header Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-2xl bg-primary/5 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-2xl shrink-0">
            {customer.firstName?.charAt(0)}{customer.lastName?.charAt(0)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {customer.isDeleted ? (
                <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full border bg-red-50 text-red-600 border-red-200">
                  Deleted
                </span>
              ) : (
                <AdminStatusBadge status="ACTIVE" />
              )}
              <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                {customer.role}
              </span>
            </div>
            <AdminPageHeader
              title={`${customer.firstName} ${customer.lastName}`}
              actions={
                <>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${customer.email}`}>
                      <Mail className="w-3.5 h-3.5" /> Email
                    </a>
                  </Button>
                  {customer.phone && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                        <Phone className="w-3.5 h-3.5" /> WhatsApp
                      </a>
                    </Button>
                  )}
                  <Button type="button" size="sm" onClick={() => router.push(`/admin/orders?search=${encodeURIComponent(customer.email)}`)}>
                    <ShoppingBag className="w-3.5 h-3.5" /> View Orders
                  </Button>
                </>
              }
            />
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{customer.email}</span>
              {customer.phone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{customer.phone}</span>}
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Joined {formatDate(customer.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="border-t border-gray-100 px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50/50">
          <div className="text-center sm:text-left">
            <p className="text-xs text-gray-500">Total Orders</p>
            <p className="text-lg font-bold text-gray-900">{orderCount}</p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs text-gray-500">Total Spent</p>
            <p className="text-lg font-bold text-emerald-600">{formatPrice(totalSpent)}</p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs text-gray-500">Addresses</p>
            <p className="text-lg font-bold text-gray-900">{customer.addresses?.length || 0}</p>
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs text-gray-500">Last Order</p>
            <p className="text-sm font-semibold text-gray-700">{lastOrder ? formatDate(lastOrder.createdAt) : '—'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-0 -mb-px overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.key === 'orders' && <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full font-semibold">{orderCount}</span>}
              {tab.key === 'addresses' && <span className="ml-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full font-semibold">{customer.addresses?.length || 0}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab customer={customer} />}
      {activeTab === 'orders' && <OrdersTab customer={customer} />}
      {activeTab === 'addresses' && <AddressesTab customer={customer} />}
      {activeTab === 'notes' && <NotesTab />}
    </div>
  );
}

/* ─── OVERVIEW TAB ─── */
function OverviewTab({ customer }: { customer: any }) {
  const totalSpent = customer.orders?.reduce((sum: number, o: any) => sum + (o.totalPrice || 0), 0) || 0;
  const completedOrders = customer.orders?.filter((o: any) => o.status === 'COMPLETED').length || 0;
  const cancelledOrders = customer.orders?.filter((o: any) => o.status === 'CANCELLED').length || 0;
  const pendingOrders = customer.orders?.filter((o: any) => o.status === 'PENDING').length || 0;

  const defaultAddress = customer.addresses?.find((a: any) => a.isDefault) || customer.addresses?.[0];

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-5">
        {/* Personal Information */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" /> Personal Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <InfoRow label="First Name" value={customer.firstName} />
            <InfoRow label="Last Name" value={customer.lastName} />
            <InfoRow label="Email" value={customer.email} />
            <InfoRow label="Phone" value={customer.phone || '—'} />
            <InfoRow label="Role" value={customer.role} />
            <InfoRow label="Verified" value={customer.isVerified ? 'Yes' : 'No'} />
            <InfoRow label="Date Joined" value={formatDate(customer.createdAt)} />
            <InfoRow label="Last Updated" value={formatDate(customer.updatedAt)} />
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-gray-400" /> Order Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <AdminKpiCard label="Total" value={customer.orders?.length || 0} icon={ShoppingBag} tone="slate" showArrow={false} />
            <AdminKpiCard label="Completed" value={completedOrders} icon={Package} tone="emerald" showArrow={false} />
            <AdminKpiCard label="Pending" value={pendingOrders} icon={Clock} tone="amber" showArrow={false} />
            <AdminKpiCard label="Cancelled" value={cancelledOrders} icon={XCircle} tone="red" showArrow={false} />
          </div>
        </div>

        {/* Recent Orders */}
        {customer.orders?.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" /> Recent Orders
              </h3>
              <button onClick={() => {}} className="text-xs text-primary hover:text-primary font-medium">
                View All →
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {customer.orders.slice(0, 5).map((order: any) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 group-hover:text-primary transition-colors">#{order.orderNumber}</p>
                      <p className="text-xs text-gray-500">{formatDate(order.createdAt)} · {order.items?.length || 0} items</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <AdminStatusBadge status={order.status} />
                    <span className="text-sm font-semibold text-gray-900">{formatPrice(order.totalPrice || 0)}</span>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column */}
      <div className="space-y-5">
        {/* Spending */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-400" /> Spending
          </h3>
          <p className="text-3xl font-bold text-emerald-600">{formatPrice(totalSpent)}</p>
          <p className="text-xs text-gray-500 mt-1">Lifetime value across {customer.orders?.length || 0} orders</p>
          {customer.orders?.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Avg. order: <span className="font-semibold text-gray-700">{formatPrice(totalSpent / (customer.orders.length || 1))}</span>
            </p>
          )}
        </div>

        {/* Default Address */}
        {defaultAddress ? (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" /> Default Address
            </h3>
            <div className="text-sm text-gray-700 space-y-0.5">
              {defaultAddress.label && <p className="font-medium text-gray-900">{defaultAddress.label}</p>}
              <p>{defaultAddress.street}</p>
              <p>{defaultAddress.city}, {defaultAddress.province}</p>
              <p>{defaultAddress.postalCode}</p>
              <p className="text-gray-500">{defaultAddress.country}</p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center">
            <MapPin className="w-6 h-6 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No addresses saved</p>
          </div>
        )}

        {/* Quick Links */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Links</h3>
          <div className="space-y-2">
            <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors py-1">
              <Mail className="w-4 h-4" /> Send Email
            </a>
            {customer.phone && (
              <a href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors py-1">
                <Phone className="w-4 h-4" /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── ORDERS TAB ─── */
function OrdersTab({ customer }: { customer: any }) {
  const orders = customer.orders || [];

  if (orders.length === 0) return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-16 text-center">
      <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 font-medium">No orders yet</p>
      <p className="text-gray-400 text-sm mt-1">This customer hasn't placed any orders.</p>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Order #</TableHead>
              <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</TableHead>
              <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Items</TableHead>
              <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Payment</TableHead>
              <TableHead className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</TableHead>
              <TableHead className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Total</TableHead>
              <TableHead className="px-5 py-3 w-10" />
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100">
            {orders.map((order: any) => (
              <TableRow key={order.id} onClick={() => window.location.href = `/admin/orders/${order.id}`}
                className="hover:bg-gray-50 cursor-pointer transition-colors group">
                <TableCell className="px-5 py-3.5 font-mono text-xs font-semibold text-gray-800">{order.orderNumber}</TableCell>
                <TableCell className="px-5 py-3.5 text-xs text-gray-500">{formatDateTime(order.createdAt)}</TableCell>
                <TableCell className="px-5 py-3.5 text-sm text-gray-700">{order.items?.length || 0}</TableCell>
                <TableCell className="px-5 py-3.5 text-xs text-gray-500">{order.paymentMethod || '—'}</TableCell>
                <TableCell className="px-5 py-3.5">
                  <AdminStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="px-5 py-3.5 text-right font-semibold text-gray-900">{formatPrice(order.totalPrice || 0)}</TableCell>
                <TableCell className="px-5 py-3.5">
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
    </div>
  );
}

/* ─── ADDRESSES TAB ─── */
function AddressesTab({ customer }: { customer: any }) {
  const addresses = customer.addresses || [];

  if (addresses.length === 0) return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-16 text-center">
      <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 font-medium">No addresses saved</p>
      <p className="text-gray-400 text-sm mt-1">This customer hasn't added any addresses yet.</p>
    </div>
  );

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {addresses.map((addr: any) => (
        <div key={addr.id} className={`bg-white border rounded-2xl shadow-sm p-5 ${addr.isDefault ? 'border-primary/30 ring-1 ring-primary/15' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-semibold text-gray-800">{addr.label || 'Address'}</span>
            </div>
            {addr.isDefault && (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary/5 text-primary border border-primary/20">Default</span>
            )}
          </div>
          <div className="text-sm text-gray-600 space-y-0.5">
            <p>{addr.street}</p>
            <p>{addr.city}, {addr.province}</p>
            <p>{addr.postalCode}</p>
            <p className="text-gray-400">{addr.country}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── NOTES TAB ─── */
function NotesTab() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-16 text-center">
      <StickyNote className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-500 font-medium">No notes yet</p>
      <p className="text-gray-400 text-sm mt-1">Customer notes and to-dos will appear here.</p>
    </div>
  );
}

/* ─── HELPER COMPONENTS ─── */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm text-gray-900 font-medium">{value}</p>
    </div>
  );
}

