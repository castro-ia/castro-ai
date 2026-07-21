import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const router = Router();

const MAX_MESSAGES = 60;
const MAX_MESSAGE_LENGTH = 8000;
const MAX_SYSTEM_PROMPT_LENGTH = 6000;
const MAX_ATTACHMENTS_PER_MESSAGE = 3;
const MAX_ATTACHMENT_BASE64_LENGTH = 12 * 1024 * 1024; // ~8-9MB de archivo real, en base64
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf'];

function validateContentBlock(block) {
  if (!block || typeof block !== 'object') return 'Bloque de contenido inválido.';

  if (block.type === 'text') {
    if (typeof block.text !== 'string') return 'Bloque de texto inválido.';
    if (block.text.length > MAX_MESSAGE_LENGTH) {
      return `El texto supera el máximo de ${MAX_MESSAGE_LENGTH} caracteres.`;
    }
    return null;
  }

  if (block.type === 'image' || block.type === 'document') {
    const allowed = block.type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_DOCUMENT_TYPES;
    const source = block.source;
    if (!source || source.type !== 'base64') return 'Los adjuntos deben venir en base64.';
    if (!allowed.includes(source.media_type)) return `Tipo de archivo no permitido: ${source.media_type}.`;
    if (typeof source.data !== 'string' || source.data.length === 0) return 'Adjunto sin datos.';
    if (source.data.length > MAX_ATTACHMENT_BASE64_LENGTH) return 'El archivo adjunto es demasiado grande (máx. ~8MB).';
    return null;
  }

  return `Tipo de bloque no soportado: ${block.type}.`;
}

function validateMessages(messages) {
  if (!Array.isArray(messages) || messages.length === 0) return 'Falta el array "messages".';
  if (messages.length > MAX_MESSAGES) {
    return `Demasiados mensajes en la conversación (máximo ${MAX_MESSAGES}).`;
  }

  for (const m of messages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant')) {
      return 'Cada mensaje necesita role "user" o "assistant".';
    }

    if (typeof m.content === 'string') {
      if (m.content.length === 0) return 'Cada mensaje necesita contenido no vacío.';
      if (m.content.length > MAX_MESSAGE_LENGTH) {
        return `Un mensaje supera el máximo de ${MAX_MESSAGE_LENGTH} caracteres.`;
      }
      continue;
    }

    if (Array.isArray(m.content)) {
      if (m.content.length === 0) return 'Un mensaje no puede tener contenido vacío.';
      const attachmentCount = m.content.filter((b) => b?.type === 'image' || b?.type === 'document').length;
      if (attachmentCount > MAX_ATTACHMENTS_PER_MESSAGE) {
        return `Máximo ${MAX_ATTACHMENTS_PER_MESSAGE} adjuntos por mensaje.`;
      }
      for (const block of m.content) {
        const err = validateContentBlock(block);
        if (err) return err;
      }
      continue;
    }

    return 'Cada mensaje necesita "content" de texto o una lista de bloques.';
  }

  return null;
}

function validateSpecialists(specialists) {
  if (!Array.isArray(specialists) || specialists.length === 0) return 'Falta el array "specialists".';
  for (const s of specialists) {
    if (!s || typeof s.id !== 'string' || !s.id) return 'Cada especialista necesita "id".';
    if (typeof s.systemPrompt !== 'string' || !s.systemPrompt || s.systemPrompt.length > MAX_SYSTEM_PROMPT_LENGTH) {
      return `El system prompt de "${s.id}" es inválido o demasiado largo.`;
    }
    if (typeof s.delegateHint !== 'string' || !s.delegateHint) {
      return `Falta "delegateHint" para "${s.id}".`;
    }
  }
  return null;
}

