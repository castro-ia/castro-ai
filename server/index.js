import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

import chatRouter from './routes/chat.js';
import settingsRouter from './routes/settings.js';

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
// 20mb para que entren los adjuntos de chat (imágenes/PDF) codificados en base64.
app.use(express.json({ limit: '20mb' }));

app.use('/api/chat', chatRouter);
app.use('/api/settings', settingsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

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
