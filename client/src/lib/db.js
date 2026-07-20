import { openDB } from 'idb';

const DB_NAME = 'castro-ai-db';
const DB_VERSION = 1;

let dbPromise;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('conversations')) {
          db.createObjectStore('conversations', { keyPath: 'agentId' });
        }
        if (!db.objectStoreNames.contains('contacts')) {
          const store = db.createObjectStore('contacts', { keyPath: 'id' });
          store.createIndex('type', 'type');
        }
        if (!db.objectStoreNames.contains('tasks')) {
          const store = db.createObjectStore('tasks', { keyPath: 'id' });
          store.createIndex('contactId', 'contactId');
        }
        if (!db.objectStoreNames.contains('kpis')) {
          db.createObjectStore('kpis', { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains('promptOverrides')) {
          db.createObjectStore('promptOverrides', { keyPath: 'agentId' });
        }
      },
    });
  }
  return dbPromise;
}

// --- Conversaciones ---

export async function getConversation(agentId) {
  const db = await getDb();
  const record = await db.get('conversations', agentId);
  return record?.messages || [];
}

export async function saveConversation(agentId, messages) {
  const db = await getDb();
  await db.put('conversations', { agentId, messages, updatedAt: Date.now() });
}

export async function clearConversation(agentId) {
  const db = await getDb();
  await db.delete('conversations', agentId);
}

// --- Contactos ---

export async function listContacts() {
  const db = await getDb();
  const all = await db.getAll('contacts');
  return all.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
}

export async function upsertContact(contact) {
  const db = await getDb();
  const record = { ...contact, id: contact.id || crypto.randomUUID(), updatedAt: Date.now() };
  await db.put('contacts', record);
  return record;
}

export async function deleteContact(id) {
  const db = await getDb();
  await db.delete('contacts', id);
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

// --- Overrides de system prompt por agente ---

export async function getPromptOverride(agentId) {
  const db = await getDb();
  const record = await db.get('promptOverrides', agentId);
  return record?.systemPrompt ?? null;
}

export async function getAllPromptOverrides() {
  const db = await getDb();
  const all = await db.getAll('promptOverrides');
  return Object.fromEntries(all.map((r) => [r.agentId, r.systemPrompt]));
}

export async function savePromptOverride(agentId, systemPrompt) {
  const db = await getDb();
  await db.put('promptOverrides', { agentId, systemPrompt, updatedAt: Date.now() });
}

export async function resetPromptOverride(agentId) {
  const db = await getDb();
  await db.delete('promptOverrides', agentId);
}
