// ─── API helper ─────────────────────────────────────────
async function db(opts: {
  table: string;
  action: 'select' | 'insert' | 'update' | 'delete';
  data?: any;
  filters?: any;
  order?: { column: string; ascending?: boolean };
  limitCount?: number;
  single?: boolean;
  count?: boolean;
  columns?: string;
}) {
  const res = await fetch('/api/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(opts),
  });
  const json = await res.json();
  if (json.error === 'table_not_found') return { data: opts.single ? null : [], count: 0 };
  if (!res.ok) throw new Error(json.error || 'DB error');
  return json;
}

// ─── Helpers ──────────────────────────────────────────────
function toSnake(obj: any): any {
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = k.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
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
  const filters: any = {};
  if (opts?.category && opts.category !== 'all') filters.category_id = opts.category;
  if (opts?.featured) filters.featured = true;
  if (opts?.bestSeller) filters.best_seller = true;
  if (opts?.trending) filters.trending = true;
  if (opts?.onSale) { filters.sale_price = { operator: 'neq', value: null }; }
  const result = await db({ table: 'products', action: 'select', filters });
  let data = (result.data || []).map((d: any) => toCamel({ id: d.id, ...d }));
  if (opts?.sort === 'price-low') data.sort((a: any, b: any) => (a.salePrice || a.price) - (b.salePrice || b.price));
  else if (opts?.sort === 'price-high') data.sort((a: any, b: any) => (b.salePrice || b.price) - (a.salePrice || a.price));
  else data.sort((a: any, b: any) => {
    const aOut = getTotalStockRaw({ ...a, size_stock: a.sizeStock }) === 0;
    const bOut = getTotalStockRaw({ ...b, size_stock: b.sizeStock }) === 0;
    if (aOut !== bOut) return aOut ? 1 : -1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });
  if (opts?.limitCount) data = data.slice(0, opts.limitCount);
  return data;
}

export async function getProduct(id: string) {
  const result = await db({ table: 'products', action: 'select', filters: { id }, single: true });
  if (!result.data) return null;
  return toCamel({ id: result.data.id, ...result.data });
}

export async function addProduct(data: any) {
  const result = await db({ table: 'products', action: 'insert', data: toSnake(data) });
  return result.data;
}

export async function updateProduct(id: string, data: any) {
  await db({ table: 'products', action: 'update', data: { ...toSnake(data), updated_at: new Date().toISOString() }, filters: { id } });
}

export async function deleteProduct(id: string) {
  await db({ table: 'products', action: 'delete', filters: { id } });
}

// ─── ORDERS ────────────────────────────────────────────
export async function getOrders(userId?: string) {
  const filters: any = {};
  if (userId) filters.user_id = userId;
  const result = await db({ table: 'orders', action: 'select', filters, order: { column: 'created_at', ascending: false } });
  return (result.data || []).map((d: any) => toCamel({ id: d.id, ...d }));
}

export async function getOrder(id: string) {
  const result = await db({ table: 'orders', action: 'select', filters: { id }, single: true });
  if (!result.data) return null;
  return toCamel({ id: result.data.id, ...result.data });
}

export async function addOrder(data: any) {
  await db({ table: 'orders', action: 'insert', data: toSnake(data) });
}

export async function updateOrderStatus(id: string, status: string) {
  await db({ table: 'orders', action: 'update', data: { order_status: status, updated_at: new Date().toISOString() }, filters: { id } });
}

// ─── CATEGORIES ─────────────────────────────────────────
export async function getCategories() {
  const result = await db({ table: 'categories', action: 'select' });
  return (result.data || []).map((d: any) => toCamel({ id: d.id, ...d }));
}

// ─── BANNERS ────────────────────────────────────────────
export async function getBanners() {
  const result = await db({ table: 'banners', action: 'select', order: { column: 'order', ascending: true } });
  return (result.data || []).map((d: any) => toCamel({ id: d.id, ...d }));
}

export async function addBanner(data: any) {
  const result = await db({ table: 'banners', action: 'insert', data: toSnake(data) });
  return result.data;
}

export async function deleteBanner(id: string) {
  await db({ table: 'banners', action: 'delete', filters: { id } });
}

// ─── COUPONS ────────────────────────────────────────────
export async function getCoupons() {
  const result = await db({ table: 'coupons', action: 'select' });
  return (result.data || []).map((d: any) => toCamel({ id: d.id, ...d }));
}

