'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { ArrowRight } from 'lucide-react';

type Props = {
  to?: string;                 // your create page path
  className?: string;
  children?: React.ReactNode;
};

export default function CreateEventCTA({
  to = '/seller/events/new',   // CHANGE this if your route is different (e.g. '/events/new')
  className = 'btn btn-primary rounded-xl',
  children = 'Create your event',
}: Props) {
  const router = useRouter();
  const { user } = useAuth();

  const go = () => {
    if (user) {
      router.push(to);
    } else {
      router.push(`/auth?next=${encodeURIComponent(to)}`);
    }
  };

  return (
    <button onClick={go} className={className} type="button">
      {children} <ArrowRight size={16} className="ml-1 inline-block" />
    </button>
  );
}