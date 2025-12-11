-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL, -- Generated in browser, stored in localStorage
  title TEXT, -- Auto-generated from first message
  model TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  kb_match_id TEXT, -- Optional: which KB entry was used
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_conversations_client_id ON conversations(client_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- RLS (Row Level Security) Policies

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Public can read their own conversations by client_id
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  TO anon
  USING (client_id::text = current_setting('request.jwt.claims', true)::json->>'client_id');

-- Public can insert conversations with their client_id
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  TO anon
  WITH CHECK (true);

-- Public can update their own conversations
CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  TO anon
  USING (client_id::text = current_setting('request.jwt.claims', true)::json->>'client_id');

-- Public can view messages in their conversations
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  TO anon
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE client_id::text = current_setting('request.jwt.claims', true)::json->>'client_id'
    )
  );

-- Public can insert messages
CREATE POLICY "Users can create messages"
  ON messages FOR INSERT
  TO anon
  WITH CHECK (true);

-- Admins can see everything (authenticated users)
CREATE POLICY "Admins can view all conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage conversations"
  ON conversations FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Admins can view all messages"
  ON messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage messages"
  ON messages FOR ALL
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
