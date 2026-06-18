import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

function toCamel(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(toCamel);
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v;
  }
  return out;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const { data, error } = await supabaseAdmin.from('products').select('*').eq('id', id).single();
    if (error) return NextResponse.json(null);
    return NextResponse.json(toCamel({ id: data.id, ...data }));
  }

  const { data } = await supabaseAdmin.from('products').select('*').order('created_at', { ascending: false }).limit(10);
  return NextResponse.json((data || []).map((d: any) => toCamel({ id: d.id, ...d })));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, productId: Date.now().toString() }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
