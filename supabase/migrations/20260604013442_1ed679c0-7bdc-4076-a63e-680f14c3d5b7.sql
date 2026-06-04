-- Revogar execução de todas as funções para anon e authenticated por padrão
DO $$ 
DECLARE 
    func_record RECORD;
BEGIN 
    FOR func_record IN 
        SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) as args
        FROM pg_proc p
        JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'public'
    LOOP
        EXECUTE format('REVOKE EXECUTE ON FUNCTION %I.%I(%s) FROM public, anon, authenticated', 
                       func_record.nspname, func_record.proname, func_record.args);
    END LOOP;
END $$;

-- Permitir execução apenas para service_role (uso interno/edge functions)
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Re-garantir acesso específico para funções que o frontend realmente precisa chamar
-- Apenas get_shared_quiz deve ser pública para anon/auth
GRANT EXECUTE ON FUNCTION public.get_shared_quiz(text) TO anon, authenticated;

-- Funções usadas por triggers ou chamadas via RPC segura
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION public.recalculate_user_stats(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unlock_achievement(uuid, text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_and_unlock_achievements(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_calendar_exported(uuid) TO authenticated;

-- Garantir que funções de gatilho (triggers) funcionem
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.trg_diagnoses_gamify() TO service_role;
GRANT EXECUTE ON FUNCTION public.trg_calendar_tasks_gamify() TO service_role;
GRANT EXECUTE ON FUNCTION public.trg_compass_analyses_gamify() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_profile_progress() TO service_role;
