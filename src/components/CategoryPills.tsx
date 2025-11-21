'use client';

type Props = {
  categories: string[];
  value: string;
  onChange: (v: string) => void;
};

export default function CategoryPills({ categories, value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((c) => {
        const active = value === c;
        return (
          <button
            key={c}
            onClick={() => onChange(c)}
            className={`rounded-full px-3 py-1 text-sm transition ${
              active
                ? 'bg-[hsl(var(--brand))] text-[hsl(var(--brand-foreground))]'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:brightness-110'
            }`}
          >
            {c[0].toUpperCase() + c.slice(1)}
          </button>
        );
      })}
    </div>
  );
}