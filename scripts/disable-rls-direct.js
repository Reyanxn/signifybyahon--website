const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://igrndenbhfmjdqpseose.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlncm5kZW5iaGZtamRxcHNlb3NlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTcwODIwMywiZXhwIjoyMDk3Mjg0MjAzfQ.lgU0yEujTijeALm637Mzz8-eIHGbvbSj20Fn-1ZKBWA'
);

async function main() {
  // Disable RLS
  const tables = ['products', 'orders', 'categories', 'banners', 'coupons', 'blogs', 'reviews', 'profiles'];
  for (const t of tables) {
    const { error } = await supabase.rpc('exec_sql', { sql: `ALTER TABLE public.${t} DISABLE ROW LEVEL SECURITY;` });
    if (error) console.log(`${t}: ${error.message}`);
    else console.log(`${t}: RLS disabled`);
  }
}
main().catch(console.error);
