-- ============================================================
-- Marketplace MVP - Initial Database Schema
-- Supabase (PostgreSQL) Migration
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES (Extends auth.users)
-- ============================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: Update updated_at on profiles
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 2. PRODUCTS
-- ============================================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),  -- stored in cents
  images TEXT[] DEFAULT '{}',
  category TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'draft')),
  stock INTEGER NOT NULL DEFAULT 1 CHECK (stock >= 0),  -- For "deduct stock" logic in mock payment
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_created_at ON public.products(created_at DESC);

-- ============================================================
-- 3. ORDERS
-- ============================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0),  -- in cents
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- ============================================================
-- 4. ORDER_ITEMS
-- ============================================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_purchase INTEGER NOT NULL CHECK (price_at_purchase >= 0),  -- snapshot in cents
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS) - CRITICAL
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- --- PROFILES ---
-- Read: Public (anyone can view profiles)
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (true);

-- Insert: Only via trigger (auth.users)
CREATE POLICY "profiles_insert_service_role"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Update: Only own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- --- PRODUCTS ---
-- Read: Public
CREATE POLICY "products_select_public"
  ON public.products FOR SELECT
  USING (true);

-- Insert: Authenticated users with seller role (or admin)
CREATE POLICY "products_insert_seller"
  ON public.products FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND (
      auth.uid() = seller_id
      OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    )
  );

-- Update/Delete: Only seller or admin
CREATE POLICY "products_update_seller"
  ON public.products FOR UPDATE
  USING (
    seller_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    seller_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "products_delete_seller"
  ON public.products FOR DELETE
  USING (
    seller_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- --- ORDERS ---
-- Read: buyer_id OR seller (via order_items -> products)
CREATE POLICY "orders_select_buyer_or_seller"
  ON public.orders FOR SELECT
  USING (
    buyer_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.order_items oi
      JOIN public.products p ON p.id = oi.product_id
      WHERE oi.order_id = orders.id AND p.seller_id = auth.uid()
    )
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Insert: Authenticated buyers (for checkout)
CREATE POLICY "orders_insert_buyer"
  ON public.orders FOR INSERT
  WITH CHECK (buyer_id = auth.uid());

-- Update: Buyer (for status changes) or Admin (for shipped/completed)
CREATE POLICY "orders_update_buyer_or_admin"
  ON public.orders FOR UPDATE
  USING (
    buyer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (true);

-- --- ORDER_ITEMS ---
-- Read: Same as orders (via order)
CREATE POLICY "order_items_select_via_order"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id
      AND (
        o.buyer_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.products p
          WHERE p.id = order_items.product_id AND p.seller_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- Insert: When creating order (buyer_id matches order's buyer)
CREATE POLICY "order_items_insert_buyer"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_items.order_id AND o.buyer_id = auth.uid()
    )
  );

-- No Update/Delete on order_items for MVP (orders are immutable once created)

-- ============================================================
-- 6. STORAGE BUCKET - "marketplace" (Product Images)
-- ============================================================

-- Create the bucket (public for read access to product images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketplace',
  'marketplace',
  true,
  5242880,  -- 5MB max per file
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: Authenticated users can upload; Public read
CREATE POLICY "marketplace_upload_authenticated"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'marketplace'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "marketplace_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'marketplace');

CREATE POLICY "marketplace_update_own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'marketplace'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "marketplace_delete_own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'marketplace'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- 7. HELPER VIEW (Optional - for Admin Dashboard)
-- ============================================================

CREATE OR REPLACE VIEW public.orders_with_sellers AS
SELECT
  o.id,
  o.buyer_id,
  o.total_amount,
  o.status,
  o.created_at,
  bp.full_name AS buyer_name,
  json_agg(DISTINCT jsonb_build_object(
    'product_id', p.id,
    'seller_id', p.seller_id,
    'seller_name', sp.full_name,
    'title', p.title,
    'quantity', oi.quantity,
    'price_at_purchase', oi.price_at_purchase
  )) FILTER (WHERE p.id IS NOT NULL) AS items
FROM public.orders o
JOIN public.profiles bp ON bp.id = o.buyer_id
LEFT JOIN public.order_items oi ON oi.order_id = o.id
LEFT JOIN public.products p ON p.id = oi.product_id
LEFT JOIN public.profiles sp ON sp.id = p.seller_id
GROUP BY o.id, o.buyer_id, o.total_amount, o.status, o.created_at, bp.full_name;

-- Grant access to the view (RLS inherits from underlying tables)
GRANT SELECT ON public.orders_with_sellers TO authenticated;
GRANT SELECT ON public.orders_with_sellers TO anon;
