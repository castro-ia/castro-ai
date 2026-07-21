import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select, Textarea } from '../ui/Input';
import { Button } from '../ui/Button';

const EMPTY = {
  title: '',
  description: '',
  category: 'negocio',
  priority: 'media',
  dueDate: '',
  dueTime: '',
  contactName: '',
  reminderEmail: false,
  done: false,
};

export function TaskForm({ open, task, calendarConnected, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(task ? { ...EMPTY, ...task } : EMPTY);
  }, [task, open]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const setChecked = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.checked }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
  };

  const reminderEnabled = calendarConnected && Boolean(form.dueDate);

  return (
    <Modal open={open} title={task?.id ? 'Editar tarea' : 'Nueva tarea'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Input label="Tarea" placeholder="Ej: Llamar a propietario" value={form.title} onChange={set('title')} required />
        <Textarea
          label="Descripción (opcional)"
          rows={3}
          placeholder="Detalles, dirección, lo que haga falta"
          value={form.description}
          onChange={set('description')}
        />

        <div className="grid grid-cols-2 gap-3">
          <Select label="Categoría" value={form.category} onChange={set('category')}>
            <option value="negocio">🟢 Negocio</option>
            <option value="personal">🔴 Personal</option>
          </Select>
          <Select label="Prioridad" value={form.priority} onChange={set('priority')}>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Fecha" type="date" value={form.dueDate} onChange={set('dueDate')} />
          <Input label="Hora (opcional)" type="time" value={form.dueTime} onChange={set('dueTime')} />
        </div>

        <Input
          label="Contacto (opcional)"
          placeholder="Ej: Ricardo - Santa Fe 3288"
          value={form.contactName}
          onChange={set('contactName')}
        />

        <label
          className={`flex items-center gap-2.5 rounded-xl border p-3 text-sm ${
            reminderEnabled ? 'border-white/10 bg-white/5 text-white' : 'border-white/5 bg-white/[0.02] text-white/30'
          }`}
        >
          <input
            type="checkbox"
            checked={form.reminderEmail}
            disabled={!reminderEnabled}
            onChange={setChecked('reminderEmail')}
            className="h-4 w-4 rounded"
          />
          Recordatorio por email (vía Google Calendar)
        </label>
        {!calendarConnected && (
          <p className="-mt-2 text-xs text-white/30">Conectá tu Google Calendar en Ajustes para activar recordatorios.</p>
        )}
        {calendarConnected && !form.dueDate && (
          <p className="-mt-2 text-xs text-white/30">Ponele una fecha a la tarea para poder activar el recordatorio.</p>
        )}

        <div className="mt-2 flex gap-2">
          {task?.id && (
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                if (confirm('¿Borrar esta tarea?')) onDelete(task.id);
              }}
            >
              Borrar
            </Button>
          )}
          <Button type="submit" className="flex-1">
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
