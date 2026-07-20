import { useState, useRef, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Trash2, Send } from 'lucide-react';
import { getAgentById } from '../config/agents';
import { useChat } from '../hooks/useChat';
import { Header } from '../components/layout/Header';
import { AgentAvatar } from '../components/agents/AgentAvatar';
import { MessageBubble } from '../components/chat/MessageBubble';
import { TypingIndicator } from '../components/chat/TypingIndicator';

export default function AgentChat() {
  const { agentId } = useParams();
  const agent = getAgentById(agentId);
  const { messages, isStreaming, error, sendMessage, clearChat } = useChat(agentId);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  if (!agent) return <Navigate to="/" replace />;

  const lastMessage = messages[messages.length - 1];
  const showTyping = isStreaming && lastMessage?.role === 'assistant' && lastMessage.content === '';

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex h-screen flex-col bg-night-900">
      <Header
        title={agent.name}
        subtitle={agent.tagline}
        showBack
        rightSlot={
          <button
            onClick={() => {
              if (messages.length > 0 && confirm('¿Borrar toda la conversación con ' + agent.name + '?')) {
                clearChat();
              }
            }}
            aria-label="Borrar conversación"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/20 active:bg-black/30"
          >
            <Trash2 size={18} color="white" />
          </button>
        }
      />

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center gap-3 pt-10 text-center">
            <AgentAvatar agent={agent} size={64} />
            <p className="max-w-[80%] text-sm text-white/50">{agent.tagline}</p>
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} agentColor={agent.color} />
        ))}
        {showTyping && <TypingIndicator />}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>

      <div className="safe-bottom border-t border-white/10 bg-night-900 px-3 py-3">
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Escribile a ${agent.name}...`}
            className="max-h-32 flex-1 resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            aria-label="Enviar"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-remax-gradient disabled:opacity-30"
          >
            <Send size={18} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
}
