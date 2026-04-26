-- Simplify collection visibility to a single field
-- Consolidates 'privacy' + 'show_on_profile' into 'visibility'
-- Values: 'private' (only you), 'unlisted' (anyone with link), 'public' (on profile)

-- Add new visibility column
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'private' 
CHECK (visibility IN ('private', 'unlisted', 'public'));

-- Migrate existing data: 
-- If show_on_profile was true, make it 'public'
-- If privacy was 'shared' or 'public' but show_on_profile false, make it 'unlisted'
-- Otherwise keep as 'private'
UPDATE collections
SET visibility = CASE
  WHEN show_on_profile = true THEN 'public'
  WHEN privacy IN ('shared', 'public') THEN 'unlisted'
  ELSE 'private'
END;

-- Drop old columns (commented out for safety - run manually after confirming migration)
-- ALTER TABLE collections DROP COLUMN IF EXISTS privacy;
-- ALTER TABLE collections DROP COLUMN IF EXISTS show_on_profile;

-- Update RLS policies to use new visibility field
DROP POLICY IF EXISTS "Users can view public collections" ON collections;
DROP POLICY IF EXISTS "Users can view shared collections" ON collections;

CREATE POLICY "Users can view public collections"
  ON collections FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Users can view unlisted collections via share token"
  ON collections FOR SELECT
  USING (visibility = 'unlisted');
