// castroStore.js — helper simple sobre localStorage para las nuevas features.
// Si más adelante querés migrarlo a IndexedDB, solo cambiás estas 4 funciones.

const PREFIX = "castro:";

export function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveData(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error("castroStore: no se pudo guardar", key, e);
  }
}

// ---------- utilidades de fecha ----------

export function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // "2026-07-21"
}

export function dayOfYear(date = new Date()) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date - start) / 86400000);
}

export function isWeekday(date = new Date()) {
  const d = date.getDay();
  return d >= 1 && d <= 5; // lunes a viernes
}

export function isFriday(date = new Date()) {
  return date.getDay() === 5;
}

// Clave de semana ISO simple (año + nro de semana) para el check-in de viernes
export function weekKey(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target - now) / 86400000);
}

export function formatUSD(n) {
  return "USD " + Number(n || 0).toLocaleString("es-AR");
}
