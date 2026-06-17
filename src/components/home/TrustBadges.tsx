'use client';

import { HiTruck, HiShieldCheck, HiRefresh, HiSupport } from 'react-icons/hi';

const badges = [
  { icon: HiTruck, label: 'Free Shipping', desc: 'On orders over ৳2,000' },
  { icon: HiShieldCheck, label: 'Secure Payment', desc: '100% secure checkout' },
  { icon: HiRefresh, label: 'Easy Returns', desc: 'Return within 3 days' },
  { icon: HiSupport, label: '24/7 Support', desc: 'Dedicated customer care' },
];

export default function TrustBadges() {
  return (
    <section className="section-spacing border-b border-[#DDDDDD]">
      <div className="container-site">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge) => (
            <div key={badge.label} className="text-center">
              <badge.icon className="w-5 h-5 mx-auto mb-2 opacity-40" />
              <h4 className="text-[10px] uppercase tracking-[0.2em]">{badge.label}</h4>
              <p className="text-[10px] opacity-40 mt-1">{badge.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
