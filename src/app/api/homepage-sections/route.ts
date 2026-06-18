import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULTS = [
  { title: 'New Arrivals', type: 'new-arrivals', display_order: 1, alignment: 'left', active: true, product_ids: [] },
  { title: 'Best Sellers', type: 'best-sellers', display_order: 2, alignment: 'left', active: true, product_ids: [] },
  { title: 'Trending Now', type: 'trending', display_order: 3, alignment: 'left', active: true, product_ids: [] },
  { title: 'Sale', type: 'sale', display_order: 4, alignment: 'left', active: true, product_ids: [] },
  { title: 'Customer Reviews', type: 'testimonials', display_order: 5, alignment: 'center', active: true, product_ids: [] },
];

const db = () => supabaseAdmin || supabase;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const all = url.searchParams.get('all') === 'true';

  let query = db().from('homepage_sections').select('*');
  if (!all) query = query.eq('active', true);
  query = query.order('display_order', { ascending: true });

  const { data, error } = await query;
  if (error) {
    if (error.message?.includes('does not exist') || error.code === '42P01') {
      return NextResponse.json({ sections: [] });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    const { data: seeded, error: seedErr } = await db().from('homepage_sections').insert(DEFAULTS).select();
    if (seedErr) return NextResponse.json({ error: seedErr.message }, { status: 500 });
    return NextResponse.json({ sections: seeded || [] });
  }

  return NextResponse.json({ sections: data });
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  if (action === 'reset') {
    await db().from('homepage_sections').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { data, error } = await db().from('homepage_sections').insert(DEFAULTS).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ sections: data || [] });
  }

  const body = await req.json();
  const { data, error } = await db().from('homepage_sections').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ section: data });
}

export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const body = await req.json();
  const { data, error } = await db().from('homepage_sections').update({ ...body, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ section: data });
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await db().from('homepage_sections').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
