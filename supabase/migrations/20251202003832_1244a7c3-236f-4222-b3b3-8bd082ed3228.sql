-- Add featured and sale fields to products table
ALTER TABLE public.products 
ADD COLUMN is_featured BOOLEAN DEFAULT false,
ADD COLUMN sale_price NUMERIC;