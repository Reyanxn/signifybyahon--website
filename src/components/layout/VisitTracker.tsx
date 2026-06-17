'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function VisitTracker() {
  const pathname = usePathname();
  const lastPath = useRef('');

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    const track = async () => {
      try {
        let city = '', region = '', country = '', ip = '';
        try {
          const res = await fetch('https://ip-api.com/json/?fields=query,city,region,country', { signal: AbortSignal.timeout(3000) });
          const data = await res.json();
          if (data.query) ip = data.query;
          if (data.city) city = data.city;
          if (data.region) region = data.region;
          if (data.country) country = data.country;
        } catch {}

        await supabase.from('visits').insert({
          ip, city, region, country,
          page: pathname,
          created_at: new Date().toISOString(),
        });
      } catch {}
    };

    track();
  }, [pathname]);

  return null;
}
