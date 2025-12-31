-- Add per-dispatch member permission overrides
-- This allows coordinators to grant specific visibility layers to individual dispatch members

ALTER TABLE public.dispatch_submissions 
ADD COLUMN IF NOT EXISTS member_permissions JSONB DEFAULT '{}';

COMMENT ON COLUMN public.dispatch_submissions.member_permissions IS 
'Per-member permission overrides. Format: { "profile_id": ["awareness", "planning", "coordination", "outcomes"] }. Empty array or missing key uses default role-based permissions.';

-- Add constraint to ensure valid JSON object
ALTER TABLE public.dispatch_submissions
ADD CONSTRAINT dispatch_member_permissions_json_check 
CHECK (member_permissions IS NULL OR jsonb_typeof(member_permissions) = 'object');
