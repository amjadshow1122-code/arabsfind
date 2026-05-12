import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Get initial session
    import('../lib/supabase').then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });

      // Listen for changes
      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
      
      // Fetch dynamic menu
      supabase.from('site_settings').select('header_config').eq('id', 1).single().then(({ data }) => {
        if (data?.header_config?.nav_links) {
          setNavLinks(data.header_config.nav_links.map(link => ({
            name: link.label,
            path: link.url
          })));
        }
      });
    });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [navLinks, setNavLinks] = useState([
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Collections', path: '/collections' },
    { name: 'About', path: '/about' },
  ]);

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-6'
      }`}
    >
      <div className="container flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/ARAB_FINDS-removebg-preview.png" alt="Arab Finds" className="h-12 w-auto object-contain" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`font-body text-sm font-semibold tracking-wider uppercase transition-colors hover:text-secondary ${
                location.pathname === link.path ? 'text-secondary' : 'text-primary'
              }`}
              style={{ color: location.pathname === link.path ? 'var(--color-secondary)' : 'var(--color-primary)' }}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button className="text-primary hover:text-secondary transition-colors">
            <Search size={20} />
          </button>
          <Link to={session ? "/profile" : "/login"} className="text-primary hover:text-secondary transition-colors">
            <User size={20} />
          </Link>
          <Link to="/cart" className="relative text-primary hover:text-secondary transition-colors">
            <ShoppingCart size={20} />
            <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
              0
            </span>
          </Link>
          <button 
            className="md:hidden text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="container py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-body text-lg font-semibold tracking-wider uppercase text-primary hover:text-secondary"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
