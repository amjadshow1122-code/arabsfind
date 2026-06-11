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
    <footer className="bg-bg-card text-ink pt-20 pb-10 border-t border-line">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-12 mb-16">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-end gap-1 mb-2">
                  <span className="font-heading text-2xl leading-none text-ink tracking-tight">
                    Al-Moavia<span className="italic text-gold-deep">Fragrance</span>
                  </span>
                  <span className="font-mono text-[8px] opacity-50 mb-0.5">.pk</span>
            </Link>
            <div className="font-mono text-[8px] tracking-[0.16em] uppercase text-ink-muted">
              PREMIUM PERFUMES, ATTARS, AND TRADITIONAL WEAR
            </div>
            <p className="text-[13px] text-ink-soft leading-relaxed max-w-[280px] mt-2">
              {description || 'Explore our exclusive collection of authentic fragrances and artisan crafted caps.'}
            </p>
          </div>

          {/* Dynamic Columns */}
          {columns.map((col, idx) => (
            <div key={idx} className="flex flex-col">
              <h4 className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-ink mb-5">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-3">
                {col.links.map((link, lidx) => (
                  <li key={lidx}>
                    <Link to={link.url} className="text-[13px] text-ink-soft hover:text-gold-deep transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info (if not covered by dynamic columns) */}
          {(!columns || columns.length === 0) && (
            <>
              <div className="flex flex-col">
                <h4 className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-ink mb-5">
                  SHOP
                </h4>
                <ul className="flex flex-col gap-3">
                  <li><Link to="/shop?category=Perfumes" className="text-[13px] text-ink-soft hover:text-gold-deep transition-colors">Perfumes</Link></li>
                  <li><Link to="/shop?category=Attars" className="text-[13px] text-ink-soft hover:text-gold-deep transition-colors">Attars</Link></li>
                  <li><Link to="/shop?category=Muslim Caps" className="text-[13px] text-ink-soft hover:text-gold-deep transition-colors">Muslim Caps</Link></li>
                  <li><Link to="/shop?category=Oud" className="text-[13px] text-ink-soft hover:text-gold-deep transition-colors">Oud Wood</Link></li>
                  <li><Link to="/shop?category=Accessories" className="text-[13px] text-ink-soft hover:text-gold-deep transition-colors">Accessories</Link></li>
                  <li><Link to="/shop?category=Incense" className="text-[13px] text-ink-soft hover:text-gold-deep transition-colors">Incense</Link></li>
                </ul>
              </div>
              <div className="flex flex-col">
                <h4 className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-ink mb-5">
                  DISCOVER
                </h4>
                <ul className="flex flex-col gap-3">
                  <li><Link to="/brands" className="text-[13px] text-ink-soft hover:text-gold-deep transition-colors">Our Master Perfumers</Link></li>
                  <li><Link to="/how-it-works" className="text-[13px] text-ink-soft hover:text-gold-deep transition-colors">How It Works</Link></li>
                  <li><Link to="/wishlist" className="text-[13px] text-ink-soft hover:text-gold-deep transition-colors">Wishlist</Link></li>
                  <li><Link to="/shop?new=true" className="text-[13px] text-ink-soft hover:text-gold-deep transition-colors">New Arrivals</Link></li>
                  <li><Link to="/shop?sale=1" className="text-[13px] text-ink-soft hover:text-gold-deep transition-colors">Special Offers</Link></li>
                </ul>
              </div>
              <div className="flex flex-col">
                <h4 className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-ink mb-5">
                  PARTNERS
                </h4>
                <ul className="flex flex-col gap-3">
                  <li><Link to="/list-sales" className="text-[13px] text-ink-soft hover:text-gold-deep transition-colors">Become a Partner</Link></li>
                  <li><Link to="/about" className="text-[13px] text-ink-soft hover:text-gold-deep transition-colors">Our Story</Link></li>
                  <li><Link to="/press" className="text-[13px] text-ink-soft hover:text-gold-deep transition-colors">Press</Link></li>
                </ul>
              </div>
              <div className="flex flex-col">
                <h4 className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-ink mb-5">
                  HELP
                </h4>
                <ul className="flex flex-col gap-3">
                  <li><Link to="/contact" className="text-[13px] text-ink-soft hover:text-gold-deep transition-colors">Contact</Link></li>
                  <li><Link to="/faq" className="text-[13px] text-ink-soft hover:text-gold-deep transition-colors">FAQ</Link></li>
                  <li><Link to="/privacy" className="text-[13px] text-ink-soft hover:text-gold-deep transition-colors">Privacy</Link></li>
                  <li><Link to="/terms" className="text-[13px] text-ink-soft hover:text-gold-deep transition-colors">Terms</Link></li>
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-line pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-ink-muted">
            {copyright ? copyright.replace(/Al-Moavia Fragrance\.com\|Al-Moavia Fragrance/gi, 'Al-MoaviaFragrance.pk') : `© ${new Date().getFullYear()} Al-MoaviaFragrance.pk. Made in Pakistan.`}
          </p>
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-muted">
            AUTHENTIC FRAGRANCE SPECIALISTS
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
