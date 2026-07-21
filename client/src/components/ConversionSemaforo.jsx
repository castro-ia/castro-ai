/**
 * ConversionSemaforo — reemplaza tu KPI de "Conversión" actual.
 *
 * Props:
 *  - prelistings: número de prelistings del mes (del sync de Calendar)
 *  - captaciones: número de captaciones del mes
 *  - benchmark: default 46
 *  - onTalkToCEO: callback para navegar al chat del Equipo (opcional).
 *                 Si lo pasás, el mensaje de alerta trae botón directo al CEO.
 *
 * Lógica del semáforo:
 *  🟢 verde:    conversión >= benchmark
 *  🟡 amarillo: hasta 8 puntos abajo del benchmark
 *  🔴 rojo:     más de 8 puntos abajo → aparece mensaje del CEO
 */
export default function ConversionSemaforo({
  prelistings = 0,
  captaciones = 0,
  benchmark = 46,
  onTalkToCEO,
}) {
  const pct =
    prelistings > 0 ? Math.round((captaciones / prelistings) * 100) : null;

  const status = getStatus(pct, benchmark);

  const colorMap = {
    verde: {
      text: "text-emerald-400",
      ring: "border-emerald-400/40",
      bg: "bg-emerald-500/10",
    },
    amarillo: {
      text: "text-amber-400",
      ring: "border-amber-400/40",
      bg: "bg-amber-500/10",
    },
    rojo: {
      text: "text-[#DC1C2E]",
      ring: "border-[#DC1C2E]/50",
      bg: "bg-[#DC1C2E]/10",
    },
    sinDatos: {
      text: "text-white/50",
      ring: "border-white/10",
      bg: "bg-white/5",
    },
  };
  const c = colorMap[status];

  return (
    <div
      className={`rounded-2xl border p-4 shadow-[3px_3px_0_rgba(0,0,0,0.6)] ${c.ring} ${c.bg} col-span-2`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-white/40">
            Conversión prelisting → captación
          </p>
          <p
            className={`text-3xl mt-1 ${c.text}`}
            style={{ fontFamily: "'Archivo Black', sans-serif" }}
          >
            {pct === null ? "—" : `${pct}%`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/40">Benchmark</p>
          <p className="text-lg text-white/70 font-semibold">{benchmark}%</p>
        </div>
      </div>

      {/* Mensaje del CEO cuando está en rojo */}
      {status === "rojo" && (
        <div className="mt-3 rounded-xl bg-black/30 border border-white/10 p-3">
          <p className="text-sm text-white/90 leading-snug">
            <span className="font-bold">CEO:</span> Este mes estás dejando
            captaciones sobre la mesa: {captaciones} de {prelistings}{" "}
            prelistings. Con tu {benchmark}% histórico serían{" "}
            {Math.round((prelistings * benchmark) / 100)}. ¿Repasamos tu guion
            de prelisting?
          </p>
          {onTalkToCEO && (
            <button
              onClick={onTalkToCEO}
              className="mt-2 text-xs font-bold text-white rounded-lg bg-gradient-to-r from-[#003DA5] to-[#DC1C2E] px-3 py-2 active:translate-y-[1px]"
            >
              Hablar con el CEO →
            </button>
          )}
        </div>
      )}

      {status === "amarillo" && (
        <p className="mt-2 text-xs text-amber-300/80">
          Cerca del benchmark, pero abajo. Una captación más este mes te pone en
          verde.
        </p>
      )}

      {status === "sinDatos" && (
        <p className="mt-2 text-xs text-white/40">
          Sin prelistings este mes todavía. La conversión arranca cuando
          arrancás vos.
        </p>
      )}
    </div>
  );
}

function getStatus(pct, benchmark) {
  if (pct === null) return "sinDatos";
  if (pct >= benchmark) return "verde";
  if (pct >= benchmark - 8) return "amarillo";
  return "rojo";
}
