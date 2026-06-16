// ── Persistencia con localStorage ────────────────────────────────────────────
// Estas funciones reemplazan la window.storage de Claude.ai
// y guardan los datos en el navegador del dispositivo.

export function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error guardando datos:", e);
  }
}

// ── Generador de ID único ─────────────────────────────────────────────────────
export const uid = () => Math.random().toString(36).slice(2, 9);

// ── Helpers de fecha ──────────────────────────────────────────────────────────
// Convierte timestamp a "2025-05-06"
export const toDateKey = (ts) => new Date(ts).toISOString().slice(0, 10);

// Convierte "2025-05-06" a "lun. 6 may. 2025"
export const formatDateLabel = (dateKey) =>
  new Date(dateKey + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

// Formatea número de pedido: 1 → "#0001"
export const formatOrderNum = (n) => `#${String(n).padStart(4, "0")}`;
