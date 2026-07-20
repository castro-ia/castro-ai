import { useState, useEffect, useCallback } from 'react';
import { listContacts, upsertContact, deleteContact } from '../lib/db';

export function useContacts() {
  const [contacts, setContacts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    const all = await listContacts();
    setContacts(all);
    setLoaded(true);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const saveContact = useCallback(
    async (contact) => {
      await upsertContact(contact);
      await reload();
    },
    [reload]
  );

  const removeContact = useCallback(
    async (id) => {
      await deleteContact(id);
      await reload();
    },
    [reload]
  );

  return { contacts, loaded, saveContact, removeContact };
}
