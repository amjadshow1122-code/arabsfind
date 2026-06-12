import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const WhatsAppWidget = () => {
  const [config, setConfig] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('footer_config')
          .eq('id', 1)
          .single();
        
        if (data?.footer_config) {
          setConfig(data.footer_config.whatsapp_widget || {
            enabled: true,
            number: '+923175587278'
          });
        }
      } catch (err) {
        console.error('Error fetching WhatsApp config:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  useEffect(() => {
    // Show tooltip after 3 seconds if widget is active
    if (config?.enabled !== false) {
      const timer = setTimeout(() => {
        // Only show if not dismissed before
        const dismissed = localStorage.getItem('whatsapp-tooltip-dismissed');
        if (!dismissed) {
          setShowTooltip(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [config]);

  const handleDismissTooltip = (e) => {
    e.stopPropagation();
    setShowTooltip(false);
    localStorage.setItem('whatsapp-tooltip-dismissed', 'true');
  };

  const handleOpenChat = () => {
    const rawNumber = config?.number || '+923175587278';
    const number = rawNumber.replace(/\D/g, '');
    const currentUrl = window.location.href;
    const text = `Hi, I'm visiting your website (${currentUrl}) and have a question. Could you please assist me?`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // If explicit disable in settings, don't render anything
  if (loading || config?.enabled === false) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-body select-none">
      {/* Interactive Tooltip Chat Bubble */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 15 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            onClick={handleOpenChat}
            className="relative bg-white border border-gray-150 rounded-2xl shadow-xl p-4 pr-10 max-w-[280px] cursor-pointer hover:border-gray-300 transition-all group duration-300"
          >
            {/* Dismiss button */}
            <button
              onClick={handleDismissTooltip}
              className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
              aria-label="Dismiss message"
            >
              <X size={14} />
            </button>

            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                <MessageCircle size={16} fill="white" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Customer Support
                </span>
                <p className="text-[13px] text-gray-800 font-medium leading-snug group-hover:text-gold transition-colors">
                  Need any assistance? Chat with our team directly on WhatsApp!
                </p>
              </div>
            </div>
            
            {/* Little pointer tail */}
            <div className="absolute right-6 bottom-[-6px] w-3 h-3 bg-white border-r border-b border-gray-150 transform rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        onClick={handleOpenChat}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-[0_4px_18px_rgba(37,211,102,0.35)] cursor-pointer group focus:outline-none"
        aria-label="Contact us on WhatsApp"
      >
        {/* Pulsing Outer Ring */}
        <span className="absolute inset-0 rounded-full border border-[#25D366] opacity-75 animate-ping group-hover:animate-none"></span>

        {/* WhatsApp Icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          className="w-7 h-7 fill-current transition-transform duration-300 group-hover:rotate-6"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>
      </motion.button>
    </div>
  );
};

export default WhatsAppWidget;
