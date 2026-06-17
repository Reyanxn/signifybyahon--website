-- Drop all existing policies first
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

-- Create a security definer function to check admin role (avoids infinite recursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Recreate all policies using the helper function
CREATE POLICY "products_select_all" ON public.products FOR SELECT USING (true);
CREATE POLICY "products_insert_admin" ON public.products FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "products_update_admin" ON public.products FOR UPDATE USING (public.is_admin());
CREATE POLICY "products_delete_admin" ON public.products FOR DELETE USING (public.is_admin());

CREATE POLICY "orders_select_owner" ON public.orders FOR SELECT USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "orders_insert_all" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update_admin" ON public.orders FOR UPDATE USING (public.is_admin());

CREATE POLICY "categories_select_all" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories_insert_admin" ON public.categories FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "banners_select_all" ON public.banners FOR SELECT USING (true);
CREATE POLICY "banners_insert_admin" ON public.banners FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "banners_delete_admin" ON public.banners FOR DELETE USING (public.is_admin());

CREATE POLICY "coupons_select_all" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "coupons_insert_admin" ON public.coupons FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "blogs_select_published" ON public.blogs FOR SELECT USING (published = true OR public.is_admin());
CREATE POLICY "blogs_insert_admin" ON public.blogs FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "blogs_delete_admin" ON public.blogs FOR DELETE USING (public.is_admin());

CREATE POLICY "reviews_select_all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert_auth" ON public.reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "profiles_select_owner" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = auth.uid());
