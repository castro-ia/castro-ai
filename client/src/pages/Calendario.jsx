import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { EmptyState } from '../components/ui/EmptyState';
import { getCalendarDay, getCalendarStatus } from '../lib/api';
import { todayISO } from '../lib/castroStore';

function addDays(dateStr, delta) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

function formatLabel(dateStr) {
  if (dateStr === todayISO()) return 'Hoy';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function Calendario() {
  const { openDrawer } = useOutletContext();
  const [date, setDate] = useState(todayISO());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getCalendarStatus()
      .then((status) => {
        if (cancelled) return;
        setConnected(status.connected);
        if (!status.connected) setLoading(false);
      })
      .catch(() => {});

    getCalendarDay(date)
      .then((data) => {
        if (!cancelled) setEvents(data.events || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  return (
    <div>
      <Header title="Calendario" subtitle="Tu día, por colores" onMenuOpen={openDrawer} />

      <div className="flex items-center justify-between px-4 pt-3">
        <button
          onClick={() => setDate((d) => addDays(d, -1))}
          aria-label="Día anterior"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 active:bg-white/10"
        >
          <ChevronLeft size={18} className="text-white/70" />
        </button>
        <div className="text-center">
          <p className="font-display text-base capitalize text-white">{formatLabel(date)}</p>
          {date !== todayISO() && (
            <button onClick={() => setDate(todayISO())} className="text-xs text-white/40 underline underline-offset-2">
              Volver a hoy
            </button>
          )}
        </div>
        <button
          onClick={() => setDate((d) => addDays(d, 1))}
          aria-label="Día siguiente"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 active:bg-white/10"
        >
          <ChevronRight size={18} className="text-white/70" />
        </button>
      </div>

      <div className="flex justify-center gap-4 px-4 pt-4 text-xs text-white/50">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400" /> Negocio
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#DC1C2E]" /> Personal
        </span>
      </div>

      <div className="flex flex-col gap-2.5 px-4 py-4">
        {!connected ? (
          <EmptyState
            icon={CalendarDays}
            title="Conectá tu Google Calendar"
            subtitle="Hacelo desde Ajustes para ver tu día acá, por colores."
          />
        ) : loading ? (
          <p className="py-8 text-center text-sm text-white/40">Cargando...</p>
        ) : error ? (
          <p className="py-8 text-center text-sm text-red-300">{error}</p>
        ) : events.length === 0 ? (
          <EmptyState icon={CalendarDays} title="Sin eventos este día" subtitle="Día libre — ¿a quién llamás primero?" />
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className={`flex items-center gap-3 rounded-2xl border p-3.5 ${
                ev.esNegocio ? 'border-emerald-400/25 bg-emerald-500/5' : 'border-[#DC1C2E]/30 bg-[#DC1C2E]/5'
              }`}
            >
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${ev.esNegocio ? 'bg-emerald-400' : 'bg-[#DC1C2E]'}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white">{ev.summary}</p>
                <p className="text-xs text-white/40">{ev.allDay ? 'Todo el día' : ev.start}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
