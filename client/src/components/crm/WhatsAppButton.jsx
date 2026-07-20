import { MessageCircle } from 'lucide-react';

export function WhatsAppButton({ phone }) {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return null;

  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      aria-label="Escribir por WhatsApp"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 active:bg-emerald-500/25"
    >
      <MessageCircle size={17} />
    </a>
  );
}
