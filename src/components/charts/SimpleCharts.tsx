'use client';

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function SparklineArea({
  data = [],
  className = 'w-full h-24',
  stroke = 'hsl(var(--accent))',
  fill = 'hsl(var(--accent)/0.25)',
}: {
  data?: number[];
  className?: string;
  stroke?: string;
  fill?: string;
}) {
  const w = 600;
  const h = 120;
  const pad = 5;

  const safe = (data ?? []).filter((n) => typeof n === 'number' && isFinite(n));
  if (safe.length === 0) {
    // Empty chart placeholder
    return <svg viewBox={`0 0 ${w} ${h}`} className={className} role="img" aria-label="sparkline" />;
  }

  const max = Math.max(...safe);
  const min = Math.min(...safe);
  const span = max - min || 1;

  const denom = safe.length - 1 || 1;
  const pts = safe.map((v, i) => {
    const x = (i / denom) * (w - pad * 2) + pad;
    const y = h - ((v - min) / span) * (h - pad * 2) - pad;
    return [x, y] as const;
  });

  const line = pts.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ');
  // Safe area path even for a single point
  const area = `${line} L ${pts[pts.length - 1][0]} ${h - pad} L ${pts[0][0]} ${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} role="img" aria-label="sparkline">
      <path d={area} fill={fill} />
      <path d={line} fill="none" stroke={stroke} strokeWidth={3} strokeLinecap="round" />
    </svg>
  );
}

export function Bars({
  values = [],
  labels = [],
  className = 'w-full h-56',
  color = 'hsl(var(--brand))',
}: {
  values?: number[];
  labels?: string[];
  className?: string;
  color?: string;
}) {
  const w = 700;
  const h = 240;
  const padX = 30;
  const padY = 20;

  const safe = (values ?? []).filter((n) => typeof n === 'number' && isFinite(n));
  if (safe.length === 0) {
    return <svg viewBox={`0 0 ${w} ${h}`} className={className} role="img" aria-label="bar chart" />;
  }

  const max = Math.max(...safe, 1);
  const step = (w - padX * 2) / safe.length;
  const bw = Math.max(4, step - 8);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} role="img" aria-label="bar chart">
      {safe.map((v, i) => {
        const x = padX + i * step + (step - bw) / 2;
        const hh = clamp((v / max) * (h - padY * 2), 0, h - padY * 2);
        const y = h - padY - hh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw} height={hh} rx={6} fill={color} />
            {!!labels[i] && (
              <text
                x={x + bw / 2}
                y={h - 4}
                fontSize="10"
                textAnchor="middle"
                fill="hsl(var(--muted-foreground))"
              >
                {labels[i]}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}