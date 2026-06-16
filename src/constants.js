// ── Usuarios por defecto ──────────────────────────────────────────────────────
// Cambia los PINs y nombres aquí para personalizar tu tienda
export const DEFAULT_USERS = [
  { id: "admin", username: "admin", name: "Admin",  pin: "1234", role: "admin"  },
  { id: "u1",    username: "carlos", name: "Carlos", pin: "1111", role: "worker" },
  { id: "u2",    username: "maria",  name: "María",  pin: "2222", role: "worker" },
  { id: "u3",    username: "luis",   name: "Luis",   pin: "3333", role: "worker" },
];

// ── Estados de pedido ─────────────────────────────────────────────────────────
export const STATUS = {
  pending:   { label: "En proceso", color: "#E67E22", bg: "#FEF5EC", icon: "⏳" },
  done:      { label: "Completado", color: "#27AE60", bg: "#EAFAF1", icon: "✅" },
  cancelled: { label: "Cancelado",  color: "#E74C3C", bg: "#FDEDEC", icon: "❌" },
};

// ── Métodos de pago ───────────────────────────────────────────────────────────
export const PAYMENT_METHODS = [
  { key: "cash",     label: "Efectivo",      icon: "💵" },
  { key: "card",     label: "Tarjeta",       icon: "💳" },
  { key: "transfer", label: "Transferencia", icon: "📲" },
];

// ── Claves de localStorage ────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  orders:   "pt_orders_v3",
  session:  "pt_session_v3",
  counter:  "pt_counter_v3",
};
