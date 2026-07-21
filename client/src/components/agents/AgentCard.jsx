import { AgentAvatar } from './AgentAvatar';

export function AgentCard({ agent }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <AgentAvatar agent={agent} size={52} />
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white">{agent.name}</p>
        <p className="truncate text-sm text-white/60">{agent.tagline}</p>
      </div>
    </div>
  );
}
