'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Package, ShoppingCart, Users, CalendarDays,
  FileText, Settings, BarChart3, ChevronLeft, ChevronDown,
  Tags, Layers, Truck, Upload, Menu, Megaphone, LayoutGrid, MessageSquare,
} from 'lucide-react';

interface NavChild { href: string; label: string }
interface NavGroup {
  group?: string;
  items: {
    href?: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    children?: NavChild[];
  }[];
}

const navGroups: NavGroup[] = [
  {
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: 'Catalogue',
    items: [
      {
        label: 'Products', icon: Package,
        children: [
          { href: '/admin/products', label: 'All Products' },
          { href: '/admin/products/new', label: 'Add Product' },
        ],
      },
      { href: '/admin/categories', label: 'Categories', icon: LayoutGrid },
      { href: '/admin/brands', label: 'Brands', icon: Tags },
      { href: '/admin/bundles', label: 'Bundles / Kits', icon: Layers },
      { href: '/admin/import', label: 'Import CSV', icon: Upload },
    ],
  },
  {
    group: 'Sales',
    items: [
      { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
      { href: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
      { href: '/admin/invoices', label: 'Invoices', icon: FileText },
      { href: '/admin/bookings', label: 'Service Bookings', icon: CalendarDays },
    ],
  },
  {
    group: 'People',
    items: [
      { href: '/admin/customers', label: 'Customers', icon: Users },
      { href: '/admin/suppliers', label: 'Suppliers', icon: Truck },
    ],
  },
  {
    group: 'Operations',
    items: [
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
      { href: '/admin/ads', label: 'Ads & Banners', icon: Megaphone },
      { href: '/admin/marketing-ads', label: 'Marketing Ads', icon: Megaphone },
      { href: '/admin/hero', label: 'Hero Settings', icon: LayoutGrid },
    ],
  },
  {
    group: 'System',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

function NavItem({
  item, collapsed, pathname,
}: {
  item: NavGroup['items'][0];
  collapsed: boolean;
  pathname: string;
}) {
  const Icon = item.icon;
  const hasChildren = !!item.children?.length;
  const isGroupActive = hasChildren
    ? item.children!.some((c) => pathname === c.href || pathname.startsWith(c.href + '/'))
    : item.href
      ? pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'))
      : false;
  const [open, setOpen] = useState(isGroupActive);

  if (!hasChildren) {
    return (
      <Link
        href={item.href || '/admin'}
        title={collapsed ? item.label : undefined}
        className={cn(
          'group flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
          isGroupActive
            ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'
            : 'text-slate-400 hover:text-white hover:bg-slate-800',
          collapsed && 'justify-center px-2'
        )}
      >
        <Icon className="w-[18px] h-[18px] shrink-0" />
        {!collapsed && <span className="flex-1">{item.label}</span>}
        {!collapsed && item.badge && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500 text-white">{item.badge}</span>
        )}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        title={collapsed ? item.label : undefined}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
          isGroupActive ? 'text-violet-400' : 'text-slate-400 hover:text-white hover:bg-slate-800',
          collapsed && 'justify-center px-2'
        )}
      >
        <Icon className="w-[18px] h-[18px] shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{item.label}</span>
            <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', open && 'rotate-180')} />
          </>
        )}
      </button>
      {!collapsed && open && (
        <div className="mt-1 ml-[18px] pl-4 border-l border-slate-700/60 space-y-0.5">
          {item.children!.map((child) => {
            const isActive = pathname === child.href;
            return (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  'block px-3 py-1.5 rounded-lg text-sm transition-all duration-150',
                  isActive
                    ? 'text-violet-400 bg-violet-500/10 font-medium'
                    : 'text-slate-500 hover:text-white hover:bg-slate-800'
                )}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen bg-[#0f1117] border-r border-slate-800/80 flex flex-col transition-all duration-300 z-40',
        collapsed ? 'w-[60px]' : 'w-[240px]'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 border-b border-slate-800/80 shrink-0',
        collapsed ? 'justify-center px-2' : 'px-5 gap-3'
      )}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shrink-0 shadow-lg shadow-violet-900/50">
          <span className="text-white text-sm font-black">B</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-white leading-tight">Bretunetech</p>
            <p className="text-[10px] text-slate-500 leading-tight">Admin Console</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'p-1 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-colors shrink-0',
            collapsed ? 'hidden' : 'ml-auto'
          )}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {collapsed && (
        <button
          onClick={onToggle}
          className="mx-auto mt-2 p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-4 h-4" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.group && !collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
                {group.group}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.label} item={item} collapsed={collapsed} pathname={pathname} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={cn('shrink-0 border-t border-slate-800/80 px-3 py-3', collapsed && 'px-2')}>
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-300 truncate">Administrator</p>
              <p className="text-[10px] text-slate-600 truncate">v1.0.0</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
