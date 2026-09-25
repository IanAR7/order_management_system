import { useState, useEffect } from "react";
import {
  fetchUsers, fetchOrders, createOrder, updateOrder, deleteOrder,
  loadSession, saveSession, toDateKey, formatDateLabel,
} from "./api";

import LoginScreen        from "./components/LoginScreen";
import OrderCard          from "./components/OrderCard";
import OrderForm          from "./components/OrderForm";
import ExportModal        from "./components/ExportModal";
import DeleteConfirmModal from "./components/DeleteConfirmModal";

export default function App() {
  const [users,   setUsers]   = useState([]);
  const [orders,  setOrders]  = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [savingOrder, setSavingOrder] = useState(false);

  // Modals
  const [showNewOrder,   setShowNewOrder]   = useState(false);
  const [editingOrder,   setEditingOrder]   = useState(null);
  const [exportingOrder, setExportingOrder] = useState(null);
  const [deletingOrder,  setDeletingOrder]  = useState(null);

  // Filtros y búsqueda
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchNum,    setSearchNum]    = useState("");
  const [searchDate,   setSearchDate]   = useState("");

  // ── Carga inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const s = loadSession();
      const [u, o] = await Promise.all([fetchUsers(), fetchOrders()]);
      setUsers(u);
      setOrders(o);
      if (s) setSession(s);
      setLoading(false);
    })();
  }, []);

  // ── Refrescar pedidos manualmente (sin Realtime, el usuario jala para refrescar) ──
  const refreshOrders = async () => {
    setRefreshing(true);
    setErrorMsg("");
    try {
      const o = await fetchOrders();
      setOrders(o);
    } catch {
      setErrorMsg("No se pudo conectar. Revisa tu internet.");
    }
    setRefreshing(false);
  };

  // ── Auth ──────────────────────────────────────────────────────────────────
  const handleLogin = (user) => { setSession(user); saveSession(user); };
  const handleLogout = () => { setSession(null); saveSession(null); };

  // ── Handlers de pedidos (todos van a Supabase y luego refrescan la lista local) ──
  const handleStatusChange = async (id, status) => {
  try {
    const extra = status === "done" ? { paid: true } : {};
    const updated = await updateOrder(id, { status, ...extra });
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
  } catch { setErrorMsg("No se pudo actualizar el pedido."); }
};

  const handlePaymentToggle = async (id) => {
    const current = orders.find((o) => o.id === id);
    try {
      const updated = await updateOrder(id, { paid: !current.paid });
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch { setErrorMsg("No se pudo actualizar el pago."); }
  };

  const handleShippingToggle = async (id) => {
    const current = orders.find((o) => o.id === id);
    try {
      const updated = await updateOrder(id, { shipping: !current.shipping });
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch { setErrorMsg("No se pudo actualizar el envío."); }
  };

  const handleDelete = async (order) => {
    try {
      await deleteOrder(order.id);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      setDeletingOrder(null);
    } catch { setErrorMsg("No se pudo eliminar el pedido."); }
  };

  const handleNewOrder = async (data) => {
    setSavingOrder(true);
    try {
      const created = await createOrder(data);
      setOrders((prev) => [created, ...prev]);
      setShowNewOrder(false);
    } catch { setErrorMsg("No se pudo crear el pedido."); }
    setSavingOrder(false);
  };

  const handleEditOrder = async (data) => {
    setSavingOrder(true);
    try {
      const updated = await updateOrder(editingOrder.id, data);
      setOrders((prev) => prev.map((o) => (o.id === editingOrder.id ? updated : o)));
      setEditingOrder(null);
    } catch { setErrorMsg("No se pudo guardar el pedido."); }
    setSavingOrder(false);
  };

  // ── Loading / Login ───────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0F172A" }}>
      <div style={{ fontSize: 44 }}>⏳</div>
    </div>
  );

  if (!session) return <LoginScreen onLogin={handleLogin} />;

  // ── Filtrado ──────────────────────────────────────────────────────────────
  const isAdmin  = session.role === "admin";
  const myOrders = isAdmin ? orders : orders.filter((o) => o.assignedTo === session.id);

  const uniqueDays = [...new Set(myOrders.map((o) => toDateKey(o.createdAt)))].sort((a, b) => b.localeCompare(a));

  const filtered = myOrders.filter((o) => {
    if (filterStatus !== "all" && o.status !== filterStatus) return false;
    if (searchDate && toDateKey(o.createdAt) !== searchDate) return false;
    if (searchNum.trim()) {
      const q = searchNum.trim().replace(/^#/, "");
      if (
        !String(o.orderNum).padStart(4, "0").includes(q) &&
        !o.clientName.toLowerCase().includes(q.toLowerCase())
      ) return false;
    }
    return true;
  });

  const counts = {
    all:       myOrders.length,
    pending:   myOrders.filter((o) => o.status === "pending").length,
    done:      myOrders.filter((o) => o.status === "done").length,
    cancelled: myOrders.filter((o) => o.status === "cancelled").length,
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{
        background: "#0F172A", padding: "20px 24px 24px",
        borderRadius: "0 0 32px 32px", boxShadow: "0 8px 40px #0F172A44",
      }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: "#64748B", fontWeight: 500 }}>Sesión activa</p>
              <h1 style={{ margin: "2px 0 0", fontFamily: "'Playfair Display', serif", fontSize: 22, color: "#F8FAFC" }}>
                {isAdmin ? "👑" : "👤"} {session.name}
              </h1>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={refreshOrders} disabled={refreshing} title="Actualizar pedidos" style={{
                background: "#1E293B", border: "1.5px solid #334155", borderRadius: 12,
                color: "#94A3B8", padding: "9px 14px", cursor: refreshing ? "wait" : "pointer",
                fontSize: 15, fontFamily: "inherit",
              }}>{refreshing ? "⏳" : "🔄"}</button>
              <button onClick={handleLogout} style={{
                background: "#1E293B", border: "1.5px solid #334155", borderRadius: 12,
                color: "#94A3B8", padding: "9px 18px", cursor: "pointer",
                fontSize: 13, fontWeight: 600, fontFamily: "inherit",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#EF4444"; e.currentTarget.style.color = "#EF4444"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#94A3B8"; }}
              >Cerrar sesión</button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {[
              { label: "Total",       val: counts.all,     accent: "#F8FAFC" },
              { label: "En proceso",  val: counts.pending, accent: "#F97316" },
              { label: "Completados", val: counts.done,    accent: "#27AE60" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "#1E293B", borderRadius: 16, padding: "14px",
                border: "1.5px solid #334155", textAlign: "center",
              }}>
                <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: s.accent, fontFamily: "'Playfair Display', serif" }}>
                  {s.val}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748B", fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Aviso de error ── */}
      {errorMsg && (
        <div style={{
          maxWidth: 640, margin: "16px auto 0", padding: "0 16px",
        }}>
          <div style={{
            background: "#FEE2E2", border: "1.5px solid #FCA5A5", borderRadius: 14,
            padding: "12px 16px", color: "#DC2626", fontSize: 13, fontWeight: 600,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            ⚠️ {errorMsg}
            <button onClick={() => setErrorMsg("")} style={{
              background: "none", border: "none", color: "#DC2626",
              fontSize: 16, cursor: "pointer",
            }}>×</button>
          </div>
        </div>
      )}

      {/* ── Contenido ── */}
      <div style={{ padding: "20px 16px", maxWidth: 640, margin: "0 auto" }}>

        {/* Búsqueda + filtro por día */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{
              position: "absolute", left: 14, top: "50%",
              transform: "translateY(-50%)", fontSize: 16, color: "#94A3B8",
            }}>🔍</span>
            <input
              value={searchNum}
              onChange={(e) => setSearchNum(e.target.value)}
              placeholder="Buscar por # o nombre..."
              style={{
                width: "100%", padding: "11px 14px 11px 40px", borderRadius: 14,
                border: "2px solid #E2E8F0", fontSize: 14, fontFamily: "inherit",
                outline: "none", background: "#fff", color: "#1E293B",
                boxSizing: "border-box", transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#F97316")}
              onBlur={(e)  => (e.target.style.borderColor = "#E2E8F0")}
            />
            {searchNum && (
              <button onClick={() => setSearchNum("")} style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "#E2E8F0", border: "none", borderRadius: "50%",
                width: 22, height: 22, fontSize: 13, cursor: "pointer", color: "#64748B",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>×</button>
            )}
          </div>

          <select
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            style={{
              padding: "11px 12px", borderRadius: 14,
              border: `2px solid ${searchDate ? "#F97316" : "#E2E8F0"}`,
              fontSize: 13, fontFamily: "inherit", outline: "none",
              background: "#fff", color: searchDate ? "#F97316" : "#64748B",
              fontWeight: 600, cursor: "pointer", minWidth: 130,
            }}
          >
            <option value="">📅 Todos los días</option>
            {uniqueDays.map((d) => (
              <option key={d} value={d}>{formatDateLabel(d)}</option>
            ))}
          </select>
        </div>

        {/* Tabs de estado */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 2 }}>
          {[
            { key: "all",       label: "Todos" },
            { key: "pending",   label: "⏳ En proceso" },
            { key: "done",      label: "✅ Completados" },
            { key: "cancelled", label: "❌ Cancelados" },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilterStatus(f.key)} style={{
              padding: "8px 16px", borderRadius: 20, border: "2px solid",
              borderColor: filterStatus === f.key ? "#F97316" : "#E2E8F0",
              background:  filterStatus === f.key ? "#FFF7ED" : "#fff",
              color:       filterStatus === f.key ? "#F97316" : "#64748B",
              fontSize: 13, fontWeight: 700, cursor: "pointer",
              whiteSpace: "nowrap", fontFamily: "inherit",
            }}>
              {f.label} ({counts[f.key]})
            </button>
          ))}
        </div>

        {/* Lista de pedidos */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "70px 0", color: "#CBD5E1" }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>📋</div>
            <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
              {searchNum || searchDate ? "Sin resultados para tu búsqueda" : "Sin pedidos aquí"}
            </p>
            <p style={{ fontSize: 13, margin: "6px 0 0", color: "#94A3B8" }}>
              {searchNum || searchDate
                ? "Intenta con otro número, nombre o fecha"
                : isAdmin ? "Usa el botón + para crear uno, o 🔄 para revisar pedidos nuevos" : "Espera a que te asignen un pedido (toca 🔄 para revisar)"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                users={users}
                currentUser={session}
                onStatusChange={handleStatusChange}
                onPaymentToggle={handlePaymentToggle}
                onShippingToggle={handleShippingToggle}
                onEdit={setEditingOrder}
                onExport={setExportingOrder}
                onDelete={setDeletingOrder}
                showPrice={isAdmin}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── FAB nuevo pedido (solo admin) ── */}
      {isAdmin && (
        <button onClick={() => setShowNewOrder(true)} style={{
          position: "fixed", bottom: 28, right: 24,
          width: 62, height: 62, borderRadius: "50%",
          background: "linear-gradient(135deg, #F97316, #EF4444)",
          border: "none", color: "#fff", fontSize: 32,
          cursor: "pointer", boxShadow: "0 8px 32px #F9731666",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >+</button>
      )}

      {/* ── Modales ── */}
      {showNewOrder   && <OrderForm users={users} onSave={handleNewOrder}  onClose={() => setShowNewOrder(false)}  title="Nuevo Pedido"  saving={savingOrder} />}
      {editingOrder   && <OrderForm users={users} initialData={editingOrder} onSave={handleEditOrder} onClose={() => setEditingOrder(null)} title="Editar Pedido" saving={savingOrder} />}
      {exportingOrder && <ExportModal order={exportingOrder} onClose={() => setExportingOrder(null)} />}
      {deletingOrder  && <DeleteConfirmModal order={deletingOrder} onConfirm={() => handleDelete(deletingOrder)} onClose={() => setDeletingOrder(null)} />}
    </div>
  );
}
