import { FileText, X } from 'lucide-react';

export function AttachmentChip({ attachment, onRemove }) {
  const imageSrc =
    attachment.kind === 'image' ? attachment.previewUrl || `data:${attachment.mediaType};base64,${attachment.base64}` : null;

  return (
    <div className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1.5 pr-3">
      {imageSrc ? (
        <img src={imageSrc} alt={attachment.name} className="h-10 w-10 rounded-lg object-cover" />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
          <FileText size={18} className="text-white/60" />
        </div>
      )}
      <span className="max-w-[120px] truncate text-xs text-white/70">{attachment.name}</span>
      {onRemove && (
        <button
          onClick={() => onRemove(attachment.id)}
          aria-label="Quitar adjunto"
          className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-white/20 bg-night-900"
        >
          <X size={11} color="white" />
        </button>
      )}
    </div>
  );
}
