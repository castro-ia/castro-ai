import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Search, Users } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { EmptyState } from '../components/ui/EmptyState';
import { ContactCard } from '../components/crm/ContactCard';
import { ContactForm } from '../components/crm/ContactForm';
import { useContacts } from '../hooks/useContacts';

export default function Crm() {
  const { openDrawer } = useOutletContext();
  const { contacts, saveContact, removeContact } = useContacts();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(undefined); // undefined = cerrado, null = nuevo, obj = editar

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) => c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.notes?.toLowerCase().includes(q)
    );
  }, [contacts, query]);

  const handleSave = async (contact) => {
    await saveContact(contact);
    setSelected(undefined);
  };

  const handleDelete = async (id) => {
    await removeContact(id);
    setSelected(undefined);
  };

  return (
    <div>
      <Header
        title="Mini CRM"
        subtitle={`${contacts.length} contacto${contacts.length === 1 ? '' : 's'}`}
        onMenuOpen={openDrawer}
        rightSlot={
          <button
            onClick={() => setSelected(null)}
            aria-label="Nuevo contacto"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/20 active:bg-black/30"
          >
            <Plus size={20} color="white" />
          </button>
        }
      />

      <div className="px-4 pt-4">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscá por nombre, teléfono o notas..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3.5 text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-4 py-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title={contacts.length === 0 ? 'Todavía no cargaste contactos' : 'No encontramos coincidencias'}
            subtitle={contacts.length === 0 ? 'Tocá el "+" para crear el primero.' : 'Probá con otra búsqueda.'}
          />
        ) : (
          filtered.map((c) => <ContactCard key={c.id} contact={c} onClick={() => setSelected(c)} />)
        )}
      </div>

      <ContactForm
        open={selected !== undefined}
        contact={selected}
        onClose={() => setSelected(undefined)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
