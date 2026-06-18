'use client';

import { useState, useEffect } from 'react';
import HeroBanner from '@/components/home/HeroBanner';
import ProductSection from '@/components/home/ProductSection';
import TrustBadges from '@/components/home/TrustBadges';
import Testimonials from '@/components/home/Testimonials';
import InstagramFeed from '@/components/home/InstagramFeed';
import BlogPreview from '@/components/home/BlogPreview';
import Newsletter from '@/components/home/Newsletter';
import { getHomepageSections } from '@/lib/supabaseServices';
import type { HomepageSection as HomepageSectionType } from '@/types';

export default function HomePage() {
  const [sections, setSections] = useState<HomepageSectionType[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getHomepageSections()
      .then((data) => { setSections(data); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const renderSection = (s: HomepageSectionType) => {
    switch (s.type) {
      case 'new-arrivals':
        return <ProductSection key={s.id} title={s.title} link="/shop?category=new-arrivals" filterType="new-arrivals" productIds={s.productIds} alignment={s.alignment} />;
      case 'best-sellers':
        return <ProductSection key={s.id} title={s.title} link="/shop?category=best-sellers" filterType="best-sellers" productIds={s.productIds} alignment={s.alignment} />;
      case 'trending':
        return <ProductSection key={s.id} title={s.title} link="/shop?category=trending" filterType="trending" productIds={s.productIds} alignment={s.alignment} />;
      case 'sale':
        return <ProductSection key={s.id} title={s.title} link="/shop?category=sale" filterType="sale" productIds={s.productIds} alignment={s.alignment} />;
      case 'custom':
        return <ProductSection key={s.id} title={s.title} link="/shop" filterType="custom" productIds={s.productIds} alignment={s.alignment} />;
      case 'testimonials':
        return <Testimonials key={s.id} />;
      default:
        return <ProductSection key={s.id} title={s.title} link="/shop" filterType="custom" productIds={s.productIds} alignment={s.alignment} />;
    }
  };

  return (
    <>
      <HeroBanner />
      {sections.map(renderSection)}
      <TrustBadges />
      <InstagramFeed />
      <BlogPreview />
      <Newsletter />
    </>
  );
}
