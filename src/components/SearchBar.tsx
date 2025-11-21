'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type SearchValues = {
  q?: string;
  city?: string;
  category?: string;
};
export default function SearchBar({ initial }: { initial?: SearchValues }) {
  const router = useRouter();
  const [q, setQ] = useState(initial?.q ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [category, setCategory] = useState(initial?.category ?? 'all');

  const submit = () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (city) params.set('city', city);
    if (category && category !== 'all') params.set('category', category);
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <div className="w-full rounded-xl border p-2 glass">
      <div className="grid gap-2 sm:grid-cols-3">
        <input className="input" placeholder="Search events" value={q} onChange={(e) => setQ(e.target.value)} />
        <input className="input" placeholder="City (e.g., Lagos)" value={city} onChange={(e) => setCity(e.target.value)} />
        <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
          {['all','music','sport','conference','festival','theatre','comedy'].map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="mt-2 flex justify-end">
        <button className="btn btn-primary" onClick={submit}>Search</button>
      </div>
    </div>
  );
}