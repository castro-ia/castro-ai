import { CopyButton } from './CopyButton';

export function MessageBubble({ message, agentColor }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
          isUser ? 'rounded-br-sm bg-remax-gradient text-white' : 'rounded-bl-sm bg-white/10 text-white/95'
        }`}
        style={!isUser ? { borderLeft: `3px solid ${agentColor}` } : undefined}
      >
        {message.content}
      </div>
      {!isUser && message.content && <CopyButton text={message.content} />}
    </div>
  );
}
