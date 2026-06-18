'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window { fbq: any; _fbq: any; }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function initPixel() {
  if (typeof window === 'undefined' || !PIXEL_ID || window.fbq) return;
  window.fbq = function(...args: any[]) { (window.fbq.callMethod ? window.fbq : window.fbq.queue).push(arguments); };
  if (!window._fbq) window._fbq = window.fbq;
  window.fbq.push = window.fbq;
  window.fbq.loaded = true;
  window.fbq.version = '2.0';
  window.fbq.queue = [];
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(s);
  window.fbq('init', PIXEL_ID);
}

export function trackPageView() {
  if (!window.fbq || !PIXEL_ID) return;
  window.fbq('track', 'PageView');
}

export function trackEvent(name: string, data?: Record<string, any>) {
  if (!window.fbq || !PIXEL_ID) return;
  window.fbq('track', name, data);
}

export default function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    initPixel();
    trackPageView();
  }, [pathname]);

  return PIXEL_ID ? (
    <noscript>
      <img height="1" width="1" style={{ display: 'none' }} src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`} />
    </noscript>
  ) : null;
}
