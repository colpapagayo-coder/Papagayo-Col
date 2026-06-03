-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    "base64Image" TEXT NOT NULL,
    "departmentCode" TEXT NOT NULL,
    "ownerId" UUID NOT NULL,
    prices JSONB NOT NULL DEFAULT '{}'::jsonb,
    "createdAt" BIGINT NOT NULL
);

-- Note: we use double quotes for camelCase names so Supabase/PostgreSQL respects the casing.
-- Ensure the dynamic "category" field introduced in the tabs setup is present in the products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Général';

-- Enable RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if they already exist to avoid "already exists" errors
DROP POLICY IF EXISTS "Allow public read access" ON public.products;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON public.products;

-- Anyone can read products
CREATE POLICY "Allow public read access" ON public.products
    FOR SELECT TO public USING (true);
    
-- Authenticated users can insert their own products
CREATE POLICY "Allow authenticated users to insert" ON public.products
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = "ownerId");

-- Create product_requests table
CREATE TABLE IF NOT EXISTS public.product_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    "requestedProduct" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for product_requests
ALTER TABLE public.product_requests ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies for requests to avoid "already exists" errors
DROP POLICY IF EXISTS "Allow public insert to product_requests" ON public.product_requests;
DROP POLICY IF EXISTS "Allow admin read requests" ON public.product_requests;

-- Allow anyone to insert requests
CREATE POLICY "Allow public insert to product_requests" ON public.product_requests
    FOR INSERT TO public WITH CHECK (true);
    
-- Allow authenticated admins to read requests
CREATE POLICY "Allow admin read requests" ON public.product_requests
    FOR SELECT TO authenticated USING (true);

