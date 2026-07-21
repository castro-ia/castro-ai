import { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Trash2, Send } from 'lucide-react';
import { getCeo } from '../config/agents';
import { useChat } from '../hooks/useChat';
import { Header } from '../components/layout/Header';
import { AgentAvatar } from '../components/agents/AgentAvatar';
import { MessageBubble } from '../components/chat/MessageBubble';
import { TypingIndicator } from '../components/chat/TypingIndicator';
import { AttachmentButton } from '../components/chat/AttachmentButton';
import { AttachmentChip } from '../components/chat/AttachmentChip';

const ceo = getCeo();

export default function Equipo() {
  const { openDrawer } = useOutletContext();
  const { messages, isStreaming, delegatingAgent, error, sendMessage, clearChat } = useChat();
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [attachmentError, setAttachmentError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const lastMessage = messages[messages.length - 1];
  const showTyping = isStreaming && lastMessage?.role === 'assistant' && lastMessage.content === '';

  const handleAddAttachment = (attachment) => {
    setAttachmentError(null);
    setAttachments((prev) => (prev.length >= 3 ? prev : [...prev, attachment]));
  };

  const handleRemoveAttachment = (id) => {
    setAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleSend = () => {
    if (!input.trim() && attachments.length === 0) return;
    sendMessage(input, attachments);
    setInput('');
    setAttachments([]);
    setAttachmentError(null);
  };

  return (
    <div className="flex h-full flex-col bg-night-900">
      <Header
        title="Equipo"
        subtitle={ceo.tagline}
        onMenuOpen={openDrawer}
        rightSlot={
          <button
            onClick={() => {
              if (messages.length > 0 && confirm('¿Borrar toda la conversación con el equipo?')) {
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
            <AgentAvatar agent={ceo} size={64} />
            <p className="max-w-[85%] text-sm text-white/50">
              Hablá con tu equipo. El CEO recibe tu pedido y consulta a Marta, Marketing, Copywriter, Precalificador
              o Automatizador cuando corresponda.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} agentColor={ceo.color} />
        ))}
        {showTyping && (
          <TypingIndicator label={delegatingAgent ? `Consultando a ${delegatingAgent.name}...` : undefined} />
        )}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>

      <div className="safe-bottom border-t border-white/10 bg-night-900 px-3 py-3">
        {attachmentError && <p className="mb-2 px-1 text-xs text-red-300">{attachmentError}</p>}
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {attachments.map((a) => (
              <AttachmentChip key={a.id} attachment={a} onRemove={handleRemoveAttachment} />
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <AttachmentButton onAdd={handleAddAttachment} onError={setAttachmentError} disabled={attachments.length >= 3} />
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
            placeholder="Escribile a tu equipo..."
            className="max-h-32 flex-1 resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={(!input.trim() && attachments.length === 0) || isStreaming}
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
