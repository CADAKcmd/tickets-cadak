'use client';

import { useState } from 'react';

type Props = {
  value?: string;
  onChange: (url: string) => void;
  buttonText?: string;
  target?: 'profile' | 'event';
};

// Resize image to keep Firestore doc small (data URL fallback)
async function resizeToDataURL(file: File, maxW = 600, quality = 0.85): Promise<string> {
  const url = URL.createObjectURL(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = url;
  });
  const scale = Math.min(1, maxW / img.width);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(url);
  return canvas.toDataURL('image/jpeg', quality);
}

export default function ImageUploader({ value, onChange, buttonText = 'Upload Photo', target = 'profile' }: Props) {
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const useCloudinary = Boolean(cloudName && preset);

  async function handleLocal(file: File) {
    setError(null);
    const dataUrl = await resizeToDataURL(file, target === 'profile' ? 600 : 1600, 0.85);
    onChange(dataUrl);
    setNote('Saved locally (no Cloudinary set).');
  }

  async function handleCloud(file: File) {
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('upload_preset', preset!);
      form.append('folder', target === 'profile' ? 'cadak/profile' : 'cadak/events');
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Upload failed');
      const url = data.secure_url.replace('/upload/', '/upload/f_auto,q_auto,w_1200/');
      onChange(url);
      setNote('Uploaded to Cloudinary.');
    } catch (e: any) {
      // Fallback to local data URL on any Cloudinary error
      await handleLocal(file);
      // Optional: show a tiny hint for dev
      setError(null);
    }
  }

  async function onFile(file: File | null) {
    if (!file) return;
    try {
      setUploading(true);
      setError(null);
      setNote(null);
      if (useCloudinary) await handleCloud(file);
      else await handleLocal(file);
    } catch (e: any) {
      setError(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="image" className="h-40 w-40 rounded-xl object-cover" />
          <label className="btn btn-ghost cursor-pointer">
            Replace image
            <input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
          </label>
        </div>
      ) : (
        <label className="btn btn-primary cursor-pointer">
          {uploading ? 'Uploading…' : buttonText}
          <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
        </label>
      )}
      {note && <div className="text-xs text-[hsl(var(--muted-foreground))]">{note}</div>}
      {error && <div className="text-sm text-red-500">{error}</div>}
    </div>
  );
}