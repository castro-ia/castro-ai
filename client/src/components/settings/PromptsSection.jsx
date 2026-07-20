import { useState } from 'react';
import { MessageSquareText, ChevronDown } from 'lucide-react';
import { agents } from '../../config/agents';
import { usePromptOverrides } from '../../hooks/usePromptOverrides';
import { AgentAvatar } from '../agents/AgentAvatar';
import { Textarea } from '../ui/Input';
import { Button } from '../ui/Button';

function AgentPromptEditor({ agent, override, onSave, onReset }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(override ?? agent.systemPrompt);
  const [savedFlash, setSavedFlash] = useState(false);

  const isCustom = Boolean(override);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5">
      <button
        onClick={() => {
          setDraft(override ?? agent.systemPrompt);
          setOpen((o) => !o);
        }}
        className="flex w-full items-center gap-3 p-3.5"
      >
        <AgentAvatar agent={agent} size={36} />
        <div className="min-w-0 flex-1 text-left">
          <p className="font-medium text-white">{agent.name}</p>
          {isCustom && <p className="text-xs text-white/40">System prompt personalizado</p>}
        </div>
        <ChevronDown size={18} className={`text-white/40 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="flex flex-col gap-2.5 border-t border-white/10 p-3.5">
          <Textarea rows={10} value={draft} onChange={(e) => setDraft(e.target.value)} className="text-sm" />
          <div className="flex gap-2">
            {isCustom && (
              <Button
                variant="secondary"
                onClick={() => {
                  onReset(agent.id);
                  setDraft(agent.systemPrompt);
                }}
              >
                Restablecer
              </Button>
            )}
            <Button
              className="flex-1"
              onClick={() => {
                onSave(agent.id, draft);
                setSavedFlash(true);
                setTimeout(() => setSavedFlash(false), 1500);
              }}
            >
              {savedFlash ? 'Guardado ✓' : 'Guardar'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function PromptsSection() {
  const { overrides, setOverride, resetOverride } = usePromptOverrides();

  return (
    <section>
      <div className="mb-3 flex items-center gap-2 px-1">
        <MessageSquareText size={17} className="text-white/50" />
        <h2 className="font-semibold text-white">System prompts de los agentes</h2>
      </div>
      <div className="flex flex-col gap-2.5">
        {agents.map((agent) => (
          <AgentPromptEditor
            key={agent.id}
            agent={agent}
            override={overrides[agent.id]}
            onSave={setOverride}
            onReset={resetOverride}
          />
        ))}
      </div>
    </section>
  );
}
