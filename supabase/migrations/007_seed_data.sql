-- Seed data for initial setup

-- Insert sample categories
INSERT INTO categories (name, slug, sort_order) VALUES
  ('Grains & Rice', 'grains-rice', 1),
  ('Pulses & Lentils', 'pulses-lentils', 2),
  ('Spices & Masala', 'spices-masala', 3),
  ('Oil & Ghee', 'oil-ghee', 4),
  ('Flour & Atta', 'flour-atta', 5),
  ('Sugar & Jaggery', 'sugar-jaggery', 6),
  ('Tea & Coffee', 'tea-coffee', 7),
  ('Snacks & Biscuits', 'snacks-biscuits', 8),
  ('Dairy Products', 'dairy-products', 9),
  ('Soap & Detergent', 'soap-detergent', 10),
  ('Personal Care', 'personal-care', 11),
  ('Beverages', 'beverages', 12),
  ('Pickles & Sauce', 'pickles-sauce', 13),
  ('Noodles & Pasta', 'noodles-pasta', 14),
  ('Canned & Packaged', 'canned-packaged', 15);

-- Insert sample products (a few per category to demonstrate)
INSERT INTO products (name, slug, price, mrp, unit, stock_quantity, category_id) VALUES
  ('Basmati Rice 5kg', 'basmati-rice-5kg', 450.00, 500.00, '5 kg', 50, (SELECT id FROM categories WHERE slug = 'grains-rice')),
  ('Sona Masoori Rice 5kg', 'sona-masoori-rice-5kg', 320.00, 350.00, '5 kg', 60, (SELECT id FROM categories WHERE slug = 'grains-rice')),
  ('Toor Dal 1kg', 'toor-dal-1kg', 140.00, 160.00, '1 kg', 80, (SELECT id FROM categories WHERE slug = 'pulses-lentils')),
  ('Moong Dal 1kg', 'moong-dal-1kg', 130.00, 150.00, '1 kg', 70, (SELECT id FROM categories WHERE slug = 'pulses-lentils')),
  ('Chana Dal 1kg', 'chana-dal-1kg', 100.00, 120.00, '1 kg', 65, (SELECT id FROM categories WHERE slug = 'pulses-lentils')),
  ('Turmeric Powder 100g', 'turmeric-powder-100g', 35.00, 40.00, '100 g', 100, (SELECT id FROM categories WHERE slug = 'spices-masala')),
  ('Red Chilli Powder 100g', 'red-chilli-powder-100g', 30.00, 35.00, '100 g', 90, (SELECT id FROM categories WHERE slug = 'spices-masala')),
  ('Garam Masala 50g', 'garam-masala-50g', 45.00, 55.00, '50 g', 75, (SELECT id FROM categories WHERE slug = 'spices-masala')),
  ('Fortune Sunflower Oil 1L', 'fortune-sunflower-oil-1l', 140.00, 155.00, '1 L', 40, (SELECT id FROM categories WHERE slug = 'oil-ghee')),
  ('Amul Ghee 500ml', 'amul-ghee-500ml', 280.00, 310.00, '500 ml', 30, (SELECT id FROM categories WHERE slug = 'oil-ghee')),
  ('Aashirvaad Atta 5kg', 'aashirvaad-atta-5kg', 280.00, 310.00, '5 kg', 55, (SELECT id FROM categories WHERE slug = 'flour-atta')),
  ('Maida 1kg', 'maida-1kg', 40.00, 45.00, '1 kg', 60, (SELECT id FROM categories WHERE slug = 'flour-atta')),
  ('Sugar 1kg', 'sugar-1kg', 45.00, 50.00, '1 kg', 100, (SELECT id FROM categories WHERE slug = 'sugar-jaggery')),
  ('Tata Tea Gold 250g', 'tata-tea-gold-250g', 120.00, 140.00, '250 g', 45, (SELECT id FROM categories WHERE slug = 'tea-coffee')),
  ('Nescafe Classic 25g', 'nescafe-classic-25g', 55.00, 65.00, '25 g', 50, (SELECT id FROM categories WHERE slug = 'tea-coffee')),
  ('Parle-G 800g', 'parle-g-800g', 70.00, 80.00, '800 g', 80, (SELECT id FROM categories WHERE slug = 'snacks-biscuits')),
  ('Amul Butter 100g', 'amul-butter-100g', 56.00, 60.00, '100 g', 35, (SELECT id FROM categories WHERE slug = 'dairy-products')),
  ('Surf Excel 1kg', 'surf-excel-1kg', 110.00, 125.00, '1 kg', 40, (SELECT id FROM categories WHERE slug = 'soap-detergent')),
  ('Maggi Noodles Pack of 4', 'maggi-noodles-pack-4', 52.00, 56.00, '4 pcs', 100, (SELECT id FROM categories WHERE slug = 'noodles-pasta'));
