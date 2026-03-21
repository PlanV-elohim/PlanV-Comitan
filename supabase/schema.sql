-- SCHEMA DE SUPABASE PARA PLAN V ELOHIM

-- Habilitar la extensión para UUIDs automáticos
create extension if not exists "uuid-ossp";

/* ==============================================
 * 1. TABLAS
 * ============================================== */

-- Campamentos (Administran Cupos y Fechas)
create table public.camps (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  location text not null,
  date_string text not null,
  capacity int not null,
  price numeric not null,
  status text not null default 'upcoming', -- 'active' (abierto para reserva), 'upcoming' (pronto), 'history' (pasado)
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reservaciones (El responsable de la reserva individual o grupal)
create table public.registrations (
  id uuid default uuid_generate_v4() primary key,
  camp_id uuid references public.camps(id) not null,
  reg_type text not null, -- 'individual' o 'group'
  group_size int default 1 not null,
  
  -- Datos del titular
  responsable_name text not null,
  responsable_lastname text not null,
  responsable_age int not null,
  responsable_phone text not null,
  responsable_email text not null,
  
  -- Iglesia
  is_from_church boolean default false not null,
  church_name text,
  
  -- Estado
  payment_status text default 'pending' not null, -- 'pending', 'paid', 'cancelled'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Acompañantes (Dependientes de una reservación grupal)
create table public.companions (
  id uuid default uuid_generate_v4() primary key,
  registration_id uuid references public.registrations(id) on delete cascade not null,
  name text not null,
  lastname text not null,
  age int not null,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Timeline (Eventos históricos para la sección "Nuestra Historia")
create table public.timeline_events (
  id uuid default uuid_generate_v4() primary key,
  year text not null,
  title text not null,
  location text not null,
  description text not null,
  image_url text not null,
  sort_order int default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Galería General (Fotos del Hero y galería pública)
create table public.gallery_images (
  id uuid default uuid_generate_v4() primary key,
  type text not null, -- 'hero_bg' (la foto de entrada gigante) o 'gallery' (cuadritos)
  image_url text not null,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Buzón de Contacto (Mensajes de la web pública)
create table public.contact_messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  is_read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


/* ==============================================
 * 2. REGLAS DE SEGURIDAD (Row Level Security - RLS)
 * ============================================== */

-- Habilitar RLS en todas las tablas
alter table public.camps enable row level security;
alter table public.registrations enable row level security;
alter table public.companions enable row level security;
alter table public.timeline_events enable row level security;
alter table public.gallery_images enable row level security;
alter table public.contact_messages enable row level security;

-- PERMISOS PÚBLICOS (Cualquiera en tu página web puede hacer esto:)
-- 1. Ver campamentos activos o próximos
create policy "Public_Read_Camps" on public.camps for select to public using (status != 'history');
-- 2. Ver la historia (timeline)
create policy "Public_Read_Timeline" on public.timeline_events for select to public using (true);
-- 3. Ver fotos de la galería activas
create policy "Public_Read_Gallery" on public.gallery_images for select to public using (is_active = true);
-- 4. INSERTAR una nueva reservación (Nadie publico puede LEER la de otros, solo insertar)
create policy "Public_Insert_Registrations" on public.registrations for insert to public with check (true);
-- 5. INSERTAR acompañantes
create policy "Public_Insert_Companions" on public.companions for insert to public with check (true);
-- 6. Enviar mensajes de contacto
create policy "Public_Insert_Contact" on public.contact_messages for insert to public with check (true);


-- PERMISOS ADMINISTRADOR (Solo tú logueado en Supabase / Auth Panel en el /admin)
-- Como el Dashboard de React usará Supabase Auth, los usuarios logueados ('authenticated') 
-- tendrán control absoluto sobre todo.
create policy "Admin_All_Camps" on public.camps for all to authenticated using (true);
create policy "Admin_All_Registrations" on public.registrations for all to authenticated using (true);
create policy "Admin_All_Companions" on public.companions for all to authenticated using (true);
create policy "Admin_All_Timeline" on public.timeline_events for all to authenticated using (true);
create policy "Admin_All_Gallery" on public.gallery_images for all to authenticated using (true);
create policy "Admin_All_Contact" on public.contact_messages for all to authenticated using (true);


/* ==============================================
 * 3. STORAGE BUCKET (Ejecuta en Dashboard > Storage)
 * ============================================== 
 *
 * Crea un bucket llamado "gallery" con acceso público.
 * En el Dashboard de Supabase:
 *   1. Ve a Storage
 *   2. Haz clic en "New Bucket"
 *   3. Nombre: gallery
 *   4. Habilita "Public bucket" (para que las URLs sean accesibles públicamente)
 *   5. Confirma.
 *
 * Luego añade estas políticas de Storage:
 */

-- Permitir a cualquiera leer imágenes del bucket "gallery"
create policy "Public_Read_Gallery_Storage"
on storage.objects for select
to public
using (bucket_id = 'gallery');

-- Permitir a usuarios autenticados (admin) subir imágenes
create policy "Admin_Upload_Gallery_Storage"
on storage.objects for insert
to authenticated
with check (bucket_id = 'gallery');

-- Permitir a admin borrar imágenes
create policy "Admin_Delete_Gallery_Storage"
on storage.objects for delete
to authenticated
using (bucket_id = 'gallery');
