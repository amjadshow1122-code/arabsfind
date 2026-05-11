import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Download,
  Globe,
  Wallet,
  Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    avgOrder: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const [recentTrends, setRecentTrends] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    
    // 1. Get total revenue and order count
    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount, created_at');
    
    // 2. Get customer count
    const { count: customerCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_admin', false);

    // 3. Get top products (Simulated joining for now or direct query if schema allows)
    // For now we query order_items and sum them up
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('product_id, quantity, price_at_time');

    const totalRevenue = orders?.reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0) || 0;
    const orderCount = orders?.length || 0;
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    setStats({
      revenue: totalRevenue,
      orders: orderCount,
      customers: customerCount || 0,
      avgOrder: avgOrderValue
    });

    // Process top products if we had them
    // setTopProducts(processedData);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const kpis = [
    { title: 'Gross Revenue', value: `$${stats.revenue.toLocaleString()}`, change: '+0%', isUp: true, icon: Wallet },
    { title: 'Total Orders', value: stats.orders.toString(), change: '+0%', isUp: true, icon: ShoppingBag },
    { title: 'Active Customers', value: stats.customers.toString(), change: '+0%', isUp: true, icon: Users },
    { title: 'Avg. Order Value', value: `$${stats.avgOrder.toFixed(2)}`, change: '+0%', isUp: true, icon: TrendingUp },
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Market Analytics</h1>
          <p className="text-gray-500 text-sm">Deep insights into your luxury heritage sales performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-100 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm">
            <Calendar size={16} className="text-gray-400" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Lifetime Data</span>
          </div>
          <button className="btn btn-primary gap-2 py-2.5 px-6">
            <Download size={16} />
            Download Report
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <motion.div 
            key={kpi.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-primary">
                <kpi.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${kpi.isUp ? 'text-green-500' : 'text-red-500'}`}>
                {kpi.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {kpi.change}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{kpi.title}</p>
              <p className="text-2xl font-bold text-primary mt-1">{loading ? '...' : kpi.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Performance */}
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-xl text-primary">Revenue Timeline</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-secondary rounded-full"></div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Revenue</span>
              </div>
            </div>
          </div>
          
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-50 rounded-lg bg-gray-50/30">
            <BarChart3 size={40} className="text-gray-200 mb-4" />
            <p className="text-gray-400 text-sm italic font-medium">
              {stats.orders > 0 ? 'Aggregating timeline data...' : 'Waiting for first order data...'}
            </p>
          </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-xl text-primary">Top Performing Items</h3>
            <button className="text-xs font-bold text-secondary uppercase tracking-widest hover:underline">Full Catalog</button>
          </div>
          <div className="flex flex-col items-center justify-center flex-grow py-10 bg-gray-50/30 rounded-xl border-2 border-dashed border-gray-50">
            <ShoppingBag size={40} className="text-gray-200 mb-4" />
            <p className="text-gray-400 text-sm italic">Product rankings will appear as sales increase.</p>
          </div>
        </div>
      </div>

      {/* Global Sales Breakdown */}
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <Globe className="text-secondary" />
          <h3 className="font-heading font-bold text-xl text-primary">Regional Market Presence</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50/30 rounded-xl border-2 border-dashed border-gray-50">
          <div className="relative">
            <Globe size={60} className="text-gray-100 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-2 border-primary/10 rounded-full animate-ping"></div>
            </div>
          </div>
          <p className="text-gray-400 text-sm italic mt-6">Awaiting geographic distribution data from new orders.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
