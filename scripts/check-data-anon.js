const { createClient } = require('@supabase/supabase-js');
// Use anon key (same as frontend uses)
const s = createClient('https://igrndenbhfmjdqpseose.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlncm5kZW5iaGZtamRxcHNlb3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDgyMDMsImV4cCI6MjA5NzI4NDIwM30.PqhYB8nUTTshWdB8xNKVob_nFSGpIjGoIzcPLLUV5_4');

async function check() {
  const { data, error } = await s.from('products').select('*').limit(10);
  if (error) { console.error('Error:', error); return; }
  console.log('Products count:', data?.length);
  data?.forEach(p => console.log(' -', p.name, '| best_seller:', p.best_seller, '| trending:', p.trending));

  const { data: orders } = await s.from('orders').select('*').limit(5);
  console.log('\nOrders count:', orders?.length);
  orders?.forEach(o => console.log(' -', o.id, '| status:', o.order_status, '| total:', o.total_amount));
}
check();
