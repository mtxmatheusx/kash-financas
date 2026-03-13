
-- Create chat_conversations table
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  consultant_type TEXT NOT NULL DEFAULT 'financial',
  title TEXT NOT NULL DEFAULT 'Nova conversa',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own conversations" ON public.chat_conversations
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can create own conversations" ON public.chat_conversations
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversations" ON public.chat_conversations
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can delete own conversations" ON public.chat_conversations
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Add conversation_id to chat_messages
ALTER TABLE public.chat_messages ADD COLUMN conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE;

-- Index for fast lookups
CREATE INDEX idx_chat_conversations_user ON public.chat_conversations(user_id, updated_at DESC);
CREATE INDEX idx_chat_messages_conversation ON public.chat_messages(conversation_id, created_at);
