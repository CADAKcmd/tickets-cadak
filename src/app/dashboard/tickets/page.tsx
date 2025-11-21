'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { listBuyerTicketsFS, deleteTicketFS } from '@/lib/firestore';
import QRCode from 'react-qr-code';

function downloadSvg(svg: SVGSVGElement, name: string) {
  const xml = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const filename = name.toLowerCase().endsWith('.svg') ? name : `${name}.svg`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Give the browser a moment before revoking the URL
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

type Ticket = {
  id: string | number;
  eventTitle: string;
  typeName: string;
  buyerEmail: string;
  status?: 'checked_in' | 'unused' | string;
  qrPayload: string;
};

export default function TicketsPage() {
  const { user } = useAuth();
  const [params] = useState(() => (typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams()));

  const justBought = params.get('justBought') === '1';
  const newTicketParam = params.get('tickets') || '';
  const newTicketIds = useMemo(() => new Set(newTicketParam ? newTicketParam.split(',') : []), [newTicketParam]);
  const errorMsg = params.get('error');

  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setError(null);
      setLoading(true);
      try {
        const list = await listBuyerTicketsFS(user.uid);
        setTickets(list as Ticket[]);
      } catch (e: any) {
        setError(e?.message || 'Failed to load tickets');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user) return <div className="card p-4">Please sign in.</div>;

  const shareLink = async (id: string | number) => {
    const url = `${window.location.origin}/ticket/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'CADAK Ticket', url });
      } catch {
        // user cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard');
    }
  };

  const downloadQR = (id: string | number) => {
    const svg = document.getElementById(`qr-${String(id)}`) as SVGSVGElement | null;
    if (svg) downloadSvg(svg, `ticket-${id}`);
  };

  const deleteTicket = async (id: string | number) => {
    try {
      if (!confirm('Delete this ticket?')) return;
      await deleteTicketFS(String(id), user!.uid);
      setTickets((t) => t.filter((x) => String(x.id) !== String(id)));
    } catch (e: any) {
      alert(e?.message || 'Failed to delete ticket');
    }
  };

  const isNew = (id: string | number) => newTicketIds.has(String(id));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Tickets</h1>

      {justBought && (
        <div className="card p-3 text-sm">
          {errorMsg ? (
            <span>
              Payment verified, but we couldn’t issue automatically: {decodeURIComponent(errorMsg)}. Your tickets are
              below.
            </span>
          ) : newTicketIds.size > 0 ? (
            <span>Payment successful. Highlighted tickets were just issued to you.</span>
          ) : (
            <span>Payment successful. Your latest tickets are at the top.</span>
          )}
        </div>
      )}

      {loading ? (
        <div className="card p-4">Loading…</div>
      ) : error ? (
        <div className="card p-4 text-red-500">{error}</div>
      ) : tickets.length === 0 ? (
        <div className="card p-4 text-[hsl(var(--muted-foreground))]">No tickets yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {tickets.map((t) => (
            <div
              key={String(t.id)}
              className={`card p-4 ${isNew(t.id) ? 'ring-2 ring-[hsl(var(--accent))]' : ''}`}
            >
              <div className="text-sm text-[hsl(var(--muted-foreground))]">{t.eventTitle}</div>
              <div className="text-lg font-semibold">{t.typeName}</div>
              <div className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">Issued to: {t.buyerEmail}</div>
              <div className="mt-2">
                <span
                  className={`badge ${
                    t.status === 'checked_in'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {t.status === 'checked_in' ? 'Checked in' : 'Unused'}
                </span>
              </div>

              <div className="mt-4 flex justify-center bg-[hsl(var(--card))] p-4">
                <QRCode id={`qr-${String(t.id)}`} value={t.qrPayload} size={140} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn btn-primary" onClick={() => shareLink(t.id)}>
                  Share Link
                </button>
                <button className="btn btn-ghost" onClick={() => downloadQR(t.id)}>
                  Download QR
                </button>
                <button className="btn btn-ghost" onClick={() => deleteTicket(t.id)}>
                  Delete
                </button>
              </div>

              <div className="mt-2 break-all text-xs text-[hsl(var(--muted-foreground))]">ID: {String(t.id)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}