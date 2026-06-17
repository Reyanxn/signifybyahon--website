DROP POLICY IF EXISTS "products_select_all" ON public.products;
DROP POLICY IF EXISTS "products_insert_admin" ON public.products;
DROP POLICY IF EXISTS "products_update_admin" ON public.products;
DROP POLICY IF EXISTS "products_delete_admin" ON public.products;
DROP POLICY IF EXISTS "orders_select_owner" ON public.orders;
DROP POLICY IF EXISTS "orders_insert_all" ON public.orders;
DROP POLICY IF EXISTS "orders_update_admin" ON public.orders;
DROP POLICY IF EXISTS "categories_select_all" ON public.categories;
DROP POLICY IF EXISTS "categories_insert_admin" ON public.categories;
DROP POLICY IF EXISTS "banners_select_all" ON public.banners;
DROP POLICY IF EXISTS "banners_insert_admin" ON public.banners;
DROP POLICY IF EXISTS "banners_delete_admin" ON public.banners;
DROP POLICY IF EXISTS "coupons_select_all" ON public.coupons;
DROP POLICY IF EXISTS "coupons_insert_admin" ON public.coupons;
DROP POLICY IF EXISTS "blogs_select_published" ON public.blogs;
DROP POLICY IF EXISTS "blogs_insert_admin" ON public.blogs;
DROP POLICY IF EXISTS "blogs_delete_admin" ON public.blogs;
DROP POLICY IF EXISTS "reviews_select_all" ON public.reviews;
DROP POLICY IF EXISTS "reviews_insert_auth" ON public.reviews;
DROP POLICY IF EXISTS "profiles_select_owner" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Allow all authenticated users to manage products
CREATE POLICY "products_all" ON public.products FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Orders: owner or any authenticated can read; anyone can insert; authenticated can update
CREATE POLICY "orders_select" ON public.orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "orders_insert" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update" ON public.orders FOR UPDATE USING (auth.role() = 'authenticated');

-- Categories: all authenticated can manage
CREATE POLICY "categories_all" ON public.categories FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Banners: all authenticated can manage
CREATE POLICY "banners_all" ON public.banners FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Coupons: all authenticated can manage
CREATE POLICY "coupons_all" ON public.coupons FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Blogs: all authenticated can manage
CREATE POLICY "blogs_all" ON public.blogs FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Reviews: all authenticated can read, anyone authenticated can insert
CREATE POLICY "reviews_select" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Profiles: owner read/write, authenticated can read all
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = auth.uid());
