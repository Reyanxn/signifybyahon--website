'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function getReferrerSource(): string {
  if (typeof document === 'undefined') return 'Direct';
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
  if (ref.includes('tiktok.com')) return 'TikTok';
  if (ref.includes('linkedin.com')) return 'LinkedIn';
  if (ref.includes('pinterest.com')) return 'Pinterest';
  try { return new URL(ref).hostname.replace('www.', ''); } catch { return 'Other'; }
}

function getPageTitle(): string {
  if (typeof document === 'undefined') return '';
  return document.title || '';
}

export default function VisitTracker() {
  const pathname = usePathname();
  const lastPath = useRef('');

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    const id = setTimeout(async () => {
      try {
        await supabase.from('visits').insert({
          page: pathname,
          title: getPageTitle(),
          referrer: getReferrerSource(),
          created_at: new Date().toISOString(),
        });
      } catch {}
    }, 800);

    return () => clearTimeout(id);
  }, [pathname]);

  return null;
}
