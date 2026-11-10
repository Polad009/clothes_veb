-- Read receipts compare "read at" with each message's created_at, so both must come
-- from the same clock: the database's. (Stamping read times from the app server let
-- clock skew leave messages that were on screen marked as unread.)
CREATE OR REPLACE FUNCTION public.chat_mark_read(p_session text, p_role text)
RETURNS void
LANGUAGE sql
SET search_path = public
AS $$
  UPDATE chat_threads SET
    customer_read_at = CASE WHEN p_role = 'customer' THEN now() ELSE customer_read_at END,
    unread_customer  = CASE WHEN p_role = 'customer' THEN 0 ELSE unread_customer END,
    admin_read_at    = CASE WHEN p_role = 'admin' THEN now() ELSE admin_read_at END,
    unread_admin     = CASE WHEN p_role = 'admin' THEN 0 ELSE unread_admin END
  WHERE session_id = p_session;
$$;

REVOKE ALL ON FUNCTION public.chat_mark_read(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.chat_mark_read(text, text) TO service_role;
