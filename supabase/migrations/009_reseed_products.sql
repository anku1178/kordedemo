-- Re-seed products (run this if products were deleted)
-- Sets mrp = price since discount feature was removed

-- First ensure categories exist
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
  ('Canned & Packaged', 'canned-packaged', 15)
ON CONFLICT (slug) DO NOTHING;

-- Grains & Rice
INSERT INTO products (name, slug, price, mrp, unit, stock_quantity, is_available, category_id) VALUES
  ('India Gate Basmati Rice 5kg', 'india-gate-basmati-rice-5kg', 485.00, 485.00, '5 kg', 50, true, (SELECT id FROM categories WHERE slug = 'grains-rice')),
  ('Sona Masoori Rice 5kg', 'sona-masoori-rice-5kg', 320.00, 320.00, '5 kg', 60, true, (SELECT id FROM categories WHERE slug = 'grains-rice')),
  ('Daawat Basmati Rice 1kg', 'daawat-basmati-rice-1kg', 135.00, 135.00, '1 kg', 80, true, (SELECT id FROM categories WHERE slug = 'grains-rice')),
  ('Poha (Flattened Rice) 500g', 'poha-500g', 45.00, 45.00, '500 g', 70, true, (SELECT id FROM categories WHERE slug = 'grains-rice')),
  ('Murmura (Puffed Rice) 500g', 'murmura-500g', 30.00, 30.00, '500 g', 55, true, (SELECT id FROM categories WHERE slug = 'grains-rice')),
  ('Rava (Semolina) 1kg', 'rava-1kg', 42.00, 42.00, '1 kg', 65, true, (SELECT id FROM categories WHERE slug = 'grains-rice'))
ON CONFLICT (slug) DO NOTHING;

-- Pulses & Lentils
INSERT INTO products (name, slug, price, mrp, unit, stock_quantity, is_available, category_id) VALUES
  ('Toor Dal 1kg', 'toor-dal-1kg', 140.00, 140.00, '1 kg', 80, true, (SELECT id FROM categories WHERE slug = 'pulses-lentils')),
  ('Moong Dal 1kg', 'moong-dal-1kg', 130.00, 130.00, '1 kg', 70, true, (SELECT id FROM categories WHERE slug = 'pulses-lentils')),
  ('Chana Dal 1kg', 'chana-dal-1kg', 100.00, 100.00, '1 kg', 65, true, (SELECT id FROM categories WHERE slug = 'pulses-lentils')),
  ('Urad Dal 1kg', 'urad-dal-1kg', 120.00, 120.00, '1 kg', 55, true, (SELECT id FROM categories WHERE slug = 'pulses-lentils')),
  ('Rajma (Kidney Beans) 500g', 'rajma-500g', 90.00, 90.00, '500 g', 45, true, (SELECT id FROM categories WHERE slug = 'pulses-lentils')),
  ('Kabuli Chana (Chickpeas) 500g', 'kabuli-chana-500g', 75.00, 75.00, '500 g', 50, true, (SELECT id FROM categories WHERE slug = 'pulses-lentils')),
  ('Lobia (Black Eyed Peas) 500g', 'lobia-500g', 55.00, 55.00, '500 g', 40, true, (SELECT id FROM categories WHERE slug = 'pulses-lentils'))
ON CONFLICT (slug) DO NOTHING;

