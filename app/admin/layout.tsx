'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Star,
  Settings,
  Truck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  ImageIcon,
  FileText,
  BarChart2,
  Users,
  Tag,
  Box,
  CreditCard,
  RefreshCw,
  Shield,
  Palette,
  Newspaper,
  Cog,
  AlertTriangle,
} from 'lucide-react';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/admin/products', label: 'Products', icon: Package, children: [
    { href: '/admin/products', label: 'All Products', icon: Package },
    { href: '/admin/products/add', label: 'Add Product', icon: Box },
    { href: '/admin/products/categories', label: 'Categories', icon: Tag },
  ]},
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, children: [
    { href: '/admin/orders', label: 'All Orders', icon: ShoppingBag },
    { href: '/admin/orders/pending', label: 'Pending', icon: RefreshCw },
    { href: '/admin/orders/processing', label: 'Processing', icon: Truck },
    { href: '/admin/orders/completed', label: 'Completed', icon: Shield },
  ]},
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/inventory', label: 'Inventory', icon: Truck, children: [
    { href: '/admin/inventory', label: 'Stock Overview', icon: Truck },
    { href: '/admin/inventory/restock', label: 'Restock Alerts', icon: RefreshCw },
    { href: '/admin/inventory/low-stock', label: 'Low Stock', icon: AlertTriangle },
  ]},
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings, children: [
    { href: '/admin/settings', label: 'General', icon: Cog },
    { href: '/admin/settings/payment', label: 'Payment Settings', icon: CreditCard },
    { href: '/admin/settings/hero', label: 'Hero Sections', icon: Palette },
    { href: '/admin/settings/blog', label: 'Blog & Pages', icon: Newspaper },
    { href: '/admin/settings/media', label: 'Media Library', icon: ImageIcon },
  ]},
];

function NavItem({ item, pathname, collapsed, level = 0 }: { item: any; pathname: string; collapsed: boolean; level?: number }) {
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const hasChildren = item.children && item.children.length > 0;
  const [expanded, setExpanded] = useState(isActive);

  if (hasChildren && collapsed) {
    return null;
  }

  return (
    <>
      <li className={`pl-${level * 4}`}>
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive || expanded
                ? 'bg-forest/5 text-forest'
                : 'text-soft-green hover:bg-muted-cream hover:text-forest',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? item.label : undefined}
            aria-expanded={expanded}
          >
            <item.icon size={18} aria-hidden="true" />
            {!collapsed && <span className="flex-1">{item.label}</span>}
            {!collapsed && (
              <ChevronRight
                size={14}
                className={cn('transition-transform', expanded && 'rotate-90')}
                aria-hidden="true"
              />
            )}
          </button>
        ) : (
          <Link
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-forest text-cream'
                : 'text-soft-green hover:bg-muted-cream hover:text-forest',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon size={18} aria-hidden="true" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        )}
      </li>
      {!collapsed && hasChildren && expanded && (
        <ul className="space-y-1 mt-1">
          {item.children.map((child: any) => (
            <NavItem key={child.href} item={child} pathname={pathname} collapsed={collapsed} level={level + 1} />
          ))}
        </ul>
      )}
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, token, hasHydrated, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const router = useRouter();

  // if (!hasHydrated) {
  //   return <div className="min-h-screen bg-muted-cream/30" />;
  // }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-muted-cream/30">
        <div className="container-luxury text-center py-32">
          <p className="font-serif text-2xl text-forest mb-4">Access Restricted</p>
          <p className="text-soft-green mb-6">Please login as an admin to access this page.</p>
          <button onClick={() => router.push('/login')} className="btn-primary">Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted-cream/30">
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-white border-r border-soft-border transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={cn('flex items-center justify-between h-16 px-4 border-b border-soft-border', collapsed && 'justify-center')}>
            <Link href="/admin/dashboard" className="flex items-center gap-3" aria-label="Admin Dashboard">
              <span className="text-xl font-serif text-forest">GT</span>
              {!collapsed && <span className="font-medium text-forest">GlowTeva Admin</span>}
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn('p-2 rounded-lg text-soft-green hover:bg-muted-cream transition-colors', collapsed && 'mx-auto')}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto" aria-label="Admin navigation">
            <ul className="space-y-1 px-3">
              {navItems.map((item) => (
                <NavItem key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
              ))}
            </ul>
          </nav>

          {/* Bottom section */}
          <div className="p-3 border-t border-soft-border">
            <Link
              href="/shop"
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-soft-green hover:bg-muted-cream hover:text-forest transition-all duration-200', collapsed && 'justify-center px-2')}
              title={collapsed ? 'View Store' : undefined}
            >
              <Home size={18} aria-hidden="true" />
              {!collapsed && <span>View Store</span>}
            </Link>
            <button
              onClick={handleLogout}
              className={cn('flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-soft-green hover:bg-muted-cream hover:text-forest transition-all duration-200 mt-2', collapsed && 'justify-center px-2')}
              title={collapsed ? 'Sign Out' : undefined}
            >
              <LogOut size={18} aria-hidden="true" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <main
        className={cn(
          'transition-all duration-300 min-h-screen',
          collapsed ? 'lg:pl-16' : 'lg:pl-64'
        )}
      >
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-soft-border">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg text-soft-green hover:bg-muted-cream"
                aria-label="Open menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <h1 className="font-serif text-xl text-forest hidden sm:block">
                {navItems.find((n) => pathname === n.href || pathname.startsWith(n.href + '/'))?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-soft-green hidden md:block">
                {user?.name}
              </span>
              <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-forest font-medium text-sm">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        <div className="container-luxury py-8">
          {children}
        </div>
      </main>
    </div>
  );
}