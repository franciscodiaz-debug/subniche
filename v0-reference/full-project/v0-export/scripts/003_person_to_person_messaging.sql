-- Drop old conversation structure and rebuild for person-to-person messaging

-- Drop existing tables (will recreate with new schema)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Create conversations table (person-to-person, not per-listing)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Ensure unique conversation between two users (order-independent)
  CONSTRAINT unique_conversation CHECK (participant_1 < participant_2),
  CONSTRAINT unique_participants UNIQUE (participant_1, participant_2)
);

-- Create messages table with optional listing attachment
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  -- Optional listing reference - when a message is about a specific listing
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view their conversations" ON conversations 
  FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Users can create conversations" ON conversations 
  FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Participants can update conversation" ON conversations 
  FOR UPDATE USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Messages policies
CREATE POLICY "Conversation participants can view messages" ON messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = conversation_id 
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );
CREATE POLICY "Conversation participants can send messages" ON messages 
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations c 
      WHERE c.id = conversation_id 
      AND (c.participant_1 = auth.uid() OR c.participant_2 = auth.uid())
    )
  );
CREATE POLICY "Users can update own messages" ON messages 
  FOR UPDATE USING (auth.uid() = sender_id);

-- Create indexes
CREATE INDEX idx_conversations_p1 ON conversations(participant_1);
CREATE INDEX idx_conversations_p2 ON conversations(participant_2);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at);
CREATE INDEX idx_messages_listing ON messages(listing_id) WHERE listing_id IS NOT NULL;
