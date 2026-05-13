import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Share2, MessageCircle, Mail, Phone, MapPin, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Footer = () => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    import('../lib/supabase').then(({ supabase }) => {
      supabase.from('site_settings').select('footer_config').eq('id', 1).single().then(({ data }) => {
        if (data?.footer_config) {
          setConfig(data.footer_config);
        }
      });
    });
  }, []);

  const description = config?.description || '';
  const copyright = config?.copyright || '';
  
  const columns = config?.columns || [];
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (idx) => {
    if (window.innerWidth >= 768) return;
    setOpenSections(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <footer className="bg-primary text-white pt-20 pb-10" style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2">
              {config?.logo ? (
                <img src={config.logo} alt="Brand Logo" className="h-10 w-auto object-contain" />
              ) : null}
            </Link>
            <p className="text-gray-400 font-body text-sm leading-relaxed">
              {description}
            </p>
            <div className="flex items-center gap-4">
              <a href={config?.social_links?.instagram || '#'} className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center hover:bg-secondary transition-all">
                <Globe size={16} />
              </a>
              <a href={config?.social_links?.facebook || '#'} className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center hover:bg-secondary transition-all">
                <Share2 size={16} />
              </a>
              <a href={config?.social_links?.twitter || '#'} className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center hover:bg-secondary transition-all">
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Dynamic Columns */}
          {columns.map((col, idx) => (
            <div key={idx} className="flex flex-col md:gap-6 border-b border-gray-800 md:border-0">
              <button 
                onClick={() => toggleSection(idx)}
                className="w-full flex items-center justify-between py-4 md:py-0 text-left group"
              >
                <h3 className="text-sm md:text-lg font-heading font-bold uppercase tracking-widest text-secondary" style={{ color: 'var(--color-secondary)' }}>
                  {col.title}
                </h3>
                <ChevronDown 
                  size={16} 
                  className={`text-secondary transition-transform duration-300 md:hidden ${openSections[idx] ? 'rotate-180' : ''}`} 
                  style={{ color: 'var(--color-secondary)' }}
                />
              </button>
              <AnimatePresence>
                {(openSections[idx] || window.innerWidth >= 768) && (
                  <motion.div
                    initial={window.innerWidth < 768 ? { height: 0, opacity: 0 } : false}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <ul className="flex flex-col gap-3 pb-6 md:pb-0">
                      {col.links.map((link, lidx) => (
                        <li key={lidx}>
                          <Link to={link.url} className="text-gray-400 hover:text-white transition-colors text-xs md:text-sm">
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {/* Contact Info */}
          <div className="flex flex-col md:gap-6 border-b border-gray-800 md:border-0">
            <button 
              onClick={() => toggleSection('contact')}
              className="w-full flex items-center justify-between py-4 md:py-0 text-left group"
            >
              <h3 className="text-sm md:text-lg font-heading font-bold uppercase tracking-widest text-secondary" style={{ color: 'var(--color-secondary)' }}>
                Contact Us
              </h3>
              <ChevronDown 
                size={16} 
                className={`text-secondary transition-transform duration-300 md:hidden ${openSections['contact'] ? 'rotate-180' : ''}`} 
                style={{ color: 'var(--color-secondary)' }}
              />
            </button>
            <AnimatePresence>
              {(openSections['contact'] || window.innerWidth >= 768) && (
                <motion.div
                  initial={window.innerWidth < 768 ? { height: 0, opacity: 0 } : false}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <ul className="flex flex-col gap-4 pb-6 md:pb-0">
                    <li className="flex items-start gap-3">
                      <MapPin size={18} className="text-secondary flex-shrink-0" style={{ color: 'var(--color-secondary)' }} />
                      <span className="text-gray-400 text-xs md:text-sm">{config?.contact_info?.address || ''}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Phone size={18} className="text-secondary flex-shrink-0" style={{ color: 'var(--color-secondary)' }} />
                      <span className="text-gray-400 text-xs md:text-sm">{config?.contact_info?.phone || ''}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Mail size={18} className="text-secondary flex-shrink-0" style={{ color: 'var(--color-secondary)' }} />
                      <span className="text-gray-400 text-xs md:text-sm">{config?.contact_info?.email || ''}</span>
                    </li>
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs font-body">
            {copyright}
          </p>
          <div className="flex items-center gap-6">
            <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" className="h-6 opacity-50 hover:opacity-100 transition-opacity" />
            <img src="https://img.icons8.com/color/48/000000/mastercard.png" alt="Mastercard" className="h-6 opacity-50 hover:opacity-100 transition-opacity" />
            <img src="https://img.icons8.com/color/48/000000/apple-pay.png" alt="Apple Pay" className="h-6 opacity-50 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
