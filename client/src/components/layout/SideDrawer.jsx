import { NavLink } from 'react-router-dom';
import { X, MessagesSquare, Home, Users, CheckSquare, Settings } from 'lucide-react';
import { brand } from '../../config/brand';

const ITEMS = [
  { to: '/equipo', label: 'Equipo', icon: MessagesSquare, primary: true },
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/crm', label: 'CRM', icon: Users },
  { to: '/tareas', label: 'Tareas', icon: CheckSquare },
];

export function SideDrawer({ open, onClose }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/60 transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={`safe-top safe-bottom fixed inset-y-0 left-0 z-40 flex w-[82%] max-w-[320px] flex-col bg-night-950 shadow-2xl transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="bg-remax-gradient px-5 pb-5 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/25 font-display text-sm text-white text-block-3d">
              {brand.logoShort}
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar menú"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 active:bg-black/30"
            >
              <X size={18} color="white" />
            </button>
          </div>
          <p className="font-display text-lg leading-tight text-white text-block-3d">{brand.teamName}</p>
          <p className="mt-0.5 text-xs text-white/80">
            {brand.agentName} · {brand.role}
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {ITEMS.map(({ to, label, icon: Icon, end, primary }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : primary
                      ? 'text-white active:bg-white/10'
                      : 'text-white/70 active:bg-white/5'
                }`
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <NavLink
            to="/ajustes"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${
                isActive ? 'bg-white/10 text-white' : 'text-white/70 active:bg-white/5'
              }`
            }
          >
            <Settings size={19} />
            Ajustes
          </NavLink>
        </div>
      </aside>
    </>
  );
}
