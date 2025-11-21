'use client';

import { useState } from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  as?: 'button' | 'a';
  href?: string;
};

type Piece = { id: number; left: number; color: string; delay: number };

const COLORS = [
  'hsl(var(--brand))',
  'hsl(var(--accent))',
  '#10b981', /* emerald */
  '#f59e0b', /* amber */
  '#ef4444', /* red */
];

export default function ConfettiButton({ children, className = '', onClick, as = 'button', href }: Props) {
  const [pieces, setPieces] = useState<Piece[]>([]);

  function burst() {
    const p: Piece[] = Array.from({ length: 26 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 150,
    }));
    setPieces(p);
    setTimeout(() => setPieces([]), 800);
  }

  function handleClick(e: React.MouseEvent) {
    burst();
    onClick?.();
  }

  const Wrapper = as === 'a' ? 'a' : 'button';

  return (
    <div className="relative inline-block">
      <Wrapper
        href={href as any}
        onClick={handleClick as any}
        className={className}
      >
        {children}
      </Wrapper>

      {/* Confetti layer */}
      <div className="pointer-events-none absolute inset-0 overflow-visible">
        {pieces.map((p) => (
          <span
            key={p.id}
            className="cadak-confetti-piece"
            style={{
              left: `${p.left}%`,
              bottom: '0px',
              background: p.color,
              animationDelay: `${p.delay}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}