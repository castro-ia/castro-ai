import { useState, useEffect, useCallback, useRef } from 'react';
import { getConversation, saveConversation, clearConversation, getPromptOverride } from '../lib/db';
import { streamChat } from '../lib/api';
import { getAgentById } from '../config/agents';

export function useChat(agentId) {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    setMessages([]);
    getConversation(agentId).then((msgs) => {
      if (!cancelled) {
        setMessages(msgs);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
      abortRef.current?.();
      abortRef.current = null;
    };
  }, [agentId]);

  const sendMessage = useCallback(
    (text) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;
      setError(null);

      const agent = getAgentById(agentId);
      const userMessage = { id: crypto.randomUUID(), role: 'user', content: trimmed, createdAt: Date.now() };
      const assistantId = crypto.randomUUID();
      const assistantMessage = { id: assistantId, role: 'assistant', content: '', createdAt: Date.now() };

      const historyForApi = [...messages, userMessage].map(({ role, content }) => ({ role, content }));

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      getPromptOverride(agentId).then((override) => {
        const systemPrompt = override || agent?.systemPrompt || '';

        abortRef.current = streamChat(
          { messages: historyForApi, systemPrompt },
          {
            onDelta: (delta) => {
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + delta } : m))
              );
            },
            onDone: () => {
              setIsStreaming(false);
              setMessages((prev) => {
                saveConversation(agentId, prev);
                return prev;
              });
            },
            onError: (message) => {
              setIsStreaming(false);
              setError(message);
              setMessages((prev) => {
                const next = prev.filter((m) => !(m.id === assistantId && m.content === ''));
                saveConversation(agentId, next);
                return next;
              });
            },
          }
        );
      });
    },
    [agentId, messages, isStreaming]
  );

  const clearChat = useCallback(async () => {
    abortRef.current?.();
    abortRef.current = null;
    setIsStreaming(false);
    await clearConversation(agentId);
    setMessages([]);
  }, [agentId]);

  return { messages, isStreaming, error, loaded, sendMessage, clearChat };
}
