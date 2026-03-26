-- Añadir soporte para campamentos en la galería
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='gallery_images' AND column_name='camp_id'
    ) THEN 
        ALTER TABLE public.gallery_images ADD COLUMN camp_id UUID REFERENCES public.camps(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Añadir columna caption para descripciones de fotos
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='gallery_images' AND column_name='caption'
    ) THEN 
        ALTER TABLE public.gallery_images ADD COLUMN caption TEXT;
    END IF;
END $$;

-- Asegurar que las políticas de RLS permitan ver estas nuevas columnas
-- (Las políticas existentes con 'SELECT to public' ya cubren esto)
