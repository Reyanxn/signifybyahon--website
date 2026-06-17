'use client';

import HeroBanner from '@/components/home/HeroBanner';
import ProductSection from '@/components/home/ProductSection';
import TrustBadges from '@/components/home/TrustBadges';
import Testimonials from '@/components/home/Testimonials';
import InstagramFeed from '@/components/home/InstagramFeed';
import BlogPreview from '@/components/home/BlogPreview';
import HomeReels from '@/components/home/HomeReels';
import Newsletter from '@/components/home/Newsletter';

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <ProductSection title="New Arrivals" link="/shop?category=new-arrivals" filterType="new-arrivals" />
      <ProductSection title="Best Sellers" link="/shop?category=best-sellers" filterType="best-sellers" />
      <ProductSection title="Trending Now" link="/shop?category=trending" filterType="trending" />
      <ProductSection title="Summer Collection" link="/shop?collection=summer" filterType="summer" />
      <ProductSection title="Sale" link="/shop?category=sale" filterType="sale" />
      <TrustBadges />
      <HomeReels />
      <Testimonials />
      <InstagramFeed />
      <BlogPreview />
      <Newsletter />
    </>
  );
}
