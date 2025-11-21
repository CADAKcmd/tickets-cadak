'use client';
import Scanner from '@/components/Scanner';

export default function DashboardScanPage() {
  return (
    <div className="space-y-4">
      <Scanner autoStart={false} timeoutMs={20000} />
    </div>
  );
}