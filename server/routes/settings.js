import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.join(__dirname, '..', '.env');

const router = Router();

router.get('/status', (_req, res) => {
  res.json({
    hasKey: Boolean(process.env.ANTHROPIC_API_KEY),
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5',
    canWriteKey: process.env.NODE_ENV !== 'production',
  });
});

router.post('/api-key', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error:
        'En producción la API key se configura desde las variables de entorno de tu hosting (Render/Railway), no desde acá.',
    });
  }

  const { apiKey } = req.body || {};
  if (typeof apiKey !== 'string' || !apiKey.trim().startsWith('sk-ant-')) {
    return res.status(400).json({ error: 'La API key no tiene el formato esperado (empieza con "sk-ant-").' });
  }

  const trimmedKey = apiKey.trim();
  let lines = [];
  if (fs.existsSync(ENV_PATH)) {
    lines = fs.readFileSync(ENV_PATH, 'utf-8').split('\n').filter(Boolean);
  }

  const withoutKey = lines.filter((line) => !line.startsWith('ANTHROPIC_API_KEY='));
  withoutKey.push(`ANTHROPIC_API_KEY=${trimmedKey}`);
  fs.writeFileSync(ENV_PATH, withoutKey.join('\n') + '\n', 'utf-8');

  process.env.ANTHROPIC_API_KEY = trimmedKey;

  res.json({ ok: true });
});

export default router;
