const { createClient } = require('@supabase/supabase-js');

// Test with anon key (like the frontend)
const anon = createClient(
  'https://igrndenbhfmjdqpseose.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlncm5kZW5iaGZtamRxcHNlb3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MDgyMDMsImV4cCI6MjA5NzI4NDIwM30.PqhYB8nUTTshWdB8xNKVob_nFSGpIjGoIzcPLLUV5_4'
);

async function test() {
  // Try insert without auth
  const { data, error } = await anon.from('products').insert({
    name: 'Test Product',
    slug: 'test-product-' + Date.now(),
    price: 999,
    stock: 10,
  });
  if (error) {
    console.log('ANON INSERT ERROR:', error.message);
  } else {
    console.log('ANON INSERT SUCCESS');
  }
}
test();
