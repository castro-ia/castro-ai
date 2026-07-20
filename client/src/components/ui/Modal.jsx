import { X } from 'lucide-react';

export function Modal({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="safe-bottom max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-night-800 p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base text-white">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 active:bg-white/15"
          >
            <X size={18} color="white" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
