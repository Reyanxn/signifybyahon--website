import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SIGNIFY BY AHON – Premium Women\'s Fashion',
    short_name: 'SIGNIFY',
    description: 'Premium women\'s fashion e-commerce platform',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#111111',
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
    ],
  };
}
