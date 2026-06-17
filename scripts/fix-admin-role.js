const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://igrndenbhfmjdqpseose.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlncm5kZW5iaGZtamRxcHNlb3NlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTcwODIwMywiZXhwIjoyMDk3Mjg0MjAzfQ.lgU0yEujTijeALm637Mzz8-eIHGbvbSj20Fn-1ZKBWA'
);

async function fixRole() {
  // Find the admin user profile
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('display_name', 'Admin');

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  if (profiles && profiles.length > 0) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', profiles[0].id);

    if (updateError) {
      console.error('Update error:', updateError.message);
    } else {
      console.log('✅ Role updated to admin for:', profiles[0].id);
    }
  } else {
    console.log('No admin profile found. Checking all profiles...');
    const { data: all } = await supabase.from('profiles').select('*');
    console.log(JSON.stringify(all, null, 2));
  }
}

fixRole().catch(console.error);
