-- Add linked external marketplace accounts for trust building
-- Users can link their profiles from other platforms like eBay, Reverb, Facebook Marketplace, Etsy

CREATE TABLE IF NOT EXISTS linked_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL, -- 'ebay', 'reverb', 'facebook_marketplace', 'etsy', 'discogs', 'craigslist'
  platform_username TEXT,
  profile_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_linked_accounts_user_id ON linked_accounts(user_id);

-- RLS policies
ALTER TABLE linked_accounts ENABLE ROW LEVEL SECURITY;

-- Users can view anyone's linked accounts (for trust building)
CREATE POLICY "Anyone can view linked accounts"
  ON linked_accounts FOR SELECT
  USING (true);

-- Users can only manage their own linked accounts
CREATE POLICY "Users can insert own linked accounts"
  ON linked_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own linked accounts"
  ON linked_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own linked accounts"
  ON linked_accounts FOR DELETE
  USING (auth.uid() = user_id);
