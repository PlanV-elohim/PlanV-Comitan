-- SCRIPT COMPLETO DE BASE DE DATOS - PLAN V ELOHIM
-- Este script es seguro para ejecutar varias veces (Idempotente)

-- 1. Habilitar extensión UUID
create extension if not exists "uuid-ossp";

/* ==============================================
 * 1. TABLAS PRINCIPALES
 * ============================================== */

-- Campamentos
create table if not exists public.camps (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  location text not null,
  date_string text not null,
  capacity int not null,
  price numeric not null,
  status text not null default 'upcoming',
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Registraciones
create table if not exists public.registrations (
  id uuid default uuid_generate_v4() primary key,
  camp_id uuid references public.camps(id) not null,
  reg_type text not null,
  group_size int default 1 not null,
  full_name text not null,
  email text not null,
  phone text not null,
  gender text, 
  payment_status text default 'pending',
  amount_paid numeric default 0,
  total_amount numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Miembros de Grupo
create table if not exists public.group_members (
  id uuid default uuid_generate_v4() primary key,
  registration_id uuid references public.registrations(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  age int not null,
  phone text,
  gender text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Itinerario
create table if not exists public.itinerary_events (
  id uuid default uuid_generate_v4() primary key,
  camp_id uuid references public.camps(id) on delete cascade not null,
  title text not null,
  description text,
  location text,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Timeline (Nuestra Historia)
create table if not exists public.timeline_events (
  id uuid default uuid_generate_v4() primary key,
  year text not null,
  date_string text,
  title text not null,
  location text not null,
  description text not null,
  image_url text not null,
  sort_order int default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Galería
create table if not exists public.gallery_images (
  id uuid default uuid_generate_v4() primary key,
  type text not null, -- 'hero_bg', 'hero_bg_text', 'hero_mobile', 'hero_mobile_text', 'gallery'
  image_url text not null,
  camp_id uuid references public.camps(id) on delete set null,
  timeline_id uuid references public.timeline_events(id) on delete set null, -- Nuevo: para agrupar por historia
  caption text,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Buzón de Contacto
create table if not exists public.contact_messages (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  is_read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

/* ==============================================
 * 2. MIGRACIONES DE COLUMNAS (Para tablas ya existentes)
 * ============================================== */

DO $$ 
BEGIN 
    -- Género en registros
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='registrations' AND column_name='gender') THEN 
        ALTER TABLE public.registrations ADD COLUMN gender TEXT;
    END IF;
    
    -- Género en miembros de grupo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='group_members' AND column_name='gender') THEN 
        ALTER TABLE public.group_members ADD COLUMN gender TEXT;
    END IF;

    -- Date string y Sort order en Timeline
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='timeline_events' AND column_name='date_string') THEN 
        ALTER TABLE public.timeline_events ADD COLUMN date_string TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='timeline_events' AND column_name='sort_order') THEN 
        ALTER TABLE public.timeline_events ADD COLUMN sort_order INT DEFAULT 0;
    END IF;

    -- Camp_id y Caption en Galería
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gallery_images' AND column_name='camp_id') THEN 
        ALTER TABLE public.gallery_images ADD COLUMN camp_id UUID REFERENCES public.camps(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gallery_images' AND column_name='caption') THEN 
        ALTER TABLE public.gallery_images ADD COLUMN caption TEXT;
    END IF;
END $$;

/* ==============================================
 * 3. SEGURIDAD (Row Level Security - RLS)
 * ============================================== */

-- Habilitar RLS en todas
alter table public.camps enable row level security;
alter table public.registrations enable row level security;
alter table public.group_members enable row level security;
alter table public.itinerary_events enable row level security;
alter table public.timeline_events enable row level security;
alter table public.gallery_images enable row level security;
alter table public.contact_messages enable row level security;

-- POLÍTICAS PÚBLICAS
drop policy if exists "Public_Read_Camps" on public.camps;
create policy "Public_Read_Camps" on public.camps for select to public using (status != 'history');

drop policy if exists "Public_Read_Timeline" on public.timeline_events;
create policy "Public_Read_Timeline" on public.timeline_events for select to public using (true);

drop policy if exists "Public_Read_Gallery" on public.gallery_images;
create policy "Public_Read_Gallery" on public.gallery_images for select to public using (is_active = true);

drop policy if exists "Public_Read_Itinerary" on public.itinerary_events;
create policy "Public_Read_Itinerary" on public.itinerary_events for select to public using (true);

drop policy if exists "Public_Insert_Registrations" on public.registrations;
create policy "Public_Insert_Registrations" on public.registrations for insert to public with check (true);

drop policy if exists "Public_Insert_Group_Members" on public.group_members;
create policy "Public_Insert_Group_Members" on public.group_members for insert to public with check (true);

drop policy if exists "Public_Insert_Contact" on public.contact_messages;
create policy "Public_Insert_Contact" on public.contact_messages for insert to public with check (true);

-- POLÍTICAS ADMINISTRADOR
drop policy if exists "Admin_All_Camps" on public.camps;
create policy "Admin_All_Camps" on public.camps for all to authenticated using (true);

drop policy if exists "Admin_All_Registrations" on public.registrations;
create policy "Admin_All_Registrations" on public.registrations for all to authenticated using (true);

drop policy if exists "Admin_All_Group_Members" on public.group_members;
create policy "Admin_All_Group_Members" on public.group_members for all to authenticated using (true);

drop policy if exists "Admin_All_Itinerary" on public.itinerary_events;
create policy "Admin_All_Itinerary" on public.itinerary_events for all to authenticated using (true);

drop policy if exists "Admin_All_Timeline" on public.timeline_events;
create policy "Admin_All_Timeline" on public.timeline_events for all to authenticated using (true);

drop policy if exists "Admin_All_Gallery" on public.gallery_images;
create policy "Admin_All_Gallery" on public.gallery_images for all to authenticated using (true);

drop policy if exists "Admin_All_Contact" on public.contact_messages;
create policy "Admin_All_Contact" on public.contact_messages for all to authenticated using (true);
