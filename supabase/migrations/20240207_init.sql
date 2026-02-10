-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create products table
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text not null,
  images text[] not null default '{}',
  height decimal not null,
  width decimal not null,
  depth decimal not null,
  colors text[] not null default '{}',
  category text not null,
  subcategory text not null,
  weight decimal,
  engraving_dimensions text,
  additional_info text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for products
alter table products enable row level security;

-- Drop existing policies if they exist to avoid errors on re-run
drop policy if exists "Public products are viewable by everyone" on products;
drop policy if exists "Authenticated users can insert products" on products;
drop policy if exists "Authenticated users can update products" on products;
drop policy if exists "Authenticated users can delete products" on products;

create policy "Public products are viewable by everyone"
  on products for select
  using ( true );

create policy "Authenticated users can insert products"
  on products for insert
  with check ( auth.role() = 'authenticated' );

create policy "Authenticated users can update products"
  on products for update
  using ( auth.role() = 'authenticated' );

create policy "Authenticated users can delete products"
  on products for delete
  using ( auth.role() = 'authenticated' );

-- Storage Bucket
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- Storage Policies
-- Note: Storage policies must be created on storage.objects
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated can upload" on storage.objects;
drop policy if exists "Authenticated can update" on storage.objects;
drop policy if exists "Authenticated can delete" on storage.objects;

create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'products' );

create policy "Authenticated can upload"
  on storage.objects for insert
  with check ( bucket_id = 'products' and auth.role() = 'authenticated' );

create policy "Authenticated can update"
  on storage.objects for update
  using ( bucket_id = 'products' and auth.role() = 'authenticated' );

create policy "Authenticated can delete"
  on storage.objects for delete
  using ( bucket_id = 'products' and auth.role() = 'authenticated' );
