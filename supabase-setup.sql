-- Create Chat Sessions Table
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references public.agencies(id) on delete cascade,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'loft')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies for Chat Sessions
CREATE POLICY "Agency sees own chat sessions" 
ON public.chat_sessions FOR SELECT 
USING (agency_id = auth.uid());

CREATE POLICY "Agency inserts own chat sessions" 
ON public.chat_sessions FOR INSERT 
WITH CHECK (agency_id = auth.uid());

-- Policies for Chat Messages
CREATE POLICY "Agency sees own chat messages" 
ON public.chat_messages FOR SELECT 
USING (
  session_id IN (
    SELECT id FROM public.chat_sessions WHERE agency_id = auth.uid()
  )
);

CREATE POLICY "Agency inserts own chat messages" 
ON public.chat_messages FOR INSERT 
WITH CHECK (
  session_id IN (
    SELECT id FROM public.chat_sessions WHERE agency_id = auth.uid()
  )
);
