import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Textarea, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { CONTACT_TYPES, LEAD_STATUSES } from './constants';

const EMPTY = { name: '', phone: '', type: 'propietario', status: 'nuevo', notes: '' };

export function ContactForm({ open, contact, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(EMPTY);

  useEffect(() => {
    setForm(contact || EMPTY);
  }, [contact, open]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <Modal open={open} title={contact ? 'Editar contacto' : 'Nuevo contacto'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Input label="Nombre" placeholder="Ej: María Gómez" value={form.name} onChange={set('name')} required />
        <Input
          label="Teléfono (con código de país)"
          placeholder="Ej: 5491122334455"
          value={form.phone}
          onChange={set('phone')}
          inputMode="tel"
        />
        <Select label="Tipo" value={form.type} onChange={set('type')}>
          {CONTACT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
        <Select label="Estado del lead" value={form.status} onChange={set('status')}>
          {LEAD_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
        <Textarea label="Notas" rows={3} placeholder="Detalles, propiedad, seguimiento..." value={form.notes} onChange={set('notes')} />

        <div className="mt-2 flex gap-2">
          {contact && (
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                if (confirm(`¿Borrar a ${contact.name}?`)) onDelete(contact.id);
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
