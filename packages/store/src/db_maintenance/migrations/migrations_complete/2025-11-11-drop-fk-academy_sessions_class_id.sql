-- Migration: Drop FK constraint on academy_sessions.class_id
ALTER TABLE public.academy_sessions
DROP CONSTRAINT IF EXISTS academy_sessions_class_id_fkey;
