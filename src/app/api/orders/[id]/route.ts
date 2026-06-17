import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = {
    id,
    customer: 'Sadia Rahman',
    total: 5380,
    status: 'shipped',
    items: [
      { name: 'Embroidered Lawn Suit', qty: 1, price: 2990 },
    ],
  };
  return NextResponse.json({ order });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  return NextResponse.json({ success: true, orderId: id, status: body.status });
}
