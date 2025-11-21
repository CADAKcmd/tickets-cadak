export default function Aurora() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Big brand blobs */}
      <div className="absolute -top-24 -left-20 h-80 w-80 rounded-full blur-3xl opacity-40 animate-cadak-aurora"
           style={{ background: 'radial-gradient(closest-side, hsl(var(--brand)/0.65), transparent 70%)' }} />
      <div className="absolute -bottom-24 -right-16 h-96 w-96 rounded-full blur-3xl opacity-40 animate-cadak-aurora"
           style={{ background: 'radial-gradient(closest-side, hsl(var(--accent)/0.55), transparent 70%)', animationDuration: '16s' }} />
      <div className="absolute top-12 right-1/3 h-64 w-64 rounded-full blur-3xl opacity-35 animate-cadak-aurora"
           style={{ background: 'radial-gradient(closest-side, rgba(16,185,129,.45), transparent 70%)', animationDuration: '18s' }} />

      {/* Soft moving beam */}
      <div className="absolute -inset-x-24 -top-20 h-64 rotate-[-12deg] cadak-beam opacity-50" />

      {/* Tiny twinkles */}
      <div className="absolute inset-0">
        {[...Array(24)].map((_, i) => (
          <span key={i}
                className="cadak-glint absolute h-1 w-1 rounded-full bg-white/60"
                style={{
                  left: `${(i * 37) % 100}%`,
                  top: `${(i * 53) % 100}%`,
                  animationDelay: `${(i % 6) * 280}ms`
                }} />
        ))}
      </div>
    </div>
  );
}