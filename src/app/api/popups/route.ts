import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const onlyActive = searchParams.get('active') === 'true';
    let query = supabaseAdmin().from('popups').select('*').order('order', { ascending: true, nullsFirst: false });
    if (onlyActive) query = query.eq('active', true);
    const { data, error } = await query;
    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return Response.json({ data: [] });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ data: data || [] });
  } catch {
    return Response.json({ data: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { error } = await supabaseAdmin().from('popups').insert({
      image: body.image,
      link: body.link || null,
      active: body.active ?? true,
      order: body.order ?? 0,
    });
    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return Response.json({ error: 'Table not found. Create it via Admin > Setup tab.', status: 404 }, { status: 404 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) return Response.json({ error: 'Missing id' }, { status: 400 });
    const updates: any = {};
    if (body.image !== undefined) updates.image = body.image;
    if (body.link !== undefined) updates.link = body.link;
    if (body.active !== undefined) updates.active = body.active;
    if (body.order !== undefined) updates.order = body.order;
    const { error } = await supabaseAdmin().from('popups').update(updates).eq('id', body.id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ error: 'Missing id' }, { status: 400 });
    const { error } = await supabaseAdmin().from('popups').delete().eq('id', id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ success: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
