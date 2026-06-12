import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings, 
  Bell, 
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Loader2,
  MousePointerClick
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { title: 'New Subscribers', value: '0', change: '0%', isUp: true, icon: Users },
    { title: 'Products In Stock', value: '0', change: '0%', isUp: true, icon: Package },
  ]);


  const [clickStats, setClickStats] = useState({ days: [], maxCount: 0 });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // 1. Fetch Products count & Group by Category
    const { data: products, count: productCount } = await supabase
      .from('products_secure')
      .select('category', { count: 'exact' });

    // 2. Fetch Customers count
    const { count: customerCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });



    // 3. Fetch Click Logs
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const { data: clicks } = await supabase
      .from('affiliate_clicks')
      .select('clicked_at')
      .gte('clicked_at', thirtyDaysAgo.getTime());
      
    // Calculate Clicks by Day (last 7 days)
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const clickCounts = {};
    last7Days.forEach(day => clickCounts[day] = 0);

    if (clicks) {
      clicks.forEach(c => {
        const date = new Date(c.clicked_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (clickCounts[date] !== undefined) {
          clickCounts[date]++;
        }
      });
    }

    const clickData = last7Days.map(day => ({
      day,
      count: clickCounts[day]
    }));
    
    const maxClicks = Math.max(...clickData.map(d => d.count), 10); // Minimum max of 10 for scale

    setClickStats({
      days: clickData,
      maxCount: maxClicks
    });

    setStats([
      { title: 'New Subscribers', value: customerCount || 0, change: '+100%', isUp: true, icon: Users },
      { title: 'Products In Stock', value: productCount || 0, change: '+100%', isUp: true, icon: Package },
    ]);


    
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);



  return (
    <div className="flex flex-col gap-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/5 rounded-lg text-primary">
                <stat.icon size={20} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.isUp ? 'text-green-500' : 'text-red-500'}`}>
                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">{stat.title}</h3>
            <p className="text-2xl font-bold text-primary mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Clicks Chart Summary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-heading text-xl font-bold">Recent Clicks</h3>
            <button onClick={() => navigate('/admin/clicks')} className="text-sm font-bold text-secondary hover:text-secondary-dark transition-colors">
              View All &rarr;
            </button>
          </div>
          <div className="p-6 flex flex-col gap-6 flex-grow">
            <div className="flex flex-col gap-4 mt-auto">
              <div className="flex items-end justify-between h-40 gap-2 border-b border-gray-100 pb-2">
                {clickStats.days.map((day, idx) => {
                  const heightPercentage = (day.count / clickStats.maxCount) * 100;
                  return (
                    <div key={idx} className="flex flex-col items-center justify-end w-full gap-2 group relative">
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-gray-900 text-white text-[10px] py-1 px-2 rounded font-bold transition-opacity whitespace-nowrap z-10 pointer-events-none">
                        {day.count} Clicks
                      </div>
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(heightPercentage, 2)}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="w-full bg-secondary rounded-t-sm hover:bg-secondary-dark transition-colors cursor-pointer"
                      ></motion.div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {clickStats.days.map((day, idx) => (
                  <div key={idx} className="w-full text-center truncate px-1">
                    {day.day}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