export async function validateCoupon(code: string) {
  const result = await db({ table: 'coupons', action: 'select', filters: { code: code.toUpperCase(), active: true }, single: true });
  if (!result.data) return null;
  const now = Date.now();
  const start = new Date(result.data.start_date).getTime();
  const end = new Date(result.data.end_date).getTime();
  if (now < start || now > end) return null;
  if (result.data.used_count >= result.data.max_uses) return null;
  return toCamel({ id: result.data.id, ...result.data });
}

// ─── BLOG ────────────────────────────────────────────────
export async function getBlogPosts() {
  const result = await db({ table: 'blogs', action: 'select', filters: { published: true }, order: { column: 'created_at', ascending: false } });
  return (result.data || []).map((d: any) => toCamel({ id: d.id, ...d }));
}

export async function addBlogPost(data: any) {
  await db({ table: 'blogs', action: 'insert', data: toSnake(data) });
}

export async function deleteBlogPost(id: string) {
  await db({ table: 'blogs', action: 'delete', filters: { id } });
}

// ─── REVIEWS ─────────────────────────────────────────────
export async function getProductReviews(productId: string) {
  const result = await db({ table: 'reviews', action: 'select', filters: { product_id: productId, approved: true }, order: { column: 'created_at', ascending: false } });
  return (result.data || []).map((d: any) => toCamel({ id: d.id, ...d }));
}

export async function getAllReviews() {
  const result = await db({ table: 'reviews', action: 'select', order: { column: 'created_at', ascending: false } });
  return (result.data || []).map((d: any) => toCamel({ id: d.id, ...d }));
}

export async function addReview(data: any) {
  await db({ table: 'reviews', action: 'insert', data: toSnake(data) });
}

export async function updateReview(id: string, data: any) {
  await db({ table: 'reviews', action: 'update', data: toSnake(data), filters: { id } });
}

export async function deleteReview(id: string) {
  await db({ table: 'reviews', action: 'delete', filters: { id } });
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
  const result = await db({ table: 'reviews', action: 'select', filters: { featured: true, approved: true }, order: { column: 'created_at', ascending: false } });
  return (result.data || []).map((d: any) => toCamel({ id: d.id, ...d }));
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
  try {
    await db({ table: 'profiles', action: 'insert', data: { id: uid, ...toSnake(data), role: 'customer' } });
  } catch (err: any) {
    if (err.message?.includes('23505')) return; // ignore duplicate
    throw err;
  }
}

export async function getUserProfile(uid: string) {
  const result = await db({ table: 'profiles', action: 'select', filters: { id: uid }, single: true });
  if (!result.data) return null;
  return toCamel({ id: result.data.id, ...result.data });
}

export async function getUsers() {
  const result = await db({ table: 'profiles', action: 'select' });
  return (result.data || []).map((d: any) => toCamel({ id: d.id, ...d }));
}

// ─── BLOG POST (single) ────────────────────────────────
export async function getBlogPost(slug: string) {
  const result = await db({ table: 'blogs', action: 'select', filters: { slug }, single: true });
  if (!result.data) return null;
  return toCamel({ id: result.data.id, ...result.data });
}

// ─── REELS (products with video) ──────────────────────
export async function getReelProducts() {
  const result = await db({ table: 'products', action: 'select', filters: { video: { operator: 'neq', value: null } }, limitCount: 10 });
  return (result.data || []).map((d: any) => toCamel({ id: d.id, ...d }));
}

// ─── STOCK ──────────────────────────────────────────────
export async function decrementProductStock(productId: string, sizeName: string, quantity: number) {
  const result = await db({ table: 'products', action: 'select', filters: { id: productId }, single: true });
  if (!result.data) throw new Error('Product not found');
  const product = result.data;
  const sizeStock: { name: string; stock: number; visible: boolean }[] = product.size_stock || [];
  const idx = sizeStock.findIndex((s) => s.name === sizeName);
  if (idx === -1) throw new Error(`Size '${sizeName}' not found for this product`);
  sizeStock[idx] = { ...sizeStock[idx], stock: Math.max(0, sizeStock[idx].stock - quantity) };
  const newTotal = sizeStock.reduce((sum, s) => sum + s.stock, 0);
  await db({ table: 'products', action: 'update', data: { size_stock: sizeStock, stock: newTotal, updated_at: new Date().toISOString() }, filters: { id: productId } });
}
