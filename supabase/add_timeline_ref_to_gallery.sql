-- Añadir soporte para eventos de historia (Timeline) en la galería
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='gallery_images' AND column_name='timeline_id'
    ) THEN 
        ALTER TABLE public.gallery_images ADD COLUMN timeline_id UUID REFERENCES public.timeline_events(id) ON DELETE SET NULL;
    END IF;
END $$;
