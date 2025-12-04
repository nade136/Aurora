-- Create enum for media types if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
        CREATE TYPE media_type AS ENUM ('image', 'video');
    END IF;
END$$;

-- Create testimonials section if not exists
INSERT INTO sections (page_id, key, "order")
SELECT id, 'testimonials', 3
FROM pages 
WHERE slug = 'testimonials' 
AND NOT EXISTS (
    SELECT 1 FROM sections WHERE key = 'testimonials'
);

-- Add comments for documentation
COMMENT ON TABLE blocks IS 'Stores testimonial items with their media and metadata';
COMMENT ON COLUMN blocks.data IS 'JSONB field containing testimonial data including media URLs and metadata';
