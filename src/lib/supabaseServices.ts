import { supabase } from './supabase';

// ─── Helpers ──────────────────────────────────────────────
function toSnake(obj: any): any {
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
    // Skip auto-timestamp fields — DB uses DEFAULT now()
    if (key === 'created_at' || key === 'updated_at') continue;
    out[key] = v;
  }
  return out;
}

function toCamel(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamel);
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v;
  }
  return out;
}

function getTotalStockRaw(product: any): number {
  if (product.size_stock && Array.isArray(product.size_stock) && product.size_stock.length > 0) {
    return product.size_stock.reduce((sum: number, s: any) => sum + (s.stock || 0), 0);
  }
  if (product.sizeStock && Array.isArray(product.sizeStock) && product.sizeStock.length > 0) {
    return product.sizeStock.reduce((sum: number, s: any) => sum + (s.stock || 0), 0);
  }
  return product.stock ?? 0;
}

// ─── PRODUCTS ───────────────────────────────────────────
export async function getProducts(opts?: { category?: string; sort?: string; limitCount?: number; featured?: boolean; bestSeller?: boolean; trending?: boolean; onSale?: boolean }) {
  let query = supabase.from('products').select('*');
  if (opts?.category && opts.category !== 'all') query = query.eq('category_id', opts.category);
  if (opts?.featured) query = query.eq('featured', true);
  if (opts?.bestSeller) query = query.eq('best_seller', true);
  if (opts?.trending) query = query.eq('trending', true);
  if (opts?.onSale) query = query.not('sale_price', 'is', null);
  const { data, error } = await query;
  if (error) throw error;
  let result = (data || []).map((d) => toCamel({ id: d.id, ...d }));
  if (opts?.sort === 'price-low') result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
  else if (opts?.sort === 'price-high') result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
  else result.sort((a, b) => {
    const aOut = getTotalStockRaw({ ...a, size_stock: a.sizeStock }) === 0;
    const bOut = getTotalStockRaw({ ...b, size_stock: b.sizeStock }) === 0;
    if (aOut !== bOut) return aOut ? 1 : -1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
  if (opts?.limitCount) result = result.slice(0, opts.limitCount);
  return result;
}

export async function getProduct(id: string) {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) return null;
  return toCamel({ id: data.id, ...data });
}

export async function addProduct(data: any) {
  const { data: result, error } = await supabase.from('products').insert(toSnake(data)).select().single();
  if (error) throw error;
  return result;
}

export async function updateProduct(id: string, data: any) {
  const { error } = await supabase.from('products').update({ ...toSnake(data), updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// ─── ORDERS ────────────────────────────────────────────
export async function getOrders(userId?: string) {
  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (userId) query = query.eq('user_id', userId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((d) => toCamel({ id: d.id, ...d }));
}

export async function getOrder(id: string) {
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
  if (error) return null;
  return toCamel({ id: data.id, ...data });
}

export async function addOrder(data: any) {
  const { error } = await supabase.from('orders').insert(toSnake(data));
  if (error) throw error;
}

export async function updateOrderStatus(id: string, status: string) {
  const { error } = await supabase.from('orders').update({ order_status: status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

// ─── CATEGORIES ─────────────────────────────────────────
export async function getCategories() {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) throw error;
  return (data || []).map((d) => toCamel({ id: d.id, ...d }));
}

// ─── BANNERS ────────────────────────────────────────────
export async function getBanners() {
  const { data, error } = await supabase.from('banners').select('*').order('order', { ascending: true });
  if (error) throw error;
  return (data || []).map((d) => toCamel({ id: d.id, ...d }));
}

export async function addBanner(data: any) {
  const { data: result, error } = await supabase.from('banners').insert(toSnake(data)).select().single();
  if (error) throw error;
  return result;
}

export async function deleteBanner(id: string) {
  const { error } = await supabase.from('banners').delete().eq('id', id);
  if (error) throw error;
}

// ─── COUPONS ────────────────────────────────────────────
export async function getCoupons() {
  const { data, error } = await supabase.from('coupons').select('*');
  if (error) throw error;
  return (data || []).map((d) => toCamel({ id: d.id, ...d }));
}

export async function validateCoupon(code: string) {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .single();
  if (error || !data) return null;
  const now = Date.now();
  const start = new Date(data.start_date).getTime();
  const end = new Date(data.end_date).getTime();
  if (now < start || now > end) return null;
  if (data.used_count >= data.max_uses) return null;
  return toCamel({ id: data.id, ...data });
}

// ─── BLOG ────────────────────────────────────────────────
export async function getBlogPosts() {
  const { data, error } = await supabase.from('blogs').select('*').eq('published', true).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((d) => toCamel({ id: d.id, ...d }));
}

export async function addBlogPost(data: any) {
  const { error } = await supabase.from('blogs').insert(toSnake(data));
  if (error) throw error;
}

export async function deleteBlogPost(id: string) {
  const { error } = await supabase.from('blogs').delete().eq('id', id);
  if (error) throw error;
}

// ─── REVIEWS ─────────────────────────────────────────────
export async function getProductReviews(productId: string) {
  const { data, error } = await supabase.from('reviews')
    .select('*').eq('product_id', productId).eq('approved', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((d) => toCamel({ id: d.id, ...d }));
}

export async function getAllReviews() {
  const { data, error } = await supabase.from('reviews')
    .select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((d) => toCamel({ id: d.id, ...d }));
}

export async function addReview(data: any) {
  const { error } = await supabase.from('reviews').insert(toSnake(data));
  if (error) throw error;
}

export async function updateReview(id: string, data: any) {
  const { error } = await supabase.from('reviews').update(toSnake(data)).eq('id', id);
  if (error) throw error;
}

export async function deleteReview(id: string) {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  if (error) throw error;
}

// ─── HOMEPAGE SECTIONS ────────────────────────────
export async function getHomepageSections() {
  try {
    const res = await fetch('/api/homepage-sections');
    const json = await res.json();
    if (json.sections) return json.sections.map((d: any) => toCamel({ id: d.id, ...d }));
    return [];
  } catch { return []; }
}

export async function getAllHomepageSections() {
  try {
    const res = await fetch('/api/homepage-sections?all=true');
    const json = await res.json();
    if (json.sections) return json.sections.map((d: any) => toCamel({ id: d.id, ...d }));
    return [];
  } catch { return []; }
}

export async function addHomepageSection(data: any) {
  const res = await fetch('/api/homepage-sections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toSnake(data)),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to create');
  return toCamel({ id: json.section.id, ...json.section });
}

export async function updateHomepageSection(id: string, data: any) {
  const res = await fetch(`/api/homepage-sections?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(toSnake(data)),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to update');
}

export async function deleteHomepageSection(id: string) {
  const res = await fetch(`/api/homepage-sections?id=${id}`, { method: 'DELETE' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to delete');
}

export async function resetHomepageSections() {
  const res = await fetch('/api/homepage-sections?action=reset', { method: 'POST' });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to reset');
}

export async function getFeaturedReviews() {
  const { data, error } = await supabase.from('reviews')
    .select('*, products(name)').eq('featured', true).eq('approved', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map((d) => toCamel({ id: d.id, ...d }));
}

// ─── STORAGE UPLOAD ─────────────────────────────────────
export async function uploadFile(file: File, path: string, bucket = 'product-images'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('path', path);
  formData.append('bucket', bucket);
  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error);
  return json.url;
}

export async function uploadProductImage(file: File, productId: string, index: number): Promise<string> {
  return uploadFile(file, `products/${productId}/${index}_${Date.now()}`);
}

// ─── USER PROFILES ────────────────────────────────────
export async function createUserProfile(uid: string, data: any) {
  const { error } = await supabase.from('profiles').insert({ id: uid, ...toSnake(data), role: 'customer' });
  if (error && error.code !== '23505') throw error; // ignore duplicate
}

export async function getUserProfile(uid: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', uid).single();
  if (error) return null;
  return toCamel({ id: data.id, ...data });
}

export async function getUsers() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw error;
  return (data || []).map((d) => toCamel({ id: d.id, ...d }));
}

// ─── BLOG POST (single) ────────────────────────────────
export async function getBlogPost(slug: string) {
  const { data, error } = await supabase.from('blogs').select('*').eq('slug', slug).single();
  if (error) return null;
  return toCamel({ id: data.id, ...data });
}

// ─── REELS (products with video) ──────────────────────
export async function getReelProducts() {
  const { data, error } = await supabase.from('products').select('*').not('video', 'is', null).limit(10);
  if (error) throw error;
  return (data || []).map((d: any) => toCamel({ id: d.id, ...d }));
}

// ─── STOCK ──────────────────────────────────────────────
export async function decrementProductStock(productId: string, sizeName: string, quantity: number) {
  const { data: product, error: fetchError } = await supabase.from('products').select('size_stock, stock').eq('id', productId).single();
  if (fetchError || !product) throw new Error('Product not found');

  const sizeStock: { name: string; stock: number; visible: boolean }[] = product.size_stock || [];
  const idx = sizeStock.findIndex((s) => s.name === sizeName);
  if (idx === -1) throw new Error(`Size '${sizeName}' not found for this product`);

  sizeStock[idx] = { ...sizeStock[idx], stock: Math.max(0, sizeStock[idx].stock - quantity) };
  const newTotal = sizeStock.reduce((sum, s) => sum + s.stock, 0);

  const { error: updateError } = await supabase.from('products').update({
    size_stock: sizeStock,
    stock: newTotal,
    updated_at: new Date().toISOString(),
  }).eq('id', productId);

  if (updateError) throw updateError;
}
