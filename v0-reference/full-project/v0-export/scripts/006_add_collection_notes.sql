-- Add notes field to collections for collection-level notes
-- Add show_on_profile field for profile visibility control

ALTER TABLE collections ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE collections ADD COLUMN IF NOT EXISTS show_on_profile BOOLEAN DEFAULT FALSE;

-- Add index for profile display queries
CREATE INDEX IF NOT EXISTS idx_collections_show_on_profile ON collections(show_on_profile) WHERE show_on_profile = TRUE;