-- Spices & Masala
INSERT INTO products (name, slug, price, mrp, unit, stock_quantity, is_available, category_id) VALUES
  ('MDH Turmeric Powder 100g', 'mdh-turmeric-powder-100g', 35.00, 35.00, '100 g', 100, true, (SELECT id FROM categories WHERE slug = 'spices-masala')),
  ('MDH Red Chilli Powder 100g', 'mdh-red-chilli-powder-100g', 32.00, 32.00, '100 g', 90, true, (SELECT id FROM categories WHERE slug = 'spices-masala')),
  ('MDH Garam Masala 50g', 'mdh-garam-masala-50g', 48.00, 48.00, '50 g', 75, true, (SELECT id FROM categories WHERE slug = 'spices-masala')),
  ('MDH Coriander Powder 100g', 'mdh-coriander-powder-100g', 28.00, 28.00, '100 g', 85, true, (SELECT id FROM categories WHERE slug = 'spices-masala')),
  ('MDH Cumin Powder 100g', 'mdh-cumin-powder-100g', 42.00, 42.00, '100 g', 60, true, (SELECT id FROM categories WHERE slug = 'spices-masala')),
  ('Everest Kitchen King 50g', 'everest-kitchen-king-50g', 45.00, 45.00, '50 g', 70, true, (SELECT id FROM categories WHERE slug = 'spices-masala')),
  ('MDH Chaat Masala 50g', 'mdh-chaat-masala-50g', 30.00, 30.00, '50 g', 65, true, (SELECT id FROM categories WHERE slug = 'spices-masala')),
  ('Whole Cumin Seeds 100g', 'whole-cumin-seeds-100g', 38.00, 38.00, '100 g', 55, true, (SELECT id FROM categories WHERE slug = 'spices-masala')),
  ('Mustard Seeds 100g', 'mustard-seeds-100g', 20.00, 20.00, '100 g', 80, true, (SELECT id FROM categories WHERE slug = 'spices-masala'))
ON CONFLICT (slug) DO NOTHING;

-- Oil & Ghee
INSERT INTO products (name, slug, price, mrp, unit, stock_quantity, is_available, category_id) VALUES
  ('Fortune Sunflower Oil 1L', 'fortune-sunflower-oil-1l', 140.00, 140.00, '1 L', 40, true, (SELECT id FROM categories WHERE slug = 'oil-ghee')),
  ('Fortune Soyabean Oil 1L', 'fortune-soyabean-oil-1l', 125.00, 125.00, '1 L', 45, true, (SELECT id FROM categories WHERE slug = 'oil-ghee')),
  ('Saffola Gold Oil 1L', 'saffola-gold-oil-1l', 185.00, 185.00, '1 L', 30, true, (SELECT id FROM categories WHERE slug = 'oil-ghee')),
  ('Amul Ghee 500ml', 'amul-ghee-500ml', 285.00, 285.00, '500 ml', 30, true, (SELECT id FROM categories WHERE slug = 'oil-ghee')),
  ('Mother Dairy Ghee 500ml', 'mother-dairy-ghee-500ml', 270.00, 270.00, '500 ml', 25, true, (SELECT id FROM categories WHERE slug = 'oil-ghee')),
  ('Groundnut Oil 1L', 'groundnut-oil-1l', 175.00, 175.00, '1 L', 20, true, (SELECT id FROM categories WHERE slug = 'oil-ghee')),
  ('Mustard Oil 1L', 'mustard-oil-1l', 155.00, 155.00, '1 L', 35, true, (SELECT id FROM categories WHERE slug = 'oil-ghee'))
ON CONFLICT (slug) DO NOTHING;

-- Flour & Atta
INSERT INTO products (name, slug, price, mrp, unit, stock_quantity, is_available, category_id) VALUES
  ('Aashirvaad Atta 5kg', 'aashirvaad-atta-5kg', 280.00, 280.00, '5 kg', 55, true, (SELECT id FROM categories WHERE slug = 'flour-atta')),
  ('Fortune Chakki Atta 5kg', 'fortune-chakki-atta-5kg', 265.00, 265.00, '5 kg', 50, true, (SELECT id FROM categories WHERE slug = 'flour-atta')),
  ('Maida 1kg', 'maida-1kg', 40.00, 40.00, '1 kg', 60, true, (SELECT id FROM categories WHERE slug = 'flour-atta')),
  ('Besan (Gram Flour) 500g', 'besan-500g', 55.00, 55.00, '500 g', 45, true, (SELECT id FROM categories WHERE slug = 'flour-atta')),
  ('Rice Flour 500g', 'rice-flour-500g', 45.00, 45.00, '500 g', 35, true, (SELECT id FROM categories WHERE slug = 'flour-atta')),
  ('Sooji (Rava) 1kg', 'sooji-rava-1kg', 42.00, 42.00, '1 kg', 55, true, (SELECT id FROM categories WHERE slug = 'flour-atta'))
ON CONFLICT (slug) DO NOTHING;

