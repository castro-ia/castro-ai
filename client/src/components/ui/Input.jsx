export function Input({ label, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-medium text-white/60">{label}</span>}
      <input
        className={`w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none ${className}`}
        {...props}
      />
    </label>
  );
}

export function Textarea({ label, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-medium text-white/60">{label}</span>}
      <textarea
        className={`w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none ${className}`}
        {...props}
      />
    </label>
  );
}

export function Select({ label, className = '', children, ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-medium text-white/60">{label}</span>}
      <select
        className={`w-full rounded-xl border border-white/10 bg-night-800 px-3.5 py-3 text-white focus:border-white/30 focus:outline-none ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
