export function TypingIndicator({ label }) {
  return (
    <div className="flex w-fit items-center gap-2.5 rounded-2xl rounded-bl-sm bg-white/10 px-4 py-3">
      {label && <span className="text-sm text-white/70">{label}</span>}
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-white/60" style={{ animationDelay: '0ms' }} />
        <span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-white/60" style={{ animationDelay: '150ms' }} />
        <span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-white/60" style={{ animationDelay: '300ms' }} />
      </span>
    </div>
  );
}
