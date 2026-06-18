import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const dayStart = new Date(date + 'T00:00:00').toISOString();
    const dayEnd = new Date(date + 'T23:59:59').toISOString();

    const isToday = date === new Date().toISOString().split('T')[0];
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const [vRes, oRes] = await Promise.all([
      supabaseAdmin().from('visits').select('id, page, title, referrer, created_at').gte('created_at', dayStart).lte('created_at', dayEnd).order('created_at', { ascending: false }).limit(500),
      supabaseAdmin().from('orders').select('id, total_amount, created_at').gte('created_at', dayStart).lte('created_at', dayEnd).order('created_at', { ascending: false }),
    ]);

    let activeCount = 0;
    if (isToday) {
      const aRes = await supabaseAdmin().from('visits').select('id', { count: 'exact', head: true }).gte('created_at', fiveMinAgo);
      activeCount = (aRes as any).count || 0;
    }

    const visits = vRes.data || [];
    const orders = oRes.data || [];

    const refMap: Record<string, number> = {};
    const pageMap: Record<string, { count: number; label: string }> = {};

    visits.forEach((v: any) => {
      const s = v.referrer || 'Direct';
      refMap[s] = (refMap[s] || 0) + 1;
      const label = cleanPageLabel(v);
      if (!pageMap[label]) pageMap[label] = { count: 0, label };
      pageMap[label].count++;
    });

    return Response.json({
      visits,
      orders,
      activeCount,
      totalVisits: visits.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((s: number, o: any) => s + (o.total_amount || 0), 0),
      referrerStats: Object.entries(refMap).sort((a, b) => b[1] - a[1]).map(([source, count]) => ({ source, count })),
      pageStats: Object.values(pageMap).sort((a, b) => b.count - a.count),
    });
  } catch (err: any) {
    return Response.json({ error: err.message, visits: [], orders: [], activeCount: 0, totalVisits: 0, totalOrders: 0, totalRevenue: 0, referrerStats: [], pageStats: [] }, { status: 500 });
  }
}

function cleanPageLabel(v: any): string {
  const title = v.title || '';
  const page = v.page || '/';
  if (title) {
    const clean = title.replace(/\s*\|\s*SIGNIFY BY AHON.*$/, '').trim();
    if (clean) return clean;
  }
  if (page === '/') return 'Home';
  if (page.startsWith('/product/')) return 'Product: ' + (title || page.split('/').pop());
  if (page.startsWith('/blog/')) return 'Blog: ' + (title || page.split('/').pop());
  if (page.startsWith('/admin')) return 'Admin';
  if (page.startsWith('/shop')) return 'Shop';
  if (page.startsWith('/cart')) return 'Cart';
  if (page.startsWith('/checkout')) return 'Checkout';
  return page.replace(/^\//, '').replace(/\//g, ' > ') || 'Home';
}
