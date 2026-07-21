import { openDB } from 'idb';

const DB_NAME = 'castro-ai-db';
const DB_VERSION = 2;

let dbPromise;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // v1 → v2: se sacaron el chat de Equipo y el CRM de contactos.
        for (const old of ['conversations', 'contacts', 'promptOverrides']) {
          if (db.objectStoreNames.contains(old)) db.deleteObjectStore(old);
        }
        if (!db.objectStoreNames.contains('tasks')) {
          db.createObjectStore('tasks', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('kpis')) {
          db.createObjectStore('kpis', { keyPath: 'key' });
        }
      },
    });
  }
  return dbPromise;
}

// --- Tareas ---

export async function listTasks() {
  const db = await getDb();
  const all = await db.getAll('tasks');
  return all.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
}

export async function upsertTask(task) {
  const db = await getDb();
  const record = { ...task, id: task.id || crypto.randomUUID(), updatedAt: Date.now() };
  await db.put('tasks', record);
  return record;
}

export async function deleteTask(id) {
  const db = await getDb();
  await db.delete('tasks', id);
}

// --- KPIs ---

const DEFAULT_KPIS = {
  key: 'main',
  prelistings: 0,
  tasaciones: 0,
  captaciones: 0,
};

export async function getKpis() {
  const db = await getDb();
  const record = await db.get('kpis', 'main');
  return record || DEFAULT_KPIS;
}

export async function saveKpis(kpis) {
  const db = await getDb();
  await db.put('kpis', { ...kpis, key: 'main', updatedAt: Date.now() });
}
