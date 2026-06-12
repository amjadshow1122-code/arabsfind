import React from 'react';
import Header from './Header';
import Footer from './Footer';
import CookieBanner from './CookieBanner';
import WhatsAppWidget from './WhatsAppWidget';
import { motion } from 'framer-motion';

import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminPath && <Header />}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`flex-grow ${!isAdminPath ? 'pt-[106px] md:pt-[116px]' : ''}`}
      >
        {children}
      </motion.main>
      {!isAdminPath && <Footer />}
      {!isAdminPath && <CookieBanner />}
      {!isAdminPath && <WhatsAppWidget />}
    </div>
  );
};

export default Layout;