-- Sugar & Jaggery
INSERT INTO products (name, slug, price, mrp, unit, stock_quantity, is_available, category_id) VALUES
  ('Sugar 1kg', 'sugar-1kg', 45.00, 45.00, '1 kg', 100, true, (SELECT id FROM categories WHERE slug = 'sugar-jaggery')),
  ('Sugar 5kg', 'sugar-5kg', 215.00, 215.00, '5 kg', 40, true, (SELECT id FROM categories WHERE slug = 'sugar-jaggery')),
  ('Gur (Jaggery) 500g', 'gur-jaggery-500g', 55.00, 55.00, '500 g', 35, true, (SELECT id FROM categories WHERE slug = 'sugar-jaggery')),
  ('Honey 500g', 'honey-500g', 185.00, 185.00, '500 g', 25, true, (SELECT id FROM categories WHERE slug = 'sugar-jaggery'))
ON CONFLICT (slug) DO NOTHING;

-- Tea & Coffee
INSERT INTO products (name, slug, price, mrp, unit, stock_quantity, is_available, category_id) VALUES
  ('Tata Tea Gold 250g', 'tata-tea-gold-250g', 125.00, 125.00, '250 g', 45, true, (SELECT id FROM categories WHERE slug = 'tea-coffee')),
  ('Red Label Tea 250g', 'red-label-tea-250g', 110.00, 110.00, '250 g', 50, true, (SELECT id FROM categories WHERE slug = 'tea-coffee')),
  ('Taj Mahal Tea 250g', 'taj-mahal-tea-250g', 155.00, 155.00, '250 g', 30, true, (SELECT id FROM categories WHERE slug = 'tea-coffee')),
  ('Nescafe Classic 25g', 'nescafe-classic-25g', 55.00, 55.00, '25 g', 50, true, (SELECT id FROM categories WHERE slug = 'tea-coffee')),
  ('Bru Instant Coffee 50g', 'bru-instant-coffee-50g', 95.00, 95.00, '50 g', 35, true, (SELECT id FROM categories WHERE slug = 'tea-coffee')),
  ('Tata Tea Premium 500g', 'tata-tea-premium-500g', 230.00, 230.00, '500 g', 25, true, (SELECT id FROM categories WHERE slug = 'tea-coffee'))
ON CONFLICT (slug) DO NOTHING;

-- Snacks & Biscuits
INSERT INTO products (name, slug, price, mrp, unit, stock_quantity, is_available, category_id) VALUES
  ('Parle-G 800g', 'parle-g-800g', 72.00, 72.00, '800 g', 80, true, (SELECT id FROM categories WHERE slug = 'snacks-biscuits')),
  ('Britannia Marie Gold 250g', 'britannia-marie-gold-250g', 35.00, 35.00, '250 g', 60, true, (SELECT id FROM categories WHERE slug = 'snacks-biscuits')),
  ('Monaco Salted 150g', 'monaco-salted-150g', 30.00, 30.00, '150 g', 55, true, (SELECT id FROM categories WHERE slug = 'snacks-biscuits')),
  ('Hide & Seek 120g', 'hide-seek-120g', 40.00, 40.00, '120 g', 45, true, (SELECT id FROM categories WHERE slug = 'snacks-biscuits')),
  ('Kurkure Masala 90g', 'kurkure-masala-90g', 20.00, 20.00, '90 g', 90, true, (SELECT id FROM categories WHERE slug = 'snacks-biscuits')),
  ('Lays Classic Salted 52g', 'lays-classic-salted-52g', 20.00, 20.00, '52 g', 100, true, (SELECT id FROM categories WHERE slug = 'snacks-biscuits')),
  ('Uncle Chips 55g', 'uncle-chips-55g', 20.00, 20.00, '55 g', 70, true, (SELECT id FROM categories WHERE slug = 'snacks-biscuits')),
  ('Haldiram Bhujia 200g', 'haldiram-bhujia-200g', 60.00, 60.00, '200 g', 50, true, (SELECT id FROM categories WHERE slug = 'snacks-biscuits')),
  ('Haldiram Aloo Bhujia 200g', 'haldiram-aloo-bhujia-200g', 55.00, 55.00, '200 g', 45, true, (SELECT id FROM categories WHERE slug = 'snacks-biscuits'))
ON CONFLICT (slug) DO NOTHING;

