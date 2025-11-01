-- Migration: add public_signal_link to dispatch_submissions
-- Safe to re-run

ALTER TABLE public.dispatch_submissions
  ADD COLUMN IF NOT EXISTS public_signal_link TEXT;

