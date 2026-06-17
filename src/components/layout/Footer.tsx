'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#1C1C1C] text-white">
      <div className="container-site py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] mb-6">SIGNIFY BY AHON</h4>
            <p className="text-xs opacity-60 leading-relaxed">
              Premium women&apos;s fashion. Bringing you the finest collection of contemporary and traditional
              women&apos;s apparel.
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { href: '/shop', label: 'Shop All' },
                { href: '/shop?category=new-arrivals', label: 'New Arrivals' },
                { href: '/shop?category=best-sellers', label: 'Best Sellers' },
                { href: '/shop?category=sale', label: 'Sale' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs opacity-60 hover:opacity-100 transition-opacity">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] mb-6">Support</h4>
            <ul className="space-y-3">
              {[
                { href: '/contact', label: 'Contact Us' },
                { href: '/faq', label: 'FAQ' },
                { href: '/shipping', label: 'Shipping Info' },
                { href: '/returns', label: 'Returns & Exchanges' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs opacity-60 hover:opacity-100 transition-opacity">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] mb-6">Follow Us</h4>
            <div className="flex gap-4">
              {['facebook', 'instagram', 'youtube'].map((social) => (
                <a
                  key={social}
                  href={`https://${social}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs uppercase tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity"
                >
                  {social}
                </a>
              ))}
            </div>
            <p className="mt-6 text-xs opacity-40">
              Dhaka, Bangladesh<br />
              info@signifybyahon.com
            </p>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs opacity-40">
            &copy; {new Date().getFullYear()} SIGNIFY BY AHON. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs opacity-40">
            <Link href="/privacy" className="hover:opacity-100 transition-opacity">Privacy</Link>
            <Link href="/terms" className="hover:opacity-100 transition-opacity">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
