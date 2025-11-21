'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RequireAuth from '@/components/RequireAuth';
import { useAuth } from '@/providers/AuthProvider';
import {
  LayoutDashboard, CalendarDays, CalendarPlus, ShoppingBag, Ticket, Users, Wallet,
  BarChart3, QrCode, Settings, LifeBuoy, Menu, X, ChevronDown
} from 'lucide-react';

type NavItem = { label: string; href?: string; icon?: React.ElementType; onClick?: () => void };
type NavGroup = { label?: string; items: NavItem[]; collapsible?: boolean };

const groups: NavGroup[] = [
  { items: [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Events', href: '/dashboard/events', icon: CalendarDays },
    { label: 'Create Event', href: '/dashboard/events/new', icon: CalendarPlus },
    { label: 'Orders', href: '/dashboard/orders', icon: ShoppingBag },
    { label: 'Tickets', href: '/dashboard/tickets', icon: Ticket },         // moved here
    { label: 'Customers', href: '/dashboard/customers', icon: Users },
    { label: 'Payouts', href: '/dashboard/payouts', icon: Wallet },
    { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Scan/Verify', href: '/dashboard/scan', icon: QrCode },
  ]},
  { items: [
    { label: 'Affiliate', href: '/dashboard/affiliate' },
    { label: 'Access Managers', href: '/dashboard/access' },
  ]},
  {
    label: 'My Account',
    collapsible: true,
    items: [
      { label: 'My Profile', href: '/dashboard/account/profile', icon: Settings },
      { label: 'Change Password', href: '/dashboard/account/password', icon: Settings },
      { label: 'Logout', icon: LifeBuoy }, // wired to signOut below
    ],
  },
  { items: [{ label: 'Support', href: '/dashboard/support', icon: LifeBuoy }]},
];

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const [openAccount, setOpenAccount] = useState(true);

  const itemEl = (it: NavItem) => {
    const active = it.href && pathname === it.href;
    const cls = `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
      active ? 'bg-[hsl(var(--brand))/0.18] text-[hsl(var(--brand))]'
             : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))/0.7] hover:text-[hsl(var(--foreground))]'
    }`;
    if (it.label === 'Logout') {
      return (
        <button key="logout" className={cls} onClick={async () => { await signOut(); onClose(); }}>
          {it.icon && <it.icon size={18} />} <span>Logout</span>
        </button>
      );
    }
    return (
      <Link key={it.label} href={it.href!} className={cls} onClick={onClose}>
        {it.icon && <it.icon size={18} />} <span>{it.label}</span>
      </Link>
    );
  };

  const list = (
    <div className="space-y-4">
      <div className="text-xs font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">CADAK Dashboard</div>
      {groups.map((g, gi) => (
        <div key={gi} className="space-y-1">
          {g.label ? (
            <button
              className="flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-sm text-[hsl(var(--muted-foreground))]"
              onClick={() => g.collapsible && setOpenAccount((v) => !v)}
            >
              <span>{g.label}</span>
              {g.collapsible && <ChevronDown size={16} className={`transition ${openAccount ? 'rotate-180' : ''}`} />}
            </button>
          ) : null}
          <div className={`${g.collapsible ? (openAccount ? 'block' : 'hidden') : 'block'} space-y-1`}>
            {g.items.map(itemEl)}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <aside className="hidden md:block w-64 shrink-0">
        <div className="card sticky top-16 p-4 h-[calc(100vh-5rem)] overflow-auto">{list}</div>
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <div className="absolute left-0 top-0 h-full w-72 border-r bg-[hsl(var(--card))] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-bold">Menu</div>
              <button className="btn btn-ghost" onClick={onClose}><X size={18} /></button>
            </div>
            {list}
          </div>
        </div>
      )}
    </>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const title = useMemo(() => {
    const all = groups.flatMap(g => g.items);
    return all.find(i => i.href === pathname)?.label || 'Dashboard';
  }, [pathname]);

  return (
    <RequireAuth>
      <div className="mx-auto max-w-7xl px-4">
        <header className="sticky top-0 z-40 mb-4 border-b glass">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <button className="btn btn-ghost md:hidden" onClick={() => setOpen(true)}><Menu size={18} /></button>
              <h1 className="text-lg font-semibold">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              {user && <span className="text-sm text-[hsl(var(--muted-foreground))]">{user.displayName || user.email}</span>}
              <button className="btn btn-ghost" onClick={() => signOut()}>Sign out</button>
            </div>
          </div>
        </header>

        <div className="flex gap-6">
          <Sidebar open={open} onClose={() => setOpen(false)} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}