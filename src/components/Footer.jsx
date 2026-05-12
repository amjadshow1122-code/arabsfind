import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Share2, MessageCircle, Mail, Phone, MapPin } from 'lucide-react';

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

  const description = config?.description || 'Discover the fusion of cultural heritage and contemporary luxury. We curate the finest finds from across the Arab world, bringing prestige and quality to your doorstep.';
  const copyright = config?.copyright || `© ${new Date().getFullYear()} ARAB FINDS. All Rights Reserved.`;
  
  // Default columns
  const defaultColumns = [
    {
      title: 'Quick Links',
      links: [
        { label: 'Shop All', url: '/shop' },
        { label: 'Collections', url: '/collections' },
        { label: 'Our Story', url: '/about' },
        { label: 'Contact Us', url: '/contact' }
      ]
    },
    {
      title: 'Customer Service',
      links: [
        { label: 'Shipping Policy', url: '/shipping' },
        { label: 'Returns & Exchanges', url: '/returns' },
        { label: 'FAQs', url: '/faq' },
        { label: 'Privacy Policy', url: '/privacy' }
      ]
    }
  ];

  const columns = config?.columns || defaultColumns;

  return (
    <footer className="bg-primary text-white pt-20 pb-10" style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2">
              {config?.logo ? (
                <img src={config.logo} alt="Brand Logo" className="h-10 w-auto object-contain" />
              ) : (
                <img src="/ARAB_FINDS-removebg-preview.png" alt="Arab Finds" className="h-10 w-auto object-contain brightness-0 invert" />
              )}
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
            <div key={idx} className="flex flex-col gap-6">
              <h3 className="text-lg font-heading font-bold uppercase tracking-widest text-secondary" style={{ color: 'var(--color-secondary)' }}>{col.title}</h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((link, lidx) => (
                  <li key={lidx}><Link to={link.url} className="text-gray-400 hover:text-white transition-colors text-sm">{link.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div className="flex flex-col gap-6">
            <h3 className="text-lg font-heading font-bold uppercase tracking-widest text-secondary" style={{ color: 'var(--color-secondary)' }}>Contact Us</h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-secondary flex-shrink-0" style={{ color: 'var(--color-secondary)' }} />
                <span className="text-gray-400 text-sm">123 Heritage Lane, Downtown Dubai, UAE</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-secondary flex-shrink-0" style={{ color: 'var(--color-secondary)' }} />
                <span className="text-gray-400 text-sm">+971 4 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-secondary flex-shrink-0" style={{ color: 'var(--color-secondary)' }} />
                <span className="text-gray-400 text-sm">support@arabfinds.com</span>
              </li>
            </ul>
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
