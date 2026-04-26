-- Add communities support for social marketplace features

-- Communities table
CREATE TABLE IF NOT EXISTS communities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- emoji or icon identifier
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User community memberships
CREATE TABLE IF NOT EXISTS user_communities (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, community_id)
);

-- Offers table for marketplace transactions
CREATE TABLE IF NOT EXISTS offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Insert some default communities for disc golf
INSERT INTO communities (name, slug, description, icon) VALUES
  ('Austin Disc Golf', 'austin-disc-golf', 'Local disc golfers in the Austin, TX area', '🌳'),
  ('DFW Disc Golf', 'dfw-disc-golf', 'Dallas-Fort Worth disc golf community', '⛳'),
  ('Houston Disc Golf', 'houston-disc-golf', 'Houston area disc golfers', '🌴'),
  ('PDGA Members', 'pdga-members', 'Professional Disc Golf Association members', '🏆'),
  ('Disc Collectors', 'disc-collectors', 'Rare and collectible disc enthusiasts', '💿'),
  ('Tournament Players', 'tournament-players', 'Competitive tournament players', '🥇')
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- RLS policies for communities
CREATE POLICY "Communities are viewable by everyone"
  ON communities FOR SELECT USING (true);

-- RLS policies for user_communities
CREATE POLICY "User communities are viewable by everyone"
  ON user_communities FOR SELECT USING (true);

CREATE POLICY "Users can join communities"
  ON user_communities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave communities"
  ON user_communities FOR DELETE
  USING (auth.uid() = user_id);

-- RLS policies for offers
CREATE POLICY "Users can view their own offers"
  ON offers FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create offers"
  ON offers FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipients can update offer status"
  ON offers FOR UPDATE
  USING (auth.uid() = recipient_id);
