-- Add for_sale and for_trade flags to collection items
-- These allow owners to subtly indicate items that may be available

ALTER TABLE collection_items
ADD COLUMN IF NOT EXISTS for_sale boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS for_trade boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS asking_price numeric(12,2) DEFAULT NULL;

-- Add index for finding available items
CREATE INDEX IF NOT EXISTS idx_collection_items_availability 
ON collection_items (for_sale, for_trade) 
WHERE for_sale = true OR for_trade = true;

COMMENT ON COLUMN collection_items.for_sale IS 'Item owner is open to selling this item';
COMMENT ON COLUMN collection_items.for_trade IS 'Item owner is open to trading this item';
COMMENT ON COLUMN collection_items.asking_price IS 'Optional asking price if for_sale is true';
