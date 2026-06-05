import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  CreditCard, 
  MapPin, 
  User, 
  Heart, 
  ChevronRight,
  ShoppingBag,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../lib/useCurrency';

const UserDashboard = () => {
  const { formatPrice } = useCurrency();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    savedItems: 0,
    points: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch Profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileData) setProfile(profileData);

        // Fetch Orders resiliently
        const { data: allOrders } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        if (allOrders) {
          // Filter in JS to avoid 400 Bad Request if column doesn't exist
          const userOrders = allOrders.filter(o => 
            o.customer_email === user.email || 
            o.user_id === user.id || 
            o.email === user.email
          );
          
          setRecentOrders(userOrders.slice(0, 5));
          const activeOrders = userOrders.filter(o => !['Delivered', 'Cancelled'].includes(o.status)).length;
          
          setDashboardStats(prev => ({
            ...prev,
            totalOrders: userOrders.length,
            activeOrders: activeOrders
          }));
        }

        // Try Fetching Wishlist (ignore if table missing)
        try {
          const { count: savedItemsCount } = await supabase
            .from('wishlist')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
            
          if (savedItemsCount !== null) {
            setDashboardStats(prev => ({ ...prev, savedItems: savedItemsCount }));
          }
        } catch (e) {
          // Table might not exist yet
        }
      }
      setLoading(false);
    };
    
    fetchDashboardData();
  }, []);

  const stats = [
    { label: 'Total Orders', value: dashboardStats.totalOrders, icon: Package },
    { label: 'Active Orders', value: dashboardStats.activeOrders, icon: ShoppingBag },
    { label: 'Saved Items', value: dashboardStats.savedItems, icon: Heart },
    { label: 'Points', value: dashboardStats.points, icon: CreditCard },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Section */}
      <div className="bg-primary rounded-xl p-8 text-white relative overflow-hidden" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="relative z-10">
          <h2 className="text-3xl font-heading font-bold mb-2">Welcome back, {profile?.full_name || 'Guest'}!</h2>
          <p className="text-gray-300">Welcome to your MoaviaFragranse.com.au account dashboard.</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4"
          >
            <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-primary">
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
              <p className="text-xl font-bold text-primary">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-heading font-bold text-lg text-primary">Recent Orders</h3>
            <Link to="/profile/orders" className="text-xs font-bold text-secondary uppercase tracking-widest hover:underline">View All</Link>
          </div>
          <div className="flex flex-col">
            {recentOrders.length > 0 ? recentOrders.map((order) => (
              <div key={order.id} className="p-6 border-b border-gray-50 last:border-0 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-primary">#ORD-{order.id.toString().slice(0, 8)}</span>
                  <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-bold text-primary">{formatPrice(order.total_amount)}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 
                    order.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {order.status || 'Pending'}
                  </span>
                </div>
              </div>
            )) : (
              <div className="p-12 text-center text-gray-400 italic text-sm">
                No recent orders found.
              </div>
            )}
          </div>
        </div>

        {/* Account Quick Links */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
          <h3 className="font-heading font-bold text-lg text-primary mb-2">Account Quick Links</h3>
          <Link to="/profile/addresses" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg group hover:bg-primary hover:text-white transition-all text-left">
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-secondary group-hover:text-white" />
              <span className="text-sm font-bold">Manage Addresses</span>
            </div>
            <ChevronRight size={16} />
          </Link>
          <Link to="/profile/settings" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg group hover:bg-primary hover:text-white transition-all text-left">
            <div className="flex items-center gap-3">
              <Bell size={18} className="text-secondary group-hover:text-white" />
              <span className="text-sm font-bold">Notification Settings</span>
            </div>
            <ChevronRight size={16} />
          </Link>
          <Link to="/profile/settings" className="flex items-center justify-between p-4 bg-gray-50 rounded-lg group hover:bg-primary hover:text-white transition-all text-left">
            <div className="flex items-center gap-3">
              <User size={18} className="text-secondary group-hover:text-white" />
              <span className="text-sm font-bold">Edit Profile</span>
            </div>
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
