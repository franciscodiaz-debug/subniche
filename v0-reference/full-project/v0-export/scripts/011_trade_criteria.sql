-- Trade criteria table
-- Stores what categories/items a user is willing to accept in trade for their listing or collection item

CREATE TABLE IF NOT EXISTS trade_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Either listing_id OR collection_item_id must be set (but not both)
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  collection_item_id UUID REFERENCES collection_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- Target criteria - what they're looking for
  target_category TEXT NOT NULL,
  target_subcategories TEXT[] DEFAULT ARRAY[]::TEXT[],
  acceptable_conditions TEXT[] DEFAULT ARRAY[]::TEXT[],
  min_value DECIMAL(10, 2),
  max_value DECIMAL(10, 2),
  value_flexibility TEXT DEFAULT 'flexible' CHECK (value_flexibility IN ('exact', 'flexible', 'any')),
  -- Free-text description for simple mode
  description TEXT,
  -- Whether this criteria is active
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Constraint: must have either listing_id or collection_item_id
  CONSTRAINT trade_criteria_source_check CHECK (
    (listing_id IS NOT NULL AND collection_item_id IS NULL) OR
    (listing_id IS NULL AND collection_item_id IS NOT NULL)
  )
);

-- Indexes for matching queries
CREATE INDEX IF NOT EXISTS idx_trade_criteria_listing ON trade_criteria(listing_id) WHERE listing_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trade_criteria_collection_item ON trade_criteria(collection_item_id) WHERE collection_item_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trade_criteria_user ON trade_criteria(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_criteria_category ON trade_criteria(target_category);
CREATE INDEX IF NOT EXISTS idx_trade_criteria_active ON trade_criteria(is_active) WHERE is_active = true;

-- Composite index for matching logic
CREATE INDEX IF NOT EXISTS idx_trade_criteria_matching 
ON trade_criteria(target_category, is_active) 
WHERE is_active = true;

-- RLS policies
ALTER TABLE trade_criteria ENABLE ROW LEVEL SECURITY;

-- Anyone can view trade criteria (needed for matching)
CREATE POLICY "Anyone can view trade criteria"
  ON trade_criteria FOR SELECT
  USING (true);

-- Users can create trade criteria for their own items
CREATE POLICY "Users can create trade criteria"
  ON trade_criteria FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own trade criteria
CREATE POLICY "Users can update own trade criteria"
  ON trade_criteria FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own trade criteria
CREATE POLICY "Users can delete own trade criteria"
  ON trade_criteria FOR DELETE
  USING (auth.uid() = user_id);

-- Comments
COMMENT ON TABLE trade_criteria IS 'Stores trade preferences for listings and collection items';
COMMENT ON COLUMN trade_criteria.target_category IS 'The category of items the user wants in trade';
COMMENT ON COLUMN trade_criteria.target_subcategories IS 'Specific subcategories within the target category';
COMMENT ON COLUMN trade_criteria.acceptable_conditions IS 'What conditions are acceptable (Mint, Excellent, etc.)';
COMMENT ON COLUMN trade_criteria.value_flexibility IS 'How strict the value matching should be: exact, flexible (+/-20%), or any';
COMMENT ON COLUMN trade_criteria.description IS 'Free-text description of what they want (simple mode)';
