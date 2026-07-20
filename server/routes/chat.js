import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

const MAX_MESSAGES = 60;
const MAX_MESSAGE_LENGTH = 8000;
const MAX_SYSTEM_PROMPT_LENGTH = 6000;

function validateBody(body) {
  const { messages, systemPrompt } = body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return 'Falta el array "messages".';
  }
  if (messages.length > MAX_MESSAGES) {
    return `Demasiados mensajes en la conversación (máximo ${MAX_MESSAGES}).`;
  }
  for (const m of messages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) {
      return 'Cada mensaje necesita role "user" o "assistant".';
    }
    if (typeof m.content !== 'string' || m.content.length === 0) {
      return 'Cada mensaje necesita "content" de texto no vacío.';
    }
    if (m.content.length > MAX_MESSAGE_LENGTH) {
      return `Un mensaje supera el máximo de ${MAX_MESSAGE_LENGTH} caracteres.`;
    }
  }
  if (systemPrompt !== undefined) {
    if (typeof systemPrompt !== 'string') {
      return '"systemPrompt" debe ser texto.';
    }
    if (systemPrompt.length > MAX_SYSTEM_PROMPT_LENGTH) {
      return `El system prompt supera el máximo de ${MAX_SYSTEM_PROMPT_LENGTH} caracteres.`;
    }
  }
  return null;
}

function friendlyError(err) {
  if (err?.status === 401) return 'La API key configurada no es válida.';
  if (err?.status === 429) return 'Se alcanzó el límite de uso de la API de Anthropic. Probá de nuevo en unos minutos.';
  if (err?.status >= 500) return 'La API de Anthropic no está disponible en este momento. Probá de nuevo en unos minutos.';
  return err?.error?.message || err?.message || 'Error inesperado al llamar a la API de Anthropic.';
}

router.post('/', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(412).json({
      error: 'No hay una API key de Anthropic configurada en el servidor. Cargala en Ajustes o en server/.env.',
    });
  }

  const validationError = validateBody(req.body);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { messages, systemPrompt } = req.body;
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';
  const anthropic = new Anthropic({ apiKey });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const send = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const stream = anthropic.messages.stream({
      model,
      max_tokens: 2048,
      system: systemPrompt || undefined,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    stream.on('text', (delta) => {
      send('delta', { text: delta });
    });

    stream.on('error', (err) => {
      send('error', { message: friendlyError(err) });
      res.end();
    });

    await stream.finalMessage();
    send('done', {});
    res.end();
  } catch (err) {
    send('error', { message: friendlyError(err) });
    res.end();
  }

  req.on('close', () => {
    res.end();
  });
});

export default router;
