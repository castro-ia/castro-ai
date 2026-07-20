import { useState, useEffect } from 'react';
import { KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { getSettingsStatus, saveApiKey } from '../../lib/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function ApiKeySection() {
  const [status, setStatus] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const reload = () => getSettingsStatus().then(setStatus).catch(() => setStatus(null));

  useEffect(() => {
    reload();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await saveApiKey(apiKey);
      setApiKey('');
      setFeedback({ ok: true, message: 'API key guardada. Ya podés usar los agentes.' });
      reload();
    } catch (err) {
      setFeedback({ ok: false, message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center gap-2">
        <KeyRound size={17} className="text-white/50" />
        <h2 className="font-semibold text-white">API key de Anthropic</h2>
      </div>

      {status && (
        <div
          className={`mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
            status.hasKey ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'
          }`}
        >
          {status.hasKey ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          {status.hasKey ? `Configurada · modelo ${status.model}` : 'Todavía no configuraste una API key'}
        </div>
      )}

      {status && !status.canWriteKey ? (
        <p className="text-sm text-white/50">
          Esta instancia corre en producción: la API key se configura desde las variables de entorno de tu hosting
          (Render/Railway), no desde acá.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          <Input
            type="password"
            placeholder="sk-ant-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            autoCapitalize="off"
            autoCorrect="off"
          />
          <Button onClick={handleSave} disabled={!apiKey.trim() || saving}>
            {saving ? 'Guardando...' : 'Guardar API key'}
          </Button>
          {feedback && (
            <p className={`text-sm ${feedback.ok ? 'text-emerald-400' : 'text-red-400'}`}>{feedback.message}</p>
          )}
          <p className="text-xs text-white/35">
            Se guarda solo en el servidor local (server/.env), nunca en el navegador. Conseguila en
            console.anthropic.com.
          </p>
        </div>
      )}
    </section>
  );
}
