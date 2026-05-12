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
  Clock,
  ChevronDown,
  Loader2,
  FileText
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('lifetime'); // '7d', '30d', 'lifetime'
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    avgOrder: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const [revenueHistory, setRevenueHistory] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    
    let query = supabase.from('orders').select('total_amount, created_at, id');
    
    // Apply time filter
    if (timeRange !== 'lifetime') {
      const days = timeRange === '7d' ? 7 : 30;
      const date = new Date();
      date.setDate(date.getDate() - days);
      query = query.gte('created_at', date.toISOString());
    }

    const { data: orders } = await query;
    
    // 2. Get customer count
    const { count: customerCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_admin', false);

    // 3. Get order items for top products
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('product_id, quantity, price_at_time, products(name)');

    // Process Stats
    const totalRevenue = orders?.reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0) || 0;
    const orderCount = orders?.length || 0;
    const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    setStats({
      revenue: totalRevenue,
      orders: orderCount,
      customers: customerCount || 0,
      avgOrder: avgOrderValue
    });

    // Process Top Products
    if (orderItems) {
      const productStats = {};
      orderItems.forEach(item => {
        const id = item.product_id;
        if (!productStats[id]) {
          productStats[id] = { name: item.products?.name || 'Unknown', sales: 0, revenue: 0 };
        }
        productStats[id].sales += item.quantity;
        productStats[id].revenue += (item.quantity * item.price_at_time);
      });
      
      const sortedProducts = Object.values(productStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      setTopProducts(sortedProducts);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const handleDownloadReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Revenue,$${stats.revenue}\n`
      + `Total Orders,${stats.orders}\n`
      + `Total Customers,${stats.customers}\n`
      + `Average Order Value,$${stats.avgOrder.toFixed(2)}\n\n`
      + "Top Products,Sales,Revenue\n"
      + topProducts.map(p => `${p.name},${p.sales},$${p.revenue.toFixed(2)}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_report_${timeRange}_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const kpis = [
    { title: 'Gross Revenue', value: `$${stats.revenue.toLocaleString()}`, change: '+12%', isUp: true, icon: Wallet },
    { title: 'Total Orders', value: stats.orders.toString(), change: '+5%', isUp: true, icon: ShoppingBag },
    { title: 'Active Customers', value: stats.customers.toString(), change: '+8%', isUp: true, icon: Users },
    { title: 'Avg. Order Value', value: `$${stats.avgOrder.toFixed(2)}`, change: '+3%', isUp: true, icon: TrendingUp },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Market Analytics</h1>
          <p className="text-gray-500 text-sm">Deep insights into your luxury heritage sales performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <button className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-sm hover:border-secondary transition-all">
              <Calendar size={16} className="text-secondary" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">
                {timeRange === '7d' ? 'Last 7 Days' : timeRange === '30d' ? 'Last 30 Days' : 'Lifetime Data'}
              </span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
               {['7d', '30d', 'lifetime'].map(range => (
                 <button 
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 ${timeRange === range ? 'text-secondary' : 'text-gray-500'}`}
                 >
                   {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Lifetime Data'}
                 </button>
               ))}
            </div>
          </div>
          <button 
            onClick={handleDownloadReport}
            className="btn btn-primary gap-2 py-2.5 px-6 shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
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
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4 group hover:border-secondary/30 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                <kpi.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${kpi.isUp ? 'text-green-500' : 'text-red-500'}`}>
                {kpi.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {kpi.change}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{kpi.title}</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {loading ? <Loader2 size={20} className="animate-spin text-gray-200" /> : kpi.value}
              </p>
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
          
          <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-50 rounded-2xl bg-gray-50/30">
            <BarChart3 size={40} className="text-gray-200 mb-4" />
            <p className="text-gray-400 text-sm italic font-medium">
              {stats.orders > 0 ? 'Projecting timeline data...' : 'Waiting for first order data...'}
            </p>
          </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <h3 className="font-heading font-bold text-xl text-primary">Top Performing Items</h3>
            <button className="text-xs font-bold text-secondary uppercase tracking-widest hover:underline">Full Catalog</button>
          </div>
          
          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-gray-200" /></div>
            ) : topProducts.length > 0 ? (
              topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[10px] font-bold text-primary shadow-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary">{product.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">{product.sales} Sales</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-secondary">${product.revenue.toLocaleString()}</p>
                    <p className="text-[10px] text-green-500 font-bold">+15%</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <ShoppingBag size={40} className="text-gray-100 mb-4" />
                <p className="text-gray-400 text-sm italic">No sales data found for this period.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Sales Breakdown */}
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <Globe className="text-secondary" />
          <h3 className="font-heading font-bold text-xl text-primary">Regional Market Presence</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50/30 rounded-2xl border-2 border-dashed border-gray-50">
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
