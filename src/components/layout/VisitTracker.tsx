'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function getReferrerSource(): string {
  const ref = document.referrer;
  if (!ref) return 'Direct';
  if (ref.includes('facebook.com') || ref.includes('fb.com') || ref.includes('fb.me')) return 'Facebook';
  if (ref.includes('wa.me') || ref.includes('whatsapp.com')) return 'WhatsApp';
  if (ref.includes('instagram.com')) return 'Instagram';
  if (ref.includes('messenger.com')) return 'Messenger';
  if (ref.includes('google') || ref.includes('search?q=')) return 'Google';
  if (ref.includes('youtube.com')) return 'YouTube';
  if (ref.includes('twitter.com') || ref.includes('x.com')) return 'Twitter / X';
  if (ref.includes('t.me') || ref.includes('telegram')) return 'Telegram';
  try { return new URL(ref).hostname.replace('www.', ''); } catch { return 'Other'; }
}

export default function VisitTracker() {
  const pathname = usePathname();
  const lastPath = useRef('');

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    const track = async () => {
      try {
        await supabase.from('visits').insert({
          page: pathname,
          referrer: getReferrerSource(),
          created_at: new Date().toISOString(),
        });
      } catch {}
    };

    setTimeout(track, 500);
  }, [pathname]);

  return null;
}
