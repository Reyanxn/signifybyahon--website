'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function getReferrerSource(): string {
  const ref = document.referrer;
  if (!ref) {
    const params = new URLSearchParams(window.location.search);
    const utm = params.get('utm_source');
    if (utm) return utm;
    return 'Direct';
  }
  if (ref.includes('facebook.com') || ref.includes('fb.com') || ref.includes('fb.me')) return 'Facebook';
  if (ref.includes('wa.me') || ref.includes('whatsapp.com')) return 'WhatsApp';
  if (ref.includes('instagram.com')) return 'Instagram';
  if (ref.includes('messenger.com')) return 'Messenger';
  if (ref.includes('google') || ref.includes('search?q=')) return 'Google';
  if (ref.includes('youtube.com')) return 'YouTube';
  if (ref.includes('twitter.com') || ref.includes('x.com')) return 'Twitter / X';
  if (ref.includes('linkedin.com')) return 'LinkedIn';
  if (ref.includes('pinterest.com')) return 'Pinterest';
  if (ref.includes('tiktok.com')) return 'TikTok';
  if (ref.includes('telegram.org') || ref.includes('t.me')) return 'Telegram';
  try {
    const url = new URL(ref);
    return url.hostname.replace('www.', '');
  } catch {
    return 'Other';
  }
}

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
          referrer: getReferrerSource(),
          created_at: new Date().toISOString(),
        });
      } catch {}
    };

    track();
  }, [pathname]);

  return null;
}
