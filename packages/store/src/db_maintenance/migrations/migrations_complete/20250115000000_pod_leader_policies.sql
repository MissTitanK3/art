-- Pods: broaden visibility and allow pod leaders to create pods
DROP POLICY IF EXISTS pods_select_all_authenticated ON public.pods;
CREATE POLICY pods_select_all_authenticated
ON public.pods
FOR SELECT
TO authenticated
USING (TRUE);

DROP POLICY IF EXISTS pod_leaders_insert_pods ON public.pods;
CREATE POLICY pod_leaders_insert_pods
ON public.pods
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.access_role = ANY (ARRAY['pod_leader','dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
