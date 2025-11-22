-- Warehouse Schema Migration
-- Date: 2025-11-22

-- Warehouses
CREATE TABLE IF NOT EXISTS public.warehouses (
    id TEXT PRIMARY KEY,
    region_id TEXT NOT NULL,
    display_name TEXT NOT NULL,
    region_zone TEXT,
    urban_type TEXT,
    capabilities JSONB DEFAULT '[]',
    max_capacity_rating TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Warehouse Zones
CREATE TABLE IF NOT EXISTS public.warehouse_zones (
    id TEXT PRIMARY KEY,
    warehouse_id TEXT NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Warehouse Bins
CREATE TABLE IF NOT EXISTS public.warehouse_bins (
    id TEXT PRIMARY KEY,
    zone_id TEXT NOT NULL REFERENCES public.warehouse_zones(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    sort_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Warehouse Inventory
CREATE TABLE IF NOT EXISTS public.warehouse_inventory (
    id TEXT PRIMARY KEY,
    warehouse_id TEXT NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
    zone_id TEXT REFERENCES public.warehouse_zones(id) ON DELETE SET NULL,
    bin_id TEXT REFERENCES public.warehouse_bins(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    sku TEXT,
    category TEXT,
    condition TEXT,
    quantity INTEGER DEFAULT 0,
    expiration_date TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Warehouse Movement Logs
CREATE TABLE IF NOT EXISTS public.warehouse_movement_logs (
    id TEXT PRIMARY KEY,
    warehouse_id TEXT NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- intake, outflow, move, adjustment
    sku TEXT,
    item_name TEXT,
    quantity INTEGER,
    by_display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    notes TEXT,
    zone_id TEXT,
    bin_id TEXT
);

-- Warehouse Pick Lists
CREATE TABLE IF NOT EXISTS public.warehouse_pick_lists (
    id TEXT PRIMARY KEY,
    inventory_id TEXT REFERENCES public.warehouse_inventory(id) ON DELETE CASCADE,
    warehouse_id TEXT REFERENCES public.warehouses(id) ON DELETE CASCADE,
    zone_id TEXT,
    bin_id TEXT,
    item_name TEXT,
    sku TEXT,
    quantity INTEGER,
    created_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_warehouses_region ON public.warehouses(region_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_warehouse ON public.warehouse_inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_warehouse_inventory_sku ON public.warehouse_inventory(sku);
CREATE INDEX IF NOT EXISTS idx_warehouse_movement_logs_warehouse ON public.warehouse_movement_logs(warehouse_id);

-- Warehouse RLS Policies

-- Enable RLS
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_movement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouse_pick_lists ENABLE ROW LEVEL SECURITY;

-- Warehouses: Read accessible to all authenticated users
CREATE POLICY "warehouses_read_authenticated"
ON warehouses
FOR SELECT
TO authenticated
USING (TRUE);

-- Warehouses: Write restricted to admins and dispatchers
CREATE POLICY "warehouses_write_privileged"
ON warehouses
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Zones: Same as warehouses
CREATE POLICY "warehouse_zones_read_authenticated"
ON warehouse_zones
FOR SELECT
TO authenticated
USING (TRUE);

CREATE POLICY "warehouse_zones_write_privileged"
ON warehouse_zones
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Bins: Same as warehouses
CREATE POLICY "warehouse_bins_read_authenticated"
ON warehouse_bins
FOR SELECT
TO authenticated
USING (TRUE);

CREATE POLICY "warehouse_bins_write_privileged"
ON warehouse_bins
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Inventory: Same as warehouses
CREATE POLICY "warehouse_inventory_read_authenticated"
ON warehouse_inventory
FOR SELECT
TO authenticated
USING (TRUE);

CREATE POLICY "warehouse_inventory_write_privileged"
ON warehouse_inventory
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Movement Logs: Read accessible to all, Write restricted to privileged
CREATE POLICY "warehouse_movement_logs_read_authenticated"
ON warehouse_movement_logs
FOR SELECT
TO authenticated
USING (TRUE);

CREATE POLICY "warehouse_movement_logs_write_privileged"
ON warehouse_movement_logs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);

-- Pick Lists: Read accessible to all, Write restricted to privileged
CREATE POLICY "warehouse_pick_lists_read_authenticated"
ON warehouse_pick_lists
FOR SELECT
TO authenticated
USING (TRUE);

CREATE POLICY "warehouse_pick_lists_write_privileged"
ON warehouse_pick_lists
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = (auth.uid())::text
      AND p.access_role = ANY (ARRAY['dispatcher_basic','dispatcher_verified','dispatcher_admin','admin','regional_admin','national_admin'])
  )
);
