import { NextResponse } from 'next/server';

export async function GET() {
  const products = [
    { id: '1', name: 'Embroidered Lawn Suit', price: 2990, category: 'lawn' },
  ];
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, productId: Date.now().toString() }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
