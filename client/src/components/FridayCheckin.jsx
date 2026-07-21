import { useState } from "react";
import { loadData, saveData, isFriday, weekKey, todayISO } from "../lib/castroStore";

const PREGUNTAS = [
  { id: "tasaciones", label: "¿Cuántas tasaciones hiciste esta semana?" },
  { id: "captaciones", label: "¿Cuántas captaciones nuevas cerraste?" },
  {
    id: "pendiente",
    label: "¿Qué acción NO hiciste y por qué?",
    textarea: true,
  },
];

/**
 * FridayCheckin — banner + formulario que aparece solo los viernes
 * si todavía no respondiste esta semana. Montalo en el War Room.
 *
 * El histórico queda en localStorage ("castro:fridayCheckins") y podés
 * inyectarlo al prompt del CEO con getCheckinContext() (abajo).
 */
export default function FridayCheckin() {
  const [history, setHistory] = useState(() =>
    loadData("fridayCheckins", [])
  );
  const [answers, setAnswers] = useState({});
  const [open, setOpen] = useState(false);

  const thisWeek = weekKey();
  const yaRespondio = history.some((h) => h.week === thisWeek);

  if (!isFriday() || yaRespondio) return null;

  function submit() {
    const entry = {
      week: thisWeek,
      fecha: todayISO(),
      tasaciones: Number(answers.tasaciones) || 0,
      captaciones: Number(answers.captaciones) || 0,
      pendiente: (answers.pendiente || "").trim(),
    };
    const next = [...history, entry];
    setHistory(next);
    saveData("fridayCheckins", next);
  }

  const inputCls =
    "w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/40";

  return (
    <div className="rounded-2xl border border-[#DC1C2E]/40 bg-gradient-to-br from-[#003DA5]/20 to-[#DC1C2E]/20 p-5 shadow-[3px_3px_0_rgba(0,0,0,0.6)]">
      <p
        className="text-white text-lg"
        style={{ fontFamily: "'Archivo Black', sans-serif" }}
      >
        VIERNES DE CUENTAS
      </p>
      <p className="text-sm text-white/60 mt-1">
        3 preguntas. 2 minutos. Sin excusas.
      </p>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 w-full rounded-xl bg-white text-[#05070f] font-bold py-3 active:translate-y-[1px]"
        >
          Rendir la semana
        </button>
      ) : (
        <div className="mt-4 space-y-3">
          {PREGUNTAS.map((q) => (
            <label key={q.id} className="block text-xs text-white/60">
              {q.label}
              {q.textarea ? (
                <textarea
                  rows={3}
                  className={inputCls + " mt-1"}
                  value={answers[q.id] || ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [q.id]: e.target.value })
                  }
                />
              ) : (
                <input
                  inputMode="numeric"
                  className={inputCls + " mt-1"}
                  value={answers[q.id] || ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [q.id]: e.target.value })
                  }
                />
              )}
            </label>
          ))}
          <button
            onClick={submit}
            className="w-full rounded-xl bg-gradient-to-r from-[#003DA5] to-[#DC1C2E] text-white font-bold py-3 active:translate-y-[1px]"
          >
            Guardar y cerrar la semana ✓
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * getCheckinContext — devuelve las últimas N semanas como texto
 * para inyectar en el system prompt del CEO. Así el CEO puede decir
 * "hace 3 viernes que decís que no llamaste a la base".
 *
 * Uso en tu llamada al proxy de Claude:
 *   const contexto = getCheckinContext(6);
 *   systemPrompt += "\n\nHistórico de check-ins de viernes de Fernando:\n" + contexto;
 */
export function getCheckinContext(n = 6) {
  const history = loadData("fridayCheckins", []);
  if (history.length === 0) return "Sin check-ins registrados todavía.";
  return history
    .slice(-n)
    .map(
      (h) =>
        `Semana ${h.week} (${h.fecha}): ${h.tasaciones} tasaciones, ${h.captaciones} captaciones. Pendiente: ${h.pendiente || "nada declarado"}`
    )
    .join("\n");
}
