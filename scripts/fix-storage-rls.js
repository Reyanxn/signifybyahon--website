const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:rashedxn019@db.igrndenbhfmjdqpseose.supabase.co:5432/postgres',
});

async function main() {
  await client.connect();
  
  // First, check current RLS status on storage.objects
  const rlsCheck = await client.query(`
    SELECT relname, relrowsecurity 
    FROM pg_class 
    WHERE relname = 'objects' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage');
  `);
  console.log('Storage objects RLS:', rlsCheck.rows[0]?.relrowsecurity ? 'ENABLED' : 'DISABLED');

  // Try disabling RLS first
  await client.query(`ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;`);
  console.log('Disabled RLS on storage.objects');
  
  // Verify
  const rlsCheck2 = await client.query(`
    SELECT relname, relrowsecurity 
    FROM pg_class 
    WHERE relname = 'objects' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'storage');
  `);
  console.log('Storage objects RLS after:', rlsCheck2.rows[0]?.relrowsecurity ? 'ENABLED' : 'DISABLED');

  // Also verify products table
  const prodCheck = await client.query(`
    SELECT relname, relrowsecurity 
    FROM pg_class 
    WHERE relname = 'products' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
  `);
  console.log('Products RLS:', prodCheck.rows[0]?.relrowsecurity ? 'ENABLED' : 'DISABLED');

  await client.end();
  console.log('Done!');
}

main().catch(console.error);
