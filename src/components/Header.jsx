import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Menu, X, Search, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewsletterModalOpen, setIsNewsletterModalOpen] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('idle');
  const { cartCount } = useCart();
  const [session, setSession] = useState(null);
  const [config, setConfig] = useState(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

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
      
      // Fetch dynamic menu and config
      supabase.from('site_settings').select('header_config').eq('id', 1).single().then(({ data }) => {
        if (data?.header_config) {
          setConfig(data.header_config);
        }
        setIsLoadingConfig(false);
      });
    });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search on route change
  useEffect(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
  }, [location.pathname]);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const defaultNavLinks = [
    { name: 'PERFUMES', path: '/shop?category=perfumes' },
    { name: 'ATTARS', path: '/shop?category=attars' },
    { name: 'MUSLIM CAPS', path: '/shop?category=muslim-caps' },
    { name: 'ACCESSORIES', path: '/shop?category=accessories' },
    { name: 'ABOUT US', path: '/about' }
  ];

  // Use nav_links from DB if available, otherwise fall back to defaults
  const navLinks = (config?.nav_links && config.nav_links.length > 0)
    ? config.nav_links.map(l => ({ name: l.label, path: l.url }))
    : defaultNavLinks;

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    
    setNewsletterStatus('submitting');
    
    const { supabase } = await import('../lib/supabase');
    const { error } = await supabase.from('newsletter_subscribers').insert([
      { email: newsletterEmail, status: 'subscribed' }
    ]);

    // If it fails due to unique constraint or something, we still say thanks
    setNewsletterStatus('success');
    
    setTimeout(() => {
      setIsNewsletterModalOpen(false);
      setTimeout(() => {
        setNewsletterStatus('idle');
        setNewsletterEmail('');
      }, 500);
    }, 3000);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 pointer-events-none">
      {/* Top Bar Announcement */}
      <div className="pointer-events-auto">
        {config?.top_bar && !isScrolled && (
          <div className="bg-ink text-bg text-center py-2 font-mono text-[10.5px] tracking-[0.18em] uppercase transition-all duration-300">
            {typeof config.top_bar === 'string' ? config.top_bar.replace(/Al-Moavia Fragrance/gi, 'Al-MoaviaFragrance.pk') : config.top_bar}
          </div>
        )}
      </div>

      <div className="w-full pointer-events-auto">
        <div className={`transition-all duration-300 border-b ${
          isScrolled ? 'bg-[#F5F0EA]/95 backdrop-blur-md border-line' : 'bg-[#F5F0EA]/95 backdrop-blur-md border-line'
        }`}>
          <div className="container mx-auto">
            <div className={`flex md:grid md:grid-cols-[1fr_auto_1fr] justify-between items-center gap-4 md:gap-6 transition-all duration-300 ${isScrolled ? 'py-3' : 'py-4 md:py-5'}`}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 min-h-[48px] justify-self-start">
          {isLoadingConfig ? (
            <div className="h-8 w-32 bg-ink/5 animate-pulse rounded"></div>
          ) : (
            <div className="flex items-end gap-1">
              <span className="font-heading text-[22px] sm:text-[26px] leading-none text-ink tracking-tight">
                Al-Moavia<span className="italic text-gold-deep">Fragrance</span>
              </span>
              <span className="font-mono text-[9px] opacity-50 mb-1">.pk</span>
            </div>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 justify-self-center">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`text-xs font-medium tracking-[0.16em] uppercase transition-colors relative py-2 
                after:content-[''] after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[1px] after:bg-gold after:scale-x-0 after:origin-center after:transition-transform after:duration-200 hover:after:scale-x-100 hover:text-gold-deep
                ${location.pathname === link.path ? 'text-gold-deep after:scale-x-100' : 'text-ink'}
              `}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4 justify-self-end">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="w-[38px] h-[38px] rounded-full inline-flex items-center justify-center transition-colors hover:bg-blush-soft text-ink relative"
          >
            <Search size={18} />
          </button>

          <Link 
            to={session ? "/profile" : "/login"}
            className="w-[38px] h-[38px] rounded-full inline-flex items-center justify-center transition-colors hover:bg-blush-soft text-ink relative"
          >
            <User size={18} />
          </Link>

          <Link 
            to="/cart"
            className="w-[38px] h-[38px] rounded-full inline-flex items-center justify-center transition-colors hover:bg-blush-soft text-ink relative"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1 w-3.5 h-3.5 bg-gold-deep text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <button 
            className="md:hidden w-[38px] h-[38px] rounded-full inline-flex items-center justify-center transition-colors hover:bg-blush-soft text-ink"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
          </div>
        </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="md:hidden absolute top-[110%] left-4 right-4 bg-white/90 backdrop-blur-xl border border-gray-100/50 rounded-3xl shadow-2xl overflow-hidden z-40 pointer-events-auto"
            >
              <div className="p-8 flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="font-display text-2xl text-ink hover:text-gold-deep text-center"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 w-full pointer-events-auto"
              style={{ background: '#F5F0EA', borderBottom: '1px solid rgba(42,37,32,0.12)', boxShadow: '0 16px 40px rgba(42,37,32,0.1)' }}
            >
              <div className="container mx-auto py-6 px-6">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-4 max-w-2xl mx-auto">
                  <Search size={20} style={{ color: '#A8854A', flexShrink: 0 }} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search perfumes, attars, brands..."
                    className="flex-1 bg-transparent outline-none text-lg font-medium"
                    style={{ color: '#2A2520' }}
                  />
                  {searchQuery && (
                    <button type="submit" className="font-mono text-[10px] tracking-[0.18em] uppercase px-5 py-2.5 transition-colors" style={{ background: '#2A2520', color: '#FAF7F2' }}>
                      Search
                    </button>
                  )}
                  <button type="button" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="w-9 h-9 rounded-full flex items-center justify-center transition-colors" style={{ color: '#9A9088' }}>
                    <X size={20} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Newsletter Modal */}
        <AnimatePresence>
          {isNewsletterModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 pointer-events-auto">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setIsNewsletterModalOpen(false)} 
                className="absolute inset-0 bg-ink/40 backdrop-blur-sm" 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                className="bg-bg w-full max-w-md p-10 relative z-10 text-center shadow-2xl"
              >
                <button 
                  onClick={() => setIsNewsletterModalOpen(false)} 
                  className="absolute top-4 right-4 p-2 text-ink/50 hover:text-ink transition-colors"
                >
                  <X size={20} />
                </button>
                
                {newsletterStatus === 'success' ? (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-6">
                    <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center text-gold-deep mb-6">
                      <Heart size={30} className="fill-gold-deep" />
                    </div>
                    <h3 className="font-display text-3xl text-ink mb-3">Thank You</h3>
                    <p className="text-sm text-ink/60 leading-relaxed font-medium">
                      Thanks for subscribing! You are now on the list for exclusive access to our newest fragrances and collections.
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <h3 className="font-display text-3xl text-ink mb-4">Join The List</h3>
                    <p className="text-sm text-ink/60 mb-8 leading-relaxed font-medium">
                      Subscribe to receive updates on new arrivals, exclusive fragrance discounts, and early access to collections.
                    </p>
                    
                    <form onSubmit={handleNewsletterSubmit} className="flex flex-col gap-4">
                      <input 
                        type="email" 
                        required
                        placeholder="Enter your email address"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        className="w-full bg-white border border-ink/10 px-5 py-4 text-sm outline-none focus:border-gold transition-colors text-center font-medium"
                      />
                      <button 
                        type="submit" 
                        disabled={newsletterStatus === 'submitting'}
                        className="w-full bg-ink text-bg font-bold tracking-[0.2em] text-[11px] uppercase py-4 hover:bg-ink-soft transition-colors disabled:opacity-50"
                      >
                        {newsletterStatus === 'submitting' ? 'SUBSCRIBING...' : 'SUBSCRIBE NOW'}
                      </button>
                    </form>
                    <p className="text-[10px] text-ink/40 mt-6 font-medium">
                      By subscribing, you agree to our Terms of Service and Privacy Policy. You can unsubscribe at any time.
                    </p>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
