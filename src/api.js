import { supabase } from "./supabaseClient";

// ── Sesión local (solo para recordar quién está logueado en este dispositivo) ──
// Esto SÍ usa localStorage porque es información de "este dispositivo", no de la tienda.
const SESSION_KEY = "pt_session";

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
export function saveSession(user) {
  try {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  } catch {}
}

// ── Usuarios ──────────────────────────────────────────────────────────────────
export async function fetchUsers() {
  const { data, error } = await supabase.from("users").select("*");
  if (error) { console.error(error); return []; }
  return data;
}

export async function findUserByUsername(username) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .ilike("username", username.trim())
    .maybeSingle();
  if (error) { console.error(error); return null; }
  return data;
}

// ── Pedidos ───────────────────────────────────────────────────────────────────
// Convierte snake_case (DB) <-> camelCase (React)
function rowToOrder(row) {
  return {
    id: row.id,
    orderNum: row.order_num,
    clientName: row.client_name,
    assignedTo: row.assigned_to,
    note: row.note || "",
    paymentMethod: row.payment_method,
    status: row.status,
    paid: row.paid,
    shipping: row.shipping,
    total: Number(row.total),
    items: row.items,
    createdAt: new Date(row.created_at).getTime(),
    shippingPrice: Number(row.shipping_price || 0),
    extendedZone:  row.extended_zone || false,
    depositPrice: Number(row.deposit_price || 0),
  };
}

export async function fetchOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return data.map(rowToOrder);
}

export async function createOrder({ 
  clientName, assignedTo, note, paymentMethod, total, items,
  shipping, shippingPrice, extendedZone, depositPrice  // ← ¿están estos?
}) {
  // 1. Obtener el siguiente número de pedido de forma segura (atómico en la DB)
  const { data: numData, error: numError } = await supabase.rpc("next_order_num");
  if (numError) { console.error(numError); throw numError; }

  // 2. Insertar el pedido
  const { data, error } = await supabase
    .from("orders")
    .insert({
      order_num:     numData,
      client_name:   clientName,
      assigned_to:   assignedTo,
      note,
      payment_method: paymentMethod,
      total,
      items,
      status:         "pending",
      paid:           false,
      shipping:       shipping   || false,      // ← ¿está?
      shipping_price: shippingPrice || 0,       // ← ¿está?
      extended_zone:  extendedZone  || false,   // ← ¿está?
      deposit_price:  depositPrice  || 0,       // ← ¿está?
    })
    .select()
    .single();

  if (error) { console.error(error); throw error; }
  return rowToOrder(data);
}

export async function updateOrder(id, fields) {
  // Convierte camelCase -> snake_case solo para las claves que vienen
  const payload = {};
  if (fields.clientName    !== undefined) payload.client_name    = fields.clientName;
  if (fields.assignedTo    !== undefined) payload.assigned_to    = fields.assignedTo;
  if (fields.note          !== undefined) payload.note           = fields.note;
  if (fields.paymentMethod !== undefined) payload.payment_method = fields.paymentMethod;
  if (fields.total         !== undefined) payload.total          = fields.total;
  if (fields.items         !== undefined) payload.items          = fields.items;
  if (fields.status        !== undefined) payload.status         = fields.status;
  if (fields.paid          !== undefined) payload.paid           = fields.paid;
  if (fields.shipping      !== undefined) payload.shipping       = fields.shipping;
  if (fields.shippingPrice !== undefined) payload.shipping_price = fields.shippingPrice;
  if (fields.extendedZone  !== undefined) payload.extended_zone  = fields.extendedZone;
  if (fields.depositPrice  !== undefined) payload.deposit_price  = fields.depositPrice;

  const { data, error } = await supabase
    .from("orders")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) { console.error(error); throw error; }
  return rowToOrder(data);
}

export async function deleteOrder(id) {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) { console.error(error); throw error; }
}

// ── Helpers de fecha y formato (no tocan la DB) ───────────────────────────────
export const toDateKey = (ts) => new Date(ts).toISOString().slice(0, 10);

export const formatDateLabel = (dateKey) =>
  new Date(dateKey + "T12:00:00").toLocaleDateString("es-MX", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

export const formatOrderNum = (n) => `#${String(n).padStart(4, "0")}`;

export const formatCurrency = (amount) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(amount);

  
