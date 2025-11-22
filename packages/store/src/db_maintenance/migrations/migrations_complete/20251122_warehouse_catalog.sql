-- Warehouse Item Catalog
CREATE TABLE IF NOT EXISTS public.warehouse_item_catalog (
    sku TEXT PRIMARY KEY,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Data
INSERT INTO public.warehouse_item_catalog (sku, item_name, category) VALUES
('water-1L-bottle', 'Bottled Water 1L', 'water'),
('water-500ml-bottle', 'Bottled Water 500ml', 'water'),
('electrolyte-packets', 'Electrolyte Packets', 'water'),
('hydration-jug-5gal', '5 Gallon Water Jug', 'water'),
('food-snack-bars', 'Snack Bars', 'food'),
('food-vegan-meals', 'Shelf-Stable Vegan Meal', 'food'),
('food-rice-bags', 'Rice Bags', 'food'),
('food-pasta', 'Dry Pasta', 'food'),
('food-infant-formula', 'Infant Formula', 'food'),
('hygiene-toothbrush', 'Toothbrush', 'hygiene'),
('hygiene-toothpaste', 'Toothpaste', 'hygiene'),
('hygiene-soap-bars', 'Soap Bars', 'hygiene'),
('hygiene-wet-wipes', 'Wet Wipes', 'hygiene'),
('hygiene-menstrual-pads', 'Menstrual Pads', 'hygiene'),
('hygiene-diapers', 'Diapers', 'hygiene'),
('med-firstaid-kit-basic', 'Basic First Aid Kit', 'medical'),
('med-bandages-assorted', 'Assorted Bandages', 'medical'),
('med-gauze-rolls', 'Gauze Rolls', 'medical'),
('med-antiseptic-wipes', 'Antiseptic Wipes', 'medical'),
('med-gloves-nitrile', 'Nitrile Gloves', 'medical'),
('med-saline', 'Saline Bottles', 'medical'),
('med-oral-rehydration', 'Oral Rehydration Salts', 'medical'),
('warmth-blankets-mylar', 'Mylar Emergency Blankets', 'warmth'),
('warmth-blankets-heavy', 'Heavy Blankets', 'warmth'),
('warmth-gloves', 'Warm Gloves', 'warmth'),
('warmth-hats', 'Warm Hats', 'warmth'),
('warmth-socks', 'Thermal Socks', 'warmth'),
('warmth-handwarmers', 'Hand Warmers', 'warmth'),
('kid-coloring-kits', 'Coloring Kits', 'kid-support'),
('kid-small-toys', 'Small Toys', 'kid-support'),
('kid-snacks', 'Kid Snacks', 'kid-support'),
('ppe-masks-n95', 'N95 Masks', 'ppe'),
('ppe-earplugs', 'Ear Plugs', 'ppe'),
('ppe-goggles', 'Protective Goggles', 'ppe'),
('ppe-safety-vests', 'Safety Vests', 'ppe'),
('ppe-rainponchos', 'Rain Ponchos', 'ppe'),
('logistics-canopies', 'Pop-Up Canopies', 'logistics'),
('logistics-tables', 'Folding Tables', 'logistics'),
('logistics-chairs', 'Folding Chairs', 'logistics'),
('logistics-tarps', 'Tarps', 'logistics'),
('logistics-totes', 'Plastic Storage Totes', 'logistics'),
('logistics-batteries-aa', 'AA Batteries', 'logistics'),
('logistics-batteries-powerbanks', 'Portable Power Banks', 'logistics'),
('comms-radios-baofeng', 'Baofeng Radios', 'comms'),
('comms-meshtastic-nodes', 'Meshtastic Nodes', 'comms'),
('comms-chargers', 'Radio Chargers', 'comms'),
('comms-batteries', 'Radio Batteries', 'comms'),
('tools-flashlights', 'Flashlights', 'tools'),
('tools-headlamps', 'Headlamps', 'tools'),
('tools-multitools', 'Multi-Tools', 'tools'),
('tools-tape-duct', 'Duct Tape', 'tools'),
('tools-zip-ties', 'Zip Ties', 'tools'),
('comfort-hot-drinks', 'Instant Hot Drink Mix', 'comfort'),
('comfort-disposable-cups', 'Disposable Cups', 'comfort'),
('comfort-blankets', 'Comfort Blankets', 'comfort'),
('comfort-notepads', 'Mini Notepads', 'comfort'),
('admin-clipboards', 'Clipboards', 'admin'),
('admin-pens', 'Pens', 'admin'),
('admin-sharpies', 'Sharpies', 'admin'),
('admin-forms', 'Paper Forms', 'admin')
ON CONFLICT (sku) DO NOTHING;

-- RLS Policies
ALTER TABLE warehouse_item_catalog ENABLE ROW LEVEL SECURITY;

-- Read accessible to all authenticated users
CREATE POLICY "warehouse_item_catalog_read_authenticated"
ON warehouse_item_catalog
FOR SELECT
TO authenticated
USING (TRUE);

-- Write restricted to admins and dispatchers
CREATE POLICY "warehouse_item_catalog_write_privileged"
ON warehouse_item_catalog
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
