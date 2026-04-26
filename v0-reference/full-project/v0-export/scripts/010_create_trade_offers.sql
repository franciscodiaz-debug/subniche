-- Trade offers table
-- Allows users to offer one or more of their items + optional cash for another user's listing

CREATE TABLE IF NOT EXISTS trade_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cash_amount DECIMAL(10, 2) DEFAULT 0,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'countered', 'expired', 'withdrawn')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

-- Trade offer items - the items being offered in the trade
CREATE TABLE IF NOT EXISTS trade_offer_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_offer_id UUID NOT NULL REFERENCES trade_offers(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trade_offers_listing ON trade_offers(listing_id);
CREATE INDEX IF NOT EXISTS idx_trade_offers_sender ON trade_offers(sender_id);
CREATE INDEX IF NOT EXISTS idx_trade_offers_recipient ON trade_offers(recipient_id);
CREATE INDEX IF NOT EXISTS idx_trade_offers_status ON trade_offers(status);
CREATE INDEX IF NOT EXISTS idx_trade_offer_items_offer ON trade_offer_items(trade_offer_id);

-- RLS policies
ALTER TABLE trade_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_offer_items ENABLE ROW LEVEL SECURITY;

-- Users can view trade offers they sent or received
CREATE POLICY "Users can view own trade offers"
  ON trade_offers FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can create trade offers
CREATE POLICY "Users can create trade offers"
  ON trade_offers FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Users can update their own trade offers (withdraw) or received offers (accept/decline)
CREATE POLICY "Users can update trade offers"
  ON trade_offers FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Trade offer items policies
CREATE POLICY "Users can view trade offer items"
  ON trade_offer_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trade_offers 
      WHERE trade_offers.id = trade_offer_items.trade_offer_id 
      AND (trade_offers.sender_id = auth.uid() OR trade_offers.recipient_id = auth.uid())
    )
  );

CREATE POLICY "Users can create trade offer items"
  ON trade_offer_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trade_offers 
      WHERE trade_offers.id = trade_offer_items.trade_offer_id 
      AND trade_offers.sender_id = auth.uid()
    )
  );
