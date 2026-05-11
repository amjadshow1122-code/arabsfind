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
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState([
    { title: 'Total Revenue', value: '$0', change: '0%', isUp: true, icon: BarChart3 },
    { title: 'Total Orders', value: '0', change: '0%', isUp: true, icon: ShoppingCart },
    { title: 'New Customers', value: '0', change: '0%', isUp: true, icon: Users },
    { title: 'Products In Stock', value: '0', change: '0%', isUp: true, icon: Package },
  ]);

  const [recentOrders, setRecentOrders] = useState([]);
  const [inventoryStats, setInventoryStats] = useState({ categories: [], totalProducts: 0 });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // 1. Fetch Products count & Group by Category
    const { data: products, count: productCount } = await supabase
      .from('products')
      .select('category', { count: 'exact' });

    // 2. Fetch Customers count
    const { count: customerCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // 3. Fetch Recent Orders (Mocked for now as we transition tables)
    const { data: orders } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    // Calculate Category Distribution
    const categoryCounts = {};
    if (products) {
      products.forEach(p => {
        categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
      });
    }
    const categories = Object.entries(categoryCounts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / (productCount || 1)) * 100)
    }));

    setInventoryStats({
      categories: categories.sort((a, b) => b.count - a.count),
      totalProducts: productCount || 0
    });

    setStats([
      { title: 'Total Revenue', value: '$0', change: '+0%', isUp: true, icon: BarChart3 },
      { title: 'Total Orders', value: orders?.length || 0, change: '+0%', isUp: true, icon: ShoppingCart },
      { title: 'New Customers', value: customerCount || 0, change: '+100%', isUp: true, icon: Users },
      { title: 'Products In Stock', value: productCount || 0, change: '+100%', isUp: true, icon: Package },
    ]);

    if (orders) setRecentOrders(orders);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleGenerateReport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Category,Products,Percentage\n"
      + inventoryStats.categories.map(c => `${c.name},${c.count},${c.percentage}%`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory_report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

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
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-heading text-xl font-bold">Recent Orders</h3>
            <button onClick={() => navigate('/admin/orders')} className="text-sm font-bold text-secondary hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-primary">#ORD-{order.id.slice(0,8)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.customer_email || 'Guest'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-bold text-primary">${order.total_amount}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-600' :
                          order.status === 'Processing' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-200" /> : <p className="text-gray-400 italic text-sm">No recent orders to display.</p>}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-heading text-xl font-bold">Inventory</h3>
            <button onClick={() => navigate('/admin/products')} className="p-2 bg-primary text-white rounded-md hover:bg-primary-light transition-all">
              <Plus size={16} />
            </button>
          </div>
          <div className="p-6 flex flex-col gap-6 flex-grow">
            {inventoryStats.categories.length > 0 ? (
              <div className="flex flex-col gap-6">
                {inventoryStats.categories.slice(0, 4).map((cat) => (
                  <div key={cat.name} className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-medium">{cat.name}</span>
                      <span className="font-bold text-primary">{cat.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.percentage}%` }}
                        className="h-full bg-secondary"
                      ></motion.div>
                    </div>
                  </div>
                ))}
                {inventoryStats.categories.length > 4 && (
                  <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest">
                    + {inventoryStats.categories.length - 4} More Categories
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Package size={40} className="text-gray-100 mb-4" />
                <p className="text-xs text-gray-400 italic">
                  Add products to see category distribution.
                </p>
              </div>
            )}
            
            <div className="mt-auto">
              <button 
                onClick={handleGenerateReport}
                disabled={inventoryStats.totalProducts === 0}
                className="btn btn-secondary w-full py-3 flex items-center justify-center gap-2"
              >
                <FileText size={18} />
                Generate Inventory Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
