-- Revoga acesso das versões específicas das funções identificadas
REVOKE EXECUTE ON FUNCTION public.get_shared_quiz(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_shared_quiz(text) FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.check_and_unlock_achievements(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.check_and_unlock_achievements(uuid, integer, integer, integer, boolean) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.recalculate_user_stats(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.unlock_achievement(uuid, text, text, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.mark_calendar_exported(uuid) FROM authenticated;

-- Garante acesso apenas ao service_role
GRANT EXECUTE ON FUNCTION public.get_shared_quiz(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_and_unlock_achievements(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.check_and_unlock_achievements(uuid, integer, integer, integer, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.recalculate_user_stats(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.unlock_achievement(uuid, text, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_calendar_exported(uuid) TO service_role;
