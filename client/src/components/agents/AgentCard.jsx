import { Link } from 'react-router-dom';
import { AgentAvatar } from './AgentAvatar';

export function AgentCard({ agent }) {
  return (
    <Link
      to={`/chat/${agent.id}`}
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition active:scale-[0.98] active:bg-white/10"
    >
      <AgentAvatar agent={agent} size={52} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white">{agent.name}</p>
        <p className="truncate text-sm text-white/60">{agent.tagline}</p>
      </div>
    </Link>
  );
}
