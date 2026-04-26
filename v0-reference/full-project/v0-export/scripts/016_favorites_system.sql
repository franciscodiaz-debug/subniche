-- Favorites System: Following (users, collections, items) and Saved Searches

-- =============================================================================
-- USER FOLLOWS TABLE (for following users and collections)
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- What is being followed (one of these will be set)
  followed_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  followed_collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure only one follow type is set
  CONSTRAINT follow_type_check CHECK (
    (followed_user_id IS NOT NULL AND followed_collection_id IS NULL) OR
    (followed_user_id IS NULL AND followed_collection_id IS NOT NULL)
  ),
  
  -- Prevent duplicate follows
  CONSTRAINT unique_user_follow UNIQUE (follower_id, followed_user_id),
  CONSTRAINT unique_collection_follow UNIQUE (follower_id, followed_collection_id),
  
  -- Prevent self-follow for users
  CONSTRAINT no_self_follow CHECK (follower_id != followed_user_id)
);

-- =============================================================================
-- WATCHLIST ITEMS TABLE (for following/watching specific listings)
-- Separate from user_follows because items have different tracking needs
-- =============================================================================
CREATE TABLE IF NOT EXISTS watchlist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  
  -- Price tracking (for price drop alerts)
  price_when_added DECIMAL(10,2),
  last_known_price DECIMAL(10,2),
  price_drop_alert BOOLEAN DEFAULT TRUE,
  
  -- Notes
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate watchlist entries
  CONSTRAINT unique_watchlist_item UNIQUE (user_id, listing_id)
);

-- =============================================================================
-- SAVED SEARCHES TABLE (search criteria with alert settings)
-- =============================================================================
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Search identification
  name TEXT NOT NULL,
  
  -- Search criteria (stored as JSONB for flexibility)
  -- Example: {"query": "les paul", "category": "Guitars", "minPrice": 500, "maxPrice": 2000, "condition": ["Excellent", "Good"]}
  search_criteria JSONB NOT NULL DEFAULT '{}'::JSONB,
  
  -- Alert settings
  alerts_enabled BOOLEAN DEFAULT TRUE,
  alert_frequency TEXT DEFAULT 'instant' CHECK (alert_frequency IN ('instant', 'daily', 'weekly')),
  alert_email BOOLEAN DEFAULT FALSE,
  alert_sms BOOLEAN DEFAULT FALSE,
  
  -- Stats
  last_checked_at TIMESTAMPTZ,
  new_matches_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ACTIVITY FEED TABLE (for storing events from followed users/collections)
-- This will power the homepage feed
-- =============================================================================
CREATE TABLE IF NOT EXISTS activity_feed_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Who generated this event
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Event type
  event_type TEXT NOT NULL CHECK (event_type IN (
    'listing_created',      -- User listed something for sale/trade
    'collection_item_added', -- User added item to a public collection
    'collection_created',   -- User created a new public collection
    'price_changed',        -- Listing price was updated
    'item_sold',            -- Item was marked as sold
    'item_traded'           -- Item was marked as traded
  )),
  
  -- References (one or more may be set depending on event type)
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  collection_item_id UUID REFERENCES collection_items(id) ON DELETE CASCADE,
  
  -- Event-specific data (e.g., old_price/new_price for price changes)
  event_data JSONB DEFAULT '{}'::JSONB,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed_events ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES FOR USER_FOLLOWS
-- =============================================================================

-- Users can view their own follows
CREATE POLICY "Users can view own follows"
  ON user_follows FOR SELECT
  USING (auth.uid() = follower_id);

-- Users can see who follows them
CREATE POLICY "Users can see their followers"
  ON user_follows FOR SELECT
  USING (auth.uid() = followed_user_id);

-- Collection owners can see who follows their collections
CREATE POLICY "Collection owners can see collection followers"
  ON user_follows FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM collections c 
      WHERE c.id = followed_collection_id 
      AND c.user_id = auth.uid()
    )
  );

