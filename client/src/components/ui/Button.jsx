const VARIANTS = {
  primary: 'bg-remax-gradient text-white active:opacity-90',
  secondary: 'bg-white/10 text-white active:bg-white/15',
  ghost: 'bg-transparent text-white/70 active:bg-white/5',
  danger: 'bg-red-500/15 text-red-300 active:bg-red-500/25',
};

export function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
