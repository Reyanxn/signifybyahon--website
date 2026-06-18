import { createClient } from '@supabase/supabase-js';

export async function POST() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const defaults = [
    { title: 'New Arrivals', type: 'new-arrivals', display_order: 1, alignment: 'left', active: true, product_ids: [] },
    { title: 'Best Sellers', type: 'best-sellers', display_order: 2, alignment: 'left', active: true, product_ids: [] },
    { title: 'Trending Now', type: 'trending', display_order: 3, alignment: 'left', active: true, product_ids: [] },
    { title: 'Sale', type: 'sale', display_order: 4, alignment: 'left', active: true, product_ids: [] },
    { title: 'Customer Reviews', type: 'testimonials', display_order: 5, alignment: 'center', active: true, product_ids: [] },
  ];

  const { error: delErr } = await supabaseAdmin.from('homepage_sections').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) return Response.json({ error: delErr.message }, { status: 500 });

  const { data, error: insErr } = await supabaseAdmin.from('homepage_sections').insert(defaults).select();
  if (insErr) return Response.json({ error: insErr.message }, { status: 500 });

  return Response.json({ sections: data || [] });
}
