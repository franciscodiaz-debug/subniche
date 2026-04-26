-- Enhanced Item Status System
-- Supports overlapping statuses: For Sale, For Trade, In Collection
-- Plus Wishlist items with URL source and public visibility

-- Add new columns to collection_items for enhanced status system
ALTER TABLE collection_items

-- For Sale specific fields (retained when status is toggled off)
ADD COLUMN IF NOT EXISTS sale_price numeric(12,2),
ADD COLUMN IF NOT EXISTS sale_payment_methods text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS sale_local_pickup boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sale_pickup_zip text,
ADD COLUMN IF NOT EXISTS sale_shipping_available boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sale_shipping_cost numeric(12,2),
ADD COLUMN IF NOT EXISTS sale_return_policy text,
ADD COLUMN IF NOT EXISTS sale_publish_to text[] DEFAULT ARRAY['marketplace']::text[], -- marketplace, followers, groups
ADD COLUMN IF NOT EXISTS sale_status_active boolean DEFAULT false,

-- For Trade specific fields (retained when status is toggled off)
ADD COLUMN IF NOT EXISTS trade_estimated_value numeric(12,2),
ADD COLUMN IF NOT EXISTS trade_interests text, -- Free-form trade interests description
ADD COLUMN IF NOT EXISTS trade_payment_methods text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS trade_local_pickup boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS trade_pickup_zip text,
ADD COLUMN IF NOT EXISTS trade_shipping_available boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS trade_shipping_cost numeric(12,2),
ADD COLUMN IF NOT EXISTS trade_return_policy text,
ADD COLUMN IF NOT EXISTS trade_publish_to text[] DEFAULT ARRAY['marketplace']::text[],
ADD COLUMN IF NOT EXISTS trade_status_active boolean DEFAULT false,

-- Collection specific fields
ADD COLUMN IF NOT EXISTS collection_notes text,
ADD COLUMN IF NOT EXISTS date_acquired date,
ADD COLUMN IF NOT EXISTS receipt_url text,
ADD COLUMN IF NOT EXISTS in_collection boolean DEFAULT true,

-- Wishlist specific fields
ADD COLUMN IF NOT EXISTS source_url text, -- URL where item was found
ADD COLUMN IF NOT EXISTS is_public_wishlist boolean DEFAULT false, -- Opt-in to show on profile
ADD COLUMN IF NOT EXISTS target_price numeric(12,2), -- Price user is willing to pay
ADD COLUMN IF NOT EXISTS wishlist_notes text;

-- Add column to collections table for wishlist-type tagging
ALTER TABLE collections
ADD COLUMN IF NOT EXISTS is_wishlist_type boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_wishlist_items boolean DEFAULT true; -- Viewer preference for mixed collections

-- Update the comments
COMMENT ON COLUMN collection_items.sale_status_active IS 'Whether For Sale status is currently active';
COMMENT ON COLUMN collection_items.trade_status_active IS 'Whether For Trade status is currently active';
COMMENT ON COLUMN collection_items.in_collection IS 'Whether item is in a collection (always true, but determines if placed in uncategorized)';
COMMENT ON COLUMN collection_items.source_url IS 'URL where wishlist item was found';
COMMENT ON COLUMN collection_items.is_public_wishlist IS 'Whether this wishlist item is visible to others';
COMMENT ON COLUMN collections.is_wishlist_type IS 'Tag any collection as wishlist-type';
COMMENT ON COLUMN collections.show_wishlist_items IS 'User preference to show/hide wishlist items in mixed collections';

-- Create index for finding items by active status
CREATE INDEX IF NOT EXISTS idx_collection_items_sale_active 
ON collection_items (sale_status_active) 
WHERE sale_status_active = true;

CREATE INDEX IF NOT EXISTS idx_collection_items_trade_active 
ON collection_items (trade_status_active) 
WHERE trade_status_active = true;

CREATE INDEX IF NOT EXISTS idx_collection_items_public_wishlist 
ON collection_items (is_public_wishlist) 
WHERE is_public_wishlist = true AND is_owned = false;

-- Create default "Uncategorized" collection function
-- This ensures every user has an uncategorized collection
CREATE OR REPLACE FUNCTION ensure_uncategorized_collection(p_user_id uuid)
RETURNS uuid AS $$
DECLARE
  v_collection_id uuid;
BEGIN
  -- Check if uncategorized collection exists
  SELECT id INTO v_collection_id
  FROM collections
  WHERE user_id = p_user_id AND name = 'Uncategorized'
  LIMIT 1;
  
  -- Create if not exists
  IF v_collection_id IS NULL THEN
    INSERT INTO collections (user_id, name, description, privacy)
    VALUES (p_user_id, 'Uncategorized', 'Items not assigned to a specific collection', 'private')
    RETURNING id INTO v_collection_id;
  END IF;
  
  RETURN v_collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create default "My Wishlist" collection function
CREATE OR REPLACE FUNCTION ensure_default_wishlist(p_user_id uuid)
RETURNS uuid AS $$
DECLARE
  v_collection_id uuid;
BEGIN
  -- Check if default wishlist exists
  SELECT id INTO v_collection_id
  FROM collections
  WHERE user_id = p_user_id AND is_wishlist = true AND name = 'My Wishlist'
  LIMIT 1;
  
  -- Create if not exists
  IF v_collection_id IS NULL THEN
    INSERT INTO collections (user_id, name, description, privacy, is_wishlist, is_wishlist_type)
    VALUES (p_user_id, 'My Wishlist', 'Items I want to acquire', 'private', true, true)
    RETURNING id INTO v_collection_id;
  END IF;
  
  RETURN v_collection_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
