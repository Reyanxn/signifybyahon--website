const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://igrndenbhfmjdqpseose.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlncm5kZW5iaGZtamRxcHNlb3NlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTcwODIwMywiZXhwIjoyMDk3Mjg0MjAzfQ.lgU0yEujTijeALm637Mzz8-eIHGbvbSj20Fn-1ZKBWA'
);

async function seed() {
  // Products
  const products = [
    { name: 'Premium Embroidered Lawn Suit', slug: 'premium-embroidered-lawn-suit', price: 2990, sale_price: 2390, description: 'Exquisite hand-embroidered lawn suit featuring intricate thread work with delicate floral motifs.', fabric_details: 'Premium Lawn | Hand Embroidery | Cotton Lining', sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Red', 'Green', 'Blue'], stock: 50, featured: true, best_seller: true, category_id: 'lawn-suits', images: [] },
    { name: 'Chiffon Dupatta Collection', slug: 'chiffon-dupatta-collection', price: 1890, sale_price: 1490, description: 'Luxurious chiffon dupatta with hand-embroidered borders.', fabric_details: 'Premium Chiffon | Hand Embroidery', sizes: ['One Size'], colors: ['Red', 'Pink', 'Gold', 'White'], stock: 100, featured: true, category_id: 'dupattas', images: [] },
    { name: 'Summer Lawn Collection 2025', slug: 'summer-lawn-collection-2025', price: 3490, sale_price: 2790, description: 'Lightweight and breathable lawn fabric perfect for summer.', fabric_details: 'Premium Lawn | Cotton Lining', sizes: ['S', 'M', 'L', 'XL', 'XXL'], colors: ['Blue', 'Green', 'Yellow', 'White'], stock: 75, featured: true, trending: true, category_id: 'lawn-suits', images: [] },
    { name: 'Organza Embroidered Kurta', slug: 'organza-embroidered-kurta', price: 4290, description: 'Hand-embroidered organza kurta with intricate detailing.', fabric_details: 'Organza | Silk Thread Work', sizes: ['M', 'L', 'XL'], colors: ['Gold', 'White', 'Pink'], stock: 30, featured: true, category_id: 'kurtas', images: [] },
    { name: 'Silk Fusion Collection', slug: 'silk-fusion-collection', price: 5490, sale_price: 4490, description: 'Pure silk collection with traditional hand-block prints.', fabric_details: 'Pure Silk | Block Print', sizes: ['S', 'M', 'L'], colors: ['Red', 'Green', 'Blue'], stock: 25, best_seller: true, category_id: 'silk', images: [] },
    { name: 'Cotton Jamdani Saree', slug: 'cotton-jamdani-saree', price: 3890, description: 'Traditional jamdani weave on premium cotton.', fabric_details: 'Premium Cotton | Jamdani Weave', sizes: ['One Size'], colors: ['White', 'Off-white', 'Light Blue'], stock: 40, trending: true, category_id: 'sarees', images: [] },
  ];

  for (const p of products) {
    const { error } = await supabase.from('products').upsert(p, { onConflict: 'slug' });
    if (error) console.error('Product error:', error.message);
  }
  console.log(`✅ ${products.length} products seeded`);

  // Banners
  const banners = [
    { title: 'Summer Collection 2025', subtitle: 'Discover your summer style', image: '', link: '/shop?category=sale', active: true, order: 1 },
    { title: 'New Arrivals', subtitle: 'Fresh designs just landed', image: '', link: '/shop', active: true, order: 2 },
    { title: 'Sale - Up to 40% Off', subtitle: 'Limited time offer', image: '', link: '/shop?category=sale', active: true, order: 3 },
  ];

  for (const b of banners) {
    const { error } = await supabase.from('banners').insert(b);
    if (error) console.error('Banner error:', error.message);
  }
  console.log(`✅ ${banners.length} banners seeded`);

  // Coupons
  const coupons = [
    { code: 'WELCOME10', type: 'percentage', value: 10, min_order: 1000, max_uses: 100, used_count: 0, active: true, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() },
    { code: 'FLAT500', type: 'fixed', value: 500, min_order: 3000, max_uses: 50, used_count: 5, active: true, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() },
    { code: 'SUMMER25', type: 'percentage', value: 25, min_order: 2000, max_uses: 200, used_count: 12, active: true, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() },
  ];

  for (const c of coupons) {
    const { error } = await supabase.from('coupons').upsert(c, { onConflict: 'code' });
    if (error) console.error('Coupon error:', error.message);
  }
  console.log(`✅ ${coupons.length} coupons seeded`);

  console.log('✅ Seeding complete!');
}

seed().catch(console.error);
