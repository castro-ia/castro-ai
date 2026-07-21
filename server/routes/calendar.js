import { Router } from 'express';
import { upsertEnvVar } from '../lib/envFile.js';

const router = Router();

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
// calendar.events alcanza para todo lo que hacemos (leer eventos para los KPIs/agenda,
// y crear/borrar eventos para los recordatorios de tareas) sin pedir acceso de más.
const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events';
const BUENOS_AIRES_OFFSET = '-03:00';
const BUENOS_AIRES_TZ = 'America/Argentina/Buenos_Aires';

function getConfig() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  };
}

function isConfigured({ clientId, clientSecret, redirectUri }) {
  return Boolean(clientId && clientSecret && redirectUri);
}

async function getAccessToken(config, refreshToken) {
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'refresh_token',
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) return null;
  return tokenData.access_token;
}

const COMBINING_DIACRITICS = /[̀-ͯ]/g;

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, ''); // saca los acentos (tildes), que tras el normalize quedan como marcas combinables
}

// "escritura" también aparece en eventos que NO son el cierre en sí: recordatorios de
// vencimiento de plazo, trámites de retirar el testimonio ya firmado, reintegros de gastos
// o cierres todavía no confirmados. Esos no cuentan como cierre real.
const CIERRE_FALSE_POSITIVES = ['retirar', 'prorroga', 'posible', 'gastos', 'reintegrar'];

function isRealCierre(title) {
  return !CIERRE_FALSE_POSITIVES.some((word) => title.includes(word));
}

// Para la agenda del día (Calendario): clasificación más laxa que la de los KPIs,
// solo para decidir el color (verde negocio / rojo personal), no para contar nada.
const NEGOCIO_KEYWORDS = [
  'tasacion',
  'prelisting',
  'autorizacion',
  'captacion',
  'mostrar',
  'reservar',
  'escritura',
  'cliente',
  'propiedad',
  'inmobiliaria',
  'inquilino',
  'propietario',
  'alquiler',
  'venta',
  'oficina',
  'reunion',
  'depto',
  'departamento',
  'refuerzo',
  'sena', // "seña" ya sin tilde tras normalize()
  'boleto',
  'escribano',
  'condominio',
  'sucesion',
  'lote',
  'casa',
];

function esNegocio(title) {
  return NEGOCIO_KEYWORDS.some((word) => title.includes(word));
}

