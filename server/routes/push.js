import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import webpush from 'web-push';
import frases from '../data/frases.json' with { type: 'json' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SUBSCRIPTION_FILE = path.join(__dirname, '..', 'data', 'push-subscription.json');

const router = Router();

function isConfigured() {
  return Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}

function setupVapid() {
  if (!isConfigured()) return false;
  webpush.setVapidDetails('mailto:fcastro@remax.com.ar', process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  return true;
}

function readSubscription() {
  try {
    return JSON.parse(fs.readFileSync(SUBSCRIPTION_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function dayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}

export async function sendDailyPush() {
  if (!setupVapid()) return { ok: false, reason: 'Faltan las claves VAPID en el servidor.' };
  const subscription = readSubscription();
  if (!subscription) return { ok: false, reason: 'Todavía no activaste la notificación diaria.' };

  const frase = frases[dayOfYear() % frases.length];
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'Buen día, Fernando 🔥',
        body: `"${frase.texto}" — ${frase.autor}`,
        url: '/',
      })
    );
    return { ok: true };
  } catch (err) {
    // 404/410 = la suscripción venció o se revocó (ej. reinstaló la PWA) — se borra para no reintentar en vano.
    if (err.statusCode === 404 || err.statusCode === 410) {
      fs.rmSync(SUBSCRIPTION_FILE, { force: true });
    }
    return { ok: false, reason: err.message };
  }
}

router.get('/public-key', (_req, res) => {
  if (!isConfigured()) return res.status(412).json({ error: 'Faltan las claves VAPID en el servidor.' });
  res.json({ key: process.env.VAPID_PUBLIC_KEY });
});

router.get('/status', (_req, res) => {
  res.json({ configured: isConfigured(), subscribed: Boolean(readSubscription()) });
});

router.post('/subscribe', (req, res) => {
  fs.mkdirSync(path.dirname(SUBSCRIPTION_FILE), { recursive: true });
  fs.writeFileSync(SUBSCRIPTION_FILE, JSON.stringify(req.body));
  res.json({ ok: true });
});

router.post('/unsubscribe', (_req, res) => {
  fs.rmSync(SUBSCRIPTION_FILE, { force: true });
  res.json({ ok: true });
});

// Disparador manual/externo: pensado para un cron externo que lo llame a las 7 AM,
// ya que en el plan free de Render el servicio duerme y un cron interno no correría dormido.
router.post('/trigger', async (_req, res) => {
  const result = await sendDailyPush();
  res.json(result);
});

export default router;
