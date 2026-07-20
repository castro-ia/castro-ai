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

export default function Home() {
  const { kpis, updateKpi } = useKpis();

  const captaciones = kpis?.captaciones ?? 0;
  const prelistings = kpis?.prelistings ?? 0;
  const conversion = prelistings > 0 ? Math.round((captaciones / prelistings) * 100) : 0;
  const benchmark = brand.kpis.conversionBenchmark;

  return (
    <div>
      <header className="safe-top bg-remax-gradient px-4 pb-6 pt-4">
        <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-black/25 font-display text-sm text-white text-block-3d">
          {brand.logoShort}
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
        <div className="grid grid-cols-2 gap-3">
          <KpiCard label="Prelistings del mes" value={prelistings} onSave={(v) => updateKpi('prelistings', v)} />
          <KpiCard label="Tasaciones" value={kpis?.tasaciones ?? 0} onSave={(v) => updateKpi('tasaciones', v)} />
          <KpiCard label="Captaciones" value={captaciones} onSave={(v) => updateKpi('captaciones', v)} />
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

      <section className="mt-6 px-4">
        <h2 className="mb-3 text-sm font-semibold text-white/60">Tus agentes</h2>
        <div className="flex flex-col gap-2.5">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      </section>
    </div>
  );
}
