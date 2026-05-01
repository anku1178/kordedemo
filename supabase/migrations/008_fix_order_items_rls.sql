-- Fix: Allow customers to insert order items for their own orders
-- (Previously only admin could insert, which broke the customer checkout flow)

DROP POLICY IF EXISTS "Customers can insert own order items" ON order_items;
CREATE POLICY "Customers can insert own order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.customer_id = auth.uid()
    )
  );
