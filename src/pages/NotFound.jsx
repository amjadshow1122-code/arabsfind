import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft, Tag } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg w-full"
      >
        {/* Big 404 */}
        <div className="relative mb-8">
          <p className="text-[9rem] sm:text-[12rem] font-heading font-black text-gray-100 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center">
              <Tag size={36} className="text-secondary" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-primary mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
          The page you're looking for may have moved, expired, or never existed. Try browsing our active moaviafragranse instead.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="btn btn-primary py-3.5 px-8 text-xs font-bold gap-2">
            <Home size={15} /> Go to Homepage
          </Link>
          <Link to="/sales" className="btn border border-gray-200 text-primary hover:bg-gray-50 py-3.5 px-8 text-xs font-bold gap-2">
            <Tag size={15} /> Browse Sales
          </Link>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-4">Popular pages</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: 'All Sales', to: '/sales' },
              { label: 'Master Perfumers', to: '/merchants' },
              { label: 'How It Works', to: '/how-it-works' },
              { label: 'Contact Us', to: '/contact' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-xs font-bold text-gray-500 hover:text-secondary transition-colors px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
