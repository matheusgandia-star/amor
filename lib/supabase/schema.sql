-- Amor em Dia — Supabase Schema
-- Execute este SQL no SQL Editor do Supabase

-- Categorias
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Produtos
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sub text default '',
  price numeric(10,2) not null default 0,
  cat uuid references categories(id) on delete set null,
  stock integer not null default 0,
  color text default '#F9E4E6',
  accent text default '#E88A92',
  photos text[] default '{}',
  descricao text default '',
  ingredientes text default '',
  ritual text default '',
  fav boolean default false,
  created_at timestamptz default now()
);

-- Clientes
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  whatsapp text default '',
  endereco text default '',
  cidade text default '',
  cep text default '',
  created_at timestamptz default now()
);

-- Pedidos
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  data date not null default current_date,
  cliente text default '',
  whatsapp text default '',
  endereco text default '',
  cidade text default '',
  cep text default '',
  envio text default 'correios' check (envio in ('correios','motoboy','retirada')),
  frete numeric(10,2) default 0,
  pgto text default '',
  status text default 'novo' check (status in ('novo','preparando','enviado','entregue','cancelado')),
  status_pgto text default 'aguardando' check (status_pgto in ('aguardando','pago','cancelado')),
  produtos uuid[] default '{}',
  qtds jsonb default '{}',
  subtotal numeric(10,2) default 0,
  total numeric(10,2) default 0,
  created_at timestamptz default now()
);

-- Configurações do site (linha única)
create table if not exists settings (
  id integer primary key default 1 check (id = 1),
  mode text default 'catalogo' check (mode in ('catalogo','loja')),
  whatsapp text default '11986305013',
  instagram text default '@amoremdia.atelie',
  banner_url text default '',
  banner_mobile_url text default '',
  hero_title text default 'Sabonetes artesanais feitos com amor',
  hero_subtitle text default 'Produtos naturais para cuidar de você',
  seo_title text default 'Amor em Dia — Sabonetes Artesanais',
  seo_description text default 'Sabonetes artesanais naturais feitos com amor.',
  favicon_url text default '',
  updated_at timestamptz default now()
);

-- Inserir linha única de settings se não existir
insert into settings (id) values (1) on conflict do nothing;

-- Storage bucket para fotos (execute separado no painel do Supabase)
-- insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true);
-- insert into storage.buckets (id, name, public) values ('banners', 'banners', true);

-- RLS Policies
alter table categories enable row level security;
alter table products enable row level security;
alter table customers enable row level security;
alter table orders enable row level security;
alter table settings enable row level security;

-- Leitura pública (site público precisa ver produtos/categorias/settings)
create policy "public read categories" on categories for select using (true);
create policy "public read products" on products for select using (true);
create policy "public read settings" on settings for select using (true);

-- Escrita apenas autenticado (admin)
create policy "auth write categories" on categories for all using (auth.role() = 'authenticated');
create policy "auth write products" on products for all using (auth.role() = 'authenticated');
create policy "auth write customers" on customers for all using (auth.role() = 'authenticated');
create policy "auth read customers" on customers for select using (auth.role() = 'authenticated');
create policy "auth write orders" on orders for all using (auth.role() = 'authenticated');
create policy "auth read orders" on orders for select using (auth.role() = 'authenticated');
create policy "auth write settings" on settings for all using (auth.role() = 'authenticated');
