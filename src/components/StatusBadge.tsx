export function OrderStatus({ status }: { status: 'paid' | 'pending' | 'refunded' | 'failed' }) {
  const map: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    refunded: 'bg-blue-100 text-blue-700',
    failed: 'bg-red-100 text-red-700',
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>{status}</span>;
}
export function TicketStatus({ status }: { status: 'unused' | 'checked_in' | 'refunded' }) {
  const map: Record<string, string> = {
    unused: 'bg-yellow-100 text-yellow-700',
    checked_in: 'bg-green-100 text-green-700',
    refunded: 'bg-blue-100 text-blue-700',
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>{status.replace('_',' ')}</span>;
}