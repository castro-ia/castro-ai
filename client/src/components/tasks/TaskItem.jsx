import { Check } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function TaskItem({ task, contact, onToggle, onClick }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3.5">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label={task.done ? 'Marcar como pendiente' : 'Marcar como hecha'}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
          task.done ? 'border-emerald-400 bg-emerald-400/20' : 'border-white/25'
        }`}
      >
        {task.done && <Check size={14} className="text-emerald-400" />}
      </button>

      <button onClick={onClick} className="min-w-0 flex-1 text-left">
        <p className={`truncate font-medium ${task.done ? 'text-white/40 line-through' : 'text-white'}`}>
          {task.title}
        </p>
        <p className="truncate text-xs text-white/40">
          {task.dueDate && formatDate(task.dueDate)}
          {task.dueDate && contact ? ' · ' : ''}
          {contact?.name}
        </p>
      </button>
    </div>
  );
}
