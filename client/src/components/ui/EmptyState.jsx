export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      {Icon && (
        <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
          <Icon size={24} className="text-white/40" />
        </div>
      )}
      <p className="font-medium text-white/70">{title}</p>
      {subtitle && <p className="text-sm text-white/40">{subtitle}</p>}
    </div>
  );
}
