import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = (formData.get('bucket') as string) || 'product-images';
    const path = formData.get('path') as string;

    if (!file || !path) {
      return NextResponse.json({ error: 'Missing file or path' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) throw error;

    const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