function htmlPage(title, bodyHtml) {
  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8" /><title>${title}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { font-family: -apple-system, system-ui, sans-serif; background: #05070f; color: #fff; padding: 24px; line-height: 1.5; }
  h1 { font-size: 1.15rem; }
  input { width: 100%; box-sizing: border-box; padding: 12px; border-radius: 10px; border: 1px solid #333; background: #101a3d; color: #fff; font-size: 14px; margin: 12px 0; }
  button { padding: 10px 16px; border-radius: 10px; border: none; background: linear-gradient(135deg,#003DA5,#DC1C2E); color: #fff; font-weight: 600; }
  a { color: #7dd3fc; }
</style></head>
<body>${bodyHtml}</body></html>`;
}

router.get('/status', (_req, res) => {
  const config = getConfig();
  res.json({
    connected: Boolean(process.env.GOOGLE_REFRESH_TOKEN),
    configured: isConfigured(config),
    canWrite: process.env.NODE_ENV !== 'production',
  });
});

router.get('/auth-url', (_req, res) => {
  const config = getConfig();
  if (!isConfigured(config)) {
    return res.status(412).json({
      error: 'Faltan las credenciales de Google (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_REDIRECT_URI) en el servidor.',
    });
  }

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: CALENDAR_SCOPE,
    access_type: 'offline',
    prompt: 'consent',
  });

  res.json({ url: `${GOOGLE_AUTH_URL}?${params.toString()}` });
});

router.get('/callback', async (req, res) => {
  const config = getConfig();
  const { code, error } = req.query;

  if (error) {
    return res.status(400).send(htmlPage('Conexión cancelada', `<h1>Conexión cancelada</h1><p>${error}</p>`));
  }
  if (!isConfigured(config) || typeof code !== 'string') {
    return res.status(400).send(htmlPage('Error', '<h1>Faltan datos para completar la conexión.</h1>'));
  }

  try {
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.refresh_token) {
      return res.status(400).send(
        htmlPage(
          'Error al conectar',
          `<h1>No se pudo completar la conexión</h1><p>${tokenData.error_description || tokenData.error || 'Google no devolvió un refresh token (probá desconectar el acceso de la app en tu cuenta de Google y reconectar).'}</p>`
        )
      );
    }

    if (process.env.NODE_ENV !== 'production') {
      upsertEnvVar('GOOGLE_REFRESH_TOKEN', tokenData.refresh_token);
      return res.send(
        htmlPage(
          'Conectado',
          `<h1>✅ Google Calendar conectado</h1><p>Ya podés cerrar esta pestaña y volver a la app.</p>`
        )
      );
    }

    return res.send(
      htmlPage(
        'Copiá tu token',
        `<h1>✅ Conectado — un último paso</h1>
        <p>En producción no puedo guardar esto solo. Copiá el valor de abajo y pegalo en Render → tu servicio → <b>Environment</b> → variable <code>GOOGLE_REFRESH_TOKEN</code>, y guardá (esto va a reiniciar el servicio).</p>
        <input readonly value="${tokenData.refresh_token}" onclick="this.select()" />
        <button onclick="navigator.clipboard.writeText('${tokenData.refresh_token}')">Copiar</button>`
      )
    );
  } catch (err) {
    return res.status(500).send(htmlPage('Error', `<h1>Error inesperado</h1><p>${err.message}</p>`));
  }
});

router.get('/kpis', async (req, res) => {
  const config = getConfig();
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!isConfigured(config) || !refreshToken) {
    return res.status(412).json({ error: 'Todavía no conectaste tu Google Calendar. Hacelo desde Ajustes.' });
  }

  const monthParam = typeof req.query.month === 'string' ? req.query.month : null;
  const now = new Date();
  const [year, month] = monthParam
    ? monthParam.split('-').map(Number)
    : [now.getFullYear(), now.getMonth() + 1];

  const pad = (n) => String(n).padStart(2, '0');
  const timeMin = `${year}-${pad(month)}-01T00:00:00${BUENOS_AIRES_OFFSET}`;
  const nextMonth = month === 12 ? { y: year + 1, m: 1 } : { y: year, m: month + 1 };
  const timeMax = `${nextMonth.y}-${pad(nextMonth.m)}-01T00:00:00${BUENOS_AIRES_OFFSET}`;

  try {
    const accessToken = await getAccessToken(config, refreshToken);
    if (!accessToken) {
      return res.status(401).json({ error: 'Se venció el acceso a tu Google Calendar. Reconectalo en Ajustes.' });
    }

    const eventsUrl = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    eventsUrl.searchParams.set('timeMin', timeMin);
    eventsUrl.searchParams.set('timeMax', timeMax);
    eventsUrl.searchParams.set('singleEvents', 'true');
    eventsUrl.searchParams.set('maxResults', '250');

    const eventsRes = await fetch(eventsUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const eventsData = await eventsRes.json();
    if (!eventsRes.ok) {
      return res.status(502).json({ error: eventsData.error?.message || 'No se pudo leer el calendario.' });
    }

    const counts = { prelistings: 0, tasaciones: 0, captaciones: 0, muestras: 0, reservas: 0, cierres: 0 };
    for (const item of eventsData.items || []) {
      // Los recordatorios diarios/semanales recurrentes (ej. "objetivo semanal: 4 prelistings")
      // no son operaciones reales — solo cuentan eventos puntuales, no instancias de una serie.
      if (item.recurringEventId) continue;

      const title = normalize(item.summary);
      if (title.includes('tasacion')) counts.tasaciones += 1;
      else if (title.includes('prelisting')) counts.prelistings += 1;
      else if (title.includes('autorizacion') || title.includes('captacion')) counts.captaciones += 1;
      else if (title.includes('mostrar')) counts.muestras += 1;
      else if (title.includes('reservar')) counts.reservas += 1;
      else if (title.includes('escritura') && isRealCierre(title)) counts.cierres += 1;
    }

    res.json({ ...counts, month: `${year}-${pad(month)}`, eventCount: (eventsData.items || []).length });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error inesperado al leer el calendario.' });
  }
});

router.get('/today', async (req, res) => {
  const config = getConfig();
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!isConfigured(config) || !refreshToken) {
    return res.status(412).json({ error: 'Todavía no conectaste tu Google Calendar. Hacelo desde Ajustes.' });
  }

  const pad = (n) => String(n).padStart(2, '0');
  const now = new Date();
  const defaultDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const dateStr = /^\d{4}-\d{2}-\d{2}$/.test(req.query.date) ? req.query.date : defaultDate;
  const timeMin = `${dateStr}T00:00:00${BUENOS_AIRES_OFFSET}`;
  const timeMax = `${dateStr}T23:59:59${BUENOS_AIRES_OFFSET}`;

  try {
    const accessToken = await getAccessToken(config, refreshToken);
    if (!accessToken) {
      return res.status(401).json({ error: 'Se venció el acceso a tu Google Calendar. Reconectalo en Ajustes.' });
    }

    const eventsUrl = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
    eventsUrl.searchParams.set('timeMin', timeMin);
    eventsUrl.searchParams.set('timeMax', timeMax);
    eventsUrl.searchParams.set('singleEvents', 'true');
    eventsUrl.searchParams.set('orderBy', 'startTime');
    eventsUrl.searchParams.set('maxResults', '50');

    const eventsRes = await fetch(eventsUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const eventsData = await eventsRes.json();
    if (!eventsRes.ok) {
      return res.status(502).json({ error: eventsData.error?.message || 'No se pudo leer el calendario.' });
    }

    const events = (eventsData.items || []).map((item) => {
      const title = item.summary || '(sin título)';
      return {
        id: item.id,
        summary: title,
        start: item.start?.dateTime
          ? new Date(item.start.dateTime).toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: BUENOS_AIRES_TZ,
            })
          : null,
        allDay: !item.start?.dateTime,
        esNegocio: esNegocio(normalize(title)),
      };
    });

    res.json({ date: dateStr, events });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error inesperado al leer el calendario.' });
  }
});

router.post('/event', async (req, res) => {
  const config = getConfig();
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!isConfigured(config) || !refreshToken) {
    return res.status(412).json({ error: 'Todavía no conectaste tu Google Calendar. Hacelo desde Ajustes.' });
  }

  const { summary, date, time, reminderMinutes } = req.body || {};
  if (!summary || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Falta el título o la fecha del recordatorio.' });
  }
  const startTime = /^\d{2}:\d{2}$/.test(time) ? time : '09:00';
  const [h, m] = startTime.split(':').map(Number);
  const endTime = `${String(h).padStart(2, '0')}:${String((m + 30) % 60).padStart(2, '0')}`;

  try {
    const accessToken = await getAccessToken(config, refreshToken);
    if (!accessToken) {
      return res.status(401).json({ error: 'Se venció el acceso a tu Google Calendar. Reconectalo en Ajustes.' });
    }

    const eventRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary,
        start: { dateTime: `${date}T${startTime}:00${BUENOS_AIRES_OFFSET}`, timeZone: BUENOS_AIRES_TZ },
        end: { dateTime: `${date}T${endTime}:00${BUENOS_AIRES_OFFSET}`, timeZone: BUENOS_AIRES_TZ },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: Number(reminderMinutes) || 60 },
            { method: 'popup', minutes: Number(reminderMinutes) || 60 },
          ],
        },
      }),
    });
    const eventData = await eventRes.json();
    if (!eventRes.ok) {
      return res.status(502).json({ error: eventData.error?.message || 'No se pudo crear el recordatorio en el calendario.' });
    }

    res.json({ eventId: eventData.id });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error inesperado al crear el recordatorio.' });
  }
});

router.delete('/event/:id', async (req, res) => {
  const config = getConfig();
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!isConfigured(config) || !refreshToken) {
    return res.status(412).json({ error: 'Todavía no conectaste tu Google Calendar.' });
  }

  try {
    const accessToken = await getAccessToken(config, refreshToken);
    if (!accessToken) {
      return res.status(401).json({ error: 'Se venció el acceso a tu Google Calendar. Reconectalo en Ajustes.' });
    }

    const eventRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(req.params.id)}`,
      { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!eventRes.ok && eventRes.status !== 404 && eventRes.status !== 410) {
      const errData = await eventRes.json().catch(() => ({}));
      return res.status(502).json({ error: errData.error?.message || 'No se pudo borrar el recordatorio del calendario.' });
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error inesperado al borrar el recordatorio.' });
  }
});

export default router;