-- Users can create follows
CREATE POLICY "Users can create follows"
  ON user_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Users can delete their own follows
CREATE POLICY "Users can delete own follows"
  ON user_follows FOR DELETE
  USING (auth.uid() = follower_id);

-- =============================================================================
-- RLS POLICIES FOR WATCHLIST_ITEMS
-- =============================================================================

-- Users can only view their own watchlist
CREATE POLICY "Users can view own watchlist"
  ON watchlist_items FOR SELECT
  USING (auth.uid() = user_id);

-- Users can add to their own watchlist
CREATE POLICY "Users can add to own watchlist"
  ON watchlist_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own watchlist items
CREATE POLICY "Users can update own watchlist items"
  ON watchlist_items FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can remove from their own watchlist
CREATE POLICY "Users can remove from own watchlist"
  ON watchlist_items FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- RLS POLICIES FOR SAVED_SEARCHES
-- =============================================================================

-- Users can only view their own saved searches
CREATE POLICY "Users can view own saved searches"
  ON saved_searches FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own saved searches
CREATE POLICY "Users can create own saved searches"
  ON saved_searches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own saved searches
CREATE POLICY "Users can update own saved searches"
  ON saved_searches FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own saved searches
CREATE POLICY "Users can delete own saved searches"
  ON saved_searches FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================================
-- RLS POLICIES FOR ACTIVITY_FEED_EVENTS
-- =============================================================================

-- Users can view events from users/collections they follow
CREATE POLICY "Users can view followed activity"
  ON activity_feed_events FOR SELECT
  USING (
    -- User follows the actor
    EXISTS (
      SELECT 1 FROM user_follows uf 
      WHERE uf.follower_id = auth.uid() 
      AND uf.followed_user_id = actor_id
    )
    OR
    -- User follows the collection (for collection events)
    EXISTS (
      SELECT 1 FROM user_follows uf 
      WHERE uf.follower_id = auth.uid() 
      AND uf.followed_collection_id = collection_id
    )
    OR
    -- User is viewing their own activity
    auth.uid() = actor_id
  );

-- System can insert events (typically done via triggers or backend)
CREATE POLICY "Actors can create their own events"
  ON activity_feed_events FOR INSERT
  WITH CHECK (auth.uid() = actor_id);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- user_follows indexes
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_followed_user ON user_follows(followed_user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_followed_collection ON user_follows(followed_collection_id);

-- watchlist_items indexes
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_listing ON watchlist_items(listing_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_created ON watchlist_items(user_id, created_at DESC);

-- saved_searches indexes
CREATE INDEX IF NOT EXISTS idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_alerts ON saved_searches(user_id, alerts_enabled) WHERE alerts_enabled = TRUE;

-- activity_feed_events indexes
CREATE INDEX IF NOT EXISTS idx_activity_feed_actor ON activity_feed_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_listing ON activity_feed_events(listing_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_collection ON activity_feed_events(collection_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created ON activity_feed_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type_created ON activity_feed_events(event_type, created_at DESC);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get follower count for a user
CREATE OR REPLACE FUNCTION get_follower_count(target_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM user_follows 
    WHERE followed_user_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get following count for a user
CREATE OR REPLACE FUNCTION get_following_count(target_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM user_follows 
    WHERE follower_id = target_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is following another user
CREATE OR REPLACE FUNCTION is_following_user(follower UUID, target UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_follows 
    WHERE follower_id = follower 
    AND followed_user_id = target
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user is following a collection
CREATE OR REPLACE FUNCTION is_following_collection(follower UUID, target_collection UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_follows 
    WHERE follower_id = follower 
    AND followed_collection_id = target_collection
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a user has an item on their watchlist
CREATE OR REPLACE FUNCTION is_on_watchlist(target_user_id UUID, target_listing_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM watchlist_items 
    WHERE user_id = target_user_id 
    AND listing_id = target_listing_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
