const { Client } = require('pg');

async function main() {
  const client = new Client({
    host: '2406:da14:1d62:b401:3ca0:1ec9:807c:6bf9',
    port: 5432,
    user: 'postgres',
    password: 'rashedxn019',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('Connected!');

  // Add order column
  await client.query(`ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;`);
  console.log('Added order column');

  // Update existing categories order
  const cats = [
    { name: 'Lawn Suits', slug: 'lawn-suits', order: 1 },
    { name: 'Kurtas', slug: 'kurtas', order: 2 },
    { name: 'Dupattas', slug: 'dupattas', order: 3 },
    { name: 'Sarees', slug: 'sarees', order: 4 },
    { name: 'Silk Collection', slug: 'silk', order: 5 },
    { name: 'Winter Collection', slug: 'winter', order: 6 },
    { name: 'Summer Collection', slug: 'summer', order: 7 },
  ];
  for (const c of cats) {
    await client.query(
      `INSERT INTO public.categories (name, slug, "order") VALUES ($1, $2, $3) ON CONFLICT (slug) DO UPDATE SET "order" = $3, name = $1`,
      [c.name, c.slug, c.order]
    );
  }
  console.log('Seeded categories');

  await client.end();
  console.log('Done!');
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
