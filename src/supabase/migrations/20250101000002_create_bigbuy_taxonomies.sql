-- Create table to store BigBuy taxonomies (categories)
CREATE TABLE IF NOT EXISTS bigbuy_taxonomies (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  parent_taxonomy_id INTEGER,
  iso_code TEXT NOT NULL DEFAULT 'es',
  url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_parent_taxonomy FOREIGN KEY (parent_taxonomy_id) REFERENCES bigbuy_taxonomies(id) ON DELETE SET NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bigbuy_taxonomies_parent ON bigbuy_taxonomies(parent_taxonomy_id);
CREATE INDEX IF NOT EXISTS idx_bigbuy_taxonomies_iso ON bigbuy_taxonomies(iso_code);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bigbuy_taxonomies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
CREATE TRIGGER trigger_update_bigbuy_taxonomies_updated_at
  BEFORE UPDATE ON bigbuy_taxonomies
  FOR EACH ROW
  EXECUTE FUNCTION update_bigbuy_taxonomies_updated_at();

-- Add comment
COMMENT ON TABLE bigbuy_taxonomies IS 'Stores BigBuy taxonomies (categories) synced from BigBuy API';

