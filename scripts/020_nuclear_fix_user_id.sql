-- Nuclear option: Drop and recreate ALL policies on ALL tables to ensure no user_id references exist
-- This script will completely reset all RLS policies with correct column names

-- ============================================
-- PROFILES TABLE
-- ============================================
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles CASCADE;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- INBOXES TABLE (formerly submitboxes)
-- ============================================
DROP POLICY IF EXISTS "inboxes_select_own" ON public.inboxes CASCADE;
DROP POLICY IF EXISTS "inboxes_select_public" ON public.inboxes CASCADE;
DROP POLICY IF EXISTS "inboxes_insert_own" ON public.inboxes CASCADE;
DROP POLICY IF EXISTS "inboxes_update_own" ON public.inboxes CASCADE;
DROP POLICY IF EXISTS "inboxes_delete_own" ON public.inboxes CASCADE;

-- Also drop old submitboxes policies if they still exist
DROP POLICY IF EXISTS "submitboxes_select_own" ON public.inboxes CASCADE;
DROP POLICY IF EXISTS "submitboxes_select_public" ON public.inboxes CASCADE;
DROP POLICY IF EXISTS "submitboxes_insert_own" ON public.inboxes CASCADE;
DROP POLICY IF EXISTS "submitboxes_update_own" ON public.inboxes CASCADE;
DROP POLICY IF EXISTS "submitboxes_delete_own" ON public.inboxes CASCADE;

CREATE POLICY "inboxes_select_own"
  ON public.inboxes FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "inboxes_select_public"
  ON public.inboxes FOR SELECT
  USING (is_active = true);

CREATE POLICY "inboxes_insert_own"
  ON public.inboxes FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "inboxes_update_own"
  ON public.inboxes FOR UPDATE
  USING (auth.uid() = creator_id);

CREATE POLICY "inboxes_delete_own"
  ON public.inboxes FOR DELETE
  USING (auth.uid() = creator_id);

-- ============================================
-- SUBMISSIONS TABLE
-- ============================================
DROP POLICY IF EXISTS "submissions_select_by_inbox_owner" ON public.submissions CASCADE;
DROP POLICY IF EXISTS "submissions_insert_public" ON public.submissions CASCADE;
DROP POLICY IF EXISTS "submissions_update_by_inbox_owner" ON public.submissions CASCADE;
DROP POLICY IF EXISTS "submissions_delete_by_inbox_owner" ON public.submissions CASCADE;

CREATE POLICY "submissions_select_by_inbox_owner"
  ON public.submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.inboxes
      WHERE inboxes.id = submissions.inbox_id
      AND inboxes.creator_id = auth.uid()
    )
  );

CREATE POLICY "submissions_insert_public"
  ON public.submissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.inboxes
      WHERE inboxes.id = submissions.inbox_id
      AND inboxes.is_active = true
      AND inboxes.is_paused = false
    )
  );

CREATE POLICY "submissions_update_by_inbox_owner"
  ON public.submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.inboxes
      WHERE inboxes.id = submissions.inbox_id
      AND inboxes.creator_id = auth.uid()
    )
  );

CREATE POLICY "submissions_delete_by_inbox_owner"
  ON public.submissions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.inboxes
      WHERE inboxes.id = submissions.inbox_id
      AND inboxes.creator_id = auth.uid()
    )
  );
