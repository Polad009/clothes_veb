-- Applied to production 2026-11-12 (Supabase security advisor: function_search_path_mutable,
-- anon/authenticated_security_definer_function_executable).
-- The sign-up trigger runs as owner; pin its search_path and make sure nobody can call it over the API.
alter function public.handle_new_user() set search_path = public, pg_temp;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
