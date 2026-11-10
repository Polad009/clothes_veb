-- ==============================================================================
-- HORWALLE: LIVE CHAT IN POSTGRES
-- Replaces the per-conversation JSON files in Storage, whose read-modify-write
-- cycle lost messages when the customer and the admin wrote at the same time.
-- Additive only: the currently deployed code does not use these tables.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.chat_threads (
  session_id text PRIMARY KEY CHECK (session_id ~ '^[A-Za-z0-9_-]{8,80}$'),
  customer_name text NOT NULL DEFAULT 'Müştəri',
  customer_phone text,
  customer_email text,
  last_message text NOT NULL DEFAULT '',
  last_sender text,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  message_count integer NOT NULL DEFAULT 0,
  unread_admin integer NOT NULL DEFAULT 0,
  unread_customer integer NOT NULL DEFAULT 0,
  customer_seen_at timestamptz,
  customer_read_at timestamptz,
  admin_read_at timestamptz,
  customer_typing_until timestamptz,
  admin_typing_until timestamptz,
  is_closed boolean NOT NULL DEFAULT false,
  closed_by text,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_threads_last_message_at_idx ON public.chat_threads (last_message_at DESC);

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id text PRIMARY KEY DEFAULT ('m_' || replace(gen_random_uuid()::text, '-', '')),
  session_id text NOT NULL REFERENCES public.chat_threads(session_id) ON DELETE CASCADE,
  sender text NOT NULL CHECK (sender IN ('customer', 'admin', 'system')),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_session_created_idx ON public.chat_messages (session_id, created_at);

ALTER TABLE public.chat_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Stores one message and updates its conversation in a single transaction.
-- Creates the conversation on the first message; raises 'CHAT_CLOSED' for a closed one.
CREATE OR REPLACE FUNCTION public.chat_post_message(
  p_session text,
  p_sender text,
  p_body text,
  p_name text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_email text DEFAULT NULL
)
RETURNS public.chat_messages
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  t public.chat_threads;
  m public.chat_messages;
BEGIN
  INSERT INTO chat_threads (session_id, customer_name, customer_phone, customer_email)
  VALUES (p_session, coalesce(nullif(p_name, ''), 'Müştəri'), nullif(p_phone, ''), nullif(p_email, ''))
  ON CONFLICT (session_id) DO UPDATE SET
    customer_name  = coalesce(nullif(EXCLUDED.customer_name, 'Müştəri'), chat_threads.customer_name),
    customer_phone = coalesce(EXCLUDED.customer_phone, chat_threads.customer_phone),
    customer_email = coalesce(EXCLUDED.customer_email, chat_threads.customer_email)
  RETURNING * INTO t;  -- the upsert also locks the conversation row

  IF t.is_closed THEN
    RAISE EXCEPTION 'CHAT_CLOSED';
  END IF;

  INSERT INTO chat_messages (session_id, sender, body)
  VALUES (p_session, p_sender, p_body)
  RETURNING * INTO m;

  UPDATE chat_threads SET
    last_message    = left(p_body, 300),
    last_sender     = p_sender,
    last_message_at = m.created_at,
    message_count   = message_count + 1,
    unread_admin    = unread_admin + CASE WHEN p_sender = 'customer' THEN 1 ELSE 0 END,
    unread_customer = unread_customer + CASE WHEN p_sender = 'customer' THEN 0 ELSE 1 END,
    customer_typing_until = CASE WHEN p_sender = 'customer' THEN NULL ELSE customer_typing_until END,
    admin_typing_until    = CASE WHEN p_sender = 'admin' THEN NULL ELSE admin_typing_until END
  WHERE session_id = p_session;

  RETURN m;
END;
$$;

REVOKE ALL ON FUNCTION public.chat_post_message(text, text, text, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.chat_post_message(text, text, text, text, text, text) TO service_role;
