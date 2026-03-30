-- ==========================================
-- FASE 1: PERFILES DE USUARIO (ACAMPANTES)
-- ==========================================

-- 1. Tabla de Perfiles Públicos (vinculada a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar RLS (Row Level Security) para Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Profiles
CREATE POLICY "Public profiles are viewable by everyone." 
    ON public.profiles FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own profile." 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 2. Trigger para crear perfil automáticamente al registrarse en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Borrar trigger si existe y recrearlo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ==========================================
-- FASE 2: GAMIFICACIÓN (INSIGNIAS)
-- ==========================================

-- 1. Catálogo de Insignias
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges are viewable by everyone" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Only admins can modify badges" ON public.badges FOR ALL USING (auth.jwt() ->> 'email' IN (SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))));

-- 2. Insignias Otorgadas a Usuarios
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
    awarded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, badge_id) -- Un usuario no puede tener la misma insignia dos veces
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User badges are viewable by everyone" ON public.user_badges FOR SELECT USING (true);
-- Los admins (y las funciones del sistema) asigan las insignias
