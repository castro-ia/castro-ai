import { Menu } from 'lucide-react';

export function Header({ title, subtitle, onMenuOpen, rightSlot = null }) {
  return (
    <header className="safe-top sticky top-0 z-10 bg-remax-gradient">
      <div className="flex items-center gap-3 px-4 pb-4 pt-3">
        <button
          onClick={onMenuOpen}
          aria-label="Abrir menú"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/20 active:bg-black/30"
        >
          <Menu size={20} color="white" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg leading-tight text-white text-block-3d">{title}</h1>
          {subtitle && <p className="truncate text-xs text-white/80">{subtitle}</p>}
        </div>

        {rightSlot}
      </div>
    </header>
  );
}
