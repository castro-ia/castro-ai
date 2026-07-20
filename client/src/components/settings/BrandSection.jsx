import { Palette } from 'lucide-react';
import { brand } from '../../config/brand';

export function BrandSection() {
  const rows = [
    ['App', brand.appName],
    ['Equipo', brand.teamName],
    ['Agente', brand.agentName],
    ['Rol', brand.role],
    ['Zona', brand.zone],
    ['Experiencia', `${brand.yearsExperience} años`],
    ['Operaciones cerradas', `${brand.closedDeals}+`],
  ];

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Palette size={17} className="text-white/50" />
        <h2 className="font-semibold text-white">Datos de marca</h2>
      </div>
      <dl className="flex flex-col gap-2">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <dt className="text-white/40">{label}</dt>
            <dd className="text-right text-white/85">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-white/35">
        Para cambiar estos datos (o rebrandizar toda la app) editá{' '}
        <code className="rounded bg-black/30 px-1 py-0.5">client/src/config/brand.js</code>.
      </p>
    </section>
  );
}
