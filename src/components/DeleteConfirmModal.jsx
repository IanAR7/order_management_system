export default function DeleteConfirmModal({ order, onConfirm, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#00000099", zIndex: 3000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: 24, padding: "32px 28px",
        width: "100%", maxWidth: 380, fontFamily: "'DM Sans', sans-serif",
        boxShadow: "0 32px 80px #00000044",
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%", background: "#FEE2E2",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 30, margin: "0 auto 16px",
          }}>🗑️</div>
          <h3 style={{
            margin: "0 0 12px", fontFamily: "'Playfair Display', serif",
            fontSize: 21, color: "#0F172A",
          }}>
            Eliminar pedido
          </h3>
          <p style={{ margin: 0, fontSize: 14, color: "#64748B", lineHeight: 1.7 }}>
            ¿Seguro que deseas eliminar el pedido de{" "}
            <strong style={{ color: "#0F172A" }}>{order.clientName}</strong>?
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "#EF4444", fontWeight: 600 }}>
            Esta acción no se puede deshacer.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "14px", borderRadius: 14, border: "2px solid #E2E8F0",
            background: "#fff", color: "#64748B", fontSize: 14,
            fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#94A3B8")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")}
          >Cancelar</button>

          <button onClick={onConfirm} style={{
            flex: 1, padding: "14px", borderRadius: 14, border: "none",
            background: "linear-gradient(135deg, #EF4444, #DC2626)",
            color: "#fff", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 4px 16px #EF444455",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >Sí, eliminar</button>
        </div>
      </div>
    </div>
  );
}
