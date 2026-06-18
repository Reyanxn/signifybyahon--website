'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

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

function getDevice(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  return 'desktop';
}

function getScreen(): string {
  if (typeof window === 'undefined') return '';
  return `${window.innerWidth}x${window.innerHeight}`;
}

export default function VisitTracker() {
  const pathname = usePathname();
  const lastPath = useRef('');

  useEffect(() => {
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    const id = setTimeout(async () => {
      try {
        await fetch('/api/track-visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            page: pathname,
            title: typeof document !== 'undefined' ? document.title : '',
            referrer: getReferrerSource(),
            device: getDevice(),
            screen: getScreen(),
          }),
        });
      } catch {}
    }, 800);

    return () => clearTimeout(id);
  }, [pathname]);

  return null;
}
