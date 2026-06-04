-- 1. Proteção de user_progress
-- Removemos INSERT/UPDATE direto do cliente para campos sensíveis
DROP POLICY IF EXISTS "progress_own" ON public.user_progress;

-- Usuários só podem ler seu progresso
CREATE POLICY "progress_read_own" ON public.user_progress
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Permitimos que o sistema (service_role) gerencie tudo
GRANT ALL ON public.user_progress TO service_role;

-- 2. Proteção de achievements
-- Usuários não podem criar ou alterar suas próprias conquistas (evita auto-atribuição de prêmios)
DROP POLICY IF EXISTS "achievements_own" ON public.achievements;

CREATE POLICY "achievements_read_own" ON public.achievements
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Apenas o service_role pode inserir ou atualizar conquistas
GRANT ALL ON public.achievements TO service_role;

-- 3. Proteção de profiles (planos e acesso)
-- Impedimos que o usuário altere seu próprio nível de acesso ou plano
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Criamos uma política que permite apenas SELECT
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Permitimos UPDATE apenas em colunas não sensíveis via trigger ou restrição (aqui removemos a política ampla)
-- Para permitir que o usuário ainda edite nome/idioma/tema de forma segura:
CREATE POLICY "profiles_update_safe_fields" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
    auth.uid() = user_id AND (
        -- Garante que campos sensíveis não sejam alterados no UPDATE
        (plan_type IS NOT DISTINCT FROM (SELECT plan_type FROM public.profiles WHERE id = auth.uid())) AND
        (access_level IS NOT DISTINCT FROM (SELECT access_level FROM public.profiles WHERE id = auth.uid())) AND
        (features_expires_at IS NOT DISTINCT FROM (SELECT features_expires_at FROM public.profiles WHERE id = auth.uid())) AND
        (plan_started_at IS NOT DISTINCT FROM (SELECT plan_started_at FROM public.profiles WHERE id = auth.uid()))
    )
);

-- 4. Proteção de viral_shares (Privacidade)
-- Ocultamos IP e User Agent do dono do lead
DROP POLICY IF EXISTS "viral_select_owner" ON public.viral_shares;

-- Criamos uma View para acesso seguro (opcional, mas aqui vamos apenas restringir a política para não vazar os campos se possível, 
-- ou simplesmente remover o acesso direto se não for essencial para o frontend)
-- Como RLS é por linha e não por coluna no SELECT, a recomendação é usar uma política que permita apenas o necessário.
-- Para realmente esconder colunas, o ideal seria uma View, mas vamos garantir que o acesso seja restrito.

CREATE POLICY "viral_select_owner_safe" ON public.viral_shares
FOR SELECT TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.quiz_leads
        WHERE id = viral_shares.lead_id
        AND user_id = auth.uid()
    )
);

-- Nota: Para esconder colunas específicas no SELECT via API, o ideal é revogar SELECT no nível de coluna para roles públicas
REVOKE SELECT (ip_hash, user_agent) ON public.viral_shares FROM authenticated;
REVOKE SELECT (ip_hash, user_agent) ON public.viral_shares FROM anon;
GRANT SELECT (ip_hash, user_agent) ON public.viral_shares TO service_role;
