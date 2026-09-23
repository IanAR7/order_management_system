import { PAYMENT_METHODS } from "../constants";
import { formatOrderNum } from "../api";
import { formatCurrency } from "../api";

export default function Receipt({ order }) {
  const pm = PAYMENT_METHODS.find((p) => p.key === order.paymentMethod);

  return (
    <div id="receipt-export" style={{
      width: 400, background: "#fff", borderRadius: 16,
      fontFamily: "Courier New, Courier, monospace",
      padding: "28px 24px", boxSizing: "border-box",
    }}>
      {/* Encabezado */}
      <div style={{
        textAlign: "center", borderBottom: "2px dashed #E2E8F0",
        paddingBottom: 16, marginBottom: 16, 
      }}>
        <div style={{ fontSize: 28, marginBottom: 4 }}>🛍️</div>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: 1 }}>Maciaga</p>
        <p style={{ margin: "6px 0 2px", fontSize: 20, fontWeight: 900, letterSpacing: 2 }}>
          {formatOrderNum(order.orderNum)}
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 11, color: "black" }}>
          {new Date(order.createdAt).toLocaleString("es-MX", {
            weekday: "long", year: "numeric", month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Cliente*/}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
          <span style={{ color: "black" }}>CLIENTE</span>
          <span style={{ fontWeight: 700 }}>{order.clientName}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
          {/* método de pago? */}
        </div>
      </div>

      {/* Items */}
      <div style={{
        borderTop: "2px dashed #E2E8F0", borderBottom: "2px dashed #E2E8F0",
        padding: "14px 0", marginBottom: 14,
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between",
          fontSize: 10, color: "black", marginBottom: 8,
        }}>
          <span>PRODUCTO</span>
          <span>CANT × PRECIO</span>
          <span>SUBTOTAL</span>
        </div>
        {order.items.map((item, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: "space-between",
            fontSize: 12, marginBottom: 5, gap: 8,
          }}>
            <span style={{ flex: 1, fontWeight: 600 }}>{item.name}</span>
            <span style={{ color: "#64748B", whiteSpace: "nowrap" }}>
              {item.qty} × {formatCurrency(item.price)}
            </span>
            <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>
              {formatCurrency(item.qty * item.price)}
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontSize: 18, fontWeight: 800, marginBottom: 8,
      }}>
        <span>TOTAL</span>
        <span>{formatCurrency(order.total)}</span>
      </div>

      {/* Nota */}
      {order.note && (
        <p style={{
          fontSize: 11, color: "black", margin: "10px 0 0",
          borderTop: "1px dashed #E2E8F0", paddingTop: 10,
        }}>
          Nota: {order.note}
        </p>
      )}

      {/* Sellos PAGADO / ENVÍO */}
      {(order.paid || order.shipping) && (
        <div style={{
          display: "flex", gap: 8, marginTop: 16,
          justifyContent: "center", flexWrap: "wrap",
        }}>
          {order.paid && (
            <div style={{
              border: "3px solid #EF4444", borderRadius: 6, padding: "4px 14px",
              color: "#EF4444", fontWeight: 900, fontSize: 16, letterSpacing: 2,
              transform: "rotate(-4deg)", display: "inline-block", opacity: 0.85,
            }}>PAGADO</div>
          )}
          {order.shipping && (
            <div style={{
              border: "3px solid #2563EB", borderRadius: 6, padding: "4px 14px",
              color: "#2563EB", fontWeight: 900, fontSize: 16, letterSpacing: 2,
              transform: "rotate(3deg)", display: "inline-block", opacity: 0.85,
            }}>ENVÍO</div>
          )}
        </div>
      )}

      <p style={{ textAlign: "center", fontSize: 10, color: "black", marginTop: 20 }}>
        ¡Gracias por su compra!
      </p>
    </div>
  );
}
