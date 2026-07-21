import { Router } from 'express';
import { upsertEnvVar } from '../lib/envFile.js';

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

  upsertEnvVar('ANTHROPIC_API_KEY', apiKey.trim());

  res.json({ ok: true });
});

export default router;
