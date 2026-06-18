import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MESO Dev — Manage SIGNIFY BY AHON',
    short_name: 'MESO Dev',
    description: 'Manage your store — orders, products, customers, analytics & real-time alerts',
    start_url: '/admin',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#1C1C1C',
    categories: ['business', 'shopping', 'productivity'],
    dir: 'ltr',
    lang: 'en',
    icons: [
      { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
    ],
    screenshots: [],
  };
}
