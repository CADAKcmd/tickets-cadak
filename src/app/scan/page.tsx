'use client';
import Scanner from '@/components/Scanner';
export default function PublicScanPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Scan Tickets</h1>
      <Scanner autoStart={false} timeoutMs={20000} />
    </div>
  );
}