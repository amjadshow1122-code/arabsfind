import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  LogOut,
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
  CheckCircle2,
  Tag,
  Store,
  Mail
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
      if (!session) { navigate('/admin/login'); return; }
      const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', session.user.id).single();
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
      try {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: recentOrders } = await supabase.from('orders').select('id, total_amount, created_at').gte('created_at', yesterday).order('created_at', { ascending: false });
        if (recentOrders) {
          recentOrders.forEach(order => {
            newNotifications.push({ id: `order-${order.id}`, type: 'order', title: 'New Order Received', message: `A new order of $${order.total_amount} was placed.`, time: new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), icon: ShoppingBag, color: 'text-green-500', bg: 'bg-green-50' });
          });
        }
      } catch (err) { console.warn('Orders table not accessible.'); }
      try {
        const { data: lowStock, error } = await supabase.from('products_secure').select('name, stock_qty').lt('stock_qty', 5).gt('stock_qty', 0);
        if (!error && lowStock) {
          lowStock.forEach(product => {
            newNotifications.push({ id: `stock-${product.name}`, type: 'stock', title: 'Low Stock Alert', message: `${product.name} has only ${product.stock_qty} units left.`, time: 'System', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' });
          });
        }
      } catch (err) { console.warn('Stock column missing.'); }
      setNotifications(newNotifications);
      setUnreadCount(newNotifications.length);
    } catch (err) { console.error('Error fetching notifications:', err); }
  };

  if (isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#F5F0EA' }}>
        <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: '#A8854A', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Custom Pages', path: '/admin/pages', icon: FileText },
    { name: 'Content', path: '/admin/content', icon: FileText },
    { name: 'Media', path: '/admin/media', icon: ImageIcon },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Backup', path: '/admin/backup', icon: Database },
  ];

  return (
    <div className="flex min-h-screen" style={{ background: '#F5F0EA' }}>
      {/* Sidebar */}
      <aside
        className={`text-white transition-all duration-300 flex flex-col fixed h-full z-50 ${isSidebarOpen ? 'w-64' : 'w-20'}`}
        style={{ background: '#2A2520' }}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {isSidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span className="font-heading text-lg font-bold tracking-widest uppercase" style={{ color: '#FAF7F2' }}>
                Moavia<span style={{ color: '#A8854A', fontStyle: 'italic' }}>Fragrance</span>
              </span>
            </motion.div>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg transition-all"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-grow py-4 flex flex-col overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className="relative group"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: isSidebarOpen ? '12px 24px' : '14px',
                justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                background: isActive ? 'rgba(168,133,74,0.15)' : 'transparent',
                color: isActive ? '#D9C089' : 'rgba(255,255,255,0.5)',
                borderLeft: isActive ? '3px solid #A8854A' : '3px solid transparent',
                transition: 'all 0.15s',
              })}
            >
              <item.icon size={18} />
              {isSidebarOpen && (
                <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="text-sm font-semibold tracking-wide">
                  {item.name}
                </motion.span>
              )}
              {!isSidebarOpen && (
                <div className="absolute left-full ml-3 px-3 py-1.5 text-white text-[11px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none z-[70] shadow-xl whitespace-nowrap" style={{ background: '#1a1612', border: '1px solid rgba(168,133,74,0.3)' }}>
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={() => navigate('/admin/login')}
            className="flex items-center gap-4 w-full transition-all"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={e => e.currentTarget.style.color = '#D9C089'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
          >
            <LogOut size={18} />
            {isSidebarOpen && <span className="text-sm font-semibold">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={`flex-grow flex flex-col transition-all duration-300 ${isSidebarOpen ? 'pl-64' : 'pl-20'}`}>
        {/* Top bar */}
        <header className="h-20 sticky top-0 z-40 flex items-center justify-between px-8" style={{ background: '#FAF7F2', borderBottom: '1px solid rgba(42,37,32,0.08)' }}>
          {/* Search */}
          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#9A9088' }} />
            <input
              type="text"
              placeholder="Global search..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{ background: '#F5F0EA', border: '1px solid transparent', color: '#2A2520' }}
              onFocus={e => { e.target.style.background = '#fff'; e.target.style.borderColor = '#A8854A'; }}
              onBlur={e => { e.target.style.background = '#F5F0EA'; e.target.style.borderColor = 'transparent'; }}
            />
          </div>

          <div className="flex items-center gap-5">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg transition-colors"
                style={{ color: showNotifications ? '#A8854A' : '#9A9088' }}
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
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 8 }}
                      className="absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl overflow-hidden z-[60]"
                      style={{ background: '#FAF7F2', border: '1px solid rgba(42,37,32,0.1)' }}
                    >
                      <div className="p-4 flex items-center justify-between" style={{ background: '#F5F0EA', borderBottom: '1px solid rgba(42,37,32,0.07)' }}>
                        <h4 className="font-bold text-sm uppercase tracking-widest" style={{ color: '#2A2520' }}>Notifications</h4>
                        <button onClick={() => setUnreadCount(0)} className="text-[10px] font-bold uppercase tracking-widest hover:underline" style={{ color: '#A8854A' }}>Mark all read</button>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? notifications.map(notif => (
                          <div key={notif.id} className="p-4 flex gap-3 group cursor-pointer relative" style={{ borderBottom: '1px solid rgba(42,37,32,0.05)' }}>
                            <div className={`w-9 h-9 rounded-xl ${notif.bg} flex items-center justify-center shrink-0`}>
                              <notif.icon className={notif.color} size={16} />
                            </div>
                            <div className="flex-grow">
                              <p className="text-xs font-bold" style={{ color: '#2A2520' }}>{notif.title}</p>
                              <p className="text-[11px] leading-relaxed" style={{ color: '#6B6258' }}>{notif.message}</p>
                            </div>
                            <button onClick={e => { e.stopPropagation(); setNotifications(prev => prev.filter(n => n.id !== notif.id)); setUnreadCount(p => Math.max(0, p - 1)); }} className="absolute right-3 top-3 p-1 opacity-0 group-hover:opacity-100 transition-all" style={{ color: '#C9B8A8' }}>
                              <X size={13} />
                            </button>
                          </div>
                        )) : (
                          <div className="p-10 text-center flex flex-col items-center gap-3">
                            <CheckCircle2 size={36} style={{ color: '#E8DCD0' }} />
                            <p className="text-xs italic" style={{ color: '#9A9088' }}>All caught up!</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                    <div className="fixed inset-0 z-[55]" onClick={() => setShowNotifications(false)} />
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="h-7 w-px" style={{ background: 'rgba(42,37,32,0.1)' }} />

            {/* User */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold" style={{ color: '#2A2520' }}>Administrator</p>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9A9088' }}>Master Access</p>
              </div>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold border-2" style={{ background: '#2A2520', borderColor: 'rgba(168,133,74,0.35)' }}>
                A
              </div>
            </div>
          </div>
        </header>

        <main className="p-8">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
