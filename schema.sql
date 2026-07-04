-- ════════════════════════════════════════════════════════════════
-- ESQUEMA: Mi Tienda - App de Pedidos
-- Pega esto completo en Supabase SQL Editor y dale "Run"
-- ════════════════════════════════════════════════════════════════

-- Tabla de usuarios (admin + trabajadores)
create table users (
  id text primary key,
  username text unique not null,
  name text not null,
  pin text not null,
  role text not null check (role in ('admin', 'worker'))
);

-- Tabla de pedidos
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_num integer not null,
  client_name text not null,
  assigned_to text references users(id),
  note text,
  payment_method text not null default 'cash',
  status text not null default 'pending' check (status in ('pending', 'done', 'cancelled')),
  paid boolean not null default false,
  shipping boolean not null default false,
  total numeric not null default 0,
  items jsonb not null default '[]',
  created_at timestamptz not null default now()
);

-- Tabla auxiliar para el contador de números de pedido
create table order_counter (
  id integer primary key default 1,
  current_value integer not null default 0
);
insert into order_counter (id, current_value) values (1, 0);

-- ── Función para obtener el siguiente número de pedido de forma segura ──
create or replace function next_order_num()
returns integer as $$
declare
  next_val integer;
begin
  update order_counter set current_value = current_value + 1
  where id = 1
  returning current_value into next_val;
  return next_val;
end;
$$ language plpgsql;

-- ── Usuarios iniciales (cambia los PINs después si quieres) ──
insert into users (id, username, name, pin, role) values
  ('admin', 'admin',  'Admin',  '1234', 'admin'),
  ('u1',    'carlos',  'Carlos', '1111', 'worker'),
  ('u2',    'maria',   'María',  '2222', 'worker'),
  ('u3',    'luis',    'Luis',   '3333', 'worker');

-- ── Seguridad: habilitar acceso (Row Level Security) ──
-- Para simplicidad, permitimos lectura/escritura pública
-- (la app ya protege con el login de PIN)
alter table users enable row level security;
alter table orders enable row level security;
alter table order_counter enable row level security;

create policy "Acceso público a usuarios" on users for select using (true);
create policy "Acceso público a pedidos" on orders for all using (true) with check (true);
create policy "Acceso público a contador" on order_counter for all using (true) with check (true);
