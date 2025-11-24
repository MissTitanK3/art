DROP POLICY IF EXISTS leaders_view_pods ON public.pods;
CREATE POLICY leaders_view_pods
ON public.pods
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['pod_leader','trainer','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);