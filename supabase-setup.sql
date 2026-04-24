-- ============================================================
--  MARIANTO MATES — SCRIPT SUPABASE
--  Pegá esto en Supabase → SQL Editor → Run
-- ============================================================

-- TABLA: perfiles de usuarios
create table if not exists perfiles (
  id uuid references auth.users on delete cascade primary key,
  nombre text,
  apellido text,
  whatsapp text,
  direccion text,
  email text,
  created_at timestamp with time zone default now()
);

-- TABLA: productos
create table if not exists productos (
  id bigserial primary key,
  nombre text not null,
  descripcion text,
  categoria text not null,  -- mate, bombilla, termo, gorra, grabado
  precio numeric not null,
  stock integer default 0,
  badge text,
  icono text default '📦',
  imagen_url text,
  grabable boolean default false,
  activo boolean default true,
  created_at timestamp with time zone default now()
);

-- TABLA: pedidos
create table if not exists pedidos (
  id bigserial primary key,
  user_id uuid references auth.users,
  numero integer not null,
  items jsonb,           -- lista de productos
  total numeric,
  direccion text,
  whatsapp text,
  grabado boolean default false,
  estado text default 'pagado',  -- pagado, enviado, entregado
  created_at timestamp with time zone default now()
);

-- SEGURIDAD: habilitar RLS (Row Level Security)
alter table perfiles enable row level security;
alter table productos enable row level security;
alter table pedidos enable row level security;

-- PERFILES: cada usuario ve y edita solo su perfil
create policy "Ver propio perfil" on perfiles for select using (auth.uid() = id);
create policy "Crear propio perfil" on perfiles for insert with check (auth.uid() = id);
create policy "Editar propio perfil" on perfiles for update using (auth.uid() = id);

-- PRODUCTOS: todos pueden ver los productos activos
create policy "Ver productos activos" on productos for select using (activo = true);

-- PEDIDOS: cada usuario ve sus propios pedidos
create policy "Ver propios pedidos" on pedidos for select using (auth.uid() = user_id);
create policy "Crear pedido" on pedidos for insert with check (auth.uid() = user_id);

-- ADMIN: dar acceso completo al email del administrador
-- (Reemplazá 'admin@mariantomates.com' con el email real del admin)
create policy "Admin productos" on productos for all using (
  auth.jwt() ->> 'email' = 'admin@mariantomates.com'
);
create policy "Admin pedidos" on pedidos for all using (
  auth.jwt() ->> 'email' = 'admin@mariantomates.com'
);

-- PRODUCTOS DE EJEMPLO para empezar
insert into productos (nombre, descripcion, categoria, precio, stock, badge, icono, grabable, activo) values
('Mate Clásico de Madera', 'Mate torneado artesanal, acabado natural. Apto para cebar y cebar.', 'mate', 4500, 8, 'Más vendido', '🧉', true, true),
('Mate Calabaza Curada', 'Calabaza 100% natural curada a mano. Guarda el sabor perfecto.', 'mate', 3800, 5, null, '🧉', true, true),
('Mate de Cerámica', 'Cerámica artesanal pintada a mano. Ideal para regalar.', 'mate', 5200, 6, 'Nuevo', '🏺', false, true),
('Bombilla de Alpaca', 'Filtro de alpaca, anticorrosión. Larga durabilidad y flujo perfecto.', 'bombilla', 1800, 15, null, '🥢', false, true),
('Bombilla Acero Inox', 'Inoxidable, apta lavavajillas. Punta en espiral antitaponamiento.', 'bombilla', 2200, 12, 'Recomendada', '🥢', false, true),
('Termo Stanley 1L', 'Mantiene temperatura 24hs. Tapa cebador integrada. Color negro.', 'termo', 18500, 3, null, '🫙', true, true),
('Termo Cebador 500ml', 'Tapa antigoteo, ideal para llevar al trabajo o la facultad.', 'termo', 12000, 7, 'Nuevo', '🫙', true, true),
('Gorra Marianto Classic', 'Bordado del logo Marianto. Tela de algodón, ajuste metálico.', 'gorra', 6500, 10, 'Nuevo', '🧢', false, true),
('Gorra Trucker Olive', 'Estilo trucker, malla trasera. Color oliva, visera curva.', 'gorra', 7200, 8, 'Nuevo', '🧢', false, true),
('Grabado en Mate', 'Grabado a láser en tu mate. Subí tu imagen o texto y lo grabamos.', 'grabado', 1500, 99, 'Personalizable', '✦', true, true),
('Grabado en Termo', 'Grabado a láser en termo. Logo, nombre o diseño personalizado.', 'grabado', 2000, 99, 'Personalizable', '✦', true, true),
('Pack Mate + Bombilla', 'Combo perfecto: mate de madera + bombilla de alpaca. Ideal para regalar.', 'mate', 5800, 4, 'Pack', '🧉', true, true);
