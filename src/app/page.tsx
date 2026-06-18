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

const DEFAULT_SECTIONS: HomepageSectionType[] = [
  { id: 'default-new-arrivals', title: 'New Arrivals', type: 'new-arrivals', displayOrder: 1, alignment: 'left', active: true, productIds: [] },
  { id: 'default-best-sellers', title: 'Best Sellers', type: 'best-sellers', displayOrder: 2, alignment: 'left', active: true, productIds: [] },
  { id: 'default-trending', title: 'Trending Now', type: 'trending', displayOrder: 3, alignment: 'left', active: true, productIds: [] },
  { id: 'default-sale', title: 'Sale', type: 'sale', displayOrder: 4, alignment: 'left', active: true, productIds: [] },
  { id: 'default-testimonials', title: 'Customer Reviews', type: 'testimonials', displayOrder: 5, alignment: 'center', active: true, productIds: [] },
];

export default function HomePage() {
  const [sections, setSections] = useState<HomepageSectionType[]>(DEFAULT_SECTIONS);

  useEffect(() => {
    getHomepageSections()
      .then((data) => { if (data.length > 0) setSections(data); })
      .catch(() => {});
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
