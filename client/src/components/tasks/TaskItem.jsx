import { Check, Bell } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

const PRIORITY_LABEL = { alta: 'Alta', media: 'Media', baja: 'Baja' };

export function TaskItem({ task, onToggle, onClick }) {
  const isNegocio = (task.category || 'negocio') === 'negocio';

  const metaParts = [
    task.dueDate && formatDate(task.dueDate),
    task.dueTime,
    task.priority && task.priority !== 'media' && PRIORITY_LABEL[task.priority],
    task.contactName,
  ].filter(Boolean);

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label={task.done ? 'Marcar como pendiente' : 'Marcar como hecha'}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
          task.done ? 'border-emerald-400 bg-emerald-400/20' : 'border-white/25'
        }`}
      >
        {task.done && <Check size={14} className="text-emerald-400" />}
      </button>

      <button onClick={onClick} className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isNegocio ? 'bg-emerald-400' : 'bg-[#DC1C2E]'}`} />
          <p className={`truncate font-medium ${task.done ? 'text-white/40 line-through' : 'text-white'}`}>
            {task.title}
          </p>
          {task.reminderEmail && <Bell size={11} className="shrink-0 text-white/30" />}
        </div>
        {metaParts.length > 0 && <p className="mt-0.5 truncate text-xs text-white/40">{metaParts.join(' · ')}</p>}
        {task.description && <p className="mt-0.5 truncate text-xs text-white/30">{task.description}</p>}
      </button>
    </div>
  );
}
