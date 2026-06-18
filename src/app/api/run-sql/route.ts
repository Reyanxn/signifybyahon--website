import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
});

export async function POST(req: Request) {
  try {
    const { sql } = await req.json();
    if (!sql || typeof sql !== 'string') {
      return Response.json({ success: false, error: 'No SQL provided' }, { status: 400 });
    }
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
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
