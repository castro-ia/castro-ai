import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import cron from 'node-cron';

import calendarRouter from './routes/calendar.js';
import pushRouter, { sendDailyPush } from './routes/push.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// override:true para que server/.env mande en desarrollo local, incluso si el shell
// ya trae una variable PORT/ANTHROPIC_* de otro proceso. En producción no se commitea
// ningún .env, así que ahí siempre gana el entorno real del hosting (Render/Railway).
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const PORT = process.env.PORT || 8787;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();

// En dev, el frontend puede accederse por localhost o por la IP de la red local (para probar
// desde el celular), así que se refleja cualquier origen. En producción el server sirve el
// build del client (mismo origen, no pasa por CORS) y de todas formas queda restringido a CLIENT_ORIGIN.
app.use(cors({ origin: process.env.NODE_ENV === 'production' ? CLIENT_ORIGIN : true }));
app.use(express.json());

app.use('/api/calendar', calendarRouter);
app.use('/api/push', pushRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Best-effort: si el proceso está despierto a las 7 AM, manda la push solo.
// En el plan free de Render el servicio se duerme sin tráfico, así que esto no
// alcanza por sí solo — por eso también existe POST /api/push/trigger para que
// un cron externo lo despierte y dispare a horario.
cron.schedule('0 7 * * *', sendDailyPush, { timezone: 'America/Argentina/Buenos_Aires' });

// En producción, este mismo servidor sirve el build estático del client (npm run build --prefix client).
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (process.env.NODE_ENV === 'production' && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Castro AI backend escuchando en http://localhost:${PORT}`);
});
