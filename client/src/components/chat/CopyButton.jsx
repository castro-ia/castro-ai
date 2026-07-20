import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Silencioso: el navegador puede bloquear el acceso al portapapeles sin gesto directo.
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label="Copiar respuesta"
      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-white/50 active:bg-white/10"
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  );
}
