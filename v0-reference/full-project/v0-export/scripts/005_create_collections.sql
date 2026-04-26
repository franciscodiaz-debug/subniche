-- Collection Mode: Create tables for user collections, wishlist, and value tracking

-- Collections table (folders/groups of items)
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  privacy TEXT DEFAULT 'private' CHECK (privacy IN ('public', 'private', 'shared')),
  share_token UUID DEFAULT gen_random_uuid(), -- For generating shareable links
  is_wishlist BOOLEAN DEFAULT FALSE, -- True for wishlist collections
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collection items table (items within collections)
-- Can link to existing listings OR be standalone collection-only items
CREATE TABLE IF NOT EXISTS collection_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL, -- Optional link to a listing
  
  -- Item details (used when not linked to a listing, or to override)
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  category TEXT,
  subcategory TEXT,
  condition TEXT,
  
  -- Value tracking
  user_estimated_value DECIMAL(10,2), -- User's stated value
  ai_suggested_value DECIMAL(10,2), -- AI-generated value estimate
  ai_value_updated_at TIMESTAMPTZ, -- When AI value was last updated
  purchase_price DECIMAL(10,2), -- What user paid (for tracking gains)
  purchase_date DATE,
  
  -- Wishlist-specific fields
  is_owned BOOLEAN DEFAULT TRUE, -- False for wishlist items
  priority INTEGER DEFAULT 0, -- For wishlist sorting (higher = more wanted)
  
  -- Metadata
  notes TEXT, -- Personal notes about the item
  custom_attributes JSONB DEFAULT '{}'::JSONB, -- Flexible attributes per niche
  sort_order INTEGER DEFAULT 0, -- For manual ordering
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Collection shares table (for tracking who has access to shared collections)
CREATE TABLE IF NOT EXISTS collection_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- Null for link-based shares
  can_comment BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(collection_id, shared_with_user_id)
);

-- Collection comments table (for social engagement)
CREATE TABLE IF NOT EXISTS collection_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES collection_items(id) ON DELETE CASCADE, -- Optional: comment on specific item
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_comments ENABLE ROW LEVEL SECURITY;

-- RLS policies for collections
CREATE POLICY "Users can view own collections"
  ON collections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public collections"
  ON collections FOR SELECT
  USING (privacy = 'public');

CREATE POLICY "Users can view shared collections"
  ON collections FOR SELECT
  USING (
    privacy = 'shared' AND (
      EXISTS (
        SELECT 1 FROM collection_shares cs 
        WHERE cs.collection_id = id 
        AND cs.shared_with_user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create own collections"
  ON collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own collections"
  ON collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own collections"
  ON collections FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for collection_items
CREATE POLICY "Users can view items in accessible collections"
  ON collection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections c 
      WHERE c.id = collection_id 
      AND (
        c.user_id = auth.uid() 
        OR c.privacy = 'public'
        OR (c.privacy = 'shared' AND EXISTS (
          SELECT 1 FROM collection_shares cs 
          WHERE cs.collection_id = c.id 
          AND cs.shared_with_user_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Users can manage items in own collections"
  ON collection_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collections c 
      WHERE c.id = collection_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in own collections"
  ON collection_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM collections c 
      WHERE c.id = collection_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items in own collections"
  ON collection_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM collections c 
      WHERE c.id = collection_id 
      AND c.user_id = auth.uid()
    )
  );

-- RLS policies for collection_shares
CREATE POLICY "Collection owners can manage shares"
  ON collection_shares FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM collections c 
      WHERE c.id = collection_id 
      AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own shares"
  ON collection_shares FOR SELECT
  USING (shared_with_user_id = auth.uid());

-- RLS policies for collection_comments
CREATE POLICY "Users can view comments on accessible collections"
  ON collection_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections c 
      WHERE c.id = collection_id 
      AND (
        c.user_id = auth.uid() 
        OR c.privacy = 'public'
        OR (c.privacy = 'shared' AND EXISTS (
          SELECT 1 FROM collection_shares cs 
          WHERE cs.collection_id = c.id 
          AND cs.shared_with_user_id = auth.uid()
        ))
      )
    )
  );

CREATE POLICY "Users can create comments on accessible collections"
  ON collection_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM collections c 
      WHERE c.id = collection_id 
      AND (
        c.user_id = auth.uid() 
        OR c.privacy = 'public'
        OR (c.privacy = 'shared' AND EXISTS (
          SELECT 1 FROM collection_shares cs 
          WHERE cs.collection_id = c.id 
          AND cs.shared_with_user_id = auth.uid()
          AND cs.can_comment = TRUE
        ))
      )
    )
  );

CREATE POLICY "Users can update own comments"
  ON collection_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON collection_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_privacy ON collections(privacy);
CREATE INDEX IF NOT EXISTS idx_collections_share_token ON collections(share_token);
CREATE INDEX IF NOT EXISTS idx_collection_items_collection ON collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_listing ON collection_items(listing_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_owned ON collection_items(is_owned);
CREATE INDEX IF NOT EXISTS idx_collection_shares_collection ON collection_shares(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_shares_user ON collection_shares(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_collection_comments_collection ON collection_comments(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_comments_item ON collection_comments(item_id);
