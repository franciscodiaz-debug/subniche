-- Add seller defaults to profiles table
-- These are used to auto-fill listing forms and can be overridden per-item

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_payment_methods text[] DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_logistics text DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_return_policy text DEFAULT NULL;

-- Add fields to collection_items to track if they're using defaults or custom values
ALTER TABLE collection_items ADD COLUMN IF NOT EXISTS uses_default_payment_methods boolean DEFAULT true;
ALTER TABLE collection_items ADD COLUMN IF NOT EXISTS uses_default_logistics boolean DEFAULT true;
ALTER TABLE collection_items ADD COLUMN IF NOT EXISTS uses_default_return_policy boolean DEFAULT true;

-- Comment explaining the system
COMMENT ON COLUMN profiles.default_payment_methods IS 'User default payment methods for For Sale/For Trade listings';
COMMENT ON COLUMN profiles.default_logistics IS 'User default logistics preference (shipping, local_pickup, both)';
COMMENT ON COLUMN profiles.default_return_policy IS 'User default return policy text';

COMMENT ON COLUMN collection_items.uses_default_payment_methods IS 'If true, uses profile default. If false, uses custom value in sale_payment_methods';
COMMENT ON COLUMN collection_items.uses_default_logistics IS 'If true, uses profile default. If false, uses custom value in sale_logistics';
COMMENT ON COLUMN collection_items.uses_default_return_policy IS 'If true, uses profile default. If false, uses custom value in sale_return_policy';
