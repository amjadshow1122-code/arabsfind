import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Heart, 
  User, 
  Settings, 
  MapPin, 
  Bell, 
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const UserPanel = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
      } else {
        navigate('/login');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/profile', icon: LayoutDashboard },
    { name: 'My Orders', path: '/profile/orders', icon: ShoppingBag },
    { name: 'Wishlist', path: '/profile/wishlist', icon: Heart },
    { name: 'Addresses', path: '/profile/addresses', icon: MapPin },
    { name: 'Notifications', path: '/profile/notifications', icon: Bell },
    { name: 'Account Settings', path: '/profile/settings', icon: Settings },
  ];

  return (
    <div className="bg-background min-h-screen pt-32 pb-20">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Mobile Sidebar Toggle */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden flex items-center justify-center gap-2 p-4 bg-white border border-gray-100 rounded-xl shadow-sm mb-4"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            <span className="font-bold text-primary uppercase tracking-widest text-xs">Account Menu</span>
          </button>

          {/* Sidebar */}
          <aside className={`w-full lg:w-1/4 flex flex-col gap-6 ${isSidebarOpen ? 'block' : 'hidden lg:flex'}`}>
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold mb-4">
                {user?.user_metadata?.full_name?.[0] || user?.email?.[0].toUpperCase()}
              </div>
              <h2 className="text-xl font-heading font-bold">{user?.user_metadata?.full_name || 'Valued Collector'}</h2>
              <p className="text-sm text-gray-500 mb-6">{user?.email}</p>
              <button 
                onClick={handleLogout}
                className="btn border border-red-100 text-red-500 hover:bg-red-50 w-full py-3 gap-2 text-xs font-bold"
              >
                <LogOut size={16} />
                Logout Account
              </button>
            </div>

            <nav className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden p-2">
              {navItems.map((item) => (
                <NavLink 
                  key={item.path}
                  to={item.path}
                  end
                  className={({ isActive }) => `
                    flex items-center justify-between px-6 py-4 rounded-lg text-sm font-bold transition-all
                    ${isActive 
                      ? 'bg-secondary/10 text-secondary' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-primary'}
                  `}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={18} />
                    {item.name}
                  </div>
                  <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </NavLink>
              ))}
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="w-full lg:w-3/4">
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
    </div>
  );
};

export default UserPanel;
