'use client';

import Link from 'next/link';
import { useAuth } from '@/providers/AuthProvider';
import { useEffect, useRef, useState } from 'react';
import { getProfileFS } from '@/lib/firestore';
import { usePathname } from 'next/navigation';
import { UserRound } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  // Hide navbar entirely on the auth page
  if (pathname?.startsWith('/auth')) return null;

  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  // anchor for positioning
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuPos, setMenuPos] = useState<{ top: number; right: number }>({ top: 64, right: 16 });

  // Load avatar
  useEffect(() => {
    (async () => {
      if (!user) { setAvatar(null); return; }
      try {
        const p = await getProfileFS(user.uid);
        setAvatar(p?.avatarUrl || user.photoURL || null);
      } catch {
        setAvatar(user?.photoURL || null);
      }
    })();
  }, [user]);

  // Listen for profile updates (custom event)
  useEffect(() => {
    if (!user) return;
    const handler = async () => {
      const p = await getProfileFS(user.uid);
      setAvatar(p?.avatarUrl || user.photoURL || null);
    };
    window.addEventListener('cadak:profile-updated', handler as any);
    return () => window.removeEventListener('cadak:profile-updated', handler as any);
  }, [user]);

  // Outside click + Escape to close
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (anchorRef.current?.contains(t)) return; // click on anchor
      if (menuRef.current?.contains(t)) return;   // click in menu
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Compute fixed position anchored to avatar (prevents clipping by overflow)
  const positionMenu = () => {
    const r = anchorRef.current?.getBoundingClientRect();
    if (!r) return;
    setMenuPos({
      top: Math.round(r.bottom + 8),
      right: Math.round(window.innerWidth - r.right),
    });
  };

  useEffect(() => {
    if (!open) return;
    positionMenu();
    const onResize = () => positionMenu();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onResize, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onResize, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Close menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const linkCls = 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]';

  return (
    <header className="sticky top-0 z-50 border-b glass overflow-visible">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          <span className="bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
            CADAK
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/explore" className={linkCls}>Explore</Link>
          <Link href="/about" className={linkCls}>About</Link>
          <Link href="/contact" className={linkCls}>Contact</Link>
          <Link href="/dashboard" className={linkCls}>Dashboard</Link>

          {!user ? (
            <Link
              href="/auth?next=/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Sign in
            </Link>
          ) : (
            <div ref={anchorRef} className="relative">
              <button
                className="btn btn-ghost p-0"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => {
                  if (!open) positionMenu();
                  setOpen((v) => !v);
                }}
              >
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--muted))]">
                    <UserRound size={18} className="text-[hsl(var(--muted-foreground))]" />
                  </div>
                )}
              </button>

              {open && (
                <div
                  ref={menuRef}
                  role="menu"
                  className="fixed z-[1000] w-56 rounded-md border bg-[hsl(var(--card))] p-2 shadow-soft"
                  style={{ top: menuPos.top, right: menuPos.right }}
                >
                  <Link className="block rounded px-3 py-2 text-sm hover:bg-[hsl(var(--muted))]" href="/dashboard">
                    Dashboard
                  </Link>
                  <Link className="block rounded px-3 py-2 text-sm hover:bg-[hsl(var(--muted))]" href="/dashboard/account/profile">
                    My profile
                  </Link>
                  <Link className="block rounded px-3 py-2 text-sm hover:bg-[hsl(var(--muted))]" href="/dashboard/settings">
                    Account settings
                  </Link>
                  <button
                    className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-[hsl(var(--muted))]"
                    onClick={() => signOut()}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}