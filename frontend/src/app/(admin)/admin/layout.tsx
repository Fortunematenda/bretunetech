'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { useAuthStore } from '@/store/auth-store';
import { adminApi, bookingsApi } from '@/lib/api';
import { Bell, ExternalLink, ChevronRight, LogOut, Settings, User, Shield, ShoppingCart, MessageSquare, X, CalendarDays } from 'lucide-react';

type NotifItem = { id: string; type: 'order' | 'enquiry' | 'booking'; title: string; sub: string; href: string; time: string; read: boolean };

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.replace('/admin', '').split('/').filter(Boolean);
  const crumbs: { label: string; href: string }[] = [{ label: 'Dashboard', href: '/admin' }];
  let path = '/admin';
  for (const seg of segments) {
    path += '/' + seg;
    const label = seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push({ label, href: path });
  }
  return crumbs;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const crumbs = getBreadcrumbs(pathname);

  const unread = notifications.filter((n) => !n.read).length;

  const pollNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const [ordersRes, enquiriesRes, bookingsRes] = await Promise.allSettled([
        adminApi.getOrders(token, { limit: '20' }),
        adminApi.getEnquiries(token, { limit: '20' }),
        bookingsApi.list(token, { limit: '20', status: 'PENDING' }),
      ]);

      const newItems: NotifItem[] = [];

      if (ordersRes.status === 'fulfilled') {
        const orders: any[] = (ordersRes.value as any).orders || [];
        orders
          .filter((o) => o.status === 'PENDING')
          .forEach((o) => {
            newItems.push({
              id: 'order-' + o.id,
              type: 'order',
              title: `New Order #${o.orderNumber || o.id.slice(0, 8)}`,
              sub: `${o.user?.firstName || 'Customer'} · ${o.totalPrice ? 'R' + Number(o.totalPrice).toFixed(2) : ''}`,
              href: '/admin/orders',
              time: o.createdAt,
              read: seenIdsRef.current.has('order-' + o.id),
            });
          });
      }

      if (enquiriesRes.status === 'fulfilled') {
        const enquiries: any[] = (enquiriesRes.value as any).enquiries || [];
        enquiries
          .filter((e) => e.status === 'NEW')
          .forEach((e) => {
            newItems.push({
              id: 'enq-' + e.id,
              type: 'enquiry',
              title: `New Enquiry from ${e.name}`,
              sub: e.service || e.email,
              href: '/admin/enquiries',
              time: e.createdAt,
              read: seenIdsRef.current.has('enq-' + e.id),
            });
          });
      }

      if (bookingsRes.status === 'fulfilled') {
        const bookings: any[] = (bookingsRes.value as any).bookings || [];
        bookings.forEach((b) => {
          newItems.push({
            id: 'booking-' + b.id,
            type: 'booking',
            title: `New Booking: ${b.serviceType?.replace(/_/g, ' ')}`,
            sub: `${b.customerName} · ${b.city || ''}`,
            href: '/admin/bookings',
            time: b.createdAt,
            read: seenIdsRef.current.has('booking-' + b.id),
          });
        });
      }

      if (newItems.length > 0) {
        setNotifications((prev) => {
          // Only keep unread notifications
          const unreadNewItems = newItems.filter((n) => !n.read);
          const merged = [...unreadNewItems, ...prev].slice(0, 30);
          return merged;
        });
      }
    } catch {}
  }, [token]);

  useEffect(() => {
    // Load seen IDs from localStorage on mount
    const saved = JSON.parse(localStorage.getItem('admin-seen-notifications') || '[]');
    saved.forEach((id: string) => seenIdsRef.current.add(id));

    pollNotifications();
    const interval = setInterval(pollNotifications, 30000);
    return () => clearInterval(interval);
  }, [pollNotifications, token]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/admin-login');
  };

  return (
    <div className="flex min-h-screen bg-[#13151c]">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-[#0f1117] border-b border-slate-800/80 flex items-center gap-4 px-6 shrink-0 sticky top-0 z-30">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-sm flex-1 min-w-0">
            {crumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1 min-w-0">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                {i === crumbs.length - 1 ? (
                  <span className="text-slate-300 font-medium truncate">{crumb.label}</span>
                ) : (
                  <Link href={crumb.href} className="text-slate-500 hover:text-slate-300 transition-colors truncate">
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Store
            </Link>
            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  if (!notifOpen) {
                    // Mark all as seen and remove from list
                    notifications.forEach((n) => {
                      seenIdsRef.current.add(n.id);
                    });
                    const saved = JSON.parse(localStorage.getItem('admin-seen-notifications') || '[]');
                    notifications.forEach((n) => {
                      if (!saved.includes(n.id)) {
                        saved.push(n.id);
                      }
                    });
                    localStorage.setItem('admin-seen-notifications', JSON.stringify(saved));
                    setNotifications([]);
                  }
                }}
                className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-black/30 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                    <p className="text-sm font-semibold text-white">Notifications</p>
                    <div className="flex items-center gap-2">
                      {notifications.length > 0 && (
                        <button onClick={() => {
                          setNotifications([]);
                          seenIdsRef.current.clear();
                          localStorage.removeItem('admin-seen-notifications');
                        }} className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">Clear all</button>
                      )}
                      <button onClick={() => setNotifOpen(false)} className="p-0.5 text-slate-500 hover:text-white"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-10 text-center text-slate-500 text-sm">
                        <Bell className="w-7 h-7 mx-auto mb-2 opacity-30" />
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <Link
                          key={n.id}
                          href={n.href}
                          onClick={() => {
                            setNotifOpen(false);
                            // Mark as seen when clicked
                            seenIdsRef.current.add(n.id);
                            const saved = JSON.parse(localStorage.getItem('admin-seen-notifications') || '[]');
                            if (!saved.includes(n.id)) {
                              saved.push(n.id);
                              localStorage.setItem('admin-seen-notifications', JSON.stringify(saved));
                            }
                            setNotifications((prev) => prev.filter((notif) => notif.id !== n.id));
                          }}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-800/60 transition-colors border-b border-slate-800/50 last:border-0 ${
                            !n.read ? 'bg-slate-800/30' : ''
                          }`}
                        >
                          <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            n.type === 'order' ? 'bg-blue-500/20' : n.type === 'booking' ? 'bg-cyan-500/20' : 'bg-violet-500/20'
                          }`}>
                            {n.type === 'order'
                              ? <ShoppingCart className="w-3.5 h-3.5 text-blue-400" />
                              : n.type === 'booking'
                              ? <CalendarDays className="w-3.5 h-3.5 text-cyan-400" />
                              : <MessageSquare className="w-3.5 h-3.5 text-violet-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white font-medium truncate">{n.title}</p>
                            <p className="text-xs text-slate-400 truncate">{n.sub}</p>
                          </div>
                          <div className="shrink-0 flex flex-col items-end gap-1">
                            <p className="text-[10px] text-slate-500">{timeAgo(n.time)}</p>
                            {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center hover:ring-2 hover:ring-violet-500/50 transition-all"
              >
                <span className="text-white text-xs font-bold">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-black/20 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-slate-800">
                    <p className="text-sm font-medium text-white truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Shield className="w-3 h-3 text-amber-400" />
                      <span className="text-xs text-amber-400 font-medium">Administrator</span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <Link
                      href="/account"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Account
                    </Link>
                    <Link
                      href="/admin/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-800 my-1"></div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
