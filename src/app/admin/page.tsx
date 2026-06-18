'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  HiChartBar, HiShoppingBag, HiUsers, HiCurrencyDollar, HiCube, HiTag, HiPhotograph, HiDocumentText, HiCollection, HiStar, HiHome, HiDatabase, HiDownload,
} from 'react-icons/hi';
import { getOrders, getProducts, getUsers } from '@/lib/supabaseServices';
import { formatPrice } from '@/utils/helpers';
import { useAuth } from '@/context/AuthContext';
import AdminProducts from '@/components/admin/AdminProducts';
import AdminOrders from '@/components/admin/AdminOrders';
import AdminCoupons from '@/components/admin/AdminCoupons';
import AdminBanners from '@/components/admin/AdminBanners';
import AdminBlogs from '@/components/admin/AdminBlogs';
import AdminCategories from '@/components/admin/AdminCategories';
import AdminReels from '@/components/admin/AdminReels';
import AdminPopups from '@/components/admin/AdminPopups';
import AdminAnalytics from '@/components/admin/AdminAnalytics';
import AdminHomepage from '@/components/admin/AdminHomepage';
import AdminReviews from '@/components/admin/AdminReviews';
import AdminSetup from '@/components/admin/AdminSetup';

const adminTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: HiChartBar },
  { id: 'analytics', label: 'Analytics', icon: HiChartBar },
  { id: 'products', label: 'Products', icon: HiCube },
  { id: 'categories', label: 'Categories', icon: HiCollection },
  { id: 'orders', label: 'Orders', icon: HiShoppingBag },
  { id: 'customers', label: 'Customers', icon: HiUsers },
  { id: 'homepage', label: 'Homepage', icon: HiHome },
  { id: 'reviews', label: 'Reviews', icon: HiStar },
  { id: 'coupons', label: 'Coupons', icon: HiTag },
  { id: 'banners', label: 'Banners', icon: HiPhotograph },
  { id: 'popups', label: 'Popups', icon: HiPhotograph },
  { id: 'reels', label: 'Reels', icon: HiDocumentText },
  { id: 'blogs', label: 'Blogs', icon: HiDocumentText },
  { id: 'setup', label: 'Setup', icon: HiDatabase },
];

export default function AdminPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  const [installPrompt, setInstallPrompt] = useState<any>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const doInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  if (loading || !user || user.role !== 'admin') return null;

  return (
    <div className="pt-16 md:pt-20 min-h-screen bg-[#F9F9F9]">
      <div className="container-site py-4 md:py-8">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-[10px] uppercase tracking-[0.1em] border border-[#DDDDDD] px-2 py-1">Menu</button>
            <div>
              <h1 className="text-sm md:text-xl tracking-[0.2em] font-normal">MESO Dev</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 mt-0.5">Manage your store</p>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {installPrompt && <button onClick={doInstall} className="flex items-center gap-1 text-[10px] uppercase tracking-[0.1em] border border-[#DDDDDD] px-2 py-1"><HiDownload className="w-3 h-3" /> App</button>}
            <button onClick={() => { logout(); router.push('/auth'); }} className="text-[10px] uppercase tracking-[0.1em] opacity-40 hover:opacity-100">Logout</button>
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full hidden md:block" />
            <span className="text-[10px] uppercase tracking-[0.1em] opacity-40 hidden md:block">{user?.email}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 md:gap-8">
          <div className={`lg:col-span-1 ${sidebarOpen ? 'block' : 'hidden'} lg:block`}>
            <nav className="border border-[#DDDDDD] bg-white">
              {adminTabs.map((tab) => (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-[10px] uppercase tracking-[0.2em] border-b border-[#DDDDDD] transition-colors ${
                    activeTab === tab.id ? 'bg-[#1C1C1C] text-white' : 'hover:bg-[#F9F9F9]'
                  }`}
                ><tab.icon className="w-4 h-4" />{tab.label}</button>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-5 space-y-6">
            {activeTab === 'dashboard' && <AdminDashboard />}
            {activeTab === 'analytics' && <AdminAnalytics />}
            {activeTab === 'products' && <AdminProducts />}
            {activeTab === 'orders' && <AdminOrders />}
            {activeTab === 'customers' && <AdminCustomers />}
            {activeTab === 'categories' && <AdminCategories />}
            {activeTab === 'homepage' && <AdminHomepage />}
            {activeTab === 'reviews' && <AdminReviews />}
            {activeTab === 'coupons' && <AdminCoupons />}
            {activeTab === 'banners' && <AdminBanners />}
            {activeTab === 'popups' && <AdminPopups />}
            {activeTab === 'reels' && <AdminReels />}
            {activeTab === 'blogs' && <AdminBlogs />}
            {activeTab === 'setup' && <AdminSetup />}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0, products: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([getOrders(), getProducts(), getUsers()]).then(([orders, products, users]) => {
      const revenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      setStats({ revenue, orders: orders.length, customers: users.length, products: products.length });
      setRecentOrders(orders.slice(-5).reverse());
    });
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: stats.revenue, icon: HiCurrencyDollar },
    { label: 'Total Orders', value: stats.orders, icon: HiShoppingBag },
    { label: 'Total Customers', value: stats.customers, icon: HiUsers },
    { label: 'Total Products', value: stats.products, icon: HiCube },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#DDDDDD] p-5">
            <stat.icon className="w-4 h-4 opacity-40 mb-3" />
            <p className="text-lg font-medium">{stat.label === 'Total Revenue' ? formatPrice(stat.value) : stat.value}</p>
            <p className="text-[10px] uppercase tracking-[0.1em] opacity-40 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-white border border-[#DDDDDD] p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs uppercase tracking-[0.2em]">Recent Orders</h2>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-xs opacity-40 text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b text-left">
                <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Order</th>
                <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Customer</th>
                <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Total</th>
                <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Status</th>
              </tr></thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="py-3 uppercase tracking-[0.1em]">{o.id?.slice(-8)}</td>
                    <td className="py-3">{o.customerInfo?.name || 'Guest'}</td>
                    <td className="py-3">{formatPrice(o.totalAmount)}</td>
                    <td className="py-3"><span className="text-[10px] uppercase tracking-[0.1em] px-2 py-1 bg-[#F9F9F9]">{o.orderStatus?.replace(/_/g, ' ')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

function AdminCustomers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers().then((data) => { setUsers(data); setLoading(false); });
  }, []);

  return (
    <div className="bg-white border border-[#DDDDDD] p-6">
      <h2 className="text-xs uppercase tracking-[0.2em] mb-6">Customers ({users.length})</h2>
      {loading ? <p className="text-xs opacity-40 text-center py-8">Loading...</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b text-left">
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Name</th>
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Email</th>
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Orders</th>
              <th className="pb-3 font-normal uppercase tracking-[0.1em] opacity-40">Role</th>
            </tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="py-3 uppercase tracking-[0.1em]">{u.displayName || u.email || '—'}</td>
                  <td className="py-3 opacity-60">{u.email}</td>
                  <td className="py-3">{u.orderCount || 0}</td>
                  <td className="py-3"><span className="text-[10px] uppercase">{u.role || 'customer'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
