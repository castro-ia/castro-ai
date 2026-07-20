import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { brand } from '../../config/brand';

export function Header({ title, subtitle, showBack = false, rightSlot = null }) {
  const navigate = useNavigate();

  return (
    <header className="safe-top sticky top-0 z-10 bg-remax-gradient">
      <div className="flex items-center gap-3 px-4 pb-4 pt-3">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            aria-label="Volver"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/20 active:bg-black/30"
          >
            <ChevronLeft size={22} color="white" />
          </button>
        ) : (
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/25 font-display text-sm text-white text-block-3d"
            aria-hidden
          >
            {brand.logoShort}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg leading-tight text-white text-block-3d">{title}</h1>
          {subtitle && <p className="truncate text-xs text-white/80">{subtitle}</p>}
        </div>

        {rightSlot}
      </div>
    </header>
  );
}
