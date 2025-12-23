-- Update/migrate presentation_session table for OXOS Presentation collaborative mode
-- This script updates the existing table if needed

-- Add current_slide column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'presentation_session'
        AND column_name = 'current_slide'
    ) THEN
        ALTER TABLE presentation_session ADD COLUMN current_slide INTEGER DEFAULT -1;
    END IF;
END $$;

-- Ensure we have at least one row for the session (reset to -1)
INSERT INTO presentation_session (current_slide)
VALUES (-1)
ON CONFLICT DO NOTHING;

-- If table already has rows, just ensure current_slide is set to -1 for reset
UPDATE presentation_session SET current_slide = -1;

-- Enable Row Level Security if not already enabled
ALTER TABLE presentation_session ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists and recreate
DROP POLICY IF EXISTS "Allow all operations on presentation_session" ON presentation_session;

CREATE POLICY "Allow all operations on presentation_session"
ON presentation_session
FOR ALL
USING (true)
WITH CHECK (true);

-- Enable real-time for this table (safe to run multiple times)
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE presentation_session;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create or replace function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_presentation_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_presentation_session_timestamp ON presentation_session;

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_presentation_session_timestamp
BEFORE UPDATE ON presentation_session
FOR EACH ROW
EXECUTE FUNCTION update_presentation_session_updated_at();

-- Display current state
SELECT 'Migration complete. Current state:' as message;
SELECT * FROM presentation_session;
