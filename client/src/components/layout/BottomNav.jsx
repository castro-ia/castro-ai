import { NavLink } from 'react-router-dom';
import { Home, Users, CheckSquare, Settings } from 'lucide-react';

const TABS = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/crm', label: 'CRM', icon: Users },
  { to: '/tareas', label: 'Tareas', icon: CheckSquare },
  { to: '/ajustes', label: 'Ajustes', icon: Settings },
];

export function BottomNav() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-night-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition ${
                isActive ? 'text-white' : 'text-white/40'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
