import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, CheckSquare } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { EmptyState } from '../components/ui/EmptyState';
import { TaskItem } from '../components/tasks/TaskItem';
import { TaskForm } from '../components/tasks/TaskForm';
import { useTasks } from '../hooks/useTasks';
import { useContacts } from '../hooks/useContacts';

export default function Tasks() {
  const { openDrawer } = useOutletContext();
  const { tasks, saveTask, removeTask, toggleDone } = useTasks();
  const { contacts } = useContacts();
  const [selected, setSelected] = useState(undefined);

  const contactsById = useMemo(() => Object.fromEntries(contacts.map((c) => [c.id, c])), [contacts]);
  const pending = tasks.filter((t) => !t.done);
  const done = tasks.filter((t) => t.done);

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

      <div className="flex flex-col gap-2.5 px-4 py-4">
        {tasks.length === 0 ? (
          <EmptyState icon={CheckSquare} title="Todavía no cargaste tareas" subtitle='Tocá el "+" para crear la primera.' />
        ) : (
          <>
            {pending.map((t) => (
              <TaskItem
                key={t.id}
                task={t}
                contact={contactsById[t.contactId]}
                onToggle={() => toggleDone(t)}
                onClick={() => setSelected(t)}
              />
            ))}
            {done.length > 0 && (
              <>
                <p className="mt-2 text-xs font-medium uppercase tracking-wide text-white/30">Hechas</p>
                {done.map((t) => (
                  <TaskItem
                    key={t.id}
                    task={t}
                    contact={contactsById[t.contactId]}
                    onToggle={() => toggleDone(t)}
                    onClick={() => setSelected(t)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      <TaskForm
        open={selected !== undefined}
        task={selected}
        contacts={contacts}
        onClose={() => setSelected(undefined)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
