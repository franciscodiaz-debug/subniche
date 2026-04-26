-- Favorites System Migration v3
-- Clean slate - drops and recreates tables

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS activity_feed_events CASCADE;
DROP TABLE IF EXISTS saved_searches CASCADE;
DROP TABLE IF EXISTS watchlist_items CASCADE;
DROP TABLE IF EXISTS user_follows CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_user_follower_count(UUID);
DROP FUNCTION IF EXISTS get_collection_follower_count(UUID);
DROP FUNCTION IF EXISTS is_following_user(UUID, UUID);
DROP FUNCTION IF EXISTS is_following_collection(UUID, UUID);
DROP FUNCTION IF EXISTS is_watching_listing(UUID, UUID);

-- =====================================================
-- USER_FOLLOWS TABLE
-- For following users and collections (relationship-based)
-- =====================================================
CREATE TABLE user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Polymorphic target - one of these will be set
  followed_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  followed_collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Ensure only one target type is set
  CONSTRAINT follow_target_check CHECK (
    (followed_user_id IS NOT NULL AND followed_collection_id IS NULL) OR
    (followed_user_id IS NULL AND followed_collection_id IS NOT NULL)
  ),
  
  -- Prevent duplicate follows
  CONSTRAINT unique_user_follow UNIQUE (follower_id, followed_user_id),
  CONSTRAINT unique_collection_follow UNIQUE (follower_id, followed_collection_id),
  
  -- Prevent self-follow
  CONSTRAINT no_self_follow CHECK (follower_id != followed_user_id)
);

-- Indexes for user_follows
CREATE INDEX idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX idx_user_follows_followed_user ON user_follows(followed_user_id) WHERE followed_user_id IS NOT NULL;
CREATE INDEX idx_user_follows_followed_collection ON user_follows(followed_collection_id) WHERE followed_collection_id IS NOT NULL;

-- RLS for user_follows
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own follows"
  ON user_follows FOR SELECT
  USING (follower_id = auth.uid());

CREATE POLICY "Users can insert own follows"
  ON user_follows FOR INSERT
  WITH CHECK (follower_id = auth.uid());

CREATE POLICY "Users can delete own follows"
  ON user_follows FOR DELETE
  USING (follower_id = auth.uid());

-- Allow users to see who follows their content (for follower counts)
CREATE POLICY "Users can view follows on their content"
  ON user_follows FOR SELECT
  USING (
    followed_user_id = auth.uid() OR
    followed_collection_id IN (SELECT id FROM collections WHERE user_id = auth.uid())
  );

-- =====================================================
-- WATCHLIST_ITEMS TABLE  
-- For following/watching specific listings (transactional intent)
-- =====================================================
CREATE TABLE watchlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  
  -- Price tracking
  price_at_watch DECIMAL(10,2), -- Price when user started watching
  
  -- Notification preferences for this specific item
  notify_price_drop BOOLEAN DEFAULT true,
  notify_sold BOOLEAN DEFAULT true,
  
  -- Metadata
  notes TEXT, -- User's private notes about this item
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Prevent duplicate watches
  CONSTRAINT unique_watchlist_item UNIQUE (user_id, listing_id)
);

-- Indexes for watchlist_items
CREATE INDEX idx_watchlist_user ON watchlist_items(user_id);
CREATE INDEX idx_watchlist_listing ON watchlist_items(listing_id);

-- RLS for watchlist_items
ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own watchlist"
  ON watchlist_items FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own watchlist"
  ON watchlist_items FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own watchlist"
  ON watchlist_items FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own watchlist"
  ON watchlist_items FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- SAVED_SEARCHES TABLE
-- For saved search criteria with alert settings
-- =====================================================
CREATE TABLE saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Search definition
  name TEXT NOT NULL, -- User-friendly name for this search
  search_criteria JSONB NOT NULL, -- Stores filters: category, price range, condition, keywords, etc.
  
  -- Alert settings
  alerts_enabled BOOLEAN DEFAULT true,
  alert_frequency TEXT DEFAULT 'instant' CHECK (alert_frequency IN ('instant', 'daily', 'weekly')),
  alert_channels TEXT[] DEFAULT ARRAY['in_app'], -- 'in_app', 'email', 'sms'
  
  -- Tracking
  last_checked_at TIMESTAMPTZ,
  last_notified_at TIMESTAMPTZ,
  new_results_count INTEGER DEFAULT 0, -- Count of new matches since last view
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for saved_searches
CREATE INDEX idx_saved_searches_user ON saved_searches(user_id);
CREATE INDEX idx_saved_searches_alerts ON saved_searches(alerts_enabled, alert_frequency) WHERE alerts_enabled = true;

-- RLS for saved_searches
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved searches"
  ON saved_searches FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own saved searches"
  ON saved_searches FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own saved searches"
  ON saved_searches FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own saved searches"
  ON saved_searches FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- ACTIVITY_FEED_EVENTS TABLE
-- Stores events for user feeds (denormalized for fast reads)
-- =====================================================
CREATE TABLE activity_feed_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who this event is for (the feed owner)
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Event details
  event_type TEXT NOT NULL CHECK (event_type IN (
    'user_listed_item',
    'user_added_to_collection', 
    'collection_new_item',
    'followed_item_price_drop',
    'followed_item_sold',
    'saved_search_match'
  )),
  
  -- Actor (who did the action)
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Related entities (polymorphic references)
  related_listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  related_collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  related_collection_item_id UUID REFERENCES collection_items(id) ON DELETE CASCADE,
  related_saved_search_id UUID REFERENCES saved_searches(id) ON DELETE CASCADE,
  
  -- Event metadata
  event_data JSONB, -- Additional context (e.g., old price, new price for price drops)
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for activity_feed_events
CREATE INDEX idx_activity_feed_user ON activity_feed_events(target_user_id, created_at DESC);
CREATE INDEX idx_activity_feed_unread ON activity_feed_events(target_user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_activity_feed_type ON activity_feed_events(event_type);

-- RLS for activity_feed_events
ALTER TABLE activity_feed_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity feed"
  ON activity_feed_events FOR SELECT
  USING (target_user_id = auth.uid());

CREATE POLICY "System can insert activity events"
  ON activity_feed_events FOR INSERT
  WITH CHECK (true); -- System/triggers will insert these

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get follower count for a user
CREATE OR REPLACE FUNCTION get_user_follower_count(target_user_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM user_follows WHERE followed_user_id = target_user_id;
$$ LANGUAGE SQL STABLE;

-- Function to get follower count for a collection
CREATE OR REPLACE FUNCTION get_collection_follower_count(target_collection_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM user_follows WHERE followed_collection_id = target_collection_id;
$$ LANGUAGE SQL STABLE;

-- Function to check if user is following another user
CREATE OR REPLACE FUNCTION is_following_user(follower UUID, target UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM user_follows 
    WHERE follower_id = follower AND followed_user_id = target
  );
$$ LANGUAGE SQL STABLE;

-- Function to check if user is following a collection
CREATE OR REPLACE FUNCTION is_following_collection(follower UUID, target UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM user_follows 
    WHERE follower_id = follower AND followed_collection_id = target
  );
$$ LANGUAGE SQL STABLE;

-- Function to check if user is watching a listing
CREATE OR REPLACE FUNCTION is_watching_listing(watcher UUID, target UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM watchlist_items 
    WHERE user_id = watcher AND listing_id = target
  );
$$ LANGUAGE SQL STABLE;

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER watchlist_items_updated_at
  BEFORE UPDATE ON watchlist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER saved_searches_updated_at
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
