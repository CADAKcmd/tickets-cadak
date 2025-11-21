'use client';

import { useEffect, useRef, useState } from 'react';

export default function CountUp({ end, duration = 1200, prefix = '', suffix = '' }: { end: number; duration?: number; prefix?: string; suffix?: string }) {
  const [val, setVal] = useState(0);
  const startTs = useRef<number | null>(null);

  useEffect(() => {
    let raf = 0;
    function step(ts: number) {
      if (startTs.current === null) startTs.current = ts;
      const p = Math.min(1, (ts - startTs.current) / duration);
      setVal(Math.floor(p * end));
      if (p < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);

  return <span>{prefix}{val.toLocaleString()}{suffix}</span>;
}