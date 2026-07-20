import { useState } from 'react';
import { Pencil } from 'lucide-react';

export function KpiCard({ label, value, suffix = '', onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? 0);

  const commit = () => {
    setEditing(false);
    const parsed = Number(draft);
    if (!Number.isNaN(parsed)) onSave(parsed);
    else setDraft(value ?? 0);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
      <p className="mb-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-white/40">
        {label}
        <Pencil size={10} />
      </p>
      {editing ? (
        <input
          autoFocus
          type="number"
          inputMode="decimal"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          className="w-full bg-transparent font-display text-2xl text-white focus:outline-none"
        />
      ) : (
        <button
          onClick={() => {
            setDraft(value ?? 0);
            setEditing(true);
          }}
          className="font-display text-2xl text-white"
        >
          {value ?? 0}
          {suffix}
        </button>
      )}
    </div>
  );
}
