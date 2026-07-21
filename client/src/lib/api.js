// Sin VITE_API_URL (caso de producción), usa rutas relativas: el mismo server Express
// sirve el build del client y la API en el mismo origen, así que "/api/..." ya alcanza.
// VITE_API_URL solo hace falta en desarrollo local, donde client y server corren en puertos separados.
const API_URL = import.meta.env.VITE_API_URL || '';

export async function getCalendarStatus() {
  const res = await fetch(`${API_URL}/api/calendar/status`);
  if (!res.ok) throw new Error('No se pudo consultar el estado del calendario.');
  return res.json();
}

export async function getCalendarAuthUrl() {
  const res = await fetch(`${API_URL}/api/calendar/auth-url`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'No se pudo generar el link de conexión.');
  return body.url;
}

export async function getCalendarKpis(month) {
  const query = month ? `?month=${month}` : '';
  const res = await fetch(`${API_URL}/api/calendar/kpis${query}`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'No se pudo sincronizar con el calendario.');
  return body;
}

export async function getCalendarToday() {
  const res = await fetch(`${API_URL}/api/calendar/today`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'No se pudo leer la agenda de hoy.');
  return body;
}

export async function getCalendarDay(date) {
  const query = date ? `?date=${date}` : '';
  const res = await fetch(`${API_URL}/api/calendar/today${query}`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'No se pudo leer la agenda de ese día.');
  return body;
}

export async function createCalendarEvent({ summary, date, time, reminderMinutes }) {
  const res = await fetch(`${API_URL}/api/calendar/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ summary, date, time, reminderMinutes }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'No se pudo crear el recordatorio en el calendario.');
  return body;
}

export async function deleteCalendarEvent(eventId) {
  const res = await fetch(`${API_URL}/api/calendar/event/${encodeURIComponent(eventId)}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 404) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'No se pudo borrar el recordatorio del calendario.');
  }
}

export async function getPushStatus() {
  const res = await fetch(`${API_URL}/api/push/status`);
  if (!res.ok) throw new Error('No se pudo consultar el estado de la notificación diaria.');
  return res.json();
}

export async function getPushPublicKey() {
  const res = await fetch(`${API_URL}/api/push/public-key`);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || 'No se pudo obtener la clave pública de notificaciones.');
  return body.key;
}

export async function saveSubscription(subscription) {
  const res = await fetch(`${API_URL}/api/push/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });
  if (!res.ok) throw new Error('No se pudo activar la notificación diaria.');
}

export async function removeSubscription() {
  await fetch(`${API_URL}/api/push/unsubscribe`, { method: 'POST' });
}
