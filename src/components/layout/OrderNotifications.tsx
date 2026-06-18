'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { usePathname } from 'next/navigation';
import toast from 'react-hot-toast';

export default function OrderNotifications() {
  const pathname = usePathname();
  const registered = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('serviceWorker' in navigator && !registered.current) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
      registered.current = true;
    }

    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }

    const channel = supabase
      .channel('new-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const order = payload.new as any;
        const name = order.customer_info?.name || 'A customer';
        const total = order.total_amount || 0;

        if (Notification.permission === 'granted') {
          new Notification('🛍 New Order!', {
            body: `${name} placed an order — ৳${total.toLocaleString('en-IN')}`,
            icon: '/icons/icon-512.svg',
            badge: '/icons/icon-512.svg',
            tag: 'new-order',
            data: { url: `/admin` },
            requireInteraction: true,
          });
        }

        if (pathname !== '/admin') {
          toast.success(`🛍 New order from ${name} — ৳${total.toLocaleString('en-IN')}`, { duration: 6000 });
        }
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [pathname]);

  return null;
}
