const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://igrndenbhfmjdqpseose.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlncm5kZW5iaGZtamRxcHNlb3NlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTcwODIwMywiZXhwIjoyMDk3Mjg0MjAzfQ.lgU0yEujTijeALm637Mzz8-eIHGbvbSj20Fn-1ZKBWA'
);

async function setup() {
  const { data, error } = await supabase.storage.createBucket('product-images', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
  });
  if (error && error.message !== 'Bucket already exists') {
    console.error('Failed to create bucket:', error);
    return;
  }
  console.log('Storage bucket created or already exists');

  const { data: bannersBucket, error: bannersError } = await supabase.storage.createBucket('banners', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    fileSizeLimit: 5 * 1024 * 1024,
  });
  if (bannersError && bannersError.message !== 'Bucket already exists') {
    console.error('Failed to create banners bucket:', bannersError);
    return;
  }
  console.log('Banners bucket created or already exists');
}

setup().catch(console.error);
