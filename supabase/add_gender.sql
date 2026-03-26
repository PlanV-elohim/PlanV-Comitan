-- MIGRACIÓN FINAL Y SEGURA
-- Ejecuta este script para actualizar tu base de datos sin errores.

DO $$ 
BEGIN 
    -- 1. Renombrar tabla solo si aún se llama 'companions'
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'companions') 
       AND NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'group_members') THEN 
        ALTER TABLE public.companions RENAME TO group_members; 
    END IF;

    -- 2. Corregir nombres de columnas si aún se llaman 'name'/'lastname'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='group_members' AND column_name='name') THEN
        ALTER TABLE public.group_members RENAME COLUMN name TO first_name;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='group_members' AND column_name='lastname') THEN
        ALTER TABLE public.group_members RENAME COLUMN lastname TO last_name;
    END IF;

    -- 3. Añadir columnas de género si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='registrations' AND column_name='gender') THEN
        ALTER TABLE public.registrations ADD COLUMN gender text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='group_members' AND column_name='gender') THEN
        ALTER TABLE public.group_members ADD COLUMN gender text;
    END IF;

END $$;

-- 4. Actualizar Políticas (Estas se pueden sobreescribir sin problemas)
ALTER TABLE IF EXISTS public.group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public_Insert_Companions" ON public.group_members;
CREATE POLICY "Public_Insert_Companions" ON public.group_members FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Admin_All_Companions" ON public.group_members;
CREATE POLICY "Admin_All_Companions" ON public.group_members FOR ALL TO authenticated USING (true);
