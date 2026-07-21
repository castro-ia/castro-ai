import { useEffect, useState } from "react";
import frases from "../data/frases.json";
import {
  loadData,
  saveData,
  todayISO,
  dayOfYear,
  formatUSD,
} from "../lib/castroStore";

/**
 * MorningBrief — pantalla de arranque de día.
 *
 * Props:
 *  - events: array de eventos de HOY del Google Calendar (opcional).
 *            Formato esperado: [{ summary: "Prelisting Beruti 3244", start: "10:30" }, ...]
 *            Si ya tenés los eventos parseados para los KPIs, pasalos acá filtrados por hoy.
 *  - onClose: callback para cerrar el brief y pasar al War Room.
 *
 * Se muestra solo la PRIMERA vez que se abre la app cada día (guarda lastBriefDate).
 * Para forzarlo en desarrollo: localStorage.removeItem("castro:lastBriefDate")
 */
export default function MorningBrief({ events = [], onClose }) {
  const frase = frases[dayOfYear() % frases.length];
  const goals = loadData("goals2026", null);

  // Cálculo del "número del día": lo que falta para la meta anual
  let restante = null;
  let ritmoOk = null;
  if (goals?.negocio?.metaAnualUSD) {
    const meta = Number(goals.negocio.metaAnualUSD);
    const facturado = Number(goals.negocio.facturadoUSD || 0);
    restante = Math.max(meta - facturado, 0);
    const esperado = (meta * dayOfYear()) / 365;
    ritmoOk = facturado >= esperado;
  }

  const topEvents = events.slice(0, 3);

  function handleClose() {
    saveData("lastBriefDate", todayISO());
    onClose?.();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#05070f] px-4">
      <div className="w-full max-w-md space-y-5 py-8">
        {/* Frase del día */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6 shadow-[3px_3px_0_rgba(0,0,0,0.6)]">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-3">
            {frase.tipo === "biblia" ? "Palabra del día" : "Frase del día"}
          </p>
          <p className="text-lg leading-snug text-white font-medium">
            “{frase.texto}”
          </p>
          <p className="mt-3 text-sm text-white/50">— {frase.autor}</p>
        </div>

        {/* Identidad */}
        <div className="rounded-2xl p-[2px] bg-gradient-to-br from-[#003DA5] to-[#DC1C2E] shadow-[3px_3px_0_rgba(0,0,0,0.6)]">
          <div className="rounded-2xl bg-[#0a1128] p-5 text-center">
            <p
              className="text-white text-xl leading-tight"
              style={{ fontFamily: "'Archivo Black', sans-serif" }}
            >
              SOY FERNANDO CASTRO
            </p>
            <p className="mt-1 text-sm text-white/70">
              De Rafael Castillo al Hall of Fame · El 1 de RE/MAX Palermo
            </p>
          </div>
        </div>

        {/* Agenda de hoy */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 shadow-[3px_3px_0_rgba(0,0,0,0.6)]">
          <p className="text-xs uppercase tracking-widest text-white/40 mb-3">
            Hoy en tu agenda
          </p>
          {topEvents.length === 0 ? (
            <p className="text-sm text-white/60">
              Sin eventos cargados. Día libre para prospectar: ¿a quién llamás
              primero?
            </p>
          ) : (
            <ul className="space-y-2">
              {topEvents.map((ev, i) => (
                <li key={i} className="flex items-baseline gap-3">
                  <span className="text-xs font-mono text-white/50 shrink-0">
                    {ev.start || "—"}
                  </span>
                  <span className="text-sm text-white">{ev.summary}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* El número del día */}
        {restante !== null && (
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center shadow-[3px_3px_0_rgba(0,0,0,0.6)]">
            <p className="text-xs uppercase tracking-widest text-white/40 mb-2">
              Falta para tu meta 2026
            </p>
            <p
              className={`text-3xl ${ritmoOk ? "text-emerald-400" : "text-[#DC1C2E]"}`}
              style={{ fontFamily: "'Archivo Black', sans-serif" }}
            >
              {formatUSD(restante)}
            </p>
            <p className="mt-1 text-xs text-white/50">
              {ritmoOk
                ? "Venís arriba del ritmo. Mantené el pie en el acelerador."
                : "Venís abajo del ritmo anual. Hoy cuenta doble."}
            </p>
          </div>
        )}

        <button
          onClick={handleClose}
          className="w-full rounded-2xl bg-gradient-to-r from-[#003DA5] to-[#DC1C2E] py-4 text-white font-bold shadow-[3px_3px_0_rgba(0,0,0,0.6)] active:translate-y-[2px] transition-transform"
        >
          A trabajar →
        </button>
      </div>
    </div>
  );
}

/**
 * Hook para decidir si mostrar el brief.
 * Uso en App.jsx:
 *   const [showBrief, setShowBrief] = useMorningBrief();
 *   {showBrief && <MorningBrief events={eventosDeHoy} onClose={() => setShowBrief(false)} />}
 */
export function useMorningBrief() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const last = loadData("lastBriefDate", null);
    if (last !== todayISO()) setShow(true);
  }, []);
  return [show, setShow];
}
