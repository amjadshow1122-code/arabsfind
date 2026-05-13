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
        // Security Layer: Prevent Admins from accessing User Panel
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        
        if (profile?.is_admin) {
          // Strictly prevent cross-access. Admins should not be here.
          await supabase.auth.signOut();
          navigate('/login', { state: { error: 'Invalid login credentials' } });
          return;
        }

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
          <div className="lg:hidden w-full mb-4 px-4 sm:px-0">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                  {navItems.find(item => item.path === location.pathname)?.icon({ size: 18 }) || <User size={18} />}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Account Menu</span>
                  <span className="text-sm font-bold text-primary">
                    {navItems.find(item => item.path === location.pathname)?.name || 'Account'}
                  </span>
                </div>
              </div>
              <div className={`transition-transform duration-300 ${isSidebarOpen ? 'rotate-180' : ''}`}>
                <ChevronRight size={18} className="text-gray-400 rotate-90" />
              </div>
            </button>
          </div>

          {/* Sidebar */}
          <AnimatePresence>
            {(isSidebarOpen || window.innerWidth >= 1024) && (
              <motion.aside 
                initial={window.innerWidth < 1024 ? { height: 0, opacity: 0 } : false}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`w-full lg:w-1/4 flex flex-col gap-6 overflow-hidden lg:overflow-visible ${isSidebarOpen ? 'px-4 sm:px-0 mb-8 lg:mb-0' : 'hidden lg:flex'}`}
              >
                <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary flex items-center justify-center text-white text-2xl sm:text-3xl font-bold mb-4">
                    {user?.user_metadata?.full_name?.[0] || user?.email?.[0].toUpperCase()}
                  </div>
                  <h2 className="text-lg sm:text-xl font-heading font-bold">{user?.user_metadata?.full_name || 'Valued Collector'}</h2>
                  <p className="text-xs sm:text-sm text-gray-500 mb-6">{user?.email}</p>
                  <button 
                    onClick={handleLogout}
                    className="btn border border-red-100 text-red-500 hover:bg-red-50 w-full py-2.5 sm:py-3 gap-2 text-[10px] sm:text-xs font-bold active:scale-95 transition-transform"
                  >
                    <LogOut size={14} className="sm:w-4 sm:h-4" />
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
                        flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 rounded-lg text-[11px] sm:text-sm font-bold transition-all
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
                      <ChevronRight size={14} className="opacity-0 lg:group-hover:opacity-100 transition-opacity" />
                    </NavLink>
                  ))}
                </nav>
              </motion.aside>
            )}
          </AnimatePresence>

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
