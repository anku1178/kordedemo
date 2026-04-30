-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  mrp NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'pcs',
  stock_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for searching products by name
CREATE INDEX idx_products_name ON products USING gin (name gin_trgm_ops);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_available ON products(is_available);
CREATE INDEX idx_products_slug ON products(slug);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE products;

-- Enable trgm extension for text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
