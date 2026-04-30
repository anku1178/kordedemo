-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'confirmed', 'picking', 'ready', 'handed_over', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_id TEXT,
  payment_method TEXT,
  customer_outside BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  ready_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_customer_outside ON orders(customer_outside) WHERE customer_outside = true;

-- Auto-update updated_at timestamp
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  order_num TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 5) AS INTEGER)), 0) + 1 INTO next_num
  FROM orders
  WHERE order_number LIKE 'KGS-%';
  
  order_num := 'KGS-' || LPAD(next_num::TEXT, 6, '0');
  RETURN order_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
