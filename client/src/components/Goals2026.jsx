import { useState } from "react";
import {
  loadData,
  saveData,
  todayISO,
  dayOfYear,
  isWeekday,
  daysUntil,
  formatUSD,
} from "../lib/castroStore";

const DEFAULT_GOALS = {
  negocio: { metaAnualUSD: 223000, facturadoUSD: 0 },
  familia: { titulo: "Disney con Selene", fecha: "2026-10-01" },
  salud: { checkins: [] }, // array de fechas "YYYY-MM-DD" en que entrenó
};

/**
 * Goals2026 — sección "Mi 2026" para el War Room (ponela arriba del grid de KPIs).
 * Todo editable por Fernando tocando el lápiz: meta anual, facturado, evento familiar y fecha.
 */
export default function Goals2026() {
  const [goals, setGoals] = useState(() => loadData("goals2026", DEFAULT_GOALS));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);

  function update(next) {
    setGoals(next);
    saveData("goals2026", next);
  }

  // ---------- NEGOCIO ----------
  const meta = Number(goals.negocio.metaAnualUSD) || 0;
  const facturado = Number(goals.negocio.facturadoUSD) || 0;
  const pct = meta > 0 ? Math.min((facturado / meta) * 100, 100) : 0;
  const esperado = (meta * dayOfYear()) / 365;
  const enRitmo = facturado >= esperado;
  // Proyección a fin de año al ritmo actual
  const proyeccion =
    dayOfYear() > 0 ? Math.round((facturado / dayOfYear()) * 365) : 0;

  // ---------- SALUD ----------
  const hoy = todayISO();
  const entrenoHoy = goals.salud.checkins.includes(hoy);
  const racha = calcRacha(goals.salud.checkins);

  function toggleGym() {
    const checkins = entrenoHoy
      ? goals.salud.checkins.filter((d) => d !== hoy)
      : [...goals.salud.checkins, hoy].sort();
    update({ ...goals, salud: { ...goals.salud, checkins } });
  }

  // ---------- FAMILIA ----------
  const dias = daysUntil(goals.familia.fecha);

  // ---------- EDICIÓN ----------
  function startEdit() {
    setDraft({
      metaAnualUSD: String(goals.negocio.metaAnualUSD),
      facturadoUSD: String(goals.negocio.facturadoUSD),
      titulo: goals.familia.titulo,
      fecha: goals.familia.fecha,
    });
    setEditing(true);
  }

  function saveEdit() {
    update({
      ...goals,
      negocio: {
        metaAnualUSD: Number(draft.metaAnualUSD) || 0,
        facturadoUSD: Number(draft.facturadoUSD) || 0,
      },
      familia: { titulo: draft.titulo, fecha: draft.fecha },
    });
    setEditing(false);
  }

  const inputCls =
    "w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/40";

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-5 shadow-[3px_3px_0_rgba(0,0,0,0.6)] space-y-5">
      <div className="flex items-center justify-between">
        <h2
          className="text-white text-lg"
          style={{ fontFamily: "'Archivo Black', sans-serif" }}
        >
          MI 2026
        </h2>
        <button
          onClick={editing ? saveEdit : startEdit}
          className="text-xs rounded-lg border border-white/20 px-3 py-1.5 text-white/70 active:bg-white/10"
        >
          {editing ? "Guardar" : "✎ Editar metas"}
        </button>
      </div>

      {editing ? (
        <div className="space-y-3">
          <label className="block text-xs text-white/50">
            Meta anual (USD)
            <input
              className={inputCls + " mt-1"}
              inputMode="numeric"
              value={draft.metaAnualUSD}
              onChange={(e) =>
                setDraft({ ...draft, metaAnualUSD: e.target.value })
              }
            />
          </label>
          <label className="block text-xs text-white/50">
            Facturado hasta hoy (USD)
            <input
              className={inputCls + " mt-1"}
              inputMode="numeric"
              value={draft.facturadoUSD}
              onChange={(e) =>
                setDraft({ ...draft, facturadoUSD: e.target.value })
              }
            />
          </label>
          <label className="block text-xs text-white/50">
            Meta familiar (título)
            <input
              className={inputCls + " mt-1"}
              value={draft.titulo}
              onChange={(e) => setDraft({ ...draft, titulo: e.target.value })}
            />
          </label>
          <label className="block text-xs text-white/50">
            Fecha del evento familiar
            <input
              type="date"
              className={inputCls + " mt-1"}
              value={draft.fecha}
              onChange={(e) => setDraft({ ...draft, fecha: e.target.value })}
            />
          </label>
        </div>
      ) : (
        <>
          {/* NEGOCIO */}
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <p className="text-xs uppercase tracking-widest text-white/40">
                Negocio
              </p>
              <p className="text-xs text-white/50">
                {formatUSD(facturado)} / {formatUSD(meta)}
              </p>
            </div>
            <div className="h-3 rounded-full bg-white/10 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  enRitmo
                    ? "bg-gradient-to-r from-[#003DA5] to-emerald-400"
                    : "bg-gradient-to-r from-[#003DA5] to-[#DC1C2E]"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-white/50">
              {enRitmo ? "✓ En ritmo. " : "⚠ Abajo del ritmo. "}
              A este ritmo cerrás el año en {formatUSD(proyeccion)}.
            </p>
          </div>

          {/* SALUD + FAMILIA en dos columnas */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={toggleGym}
              disabled={!isWeekday()}
              className={`rounded-2xl border p-4 text-center transition-colors ${
                entrenoHoy
                  ? "bg-emerald-500/15 border-emerald-400/40"
                  : "bg-white/5 border-white/10 active:bg-white/10"
              } ${!isWeekday() ? "opacity-50" : ""}`}
            >
              <p className="text-2xl">{entrenoHoy ? "💪" : "🏋️"}</p>
              <p
                className="text-xl text-white mt-1"
                style={{ fontFamily: "'Archivo Black', sans-serif" }}
              >
                {racha}
              </p>
              <p className="text-[11px] text-white/50 leading-tight mt-0.5">
                {isWeekday()
                  ? entrenoHoy
                    ? "días de racha · hecho ✓"
                    : "días de racha · tocá al entrenar"
                  : "días de racha · finde libre"}
              </p>
            </button>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-4 text-center">
              <p className="text-2xl">🏰</p>
              <p
                className="text-xl text-white mt-1"
                style={{ fontFamily: "'Archivo Black', sans-serif" }}
              >
                {dias !== null && dias >= 0 ? dias : "—"}
              </p>
              <p className="text-[11px] text-white/50 leading-tight mt-0.5">
                días para {goals.familia.titulo}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Racha: cuenta días hábiles consecutivos entrenados hacia atrás desde hoy
// (los fines de semana no cortan la racha).
function calcRacha(checkins) {
  const set = new Set(checkins);
  let racha = 0;
  const d = new Date();
  // Si hoy es hábil y todavía no entrenó, arrancamos desde ayer para no castigar la mañana
  if (isWeekday(d) && !set.has(d.toISOString().slice(0, 10))) {
    d.setDate(d.getDate() - 1);
  }
  for (let i = 0; i < 365; i++) {
    const day = d.getDay();
    if (day >= 1 && day <= 5) {
      const iso = d.toISOString().slice(0, 10);
      if (set.has(iso)) racha++;
      else break;
    }
    d.setDate(d.getDate() - 1);
  }
  return racha;
}
