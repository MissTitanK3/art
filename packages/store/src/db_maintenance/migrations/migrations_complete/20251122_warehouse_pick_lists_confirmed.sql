-- Add confirmation tracking to warehouse pick lists
-- Date: 2025-11-22

ALTER TABLE warehouse_pick_lists 
ADD COLUMN IF NOT EXISTS confirmed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS confirmed_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Index for efficient queries on confirmed pick lists
CREATE INDEX IF NOT EXISTS idx_warehouse_pick_lists_confirmed 
ON warehouse_pick_lists(confirmed, confirmed_at DESC);

COMMENT ON COLUMN warehouse_pick_lists.confirmed IS 'Whether this pick list has been confirmed by a dispatcher';
COMMENT ON COLUMN warehouse_pick_lists.confirmed_at IS 'Timestamp when the pick list was confirmed';
COMMENT ON COLUMN warehouse_pick_lists.confirmed_by IS 'Profile ID of the user who confirmed the pick list';
