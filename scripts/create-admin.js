const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://igrndenbhfmjdqpseose.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlncm5kZW5iaGZtamRxcHNlb3NlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTcwODIwMywiZXhwIjoyMDk3Mjg0MjAzfQ.lgU0yEujTijeALm637Mzz8-eIHGbvbSj20Fn-1ZKBWA'
);

async function createAdmin() {
  // Create the user via Supabase Admin API (service_role bypasses RLS)
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@signify.com',
    password: 'Admin123!',
    email_confirm: true,
    user_metadata: { display_name: 'Admin' },
  });

  if (error) {
    console.error('Create user error:', error.message);
    return;
  }

  console.log('✅ User created:', data.user.id);

  // Set role to admin in profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: data.user.id, display_name: 'Admin', role: 'admin' }, { onConflict: 'id' });

  if (profileError) {
    console.error('Profile update error:', profileError.message);
    return;
  }

  console.log('✅ Role set to admin');
  console.log('');
  console.log('📧 Email: admin@signify.com');
  console.log('🔑 Password: Admin123!');
  console.log('');
  console.log('Go to http://localhost:3000/auth to login');
}

createAdmin().catch(console.error);
