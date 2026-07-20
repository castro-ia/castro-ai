import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';

const EMPTY = { title: '', dueDate: '', contactId: '', done: false };

export function TaskForm({ open, task, contacts, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(task || EMPTY);
  }, [task, open]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave(form);
  };

  return (
    <Modal open={open} title={task ? 'Editar tarea' : 'Nueva tarea'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Input label="Tarea" placeholder="Ej: Llamar a propietario" value={form.title} onChange={set('title')} required />
        <Input label="Fecha" type="date" value={form.dueDate} onChange={set('dueDate')} />
        <Select label="Vincular a un contacto (opcional)" value={form.contactId} onChange={set('contactId')}>
          <option value="">Sin vincular</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        <div className="mt-2 flex gap-2">
          {task && (
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
