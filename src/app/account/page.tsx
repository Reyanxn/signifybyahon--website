'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { HiUser, HiShoppingBag, HiHeart, HiLocationMarker, HiBell, HiLogout } from 'react-icons/hi';
import { getOrderStatusColor, formatPrice } from '@/utils/helpers';
import { useAuth } from '@/context/AuthContext';
import { getOrders, getUserProfile } from '@/lib/supabaseServices';
import type { Order } from '@/types';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'profile', label: 'Profile', icon: HiUser },
  { id: 'orders', label: 'Orders', icon: HiShoppingBag },
  { id: 'wishlist', label: 'Wishlist', icon: HiHeart },
  { id: 'addresses', label: 'Addresses', icon: HiLocationMarker },
  { id: 'notifications', label: 'Notifications', icon: HiBell },
];

function AccountContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      getOrders(user.uid).then(setOrders);
      getUserProfile(user.uid).then(setProfile);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
  };

  if (!user) return <div className="pt-16 md:pt-20 min-h-screen flex items-center justify-center"><Link href="/auth" className="underline text-xs uppercase tracking-[0.2em]">Sign in to view your account</Link></div>;

  return (
    <div className="pt-16 md:pt-20 min-h-screen bg-[#F9F9F9]">
      <div className="container-site py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-lg md:text-xl tracking-[0.2em] font-normal">My Account</h1>
          <Button variant="ghost" className="text-[10px]" onClick={handleLogout}><HiLogout className="w-3 h-3 mr-1" /> Sign Out</Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <nav className="border border-[#DDDDDD] bg-white">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-5 py-4 text-[10px] uppercase tracking-[0.2em] border-b border-[#DDDDDD] transition-colors ${
                    activeTab === tab.id ? 'bg-[#1C1C1C] text-white' : 'hover:bg-[#F9F9F9]'
                  }`}
                ><tab.icon className="w-4 h-4" />{tab.label}</button>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-3 space-y-4">
            {activeTab === 'profile' && (
              <div className="border border-[#DDDDDD] bg-white p-8">
                <h2 className="text-xs uppercase tracking-[0.2em] mb-6">Profile</h2>
                <div className="space-y-3 text-xs">
                  <p><span className="opacity-60">Name:</span> {profile?.displayName || user.displayName || '—'}</p>
                  <p><span className="opacity-60">Email:</span> {user.email}</p>
                  <p><span className="opacity-60">Phone:</span> {profile?.phone || '—'}</p>
                  <p><span className="opacity-60">Role:</span> {user.role}</p>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <div className="border border-[#DDDDDD] bg-white p-8 text-center">
                    <HiShoppingBag className="w-8 h-8 opacity-20 mx-auto mb-3" />
                    <p className="text-xs opacity-60 uppercase tracking-[0.2em]">No orders yet</p>
                    <Link href="/shop" className="btn btn-outline mt-4 text-[10px]">Start Shopping</Link>
                  </div>
                ) : orders.map((order) => (
                  <Link key={order.id} href={`/order/${order.id}`}
                    className="block border border-[#DDDDDD] bg-white p-5 hover:border-[#1C1C1C] transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div><p className="text-xs uppercase tracking-[0.2em]">{order.id}</p><p className="text-[10px] opacity-40">{new Date(order.createdAt).toLocaleDateString()}</p></div>
                      <span className={`text-[10px] uppercase tracking-[0.1em] px-2 py-1 ${getOrderStatusColor(order.orderStatus)}`}>{order.orderStatus?.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between text-xs"><span className="opacity-60">{order.items?.length} item(s)</span><span>{formatPrice(order.totalAmount)}</span></div>
                  </Link>
                ))}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="border border-[#DDDDDD] bg-white p-8 text-center">
                <HiHeart className="w-8 h-8 opacity-20 mx-auto mb-3" />
                <p className="text-xs opacity-60 uppercase tracking-[0.2em]">Your wishlist is empty</p>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="border border-[#DDDDDD] bg-white p-8">
                <h2 className="text-xs uppercase tracking-[0.2em] mb-6">Saved Addresses</h2>
                <div className="border border-dashed border-[#DDDDDD] p-6 text-center">
                  <p className="text-xs opacity-40 uppercase tracking-[0.1em]">No addresses saved</p>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="border border-[#DDDDDD] bg-white p-8">
                <h2 className="text-xs uppercase tracking-[0.2em] mb-6">Notifications</h2>
                <p className="text-xs opacity-40 text-center py-8">No notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="pt-24 min-h-screen flex items-center justify-center"><div className="animate-spin w-6 h-6 border border-[#1C1C1C] border-t-transparent rounded-full" /></div>}>
      <AccountContent />
    </Suspense>
  );
}
