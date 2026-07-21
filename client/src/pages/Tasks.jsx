import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, CheckSquare } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { EmptyState } from '../components/ui/EmptyState';
import { TaskItem } from '../components/tasks/TaskItem';
import { TaskForm } from '../components/tasks/TaskForm';
import { useTasks } from '../hooks/useTasks';
import { getCalendarStatus } from '../lib/api';

const FILTERS = [
  { value: 'todas', label: 'Todas' },
  { value: 'negocio', label: '🟢 Negocio' },
  { value: 'personal', label: '🔴 Personal' },
];

export default function Tasks() {
  const { openDrawer } = useOutletContext();
  const { tasks, saveTask, removeTask, toggleDone } = useTasks();
  const [selected, setSelected] = useState(undefined);
  const [filter, setFilter] = useState('todas');
  const [calendarConnected, setCalendarConnected] = useState(false);

  useEffect(() => {
    getCalendarStatus()
      .then((status) => setCalendarConnected(status.connected))
      .catch(() => setCalendarConnected(false));
  }, []);

  const filtered = useMemo(
    () => (filter === 'todas' ? tasks : tasks.filter((t) => (t.category || 'negocio') === filter)),
    [tasks, filter]
  );
  const pending = filtered.filter((t) => !t.done);
  const done = filtered.filter((t) => t.done);

  const handleSave = async (task) => {
    await saveTask(task);
    setSelected(undefined);
  };

  const handleDelete = async (id) => {
    await removeTask(id);
    setSelected(undefined);
  };

  return (
    <div>
      <Header
        title="Tareas"
        subtitle={`${pending.length} pendiente${pending.length === 1 ? '' : 's'}`}
        onMenuOpen={openDrawer}
        rightSlot={
          <button
            onClick={() => setSelected(null)}
            aria-label="Nueva tarea"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/20 active:bg-black/30"
          >
            <Plus size={20} color="white" />
          </button>
        }
      />

      <div className="flex gap-2 px-4 pt-4">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              filter === f.value ? 'bg-white/15 text-white' : 'bg-white/5 text-white/50 active:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2.5 px-4 py-4">
        {tasks.length === 0 ? (
          <EmptyState icon={CheckSquare} title="Todavía no cargaste tareas" subtitle='Tocá el "+" para crear la primera.' />
        ) : filtered.length === 0 ? (
          <EmptyState icon={CheckSquare} title="Nada por acá" subtitle="Probá con otro filtro." />
        ) : (
          <>
            {pending.map((t) => (
              <TaskItem key={t.id} task={t} onToggle={() => toggleDone(t)} onClick={() => setSelected(t)} />
            ))}
            {done.length > 0 && (
              <>
                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-white/30">Hechas</p>
                {done.map((t) => (
                  <TaskItem key={t.id} task={t} onToggle={() => toggleDone(t)} onClick={() => setSelected(t)} />
                ))}
              </>
            )}
          </>
        )}
      </div>

      <TaskForm
        open={selected !== undefined}
        task={selected}
        calendarConnected={calendarConnected}
        onClose={() => setSelected(undefined)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
