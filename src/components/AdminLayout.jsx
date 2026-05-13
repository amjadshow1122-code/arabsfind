import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronRight,
  Bell,
  Search,
  Menu,
  X,
  Database,
  Tags,
  FileText,
  Image as ImageIcon,
  Clock,
  AlertCircle,
  ShoppingBag,
  UserPlus,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAdmin, setIsAdmin] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (!profile || !profile.is_admin) {
        navigate('/admin/login');
      } else {
        setIsAdmin(true);
        fetchNotifications();
      }
    };

    checkAdmin();
  }, [navigate]);

  const fetchNotifications = async () => {
    try {
      const newNotifications = [];
      
      // 1. Fetch recent orders (last 24h)
      try {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: recentOrders } = await supabase
          .from('orders')
          .select('id, total_amount, created_at')
          .gte('created_at', yesterday)
          .order('created_at', { ascending: false });

        if (recentOrders) {
          recentOrders.forEach(order => {
            newNotifications.push({
              id: `order-${order.id}`,
              type: 'order',
              title: 'New Order Received',
              message: `A new order of $${order.total_amount} was placed.`,
              time: new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              icon: ShoppingBag,
              color: 'text-green-500',
              bg: 'bg-green-50'
            });
          });
        }
      } catch (err) {
        console.warn('Orders table not found or not accessible yet.');
      }

      // 2. Fetch low stock items (with error handling for missing column)
      try {
        const { data: lowStock, error } = await supabase
          .from('products')
          .select('name, stock')
          .lt('stock', 5)
          .gt('stock', 0);

        if (!error && lowStock) {
          lowStock.forEach(product => {
            newNotifications.push({
              id: `stock-${product.name}`,
              type: 'stock',
              title: 'Low Stock Alert',
              message: `${product.name} has only ${product.stock} units left.`,
              time: 'System',
              icon: AlertCircle,
              color: 'text-red-500',
              bg: 'bg-red-50'
            });
          });
        }
      } catch (err) {
        console.warn('Stock column missing in products table. Run SQL migration to fix.');
      }

      setNotifications(newNotifications);
      setUnreadCount(newNotifications.length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-[#001236] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Content', path: '/admin/content', icon: FileText },
    { name: 'Media', path: '/admin/media', icon: ImageIcon },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Backup', path: '/admin/backup', icon: Database },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8f9ff]">
      {/* Sidebar */}
      <aside 
        className={`bg-[#001236] text-white transition-all duration-300 flex flex-col ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } fixed h-full z-50`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <img src="/ARAB_FINDS-removebg-preview.png" alt="Arab Finds" className="h-10 w-auto object-contain brightness-0 invert" />
            </motion.div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-grow py-6 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => `
                flex items-center gap-4 px-6 py-4 transition-all relative group
                ${isActive 
                  ? 'bg-secondary text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'}
              `}
            >
              <item.icon size={20} />
              {isSidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-bold text-sm"
                >
                  {item.name}
                </motion.span>
              )}
              {!isSidebarOpen && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-primary text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={() => navigate('/admin/login')}
            className="flex items-center gap-4 text-gray-400 hover:text-white transition-all group w-full"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-bold text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-grow flex flex-col transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-20'}`}>
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4 flex-grow max-w-xl">
            <div className="relative w-full">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Global search..." 
                className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-secondary px-12 py-2.5 rounded-xl outline-none transition-all text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 transition-colors ${showNotifications ? 'text-secondary' : 'text-gray-400 hover:text-primary'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[8px] flex items-center justify-center text-white font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute right-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60]"
                    >
                      <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <h4 className="font-bold text-primary text-sm uppercase tracking-widest">Notifications</h4>
                        <button onClick={() => setUnreadCount(0)} className="text-[10px] font-bold text-secondary uppercase tracking-widest hover:underline">Mark all read</button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notif) => (
                            <div key={notif.id} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group cursor-pointer relative">
                              <div className={`w-10 h-10 rounded-xl ${notif.bg} flex items-center justify-center shrink-0`}>
                                <notif.icon className={notif.color} size={18} />
                              </div>
                              <div className="flex flex-col gap-1 flex-grow">
                                <p className="text-xs font-bold text-primary">{notif.title}</p>
                                <p className="text-[11px] text-gray-500 leading-relaxed pr-6">{notif.message}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Clock size={10} className="text-gray-300" />
                                  <span className="text-[10px] text-gray-400 font-medium">{notif.time}</span>
                                </div>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNotifications(prev => prev.filter(n => n.id !== notif.id));
                                  setUnreadCount(prev => Math.max(0, prev - 1));
                                }}
                                className="absolute right-4 top-4 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="p-12 text-center flex flex-col items-center gap-3">
                            <CheckCircle2 className="text-gray-100" size={40} />
                            <p className="text-gray-400 text-xs italic">All caught up! No new alerts.</p>
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-gray-50/50 border-t border-gray-50 text-center">
                         <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:text-secondary transition-colors">View All Activity</button>
                      </div>
                    </motion.div>
                    <div 
                      className="fixed inset-0 z-[55]" 
                      onClick={() => setShowNotifications(false)}
                    />
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-[1px] bg-gray-100"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-primary">Administrator</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Master Access</p>
              </div>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold border-2 border-secondary/20">
                A
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
