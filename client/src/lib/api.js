// Sin VITE_API_URL (caso de producción), usa rutas relativas: el mismo server Express
// sirve el build del client y la API en el mismo origen, así que "/api/..." ya alcanza.
// VITE_API_URL solo hace falta en desarrollo local, donde client y server corren en puertos separados.
const API_URL = import.meta.env.VITE_API_URL || '';

/**
 * Manda la conversación al backend y consume la respuesta en streaming (SSE sobre POST).
 * callbacks: { onDelta(text), onDone(), onError(message) }
 * Devuelve una función `abort()` para cancelar el streaming.
 */
export function streamChat({ messages, systemPrompt }, { onDelta, onDone, onError }) {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, systemPrompt }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        onError(body.error || `Error del servidor (${res.status}).`);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() || '';

        for (const chunk of chunks) {
          const eventMatch = chunk.match(/^event: (.+)$/m);
          const dataMatch = chunk.match(/^data: (.+)$/m);
          if (!eventMatch || !dataMatch) continue;

          const event = eventMatch[1];
          const data = JSON.parse(dataMatch[1]);

          if (event === 'delta') onDelta(data.text);
          else if (event === 'done') onDone();
          else if (event === 'error') onError(data.message);
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        onError(err.message || 'No se pudo conectar con el servidor.');
      }
    }
  })();

  return () => controller.abort();
}

export async function getSettingsStatus() {
  const res = await fetch(`${API_URL}/api/settings/status`);
  if (!res.ok) throw new Error('No se pudo consultar el estado de la API key.');
  return res.json();
}

export async function saveApiKey(apiKey) {
  const res = await fetch(`${API_URL}/api/settings/api-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'No se pudo guardar la API key.');
  return body;
}
