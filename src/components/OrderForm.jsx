import { useState } from "react";
import { PAYMENT_METHODS } from "../constants";
import { uid } from "../storage";
import { formatCurrency } from "../api";

const labelStyle = {
  fontSize: 11, fontWeight: 700, color: "#94A3B8",
  textTransform: "uppercase", letterSpacing: 1,
  display: "block", marginBottom: 8,
};

const fieldStyle = {
  padding: "12px 14px", borderRadius: 12, border: "2px solid #E2E8F0",
  fontSize: 14, fontFamily: "inherit", outline: "none",
  background: "#fff", width: "100%", boxSizing: "border-box",
  color: "#1E293B", transition: "border-color 0.15s",
};

document.addEventListener("wheel", function(event) {
  if (document.activeElement.type ==="number") {
    document.activeElement.blur();
  }
});

export default function OrderForm({ users, initialData, onSave, onClose, title, saving }) {
  const workers = users.filter((u) => u.role === "worker");

  const [clientName,    setClientName]    = useState(initialData?.clientName    || "");
  const [assignedTo,    setAssignedTo]    = useState(initialData?.assignedTo    || workers[0]?.id || "");
  const [note,          setNote]          = useState(initialData?.note          || "");
  const [paymentMethod, setPaymentMethod] = useState(initialData?.paymentMethod || "cash");
  const [shipping,      setShipping]      = useState(initialData?.shipping      || false);
  const [shippingPrice, setShippingPrice] = useState(initialData?.shippingPrice || "");
  const [extendedZone,  setExtendedZone]  = useState(initialData?.extendedZone  || false);
  const [depositPrice, setDepositPrice] = useState(initialData?.depositPrice || "");
  const EXTENDED_ZONE_COST = 237;
  
  const [items,         setItems]         = useState(
    initialData?.items?.map((i) => ({ ...i, id: i.id || uid() })) ||
    [{ id: uid(), name: "", qty: "", price: "" }]
  );

  const addItem    = () => setItems((p) => [...p, { id: uid(), name: "", qty: "", price: "" }]);
  const removeItem = (id) => setItems((p) => p.filter((i) => i.id !== id));
  const updateItem = (id, field, val) =>
    setItems((p) => p.map((i) => (i.id === id ? { ...i, [field]: val } : i)));

  const validItems = items.filter(
    (i) => i.name.trim() && Number(i.qty) > 0 && Number(i.price) >= 0
  );
  
  const itemsTotal    = validItems.reduce((s, i) => s + Number(i.qty) * Number(i.price), 0);
  const shippingCost  = shipping && shippingPrice !== "" ? parseFloat(shippingPrice) || 0 : 0;
  const extendedCost  = shipping && extendedZone ? EXTENDED_ZONE_COST : 0;
  const depositCost  = paymentMethod === "transfer" && depositPrice !== "" ? parseFloat(depositPrice) || 0 : 0;
  const total        = itemsTotal + shippingCost + extendedCost + depositCost;
  
  const canSave  = clientName.trim() && validItems.length > 0 && assignedTo && !saving;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      clientName: clientName.trim(),
      assignedTo,
      note,
      paymentMethod, 
      total,
      items: validItems.map((i) => ({
        id: i.id, name: i.name.trim(),
        qty: Number(i.qty), price: Number(i.price),
      })),
      shipping,
      shippingPrice: shippingCost, 
      extendedZone,
      depositPrice: depositCost,
    });
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#00000088", zIndex: 1000,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#fff", borderRadius: "28px 28px 0 0",
        width: "100%", maxWidth: 600, maxHeight: "93vh",
        overflow: "auto", padding: "28px 24px 44px",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#0F172A" }}>
            {title}
          </h2>
          <button onClick={onClose} style={{
            background: "#F1F5F9", border: "none", borderRadius: "50%",
            width: 38, height: 38, fontSize: 20, cursor: "pointer",
          }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={labelStyle}>Nombre del cliente</label>
            <input
              value={clientName} onChange={(e) => setClientName(e.target.value)}
              placeholder="Ej: Juan, Mesa 3..." style={fieldStyle}
              onFocus={(e) => (e.target.style.borderColor = "#F97316")}
              onBlur={(e)  => (e.target.style.borderColor = "#E2E8F0")}
            />
          </div>

          <div>
            <label style={labelStyle}>Asignar a</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {workers.map((w) => (
                <button key={w.id} onClick={() => setAssignedTo(w.id)} style={{
                  padding: "9px 18px", borderRadius: 20, border: "2px solid",
                  borderColor: assignedTo === w.id ? "#F97316" : "#E2E8F0",
                  background:  assignedTo === w.id ? "#FFF7ED" : "#fff",
                  color:       assignedTo === w.id ? "#F97316" : "#64748B",
                  fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
                }}>{w.name}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Método de pago</label>
            <div style={{ display: "flex", gap: 8 }}>
              {PAYMENT_METHODS.map((pm) => (
                <button key={pm.key} onClick={() => { setPaymentMethod(pm.key); 
                  if (pm.key !== "transfer") setDepositPrice(""); }} style={{
                  flex: 1, padding: "11px 8px", borderRadius: 14, border: "2px solid",
                  borderColor: paymentMethod === pm.key ? "#6366F1" : "#E2E8F0",
                  background:  paymentMethod === pm.key ? "#EEF2FF" : "#fff",
                  color:       paymentMethod === pm.key ? "#6366F1" : "#64748B",
                  fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                }}>
                  <span style={{ fontSize: 20 }}>{pm.icon}</span>
                  <span>{pm.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Envío */}
          <div>
            <label style={labelStyle}>Envío</label>
            <div style={{ display: "flex", gap: 8, marginBottom: shipping ? 12 : 0 }}>
              <button onClick={() => { setShipping(false); setShippingPrice(""); setExtendedZone(false); }} style={{
                flex: 1, padding: "11px", borderRadius: 14, border: "2px solid",
                borderColor: !shipping ? "#F97316" : "#E2E8F0",
                background:  !shipping ? "#FFF7ED" : "#fff",
                color:       !shipping ? "#F97316" : "#64748B",
                fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
              }}>✗ Sin envío</button>
              <button onClick={() => setShipping(true)} style={{
                flex: 1, padding: "11px", borderRadius: 14, border: "2px solid",
                borderColor: shipping ? "#2563EB" : "#E2E8F0",
                background:  shipping ? "#EFF6FF" : "#fff",
                color:       shipping ? "#2563EB" : "#64748B",
                fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
              }}>🚚 Con envío</button>
            </div>

            {shipping && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Precio de envío */}
                <input
                  value={shippingPrice}
                  onChange={(e) => setShippingPrice(e.target.value)}
                  placeholder="Costo de envío $"
                  inputMode="decimal" pattern="[0-9.]*"
                  type="number" min="1"
                  style={fieldStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                  onBlur={(e)  => (e.target.style.borderColor = "#E2E8F0")}
                />

                {/* Zona Extendida */}
                <button onClick={() => setExtendedZone((v) => !v)} style={{
                  padding: "11px 16px", borderRadius: 14, border: "2px solid",
                  borderColor: extendedZone ? "#7C3AED" : "#E2E8F0",
                  background:  extendedZone ? "#F5F3FF" : "#fff",
                  color:       extendedZone ? "#7C3AED" : "#64748B",
                  fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span>📍 Zona Extendida</span>
                  <span style={{
                    fontSize: 12, background: extendedZone ? "#7C3AED" : "#E2E8F0",
                    color: extendedZone ? "#fff" : "#94A3B8",
                    borderRadius: 20, padding: "2px 10px",
                  }}>+$237.00</span>
                </button>

              </div>
            )}
          </div>

          {paymentMethod === "transfer" && (
            <input
              value={depositPrice}
              onChange={(e) => setDepositPrice(e.target.value)}
              placeholder="Costo de depósito $"
              inputMode="decimal" pattern="[0-9.]*"
              type="number" min="1"
              style={{ ...fieldStyle, marginTop: 10, borderColor: "#6366F1" }}
              onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
              onBlur={(e)  => (e.target.style.borderColor = "#6366F1")}
            />
          )}

          {/* Desglose */}
          <div style={{ background: "#EFF6FF", borderRadius: 12, padding: "10px 14px", fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#475569", marginBottom: 4 }}>
              <span>Subtotal productos</span>
              <span>{formatCurrency(itemsTotal)}</span>
            </div>
            {shipping && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "#2563EB" }}>
              <span>Envío</span>
              <span>{formatCurrency(shippingCost)}</span>
            </div>
            )}
            {extendedZone && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "#7C3AED" }}>
                <span>Zona Extendida</span>
                <span>+{formatCurrency(EXTENDED_ZONE_COST)}</span>
              </div>
            )}
            {paymentMethod === "transfer" && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "#27AE60" }}>
                <span>Depósito</span>
                <span>{formatCurrency(depositCost)}</span>
              </div>
            )}
          </div>

          <div>
            <label style={labelStyle}>Productos / Items</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((item, idx) => (
                <div key={item.id} style={{
                  background: "#F8FAFC", borderRadius: 16,
                  padding: "14px 16px", border: "1.5px solid #E2E8F0",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8" }}>ITEM {idx + 1}</span>
                    {items.length > 1 && (
                      <button onClick={() => removeItem(item.id)} style={{
                        background: "#FEE2E2", border: "none", borderRadius: 8,
                        color: "#EF4444", fontSize: 11, fontWeight: 700,
                        padding: "3px 10px", cursor: "pointer", fontFamily: "inherit",
                      }}>Eliminar</button>
                    )}
                  </div>
                  <input
                    value={item.name} onChange={(e) => updateItem(item.id, "name", e.target.value)}
                    placeholder="Nombre del producto..."
                    style={{ ...fieldStyle, marginBottom: 8 }}
                    onFocus={(e) => (e.target.style.borderColor = "#F97316")}
                    onBlur={(e)  => (e.target.style.borderColor = "#E2E8F0")}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <input
                      value={item.qty} onChange={(e) => updateItem(item.id, "qty", e.target.value)}
                      placeholder="Cantidad" type="number" min="1" style={fieldStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#F97316")}
                      onBlur={(e)  => (e.target.style.borderColor = "#E2E8F0")}
                    />
                    <input
                      value={item.price} onChange={(e) => updateItem(item.id, "price", e.target.value)}
                      placeholder="Precio $" type="number" min="0" style={fieldStyle}
                      onFocus={(e) => (e.target.style.borderColor = "#F97316")}
                      onBlur={(e)  => (e.target.style.borderColor = "#E2E8F0")}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addItem} style={{
              marginTop: 10, width: "100%", padding: "12px", borderRadius: 14,
              border: "2px dashed #E2E8F0", background: "#fff", color: "#94A3B8",
              fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#F97316"; e.currentTarget.style.color = "#F97316"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "#94A3B8"; }}
            >+ Agregar otro item</button>
          </div>

          <div>
            <label style={labelStyle}>Nota (opcional)</label>
            <input
              value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Indicaciones especiales..." style={fieldStyle}
              onFocus={(e) => (e.target.style.borderColor = "#F97316")}
              onBlur={(e)  => (e.target.style.borderColor = "#E2E8F0")}
            />
          </div>
        </div>

        <div style={{
          background: "#FFF7ED", borderRadius: 20, padding: "18px 20px", marginTop: 24,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          border: "2px solid #FED7AA",
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: "#F97316", fontWeight: 600 }}>Total del pedido</p>
            <p style={{
              margin: 0, fontSize: 28, fontWeight: 800, color: "#EA580C",
              fontFamily: "'Playfair Display', serif",
            }}>{formatCurrency(total)}</p>
          </div>
          <button onClick={handleSave} disabled={!canSave} style={{
            padding: "16px 28px", borderRadius: 16, border: "none",
            background: canSave ? "linear-gradient(135deg, #F97316, #EF4444)" : "#E2E8F0",
            color:      canSave ? "#fff" : "#94A3B8",
            fontSize: 15, fontWeight: 700,
            cursor: canSave ? "pointer" : "not-allowed",
            fontFamily: "inherit",
          }}>{saving ? "Guardando..." : "Guardar"}</button>
        </div>
      </div>
    </div>
  );
}