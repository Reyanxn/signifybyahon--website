import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { error } = await supabase.from('reviews').insert({
      product_id: body.productId,
      user_id: body.userId || 'guest',
      user_name: body.userName,
      rating: body.rating,
      comment: body.comment,
      approved: false,
      featured: false,
    });
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
