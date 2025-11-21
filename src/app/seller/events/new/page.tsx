'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { createEventFS } from '@/lib/firestore';
import { Event, TicketType } from '@/lib/types';
import { useToast } from '@/components/ui/Toast';

const categories: Event['category'][] = ['music','sport','conference','festival','theatre','comedy'];
const currencies = ['USD','NGN','GBP','EUR'];
const presetTiers = ['Regular', 'VIP', 'VVIP', 'Premium'] as const;

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function NewEventPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState(toLocalInput(new Date().toISOString()));
  const [endAt, setEndAt] = useState<string>('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [category, setCategory] = useState<Event['category']>('music');
  const [currency, setCurrency] = useState<string>('NGN');
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [saving, setSaving] = useState(false);

  const addTicketType = () => {
    setTicketTypes((prev) => [
      ...prev,
      {
        id: `tt_${Math.random().toString(36).slice(2,8)}`,
        name: 'General',
        tier: 'Regular',
        priceMinor: 0,
        currency,
        quantityTotal: 100,
        quantitySold: 0,
        maxPerOrder: 10,
        perks: [],
        badgeColor: '#8B5CF6',
      },
    ]);
  };
  const updateTicket = (id: string, patch: Partial<TicketType>) =>
    setTicketTypes((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const removeTicket = (id: string) => setTicketTypes((prev) => prev.filter((t) => t.id !== id));

  const onFile = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCoverImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const save = async (status: Event['status']) => {
    if (!user) { toast({ message: 'Please sign in', variant: 'error' }); return; }
    if (!title || !startAt || !venue || !currency || ticketTypes.length === 0) {
      toast({ message: 'Fill title, date, venue, currency and add at least one ticket type.', variant: 'error' });
      return;
    }
    try {
      setSaving(true);
      // Do NOT include ticketTypes here; it’s passed separately to createEventFS
      const base: Omit<Event, 'id' | 'ticketTypes' | 'sellerId'> = {
        title,
        description,
        startAt: new Date(startAt).toISOString(),
        endAt: endAt ? new Date(endAt).toISOString() : undefined,
        venue,
        city,
        country,
        category,
        status,
        coverImage,
        currency,
      };
      await createEventFS(user.uid, base, ticketTypes);
      toast({ message: status === 'published' ? 'Event published!' : 'Draft saved.', variant: 'success' });
      router.push('/dashboard/events');
    } catch (e: any) {
      toast({ message: e?.message || 'Failed to save event', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create Event</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 card p-4 space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input className="input mt-1" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea className="input mt-1" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Start</label>
              <input type="datetime-local" className="input mt-1" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">End (optional)</label>
              <input type="datetime-local" className="input mt-1" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className="text-sm font-medium">Venue</label><input className="input mt-1" value={venue} onChange={(e) => setVenue(e.target.value)} /></div>
            <div><label className="text-sm font-medium">City</label><input className="input mt-1" value={city} onChange={(e) => setCity(e.target.value)} /></div>
            <div><label className="text-sm font-medium">Country</label><input className="input mt-1" value={country} onChange={(e) => setCountry(e.target.value)} /></div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select className="input mt-1" value={category} onChange={(e) => setCategory(e.target.value as Event['category'])}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Currency</label>
              <select
                className="input mt-1"
                value={currency}
                onChange={(e) => {
                  const cur = e.target.value;
                  setCurrency(cur);
                  setTicketTypes((prev) => prev.map((t) => ({ ...t, currency: cur })));
                }}
              >
                {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Cover Image</label>
              <input className="input mt-1" type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
              {coverImage && <img src={coverImage} alt="cover" className="mt-2 h-32 w-full rounded-md object-cover" />}
            </div>
          </div>
        </div>

        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Ticket Tiers</h2>
            <button className="btn btn-primary" onClick={addTicketType}>Add Tier</button>
          </div>

          {ticketTypes.length === 0 && (
            <div className="text-sm text-[hsl(var(--muted-foreground))]">No tiers yet (e.g., Regular, VIP, Premium).</div>
          )}

          <div className="space-y-3">
            {ticketTypes.map((t) => (
              <div key={t.id} className="rounded-md border p-3 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Tier</label>
                    <select className="input mt-1" value={t.tier || ''} onChange={(e) => updateTicket(t.id, { tier: e.target.value })}>
                      {[...presetTiers, 'Custom'].map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Display name</label>
                    <input className="input mt-1" value={t.name} onChange={(e) => updateTicket(t.id, { name: e.target.value })} placeholder="e.g., General / VIP" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <input
                      className="input mt-1"
                      type="number"
                      min={0}
                      step="0.01"
                      value={(t.priceMinor / 100).toString()}
                      onChange={(e) =>
                        updateTicket(t.id, { priceMinor: Math.round(parseFloat(e.target.value || '0') * 100) })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Quantity</label>
                    <input
                      className="input mt-1"
                      type="number"
                      min={1}
                      value={t.quantityTotal}
                      onChange={(e) => updateTicket(t.id, { quantityTotal: Number(e.target.value || 0) })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max/order</label>
                    <input
                      className="input mt-1"
                      type="number"
                      min={1}
                      value={t.maxPerOrder ?? 10}
                      onChange={(e) => updateTicket(t.id, { maxPerOrder: Number(e.target.value || 1) })}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium">Perks (comma-separated)</label>
                    <input
                      className="input mt-1"
                      placeholder="Fast lane, Free drink"
                      value={(t.perks || []).join(', ')}
                      onChange={(e) =>
                        updateTicket(t.id, {
                          perks: e.target.value
                            .split(',')
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Badge color</label>
                    <input
                      className="input mt-1"
                      type="color"
                      value={t.badgeColor || '#8B5CF6'}
                      onChange={(e) => updateTicket(t.id, { badgeColor: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end">
                    <button className="btn btn-ghost w-full" onClick={() => removeTicket(t.id)}>
                      Remove tier
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Sale starts (optional)</label>
                    <input
                      className="input mt-1"
                      type="datetime-local"
                      value={t.saleStartAt ? toLocalInput(t.saleStartAt) : ''}
                      onChange={(e) =>
                        updateTicket(t.id, {
                          saleStartAt: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Sale ends (optional)</label>
                    <input
                      className="input mt-1"
                      type="datetime-local"
                      value={t.saleEndAt ? toLocalInput(t.saleEndAt) : ''}
                      onChange={(e) =>
                        updateTicket(t.id, {
                          saleEndAt: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button disabled={saving} className="btn btn-ghost w-full" onClick={() => save('draft')}>
              {saving ? 'Saving…' : 'Save Draft'}
            </button>
            <button disabled={saving} className="btn btn-primary mt-2 w-full" onClick={() => save('published')}>
              {saving ? 'Publishing…' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}