-- Dairy Products
INSERT INTO products (name, slug, price, mrp, unit, stock_quantity, is_available, category_id) VALUES
  ('Amul Butter 100g', 'amul-butter-100g', 56.00, 56.00, '100 g', 35, true, (SELECT id FROM categories WHERE slug = 'dairy-products')),
  ('Amul Butter 500g', 'amul-butter-500g', 270.00, 270.00, '500 g', 20, true, (SELECT id FROM categories WHERE slug = 'dairy-products')),
  ('Amul Cheese Slices 200g', 'amul-cheese-slices-200g', 120.00, 120.00, '200 g', 25, true, (SELECT id FROM categories WHERE slug = 'dairy-products')),
  ('Amul Paneer 200g', 'amul-paneer-200g', 80.00, 80.00, '200 g', 30, true, (SELECT id FROM categories WHERE slug = 'dairy-products')),
  ('Mother Dairy Curd 400g', 'mother-dairy-curd-400g', 35.00, 35.00, '400 g', 40, true, (SELECT id FROM categories WHERE slug = 'dairy-products')),
  ('Amul Milk 1L (Full Cream)', 'amul-milk-1l-full-cream', 65.00, 65.00, '1 L', 50, true, (SELECT id FROM categories WHERE slug = 'dairy-products')),
  ('Amul Toned Milk 1L', 'amul-toned-milk-1l', 55.00, 55.00, '1 L', 45, true, (SELECT id FROM categories WHERE slug = 'dairy-products')),
  ('Amul Cream 200ml', 'amul-cream-200ml', 45.00, 45.00, '200 ml', 20, true, (SELECT id FROM categories WHERE slug = 'dairy-products'))
ON CONFLICT (slug) DO NOTHING;

-- Soap & Detergent
INSERT INTO products (name, slug, price, mrp, unit, stock_quantity, is_available, category_id) VALUES
  ('Surf Excel Easy Wash 1kg', 'surf-excel-easy-wash-1kg', 115.00, 115.00, '1 kg', 40, true, (SELECT id FROM categories WHERE slug = 'soap-detergent')),
  ('Surf Excel Quick Wash 500g', 'surf-excel-quick-wash-500g', 60.00, 60.00, '500 g', 50, true, (SELECT id FROM categories WHERE slug = 'soap-detergent')),
  ('Vim Liquid 500ml', 'vim-liquid-500ml', 99.00, 99.00, '500 ml', 35, true, (SELECT id FROM categories WHERE slug = 'soap-detergent')),
  ('Vim Bar', 'vim-bar', 10.00, 10.00, '1 pc', 100, true, (SELECT id FROM categories WHERE slug = 'soap-detergent')),
  ('Lux Soap Bar', 'lux-soap-bar', 38.00, 38.00, '100 g', 80, true, (SELECT id FROM categories WHERE slug = 'soap-detergent')),
  ('Dettol Soap Bar', 'dettol-soap-bar', 42.00, 42.00, '100 g', 60, true, (SELECT id FROM categories WHERE slug = 'soap-detergent')),
  ('Harpic Toilet Cleaner 500ml', 'harpic-toilet-cleaner-500ml', 85.00, 85.00, '500 ml', 40, true, (SELECT id FROM categories WHERE slug = 'soap-detergent')),
  ('Colin Glass Cleaner 500ml', 'colin-glass-cleaner-500ml', 75.00, 75.00, '500 ml', 25, true, (SELECT id FROM categories WHERE slug = 'soap-detergent')),
  ('Lizol Floor Cleaner 500ml', 'lizol-floor-cleaner-500ml', 95.00, 95.00, '500 ml', 30, true, (SELECT id FROM categories WHERE slug = 'soap-detergent'))
ON CONFLICT (slug) DO NOTHING;

