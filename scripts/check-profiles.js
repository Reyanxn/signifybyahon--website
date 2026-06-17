const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://igrndenbhfmjdqpseose.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlncm5kZW5iaGZtamRxcHNlb3NlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTcwODIwMywiZXhwIjoyMDk3Mjg0MjAzfQ.lgU0yEujTijeALm637Mzz8-eIHGbvbSj20Fn-1ZKBWA'
);

async function check() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) { console.error(error); return; }
  console.log(JSON.stringify(data, null, 2));
}
check();
