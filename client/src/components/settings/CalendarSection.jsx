import { useState, useEffect } from 'react';
import { CalendarDays, CheckCircle2, AlertCircle } from 'lucide-react';
import { getCalendarStatus, getCalendarAuthUrl } from '../../lib/api';
import { Button } from '../ui/Button';

export function CalendarSection() {
  const [status, setStatus] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const reload = () => getCalendarStatus().then(setStatus).catch(() => setStatus(null));

  useEffect(() => {
    reload();
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      const url = await getCalendarAuthUrl();
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setConnecting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <CalendarDays size={17} className="text-white/50" />
        <h2 className="font-semibold text-white">Google Calendar</h2>
      </div>

      {status && (
        <div
          className={`mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
            status.connected ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'
          }`}
        >
          {status.connected ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {status.connected ? 'Conectado — el War Room se sincroniza con tu calendario' : 'Todavía no conectaste tu calendario'}
        </div>
      )}

      {status && !status.configured ? (
        <p className="text-sm text-white/50">
          Faltan las credenciales de Google en el servidor (<code className="rounded bg-black/30 px-1">GOOGLE_CLIENT_ID</code>,{' '}
          <code className="rounded bg-black/30 px-1">GOOGLE_CLIENT_SECRET</code>,{' '}
          <code className="rounded bg-black/30 px-1">GOOGLE_REDIRECT_URI</code>). Revisá el README para configurarlas.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          <Button onClick={handleConnect} disabled={connecting}>
            {connecting ? 'Abriendo Google...' : status?.connected ? 'Reconectar Google Calendar' : 'Conectar Google Calendar'}
          </Button>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <p className="text-xs text-white/35">
            Solo se lee tu calendario (no se modifica nada). Los eventos se cuentan por palabra clave en el título:
            "tasación", "prelisting", "captación" o "autorización de venta". Los eventos recurrentes (recordatorios diarios/semanales) no se cuentan.
          </p>
        </div>
      )}
    </section>
  );
}
