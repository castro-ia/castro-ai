export function TypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-sm bg-white/10 px-4 py-3">
      <span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-white/60" style={{ animationDelay: '0ms' }} />
      <span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-white/60" style={{ animationDelay: '150ms' }} />
      <span className="h-1.5 w-1.5 animate-typing-dot rounded-full bg-white/60" style={{ animationDelay: '300ms' }} />
    </div>
  );
}
