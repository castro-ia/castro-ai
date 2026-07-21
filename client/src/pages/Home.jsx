import { Link, useOutletContext } from 'react-router-dom';
import { MessagesSquare, Menu, ChevronRight, RefreshCw } from 'lucide-react';
import { agents } from '../config/agents';
import { brand } from '../config/brand';
import { useKpis } from '../hooks/useKpis';
import { AgentCard } from '../components/agents/AgentCard';
import { KpiCard } from '../components/ui/KpiCard';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buen día';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

function formatSyncedAt(timestamp) {
  if (!timestamp) return null;
  return new Date(timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

export default function Home() {
  const { openDrawer } = useOutletContext();
  const { kpis, updateKpi, calendarConnected, syncing, syncError, syncFromCalendar } = useKpis();

  const captaciones = kpis?.captaciones ?? 0;
  const prelistings = kpis?.prelistings ?? 0;
  const conversion = prelistings > 0 ? Math.round((captaciones / prelistings) * 100) : 0;
  const benchmark = brand.kpis.conversionBenchmark;

  return (
    <div>
      <header className="safe-top bg-remax-gradient px-4 pb-6 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/25 font-display text-sm text-white text-block-3d">
            {brand.logoShort}
          </div>
          <button
            onClick={openDrawer}
            aria-label="Abrir menú"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/20 active:bg-black/30"
          >
            <Menu size={20} color="white" />
          </button>
        </div>
        <p className="text-sm text-white/80">
          {getGreeting()}, {brand.agentName.split(' ')[0]}
        </p>
        <h1 className="font-display text-2xl leading-tight text-white text-block-3d">War Room</h1>
        <p className="mt-1 text-xs text-white/70">
          {brand.role} · {brand.zone}
        </p>
      </header>

      <section className="-mt-3 px-4">
        <Link
          to="/equipo"
          className="flex items-center gap-3 rounded-2xl bg-remax-gradient p-4 shadow-block transition active:scale-[0.98]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/20">
            <MessagesSquare size={22} color="white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-base text-white">Hablar con el Equipo</p>
            <p className="truncate text-xs text-white/80">El CEO coordina a todo el equipo por vos</p>
          </div>
          <ChevronRight size={20} className="shrink-0 text-white/70" />
        </Link>
      </section>

      <section className="mt-4 px-4">
        <div className="mb-2 flex items-center justify-between">
          {calendarConnected ? (
            <>
              <p className="text-xs text-white/35">
                {kpis?.lastSyncedAt ? `Sincronizado ${formatSyncedAt(kpis.lastSyncedAt)}` : 'Todavía no sincronizaste'}
              </p>
              <button
                onClick={syncFromCalendar}
                disabled={syncing}
                className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70 active:bg-white/10 disabled:opacity-50"
              >
                <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Sincronizando...' : 'Sincronizar'}
              </button>
            </>
          ) : (
            <Link to="/ajustes" className="text-xs text-white/40 underline underline-offset-2">
              Conectá tu Google Calendar en Ajustes para actualizar esto solo
            </Link>
          )}
        </div>
        {syncError && <p className="mb-2 text-xs text-red-300">{syncError}</p>}
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Prelistings del mes" value={prelistings} onSave={(v) => updateKpi('prelistings', v)} />
          <KpiCard label="Tasaciones" value={kpis?.tasaciones ?? 0} onSave={(v) => updateKpi('tasaciones', v)} />
          <KpiCard label="Captaciones" value={captaciones} onSave={(v) => updateKpi('captaciones', v)} />
          <KpiCard label="Muestras" value={kpis?.muestras ?? 0} onSave={(v) => updateKpi('muestras', v)} />
          <KpiCard label="Reservas" value={kpis?.reservas ?? 0} onSave={(v) => updateKpi('reservas', v)} />
          <KpiCard label="Cierres" value={kpis?.cierres ?? 0} onSave={(v) => updateKpi('cierres', v)} />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-white/40">
              Conversión vs. {benchmark}%
            </p>
            <p className={`font-display text-2xl ${conversion >= benchmark ? 'text-emerald-400' : 'text-white'}`}>
              {conversion}%
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 px-4 pb-4">
        <h2 className="mb-3 text-sm font-semibold text-white/60">Tu equipo</h2>
        <div className="flex flex-col gap-2.5">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </section>
    </div>
  );
}