-- Personal Care
INSERT INTO products (name, slug, price, mrp, unit, stock_quantity, is_available, category_id) VALUES
  ('Colgate MaxFresh 150g', 'colgate-maxfresh-150g', 89.00, 89.00, '150 g', 50, true, (SELECT id FROM categories WHERE slug = 'personal-care')),
  ('Pepsodent Toothpaste 150g', 'pepsodent-toothpaste-150g', 55.00, 55.00, '150 g', 45, true, (SELECT id FROM categories WHERE slug = 'personal-care')),
  ('Closeup Toothpaste 150g', 'closeup-toothpaste-150g', 72.00, 72.00, '150 g', 40, true, (SELECT id FROM categories WHERE slug = 'personal-care')),
  ('Clinic Plus Shampoo 175ml', 'clinic-plus-shampoo-175ml', 95.00, 95.00, '175 ml', 35, true, (SELECT id FROM categories WHERE slug = 'personal-care')),
  ('Head & Shoulders Shampoo 180ml', 'head-shoulders-shampoo-180ml', 135.00, 135.00, '180 ml', 25, true, (SELECT id FROM categories WHERE slug = 'personal-care')),
  ('Parachute Coconut Oil 200ml', 'parachute-coconut-oil-200ml', 55.00, 55.00, '200 ml', 60, true, (SELECT id FROM categories WHERE slug = 'personal-care')),
  ('Dabur Amla Hair Oil 200ml', 'dabur-amla-hair-oil-200ml', 65.00, 65.00, '200 ml', 40, true, (SELECT id FROM categories WHERE slug = 'personal-care')),
  ('Vaseline Lotion 200ml', 'vaseline-lotion-200ml', 110.00, 110.00, '200 ml', 30, true, (SELECT id FROM categories WHERE slug = 'personal-care')),
  ('Nivea Cream 60ml', 'nivea-cream-60ml', 75.00, 75.00, '60 ml', 25, true, (SELECT id FROM categories WHERE slug = 'personal-care'))
ON CONFLICT (slug) DO NOTHING;

-- Beverages
INSERT INTO products (name, slug, price, mrp, unit, stock_quantity, is_available, category_id) VALUES
  ('Coca-Cola 750ml', 'coca-cola-750ml', 38.00, 38.00, '750 ml', 80, true, (SELECT id FROM categories WHERE slug = 'beverages')),
  ('Pepsi 750ml', 'pepsi-750ml', 38.00, 38.00, '750 ml', 75, true, (SELECT id FROM categories WHERE slug = 'beverages')),
  ('Thums Up 750ml', 'thums-up-750ml', 38.00, 38.00, '750 ml', 70, true, (SELECT id FROM categories WHERE slug = 'beverages')),
  ('Sprite 750ml', 'sprite-750ml', 38.00, 38.00, '750 ml', 65, true, (SELECT id FROM categories WHERE slug = 'beverages')),
  ('Maaza Mango 600ml', 'maaza-mango-600ml', 30.00, 30.00, '600 ml', 55, true, (SELECT id FROM categories WHERE slug = 'beverages')),
  ('Real Fruit Juice (Orange) 1L', 'real-fruit-juice-orange-1l', 99.00, 99.00, '1 L', 30, true, (SELECT id FROM categories WHERE slug = 'beverages')),
  ('Paper Boat Aam Panna 200ml', 'paper-boat-aam-panna-200ml', 30.00, 30.00, '200 ml', 40, true, (SELECT id FROM categories WHERE slug = 'beverages')),
  ('Bisleri Water 1L', 'bisleri-water-1l', 20.00, 20.00, '1 L', 100, true, (SELECT id FROM categories WHERE slug = 'beverages'))
ON CONFLICT (slug) DO NOTHING;

-- Pickles & Sauce
INSERT INTO products (name, slug, price, mrp, unit, stock_quantity, is_available, category_id) VALUES
  ('Maggi Tomato Ketchup 200g', 'maggi-tomato-ketchup-200g', 35.00, 35.00, '200 g', 60, true, (SELECT id FROM categories WHERE slug = 'pickles-sauce')),
  ('Maggi Tomato Ketchup 500g', 'maggi-tomato-ketchup-500g', 75.00, 75.00, '500 g', 45, true, (SELECT id FROM categories WHERE slug = 'pickles-sauce')),
  ('Kissan Tomato Ketchup 200g', 'kissan-tomato-ketchup-200g', 38.00, 38.00, '200 g', 50, true, (SELECT id FROM categories WHERE slug = 'pickles-sauce')),
  ('Ching''s Secret Soy Sauce 200ml', 'chings-secret-soy-sauce-200ml', 35.00, 35.00, '200 ml', 40, true, (SELECT id FROM categories WHERE slug = 'pickles-sauce')),
  ('Ching''s Secret Vinegar 200ml', 'chings-secret-vinegar-200ml', 25.00, 25.00, '200 ml', 35, true, (SELECT id FROM categories WHERE slug = 'pickles-sauce')),
  ('Pickle - Mango 200g', 'pickle-mango-200g', 55.00, 55.00, '200 g', 30, true, (SELECT id FROM categories WHERE slug = 'pickles-sauce')),
  ('Pickle - Mixed 200g', 'pickle-mixed-200g', 50.00, 50.00, '200 g', 25, true, (SELECT id FROM categories WHERE slug = 'pickles-sauce')),
  ('Patak''s Tandoori Paste 200g', 'pataks-tandoori-paste-200g', 85.00, 85.00, '200 g', 20, true, (SELECT id FROM categories WHERE slug = 'pickles-sauce'))
