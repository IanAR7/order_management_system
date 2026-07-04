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
