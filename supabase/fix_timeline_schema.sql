-- Añadir columna date_string a timeline_events si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='timeline_events' AND column_name='date_string'
    ) THEN 
        ALTER TABLE public.timeline_events ADD COLUMN date_string TEXT;
    END IF;
END $$;

-- También podemos añadir una columna 'sort_order' para que puedas mover los eventos
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='timeline_events' AND column_name='sort_order'
    ) THEN 
        ALTER TABLE public.timeline_events ADD COLUMN sort_order INT DEFAULT 0;
    END IF;
END $$;