ON CONFLICT (slug) DO NOTHING;

-- Noodles & Pasta
INSERT INTO products (name, slug, price, mrp, unit, stock_quantity, is_available, category_id) VALUES
  ('Maggi Noodles Pack of 4', 'maggi-noodles-pack-4', 52.00, 52.00, '4 pcs', 100, true, (SELECT id FROM categories WHERE slug = 'noodles-pasta')),
  ('Maggi Noodles Family Pack', 'maggi-noodles-family-pack', 96.00, 96.00, '4 pcs', 80, true, (SELECT id FROM categories WHERE slug = 'noodles-pasta')),
  ('Yippee Noodles 280g', 'yippee-noodles-280g', 48.00, 48.00, '280 g', 60, true, (SELECT id FROM categories WHERE slug = 'noodles-pasta')),
  ('Top Ramen Curry 70g', 'top-ramen-curry-70g', 15.00, 15.00, '70 g', 90, true, (SELECT id FROM categories WHERE slug = 'noodles-pasta')),
  ('Pasta Penne 500g', 'pasta-penne-500g', 65.00, 65.00, '500 g', 30, true, (SELECT id FROM categories WHERE slug = 'noodles-pasta')),
  ('Ching''s Hakka Noodles 150g', 'chings-hakka-noodles-150g', 30.00, 30.00, '150 g', 55, true, (SELECT id FROM categories WHERE slug = 'noodles-pasta')),
  ('Maggi Pazzta 64g', 'maggi-pazzta-64g', 25.00, 25.00, '64 g', 45, true, (SELECT id FROM categories WHERE slug = 'noodles-pasta'))
ON CONFLICT (slug) DO NOTHING;

-- Canned & Packaged
INSERT INTO products (name, slug, price, mrp, unit, stock_quantity, is_available, category_id) VALUES
  ('Amul Milk Powder 500g', 'amul-milk-powder-500g', 175.00, 175.00, '500 g', 25, true, (SELECT id FROM categories WHERE slug = 'canned-packaged')),
  ('Milkmaid Condensed Milk 400g', 'milkmaid-condensed-milk-400g', 120.00, 120.00, '400 g', 30, true, (SELECT id FROM categories WHERE slug = 'canned-packaged')),
  ('Baked Beans 420g', 'baked-beans-420g', 65.00, 65.00, '420 g', 20, true, (SELECT id FROM categories WHERE slug = 'canned-packaged')),
  ('Sweet Corn 340g', 'sweet-corn-340g', 45.00, 45.00, '340 g', 35, true, (SELECT id FROM categories WHERE slug = 'canned-packaged')),
  ('Tuna Canned 170g', 'tuna-canned-170g', 95.00, 95.00, '170 g', 15, true, (SELECT id FROM categories WHERE slug = 'canned-packaged')),
  ('MTR Ready to Eat Rajma 300g', 'mtr-ready-to-eat-rajma-300g', 75.00, 75.00, '300 g', 25, true, (SELECT id FROM categories WHERE slug = 'canned-packaged')),
  ('MTR Ready to Eat Dal Makhani 300g', 'mtr-ready-to-eat-dal-makhani-300g', 80.00, 80.00, '300 g', 20, true, (SELECT id FROM categories WHERE slug = 'canned-packaged')),
  ('Knorr Soup Packet 53g', 'knorr-soup-packet-53g', 45.00, 45.00, '53 g', 40, true, (SELECT id FROM categories WHERE slug = 'canned-packaged'))
ON CONFLICT (slug) DO NOTHING;
