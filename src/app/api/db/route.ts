import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const admin = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { table, action, data, filters, order, limitCount, single, count, columns } = body;
    if (!table) return NextResponse.json({ error: 'Missing table' }, { status: 400 });

    let query: any;

    if (action === 'select') {
      query = admin().from(table).select(columns || '*', count ? { count: 'exact', head: !!count } : {});
      if (filters) applyFilters(query, filters);
      if (order) query = query.order(order.column, { ascending: order.ascending ?? true });
      if (limitCount) query = query.limit(limitCount);
      if (single) query = query.single();
      const result = await query;
      if (result.error && result.error.message?.includes('does not exist') || result.error?.code === '42P01') {
        return NextResponse.json({ data: null, count: 0, error: 'table_not_found' }, { status: 200 });
      }
      if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
      return NextResponse.json({ data: result.data || null, count: result.count ?? 0 });
    }

    if (action === 'insert') {
      query = admin().from(table).insert(data || {}).select('*');
      const result = await query;
      if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
      return NextResponse.json({ data: result.data?.[0] || null });
    }

    if (action === 'update') {
      query = admin().from(table).update(data || {});
      if (filters) applyFilters(query, filters);
      const result = await query;
      if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      query = admin().from(table).delete();
      if (filters) applyFilters(query, filters);
      const result = await query;
      if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function applyFilters(query: any, filters: any) {
  for (const [col, val] of Object.entries(filters)) {
    if (val !== null && val !== undefined && typeof val === 'object' && 'operator' in val) {
      const { operator, value } = val as any;
      if (operator === 'neq') query = query.neq(col, value);
      else if (operator === 'gt') query = query.gt(col, value);
      else if (operator === 'gte') query = query.gte(col, value);
      else if (operator === 'lt') query = query.lt(col, value);
      else if (operator === 'lte') query = query.lte(col, value);
      else if (operator === 'is') query = query.is(col, value);
      else if (operator === 'in') query = query.in(col, value);
      else if (operator === 'contains') query = query.contains(col, value);
      else if (operator === 'ilike') query = query.ilike(col, value);
      else query = query.eq(col, value);
    } else {
      query = query.eq(col, val);
    }
  }
}
