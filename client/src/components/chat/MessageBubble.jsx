import { CopyButton } from './CopyButton';
import { AttachmentChip } from './AttachmentChip';
import { Markdown } from './Markdown';

export function MessageBubble({ message, agentColor }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      {message.attachments && message.attachments.length > 0 && (
        <div className={`mb-1.5 flex flex-wrap gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          {message.attachments.map((a) => (
            <AttachmentChip key={a.id} attachment={a} />
          ))}
        </div>
      )}

      {message.content && (
        <div
          className={`max-w-[85%] rounded-2xl px-4 py-3 ${
            isUser ? 'rounded-br-sm bg-remax-gradient text-white' : 'rounded-bl-sm bg-white/10 text-white/95'
          }`}
          style={!isUser ? { borderLeft: `3px solid ${agentColor}` } : undefined}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{message.content}</p>
          ) : (
            <Markdown>{message.content}</Markdown>
          )}
        </div>
      )}

      {!isUser && message.content && <CopyButton text={message.content} />}
    </div>
  );
}