function friendlyError(err) {
  // El body de error de Anthropic viene anidado: { type, error: { type, message } }.
  const anthropicMessage = err?.error?.error?.message || err?.error?.message;

  if (err?.status === 401) return 'La API key configurada no es válida.';
  if (anthropicMessage?.toLowerCase().includes('credit balance is too low')) {
    return 'Tu cuenta de Anthropic se quedó sin crédito. Cargá saldo en console.anthropic.com → Plans & Billing.';
  }
  if (err?.status === 429) return 'Se alcanzó el límite de uso de la API de Anthropic. Probá de nuevo en unos minutos.';
  if (err?.status >= 500) return 'La API de Anthropic no está disponible en este momento. Probá de nuevo en unos minutos.';
  return anthropicMessage || err?.message || 'Error inesperado al llamar a la API de Anthropic.';
}

function buildTools(specialists) {
  return specialists.map((s) => ({
    name: `consult_${s.id}`,
    description: s.delegateHint,
    input_schema: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: 'La consulta puntual para este especialista, con todo el contexto necesario para que pueda responder sin pedir más datos.',
        },
      },
      required: ['question'],
    },
  }));
}

router.post('/', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(412).json({
      error: 'No hay una API key de Anthropic configurada en el servidor. Cargala en Ajustes o en server/.env.',
    });
  }

  const { messages, ceoSystemPrompt, specialists } = req.body || {};

  const messagesError = validateMessages(messages);
  if (messagesError) return res.status(400).json({ error: messagesError });

  if (typeof ceoSystemPrompt !== 'string' || !ceoSystemPrompt || ceoSystemPrompt.length > MAX_SYSTEM_PROMPT_LENGTH) {
    return res.status(400).json({ error: 'Falta o es inválido el system prompt del CEO.' });
  }

  const specialistsError = validateSpecialists(specialists);
  if (specialistsError) return res.status(400).json({ error: specialistsError });

  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';
  const anthropic = new Anthropic({ apiKey });
  const tools = buildTools(specialists);
  const specialistsById = Object.fromEntries(specialists.map((s) => [s.id, s]));
  const apiMessages = messages.map((m) => ({ role: m.role, content: m.content }));

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const send = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    // 1) El CEO decide: responde directo o delega en un especialista.
    const decision = await anthropic.messages.create({
      model,
      max_tokens: 2048,
      system: ceoSystemPrompt,
      tools,
      messages: apiMessages,
    });

    const toolUseBlocks = decision.content.filter((b) => b.type === 'tool_use');

    if (toolUseBlocks.length === 0) {
      // Respondió directo — se manda tal cual, sin una segunda llamada que duplicaría la generación.
      const text = decision.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('');
      send('delta', { text });
      send('done', {});
      return res.end();
    }

    // 2) Consultar a cada especialista que el CEO haya pedido.
    const toolResults = [];
    for (const block of toolUseBlocks) {
      const specialistId = block.name.replace(/^consult_/, '');
      const specialist = specialistsById[specialistId];
      const question = typeof block.input?.question === 'string' ? block.input.question : '';

      if (!specialist) {
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: 'No se encontró a ese especialista en el equipo.',
          is_error: true,
        });
        continue;
      }

      send('delegating', { agent: specialistId, name: specialist.name });

      try {
        const specialistResponse = await anthropic.messages.create({
          model,
          max_tokens: 1536,
          system: specialist.systemPrompt,
          messages: [{ role: 'user', content: question || 'Sin detalle adicional.' }],
        });
        const specialistText = specialistResponse.content
          .filter((b) => b.type === 'text')
          .map((b) => b.text)
          .join('');
        toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: specialistText });
      } catch (err) {
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: friendlyError(err),
          is_error: true,
        });
      }
    }

    // 3) El CEO sintetiza la respuesta final integrando lo que le contestaron, esta vez en streaming.
    const followUpMessages = [
      ...apiMessages,
      { role: 'assistant', content: decision.content },
      { role: 'user', content: toolResults },
    ];

    const stream = anthropic.messages.stream({
      model,
      max_tokens: 2048,
      system: ceoSystemPrompt,
      messages: followUpMessages,
    });

    stream.on('text', (delta) => send('delta', { text: delta }));
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
