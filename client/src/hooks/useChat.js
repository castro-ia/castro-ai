import { useState, useEffect, useCallback, useRef } from 'react';
import { getConversation, saveConversation, clearConversation, getAllPromptOverrides } from '../lib/db';
import { streamChat } from '../lib/api';
import { getCeo, getSpecialists } from '../config/agents';

const CONVERSATION_KEY = 'equipo';

function buildApiContent(message) {
  if (!message.attachments || message.attachments.length === 0) {
    return message.content;
  }
  const blocks = message.attachments.map((a) => ({
    type: a.kind,
    source: { type: 'base64', media_type: a.mediaType, data: a.base64 },
  }));
  if (message.content) {
    blocks.push({ type: 'text', text: message.content });
  }
  return blocks;
}

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [delegatingAgent, setDelegatingAgent] = useState(null);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    getConversation(CONVERSATION_KEY).then((msgs) => {
      setMessages(msgs);
      setLoaded(true);
    });
    return () => {
      abortRef.current?.();
      abortRef.current = null;
    };
  }, []);

  const sendMessage = useCallback(
    (text, attachments = []) => {
      const trimmed = text.trim();
      if ((!trimmed && attachments.length === 0) || isStreaming) return;
      setError(null);
      setDelegatingAgent(null);

      const userMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: trimmed,
        attachments: attachments.length ? attachments : undefined,
        createdAt: Date.now(),
      };
      const assistantId = crypto.randomUUID();
      const assistantMessage = { id: assistantId, role: 'assistant', content: '', createdAt: Date.now() };

      const historyForApi = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: buildApiContent(m),
      }));

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      getAllPromptOverrides().then((overrides) => {
        const ceo = getCeo();
        const ceoSystemPrompt = overrides[ceo.id] || ceo.systemPrompt;
        const specialists = getSpecialists().map((s) => ({
          id: s.id,
          name: s.name,
          systemPrompt: overrides[s.id] || s.systemPrompt,
          delegateHint: s.delegateHint,
        }));

        abortRef.current = streamChat(
          { messages: historyForApi, ceoSystemPrompt, specialists },
          {
            onDelegating: (agentId, name) => {
              setDelegatingAgent({ id: agentId, name });
            },
            onDelta: (delta) => {
              setDelegatingAgent(null);
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + delta } : m))
              );
            },
            onDone: () => {
              setIsStreaming(false);
              setDelegatingAgent(null);
              setMessages((prev) => {
                saveConversation(CONVERSATION_KEY, prev);
                return prev;
              });
            },
            onError: (message) => {
              setIsStreaming(false);
              setDelegatingAgent(null);
              setError(message);
              setMessages((prev) => {
                const next = prev.filter((m) => !(m.id === assistantId && m.content === ''));
                saveConversation(CONVERSATION_KEY, next);
                return next;
              });
            },
          }
        );
      });
    },
    [messages, isStreaming]
  );

  const clearChat = useCallback(async () => {
    abortRef.current?.();
    abortRef.current = null;
    setIsStreaming(false);
    setDelegatingAgent(null);
    await clearConversation(CONVERSATION_KEY);
    setMessages([]);
  }, []);

  return { messages, isStreaming, delegatingAgent, error, loaded, sendMessage, clearChat };
}
