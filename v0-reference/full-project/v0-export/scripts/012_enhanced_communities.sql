-- Enhanced communities schema for social marketplace features
-- Adds: enhanced community table, posts, roles, listing associations

-- Step 1: Add new columns to communities table
ALTER TABLE communities ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS privacy TEXT DEFAULT 'public' CHECK (privacy IN ('public', 'private', 'invite_only'));
ALTER TABLE communities ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE communities ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE communities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Step 2: Create community_roles table for admin/mod permissions
CREATE TABLE IF NOT EXISTS community_roles (
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'moderator')),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  PRIMARY KEY (community_id, user_id)
);

-- Step 3: Create community_posts table for discussions
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_type TEXT NOT NULL CHECK (post_type IN ('discussion', 'question', 'show_and_tell')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  like_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create community_post_comments table
CREATE TABLE IF NOT EXISTS community_post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES community_post_comments(id) ON DELETE CASCADE, -- For nested replies
  content TEXT NOT NULL,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create community_post_likes table
CREATE TABLE IF NOT EXISTS community_post_likes (
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- Step 6: Create community_comment_likes table
CREATE TABLE IF NOT EXISTS community_comment_likes (
  comment_id UUID REFERENCES community_post_comments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (comment_id, user_id)
);

-- Step 7: Create community_listings junction table (associate listings with communities)
CREATE TABLE IF NOT EXISTS community_listings (
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  PRIMARY KEY (community_id, listing_id)
);

-- Step 8: Add community_ids to listings for quick filtering
ALTER TABLE listings ADD COLUMN IF NOT EXISTS community_ids UUID[] DEFAULT ARRAY[]::UUID[];

-- Enable RLS on new tables
ALTER TABLE community_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_listings ENABLE ROW LEVEL SECURITY;

-- RLS policies for community_roles
CREATE POLICY "Community roles are viewable by everyone"
  ON community_roles FOR SELECT USING (true);

CREATE POLICY "Owners and admins can manage roles"
  ON community_roles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM community_roles cr
      WHERE cr.community_id = community_roles.community_id
      AND cr.user_id = auth.uid()
      AND cr.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners and admins can update roles"
  ON community_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM community_roles cr
      WHERE cr.community_id = community_roles.community_id
      AND cr.user_id = auth.uid()
      AND cr.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Owners and admins can delete roles"
  ON community_roles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM community_roles cr
      WHERE cr.community_id = community_roles.community_id
      AND cr.user_id = auth.uid()
      AND cr.role IN ('owner', 'admin')
    )
  );

-- RLS policies for community_posts
CREATE POLICY "Posts in public communities are viewable by everyone"
  ON community_posts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = community_posts.community_id
      AND (c.privacy = 'public' OR EXISTS (
        SELECT 1 FROM user_communities uc
        WHERE uc.community_id = c.id AND uc.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Community members can create posts"
  ON community_posts FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM user_communities uc
      WHERE uc.community_id = community_posts.community_id
      AND uc.user_id = auth.uid()
    )
  );

CREATE POLICY "Authors can update own posts"
  ON community_posts FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors and mods can delete posts"
  ON community_posts FOR DELETE
  USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM community_roles cr
      WHERE cr.community_id = community_posts.community_id
      AND cr.user_id = auth.uid()
      AND cr.role IN ('owner', 'admin', 'moderator')
    )
  );

-- RLS policies for community_post_comments
CREATE POLICY "Comments are viewable if post is viewable"
  ON community_post_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM community_posts cp
      JOIN communities c ON c.id = cp.community_id
      WHERE cp.id = community_post_comments.post_id
      AND (c.privacy = 'public' OR EXISTS (
        SELECT 1 FROM user_communities uc
        WHERE uc.community_id = c.id AND uc.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Community members can create comments"
  ON community_post_comments FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM community_posts cp
      JOIN user_communities uc ON uc.community_id = cp.community_id
      WHERE cp.id = community_post_comments.post_id
      AND uc.user_id = auth.uid()
    )
  );

CREATE POLICY "Authors can update own comments"
  ON community_post_comments FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Authors and mods can delete comments"
  ON community_post_comments FOR DELETE
  USING (
    auth.uid() = author_id OR
    EXISTS (
      SELECT 1 FROM community_posts cp
      JOIN community_roles cr ON cr.community_id = cp.community_id
      WHERE cp.id = community_post_comments.post_id
      AND cr.user_id = auth.uid()
      AND cr.role IN ('owner', 'admin', 'moderator')
    )
  );

-- RLS policies for likes
CREATE POLICY "Likes are viewable by everyone"
  ON community_post_likes FOR SELECT USING (true);

CREATE POLICY "Users can like posts"
  ON community_post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON community_post_likes FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Comment likes are viewable by everyone"
  ON community_comment_likes FOR SELECT USING (true);

CREATE POLICY "Users can like comments"
  ON community_comment_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike comments"
  ON community_comment_likes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for community_listings
CREATE POLICY "Community listings are viewable if community is accessible"
  ON community_listings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = community_listings.community_id
      AND (c.privacy = 'public' OR EXISTS (
        SELECT 1 FROM user_communities uc
        WHERE uc.community_id = c.id AND uc.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Listing owners can add to communities they belong to"
  ON community_listings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings l
      WHERE l.id = community_listings.listing_id
      AND l.seller_id = auth.uid()
    ) AND
    EXISTS (
      SELECT 1 FROM user_communities uc
      WHERE uc.community_id = community_listings.community_id
      AND uc.user_id = auth.uid()
    )
  );

CREATE POLICY "Listing owners can remove from communities"
  ON community_listings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM listings l
      WHERE l.id = community_listings.listing_id
      AND l.seller_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_posts_community ON community_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON community_posts(post_type);
CREATE INDEX IF NOT EXISTS idx_community_post_comments_post ON community_post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_post_comments_author ON community_post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_community_listings_community ON community_listings(community_id);
CREATE INDEX IF NOT EXISTS idx_community_listings_listing ON community_listings(listing_id);
CREATE INDEX IF NOT EXISTS idx_community_roles_community ON community_roles(community_id);
CREATE INDEX IF NOT EXISTS idx_listings_community_ids ON listings USING GIN(community_ids);

-- Function to update post like count
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update post comment count
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update comment like count
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_post_comments SET like_count = like_count + 1 WHERE id = NEW.comment_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_post_comments SET like_count = like_count - 1 WHERE id = OLD.comment_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update community member count
CREATE OR REPLACE FUNCTION update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE communities SET member_count = member_count + 1 WHERE id = NEW.community_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE communities SET member_count = member_count - 1 WHERE id = OLD.community_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist, then create them
DROP TRIGGER IF EXISTS on_post_like_change ON community_post_likes;
CREATE TRIGGER on_post_like_change
  AFTER INSERT OR DELETE ON community_post_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

DROP TRIGGER IF EXISTS on_post_comment_change ON community_post_comments;
CREATE TRIGGER on_post_comment_change
  AFTER INSERT OR DELETE ON community_post_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comment_count();

DROP TRIGGER IF EXISTS on_comment_like_change ON community_comment_likes;
CREATE TRIGGER on_comment_like_change
  AFTER INSERT OR DELETE ON community_comment_likes
  FOR EACH ROW EXECUTE FUNCTION update_comment_like_count();

DROP TRIGGER IF EXISTS on_community_membership_change ON user_communities;
CREATE TRIGGER on_community_membership_change
  AFTER INSERT OR DELETE ON user_communities
  FOR EACH ROW EXECUTE FUNCTION update_community_member_count();
