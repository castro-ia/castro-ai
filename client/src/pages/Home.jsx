import { Link, useOutletContext } from 'react-router-dom';
import { CalendarDays, Menu, ChevronRight, RefreshCw } from 'lucide-react';
import { brand } from '../config/brand';
import { useKpis } from '../hooks/useKpis';
import { KpiCard } from '../components/ui/KpiCard';
import Goals2026 from '../components/Goals2026';
import ConversionSemaforo from '../components/ConversionSemaforo';
import FridayCheckin from '../components/FridayCheckin';
import frases from '../data/frases.json';
import { dayOfYear } from '../lib/castroStore';

const VERSICULOS = frases.filter((f) => f.tipo === 'biblia');

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buen día';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

function getVersiculoDelDia() {
  return VERSICULOS[dayOfYear() % VERSICULOS.length];
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
  const benchmark = brand.kpis.conversionBenchmark;
  const versiculo = getVersiculoDelDia();

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
        <h1 className="font-display text-lg leading-snug text-white text-block-3d">
          “{versiculo.texto}”
        </h1>
        <p className="mt-1 text-xs text-white/70">
          — {versiculo.autor} · {brand.role} · {brand.zone}
        </p>
      </header>

      <section className="-mt-3 px-4">
        <Link
          to="/calendario"
          className="flex items-center gap-3 rounded-2xl bg-remax-gradient p-4 shadow-block transition active:scale-[0.98]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/20">
            <CalendarDays size={22} color="white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-base text-white">Ver mi día</p>
            <p className="truncate text-xs text-white/80">Tu agenda de hoy, por colores: negocio y personal</p>
          </div>
          <ChevronRight size={20} className="shrink-0 text-white/70" />
        </Link>
      </section>

      <section className="mt-4 px-4">
        <FridayCheckin />
      </section>

      <section className="mt-4 px-4">
        <Goals2026 />
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
          <KpiCard label="Captaciones" value={captaciones} onSave={(v) => updateKpi('captaciones', v)} />
          <KpiCard label="Muestras" value={kpis?.muestras ?? 0} onSave={(v) => updateKpi('muestras', v)} />
          <KpiCard label="Reservas" value={kpis?.reservas ?? 0} onSave={(v) => updateKpi('reservas', v)} />
          <KpiCard label="Cierres" value={kpis?.cierres ?? 0} onSave={(v) => updateKpi('cierres', v)} />
        </div>
        <div className="mt-3">
          <ConversionSemaforo prelistings={prelistings} captaciones={captaciones} benchmark={benchmark} />
        </div>
      </section>

      <section className="mt-6 px-4 pb-8 text-center">
        <p className="font-display text-sm uppercase tracking-wide text-white/40">
          Equipo Ganador · {brand.teamName} · El 1 de RE/MAX Palermo
        </p>
      </section>
    </div>
  );
}
