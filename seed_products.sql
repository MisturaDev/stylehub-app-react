-- Seed Data for Products Table

insert into public.products (title, description, price, sale_price, image_url, category, brand, is_featured, seller_id)
values
  (
    'Classic White Linen Shirt',
    'A breathable, lightweight linen shirt perfect for summer days. Features a relaxed fit and mother-of-pearl buttons.',
    89.00,
    null,
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
    'Shirts',
    'Uniqlo',
    true,
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    'Floral Summer Midi Dress',
    'Elegant floral print midi dress with a cinched waist and flowing skirt. Ideal for garden parties or brunch.',
    120.00,
    95.00,
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800',
    'Dresses',
    'Zara',
    true,
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    'Leather Chelsea Boots',
    'Handcrafted leather Chelsea boots with durable rubber soles. Timeless style that pairs well with jeans or trousers.',
    180.00,
    null,
    'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800',
    'Shoes',
    'Dr. Martens',
    false,
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    'Silk Scarf - Midnight Blue',
    'Luxurious 100% silk scarf in a deep midnight blue shade. Adds a touch of sophistication to any outfit.',
    45.00,
    null,
    'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa3e?auto=format&fit=crop&q=80&w=800',
    'Accessories',
    'Hermes',
    false,
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    'Slim Fit Navy Blazer',
    'Tailored navy blazer made from premium wool blend. A versatile essential for the modern professional.',
    250.00,
    199.99,
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800',
    'Shirts',
    'Ralph Lauren',
    true,
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    'Running Sneakers',
    'High-performance running shoes with cushioned soles for maximum comfort during your workouts.',
    110.00,
    null,
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
    'Shoes',
    'Nike',
    true,
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    'Denim Jacket',
    'Classic denim jacket with a vintage wash. Features button-flap chest pockets and side welt pockets.',
    75.00,
    null,
    'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=800',
    'Shirts',
    'Levi''s',
    false,
    (SELECT id FROM auth.users LIMIT 1)
  ),
  (
    'Gold Plated Necklace',
    'Minimalist gold plated chain necklace. Tarnish-resistant and perfect for layering.',
    35.00,
    29.00,
    'https://images.unsplash.com/photo-1599643478518-17488fbbcd75?auto=format&fit=crop&q=80&w=800',
    'Accessories',
    'Mejuri',
    false,
    (SELECT id FROM auth.users LIMIT 1)
  );
