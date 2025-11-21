'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Toast = { id: string; message: string; variant?: 'success' | 'error' | 'info' };
type Ctx = { toast: (t: Omit<Toast, 'id'>) => void };

const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const toast = (t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2, 9);
    setItems((list) => [...list, { id, ...t }]);
    setTimeout(() => {
      setItems((list) => list.filter((x) => x.id !== id));
    }, 3000);
  };

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[320px] flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-md border p-3 text-sm shadow-soft ${
              t.variant === 'success'
                ? 'border-green-600/30 bg-green-600/10 text-green-300'
                : t.variant === 'error'
                ? 'border-red-600/30 bg-red-600/10 text-red-300'
                : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
}