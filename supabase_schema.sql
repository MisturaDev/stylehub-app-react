-- Enable Row Level Security (RLS) and Create Tables

-- 1. Profiles (Public User Data)
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 2. Products
create table public.products (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  price decimal(10,2) not null,
  sale_price decimal(10,2),
  image_url text not null,
  category text not null,
  brand text,
  is_featured boolean default false,
  seller_id uuid references auth.users,
  created_at timestamptz default now()
);

alter table public.products enable row level security;

create policy "Products are viewable by everyone"
  on products for select
  using ( true );

create policy "Sellers can insert their own products"
  on products for insert
  with check ( auth.uid() = seller_id );
  
create policy "Sellers can update their own products"
  on products for update
  using ( auth.uid() = seller_id );

-- 3. Cart Items
create table public.cart_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  product_id uuid references public.products not null,
  quantity integer default 1,
  created_at timestamptz default now()
);

alter table public.cart_items enable row level security;

create policy "Users can view own cart items"
  on cart_items for select
  using ( auth.uid() = user_id );

create policy "Users can insert own cart items"
  on cart_items for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own cart items"
  on cart_items for update
  using ( auth.uid() = user_id );

create policy "Users can delete own cart items"
  on cart_items for delete
  using ( auth.uid() = user_id );

-- 4. Wishlist Items
create table public.wishlist_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  product_id uuid references public.products not null,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

alter table public.wishlist_items enable row level security;

create policy "Users can view own wishlist items"
  on wishlist_items for select
  using ( auth.uid() = user_id );

create policy "Users can insert own wishlist items"
  on wishlist_items for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete own wishlist items"
  on wishlist_items for delete
  using ( auth.uid() = user_id );

-- 5. Likes (for Trending Products)
create table public.likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  product_id uuid references public.products not null,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

alter table public.likes enable row level security;

create policy "Examples of usage"
  on likes for select
  using ( true );

create policy "Users can insert own likes"
  on likes for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete own likes"
  on likes for delete
  using ( auth.uid() = user_id );
