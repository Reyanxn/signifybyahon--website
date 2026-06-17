import { NextResponse } from 'next/server';

export async function GET() {
  const orders = [
    { id: 'SIG-A1B2C3', customer: 'Sadia Rahman', total: 5380, status: 'shipped', date: '2025-06-17' },
  ];
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, orderId: 'SIG-' + Date.now() }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
