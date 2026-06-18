import { Pool } from 'pg';

export async function POST(req: Request) {
  try {
    const { sql } = await req.json();
    if (!sql || typeof sql !== 'string') {
      return Response.json({ success: false, error: 'No SQL provided' }, { status: 400 });
    }

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      return Response.json({
        success: false,
        error: [
          'DATABASE_URL not set in Vercel environment variables.',
          '',
          'To fix:',
          '1. Go to https://vercel.com/reyanxn/signifybyahon--website/settings/environment-variables',
          '2. Add DATABASE_URL with value:',
          '   postgresql://postgres:rashedxn019@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
          '3. Redeploy',
          '',
          'Or run the ALL SQL manually in Supabase SQL Editor (Dashboard → SQL Editor → New Query):',
          '',
          '-- === PASTE FROM AdminSetup.tsx "Show SQL" button ===',
        ].join('\n'),
      }, { status: 500 });
    }

    const pool = new Pool({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
      max: 1,
    });

    const client = await pool.connect();
    try {
      const result = await client.query(sql);
      return Response.json({
        success: true,
        rows: result.rows || [],
        rowCount: result.rowCount ?? 0,
        command: result.command,
      });
    } finally {
      client.release();
    }
  } catch (error: any) {
    const msg = error.message || String(error);
    if (msg.includes('ECONNREFUSED') || msg.includes('ENOTFOUND') || msg.includes('timeout')) {
      return Response.json({
        success: false,
        error: [
          'Cannot connect to database from Vercel.',
          '',
          'To fix, add this DATABASE_URL in Vercel env vars:',
          '   postgresql://postgres:rashedxn019@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
          '',
          'Or run the SQL manually in Supabase SQL Editor.',
        ].join('\n'),
      }, { status: 500 });
    }
    return Response.json({ success: false, error: msg }, { status: 500 });
  }
}
