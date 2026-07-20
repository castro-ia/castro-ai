import { Crown, Scale, Megaphone, PenLine, ClipboardCheck, Workflow } from 'lucide-react';

const ICONS = {
  Crown,
  Scale,
  Megaphone,
  PenLine,
  ClipboardCheck,
  Workflow,
};

export function AgentAvatar({ agent, size = 48 }) {
  const Icon = ICONS[agent.icon];

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-2xl shadow-block"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${agent.color}, ${agent.color}99)`,
      }}
    >
      {Icon ? (
        <Icon size={size * 0.52} strokeWidth={2} color="white" />
      ) : (
        <span className="font-display text-white" style={{ fontSize: size * 0.4 }}>
          {agent.name[0]}
        </span>
      )}
    </div>
  );
}
