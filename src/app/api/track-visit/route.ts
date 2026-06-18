import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { error } = await supabaseAdmin.from('visits').insert({
      page: body.page || '/',
      title: body.title || '',
      referrer: body.referrer || 'Direct',
      created_at: new Date().toISOString(),
    });
    if (error) {
      if (error.message?.includes('does not exist') || error.code === '42P01') {
        return Response.json({ tracked: false, reason: 'table_not_found' });
      }
      return Response.json({ tracked: false, error: error.message }, { status: 500 });
    }
    return Response.json({ tracked: true });
  } catch {
    return Response.json({ tracked: false }, { status: 500 });
  }
}
