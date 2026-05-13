import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import Profile from './pages/Profile';
import About from './pages/About';
import AdminProducts from './pages/AdminProducts';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import UserPanel from './components/UserPanel';
import UserDashboard from './pages/UserDashboard';
import UserOrders from './pages/UserOrders';
import UserWishlist from './pages/UserWishlist';
import UserSettings from './pages/UserSettings';
import UserAddresses from './pages/UserAddresses';
import UserNotifications from './pages/UserNotifications';
import ForgotPassword from './pages/ForgotPassword';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './components/AdminLayout';
import AdminOrders from './pages/AdminOrders';
import AdminCustomers from './pages/AdminCustomers';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminSettings from './pages/AdminSettings';
import AdminBackup from './pages/AdminBackup';
import AdminCategories from './pages/AdminCategories';
import AdminContent from './pages/AdminContent';
import AdminMedia from './pages/AdminMedia';
import MaintenancePage from './pages/MaintenancePage';
import { supabase } from './lib/supabase';
import { CartProvider } from './context/CartContext';

// Helper component to guard against maintenance mode
const MaintenanceGuard = ({ children }) => {
  const [maintenance, setMaintenance] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkMaintenance = async () => {
      // Allow access to admin routes even in maintenance
      if (location.pathname.startsWith('/admin')) {
        setMaintenance(false);
        return;
      }

      const { data } = await supabase
        .from('site_settings')
        .select('maintenance_mode')
        .eq('id', 1)
        .single();
      
      if (data?.maintenance_mode) {
        // Admins can bypass
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();
          
          if (profile?.is_admin) {
            setMaintenance(false);
            return;
          }
        }
        setMaintenance(true);
      } else {
        setMaintenance(false);
      }
    };

    checkMaintenance();
  }, [location.pathname]);

  if (maintenance === null) return null; // Loading
  if (maintenance) return <MaintenancePage />;
  return children;
};

// Placeholder components for other pages
const Collections = () => <div className="container py-20"><h1>Collections</h1><p className="mt-4">Explore our curated collections.</p></div>;

function App() {
  return (
    <Router>
      <MaintenanceGuard>
        <CartProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/about" element={<About />} />
              <Route path="/collections" element={<Collections />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              
              {/* User Panel Routes */}
              <Route path="/profile" element={<UserPanel><UserDashboard /></UserPanel>} />
              <Route path="/profile/orders" element={<UserPanel><UserOrders /></UserPanel>} />
              <Route path="/profile/wishlist" element={<UserPanel><UserWishlist /></UserPanel>} />
              <Route path="/profile/settings" element={<UserPanel><UserSettings /></UserPanel>} />
              <Route path="/profile/addresses" element={<UserPanel><UserAddresses /></UserPanel>} />
              <Route path="/profile/notifications" element={<UserPanel><UserNotifications /></UserPanel>} />

              <Route path="/admin/login" element={<AdminLogin />} />
              
              <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
              <Route path="/admin/products" element={<AdminLayout><AdminProducts /></AdminLayout>} />
              <Route path="/admin/categories" element={<AdminLayout><AdminCategories /></AdminLayout>} />
              <Route path="/admin/content" element={<AdminLayout><AdminContent /></AdminLayout>} />
              <Route path="/admin/media" element={<AdminLayout><AdminMedia /></AdminLayout>} />
              <Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} />
              <Route path="/admin/customers" element={<AdminLayout><AdminCustomers /></AdminLayout>} />
              <Route path="/admin/analytics" element={<AdminLayout><AdminAnalytics /></AdminLayout>} />
              <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
              <Route path="/admin/backup" element={<AdminLayout><AdminBackup /></AdminLayout>} />
            </Routes>
          </Layout>
        </CartProvider>
      </MaintenanceGuard>
    </Router>
  );
}

export default App;
