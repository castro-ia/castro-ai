import { useState, useEffect } from 'react';
import { BellRing, CheckCircle2, AlertCircle } from 'lucide-react';
import { getPushStatus } from '../../lib/api';
import { isPushSupported, subscribeToPush, unsubscribeFromPush } from '../../lib/push';
import { Button } from '../ui/Button';

export function PushSection() {
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const reload = () => getPushStatus().then(setStatus).catch(() => setStatus(null));

  useEffect(() => {
    reload();
  }, []);

  const handleToggle = async () => {
    setBusy(true);
    setError(null);
    try {
      if (status?.subscribed) {
        await unsubscribeFromPush();
      } else {
        await subscribeToPush();
      }
      await reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!isPushSupported()) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <BellRing size={17} className="text-white/50" />
        <h2 className="font-semibold text-white">Notificación diaria</h2>
      </div>

      {status && (
        <div
          className={`mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
            status.subscribed ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'
          }`}
        >
          {status.subscribed ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {status.subscribed ? 'Activada — te llega la frase del día a las 7 AM' : 'Todavía no la activaste'}
        </div>
      )}

      {status && !status.configured ? (
        <p className="text-sm text-white/50">
          Faltan las claves VAPID en el servidor (<code className="rounded bg-black/30 px-1">VAPID_PUBLIC_KEY</code>,{' '}
          <code className="rounded bg-black/30 px-1">VAPID_PRIVATE_KEY</code>).
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          <Button onClick={handleToggle} disabled={busy} variant={status?.subscribed ? 'secondary' : 'primary'}>
            {busy ? 'Un momento...' : status?.subscribed ? 'Desactivar' : 'Activar notificación diaria'}
          </Button>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <p className="text-xs text-white/35">
            Todos los días a las 7 AM te llega una notificación con la frase del día — antes de abrir Instagram, como
            dice el plan. Necesita que la app esté instalada en tu pantalla de inicio.
          </p>
        </div>
      )}
    </section>
  );
}
