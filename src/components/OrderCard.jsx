import { STATUS, PAYMENT_METHODS } from "../constants";
import { formatOrderNum } from "../api";
import { formatCurrency } from "../api";

function StatusBadge({ status }) {
  const s = STATUS[status];
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1.5px solid ${s.color}33`,
      borderRadius: 30, padding: "4px 12px", fontSize: 12, fontWeight: 700,
      fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 5,
    }}>{s.icon} {s.label}</span>
  );
}

export default function OrderCard({
  order, users, currentUser,
  onStatusChange, onPaymentToggle, onShippingToggle,
  onEdit, onExport, onDelete,
  showPrice,
}) {
  const assigned   = users.find((u) => u.id === order.assignedTo);
  const pm         = PAYMENT_METHODS.find((p) => p.key === order.paymentMethod);
  const canAct     = currentUser.role === "admin" || currentUser.id === order.assignedTo;
  const isAdmin    = currentUser.role === "admin";
  const isFinished = order.status === "done" || order.status === "cancelled";

  return (
    <div style={{
      background: "#fff", borderRadius: 22, overflow: "hidden",
      boxShadow: "0 2px 16px #0000000A", border: "1.5px solid #F1F5F9",
      borderLeft: `5px solid ${STATUS[order.status].color}`,
      transition: "box-shadow 0.2s, transform 0.2s",
      fontFamily: "'DM Sans', sans-serif",
    }}
    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 32px #0000001A"; e.currentTarget.style.transform = "translateY(-2px)"; }}
    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 16px #0000000A"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ padding: "18px 20px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <p style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 18, color: "#0F172A" }}>
              Pedido de {order.clientName}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#6366F1", fontWeight: 700, letterSpacing: 0.5 }}>
              {formatOrderNum(order.orderNum)}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#94A3B8" }}>
              {new Date(order.createdAt).toLocaleString("es-MX", {
                weekday: "short", hour: "2-digit", minute: "2-digit",
                day: "2-digit", month: "short",
              })}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
            <StatusBadge status={order.status} />

            <span onClick={() => isAdmin && onPaymentToggle(order.id)} style={{
              background: order.paid ? "#EAFAF1" : "#F8FAFC",
              color:       order.paid ? "#27AE60" : "#94A3B8",
              border: `1.5px solid ${order.paid ? "#27AE6044" : "#E2E8F0"}`,
              borderRadius: 30, padding: "4px 12px", fontSize: 11, fontWeight: 800,
              letterSpacing: 0.5, cursor: isAdmin ? "pointer" : "default",
              display: "inline-flex", alignItems: "center", gap: 4,
              transition: "all 0.2s", userSelect: "none",
            }} title={isAdmin ? "Clic para cambiar estado de pago" : ""}>
              {order.paid ? "✓ PAGADO" : "✗ NO PAGADO"}
            </span>

            <span onClick={() => isAdmin && onShippingToggle(order.id)} style={{
              background: order.shipping ? "#EFF6FF" : "#F8FAFC",
              color:       order.shipping ? "#2563EB" : "#94A3B8",
              border: `1.5px solid ${order.shipping ? "#2563EB44" : "#E2E8F0"}`,
              borderRadius: 30, padding: "4px 12px", fontSize: 11, fontWeight: 800,
              letterSpacing: 0.5, cursor: isAdmin ? "pointer" : "default",
              display: "inline-flex", alignItems: "center", gap: 4,
              transition: "all 0.2s", userSelect: "none",
            }} title={isAdmin ? "Clic para cambiar tipo de entrega" : ""}>
              {order.shipping ? "🚚 ENVÍO" : "✗ NO ENVÍO"}
            </span>
          </div>
        </div>

        {pm && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "#F1F5F9", borderRadius: 10, padding: "4px 10px",
            marginBottom: 12, fontSize: 12, fontWeight: 600, color: "#475569",
          }}>
            {pm.icon} {pm.label}
          </div>
        )}

        <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "12px 14px", marginBottom: 12 }}>
          {order.items.map((item, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "5px 0",
              borderBottom: i < order.items.length - 1 ? "1px dashed #E2E8F0" : "none",
            }}>
              <span style={{ fontSize: 14, color: "#334155" }}>
                <strong style={{ color: "#0F172A" }}>{item.qty}×</strong> {item.name}
              </span>
              {showPrice && (
                <span style={{ fontSize: 13, fontWeight: 700, color: "#F97316" }}>
                  {formatCurrency(item.price * item.qty)}
                </span>
              )}
            </div>
          ))}
          {showPrice && (
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTop: "2px solid #E2E8F0" }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: "#0F172A" }}>
                Total ({order.items.reduce((s, i) => s + i.qty, 0)} pzs)
              </span>
              <span style={{ fontWeight: 800, fontSize: 16, color: "#EA580C" }}>{formatCurrency(order.total)}</span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#64748B" }}>
            👤 <strong style={{ color: "#0F172A" }}>{assigned?.name || "Sin asignar"}</strong>
            {order.note && <span style={{ color: "#94A3B8" }}> · {order.note}</span>}
          </span>
          {isAdmin && (
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => onEdit(order)} style={{
                background: "#EEF2FF", border: "none", borderRadius: 10,
                padding: "6px 12px", color: "#6366F1", fontSize: 12,
                fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}>✏️ Editar</button>
              <button onClick={() => onExport(order)} style={{
                background: "#FFF7ED", border: "none", borderRadius: 10,
                padding: "6px 12px", color: "#F97316", fontSize: 12,
                fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}>📤 Exportar</button>
            </div>
          )}
        </div>
      </div>

      {canAct && (
        <div style={{ borderTop: "1.5px solid #F1F5F9", display: "flex" }}>
          {!isFinished ? (
            <>
              <button onClick={() => onStatusChange(order.id, "done")} style={{
                flex: 1, padding: "13px 0", border: "none", background: "#EAFAF1",
                color: "#27AE60", fontWeight: 700, fontSize: 13,
                cursor: "pointer", fontFamily: "inherit", borderRight: "1.5px solid #F1F5F9",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#D5F5E3")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#EAFAF1")}
              >✅ Completar</button>
              <button onClick={() => onStatusChange(order.id, "cancelled")} style={{
                flex: 1, padding: "13px 0", border: "none", background: "#FDEDEC",
                color: "#E74C3C", fontWeight: 700, fontSize: 13,
                cursor: "pointer", fontFamily: "inherit",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FADBD8")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#FDEDEC")}
              >❌ Cancelar</button>
            </>
          ) : isAdmin ? (
            <>
              <button onClick={() => onStatusChange(order.id, "pending")} style={{
                flex: 1, padding: "13px 0", border: "none", background: "#FEF5EC",
                color: "#E67E22", fontWeight: 700, fontSize: 13,
                cursor: "pointer", fontFamily: "inherit", borderRight: "1.5px solid #F1F5F9",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FDEBD0")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#FEF5EC")}
              >⏳ Reactivar</button>
              <button onClick={() => onDelete(order)} style={{
                flex: 1, padding: "13px 0", border: "none", background: "#FEE2E2",
                color: "#EF4444", fontWeight: 700, fontSize: 13,
                cursor: "pointer", fontFamily: "inherit",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#FECACA")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#FEE2E2")}
              >🗑️ Eliminar</button>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}