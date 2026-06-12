import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Star, 
  Shield, 
  Truck, 
  RotateCcw, 
  ShoppingBag, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../lib/useCurrency';

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const location = useLocation();
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    if (location.state?.showCartSuccess) {
      setShowSuccessToast(true);
      // Clean up React Router state to prevent showing on refresh
      navigate(location.pathname, { replace: true, state: {} });
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, location.pathname]);

  const handleSubscribe = (e) => {
    e.preventDefault();
    setIsSubscribed(true);
  };

  const fetchHomeData = async () => {
    setLoading(true);
    const { data: sections } = await supabase
      .from('homepage_content')
      .select('*')
      .eq('is_visible', true);
    
    const contentMap = {};
    if (sections) {
      sections.forEach(s => {
        contentMap[s.section_name] = s.content;
      });
    }
    setContent(contentMap);

    const shuffleArray = (array) => {
      let shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const { data: products } = await supabase
      .from('products_secure')
      .select('*')
      .eq('is_featured', true)
      .limit(50);
    
    if (products && products.length > 0) {
      setFeaturedProducts(shuffleArray(products).slice(0, 12));
    } else {
      const { data: fallback } = await supabase
        .from('products_secure')
        .select('*')
        .limit(50);
      if (fallback) setFeaturedProducts(shuffleArray(fallback).slice(0, 12));
    }
    
    // Fetch categories that have an image
    const { data: categoriesData, error: catError } = await supabase
      .from('categories')
      .select('*')
      .not('image_url', 'is', null)
      .limit(6);
      
    if (!catError && categoriesData) {
      setCategories(categoriesData);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchHomeData();
  }, []);

  // Slider Logic
  useEffect(() => {
    if (content.hero?.slides?.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % content.hero.slides.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [content.hero]);

  const { formatPrice } = useCurrency();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-secondary animate-spin" />
      </div>
    );
  }

  const allSlides = content.hero?.slides || [
    {
      title: content.hero?.title || 'Discover the Essence',
      subtitle: content.hero?.subtitle || 'Premium perfumes, authentic attars, and traditional wear.',
      image: content.hero?.bg_image || 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=2000',
      cta_text: content.hero?.cta_text || 'Shop Collection',
      is_visible: true
    }
  ];

  const slides = allSlides.filter(s => s.is_visible !== false);

  return (
    <div className="flex flex-col">
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            id="cart-success-toast"
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[9999] bg-white border border-gray-100 px-6 py-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-4 w-[90%] max-w-md"
          >
            <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center shrink-0">
              <ShoppingBag size={20} className="text-[#25D366]" />
            </div>
            <p className="text-[14px] font-medium text-gray-800 leading-snug">
              Product added successfully to the cart. You can remove the product from the cart at any time.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Slider Section (Adapted to Split Layout) */}
      {content.hero && slides.length > 0 && (
        <section className="relative w-full h-[550px] md:h-[calc(100vh-120px)] min-h-[500px] overflow-hidden bg-bg border-b border-line">
          {/* Background Image Slider */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={`img-${currentSlide}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 z-0"
            >
              <img 
                src={slides[currentSlide].image} 
                alt="Hero" 
                className="w-full h-full object-cover object-[75%_center] md:object-[center_30%]"
              />
              {/* Overlay gradient only if we are showing text */}
              {slides[currentSlide].show_content !== false && (
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-bg via-bg/90 to-transparent w-full md:w-[65%]" />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Issue Badge */}
          <div className="pill pill-cream absolute top-6 right-6 md:top-8 md:right-8 z-20 shadow-sm">
            Issue - 05 / 26
          </div>

          {/* Copy content */}
          {slides[currentSlide].show_content !== false && (
            <div className="relative z-10 container mx-auto h-full flex flex-col justify-center px-4 sm:px-6 pt-12 pb-20 md:pt-8 md:pb-16">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={`copy-${currentSlide}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col gap-4 sm:gap-6 max-w-xl"
                >
                  <div className="eyebrow">Legacy of Excellence - Authentic Fragrances</div>
                  
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-none">
                    {slides[currentSlide].title.split(' ').slice(0, -2).join(' ')} <br/>
                    <em className="text-gold-deep">{slides[currentSlide].title.split(' ').slice(-2).join(' ')}</em>
                  </h1>
                  
                  <p className="text-ink-soft text-base md:text-lg max-w-[380px]">
                    {slides[currentSlide].subtitle}
                  </p>
                  
                  <div className="flex gap-3 md:gap-4 mt-2 md:mt-3 flex-wrap">
                    <Link to="/shop" className="btn btn-gold w-full sm:w-auto">
                      {slides[currentSlide].cta_text || 'Shop the Edit'} &rarr;
                    </Link>
                    <Link to="/about" className="btn btn-ghost w-full sm:w-auto">
                      How it works
                    </Link>
                  </div>

                  <div className="hidden sm:flex gap-6 mt-12 pt-6 border-t border-line max-w-[400px]">
                    <div><span className="font-mono font-bold text-ink text-sm">50+</span> <span className="text-[10px] text-ink-muted uppercase tracking-[0.1em] ml-1 flex flex-col mt-0.5">Master Perfumers</span></div>
                    <div><span className="font-mono font-bold text-ink text-sm">200+</span> <span className="text-[10px] text-ink-muted uppercase tracking-[0.1em] ml-1 flex flex-col mt-0.5">Authentic Oils</span></div>
                    <div><span className="font-mono font-bold text-ink text-sm">Premium</span> <span className="text-[10px] text-ink-muted uppercase tracking-[0.1em] ml-1 flex flex-col mt-0.5">Quality Guaranteed</span></div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* Slider Dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? 'bg-gold w-6' : 'bg-white/60 hover:bg-white'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Category Grid (Every sale, sorted.) */}
      {content.collections_intro && (
        <section className="section py-16 sm:py-24">
          <div className="container">
            <div className="eyebrow mb-3">{content.collections_intro?.subtitle || 'SHOP BY COLLECTION'}</div>
            <div className="section-head flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <h2 className="text-4xl sm:text-5xl">{content.collections_intro?.title || 'Find your signature scent.'}</h2>
              <Link to="/shop" className="section-head-link">VIEW ALL CATEGORIES</Link>
            </div>

            <div className="tile-grid">
              {categories.length > 0 ? categories.map((cat) => (
                <Link to={`/shop?category=${cat.slug || cat.name}`} key={cat.id} className="tile">
                  <img src={cat.image_url} alt={cat.name} />
                  <div className="tile-overlay text-center">
                    <div className="tile-label text-xl sm:text-2xl">{cat.name}</div>
                    <div className="tile-count"><span>SHOP NOW</span></div>
                  </div>
                </Link>
              )) : [
                { name: 'Perfumes', count: '124', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800' },
                { name: 'Attars', count: '86', image: 'https://images.unsplash.com/photo-1583209814683-c023dd293cc6?auto=format&fit=crop&q=80&w=800' },
                { name: 'Muslim Caps', count: '52', image: 'https://images.unsplash.com/photo-1616422285623-146b9a896677?auto=format&fit=crop&q=80&w=800' },
                { name: 'Oud Wood', count: '24', image: 'https://images.unsplash.com/photo-1608688461528-76166e4a2e55?auto=format&fit=crop&q=80&w=800' },
                { name: 'Accessories', count: '45', image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=800' },
                { name: 'Incense', count: '38', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?auto=format&fit=crop&q=80&w=800' },
              ].map((cat) => (
                <Link to={`/shop?category=${cat.name}`} key={cat.name} className="tile">
                  <img src={cat.image} alt={cat.name} />
                  <div className="tile-overlay text-center">
                    <div className="tile-label text-xl sm:text-2xl">{cat.name}</div>
                    <div className="tile-count">{cat.count} ITEMS</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {content.products_section && (
        <section className="section py-16 sm:py-24 bg-bg-card">
          <div className="container">
            <div className="eyebrow mb-3">JUST ADDED - DISCOVER NEW ARRIVALS</div>
            <div className="section-head flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <h2 className="text-4xl sm:text-5xl leading-tight">Fresh from the<br/><em>master perfumers.</em></h2>
              <Link to="/shop" className="section-head-link">SEE EVERYTHING NEW</Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.map((product) => (
                <div key={product.id} className="pcard">
                  <Link to={`/product/${product.id}`} className="pcard-image group block">
                    <img src={product.image_url} alt={product.name} className="pcard-img-inner" />
                    
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                      <span className="pill pill-ink shadow-sm">NEW IN</span>
                    </div>



                    {/* Shop Brand Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 transition-all duration-300 z-10">
                      <span className="btn btn-ink w-full py-2.5 text-[10px] text-center block">
                        VIEW DETAILS
                      </span>
                    </div>
                  </Link>

                  <div className="flex flex-col gap-1 px-0.5 mt-1">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="font-display text-[17px] font-medium leading-snug text-ink">{product.name}</h3>
                    </Link>
                    <p className="text-[13px] text-ink-soft leading-snug line-clamp-2">{product.description || 'Premium fragrance piece'}</p>
                    <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-ink-muted mt-0.5">AUTHENTIC QUALITY</p>
                    
                    <div className="flex items-baseline gap-2.5 mt-1">
                      {product.compare_at_price && (
                        <span className="text-[12px] text-ink-muted line-through">{formatPrice(product.compare_at_price)}</span>
                      )}
                      <span className="text-[15px] font-bold text-ink tracking-tight">{formatPrice(product.price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brand Strip */}
      <section className="border-y border-line grid grid-cols-2 md:grid-cols-6 divide-x divide-y md:divide-y-0 divide-line">
        {[
          { name: 'Royal Oud', loc: 'PREMIUM QUALITY' },
          { name: 'Al-Haramain', loc: 'AUTHENTIC ATTARS' },
          { name: 'Sunnah Wear', loc: 'TRADITIONAL CAPS' },
          { name: 'Musk Essence', loc: 'ALCOHOL-FREE' },
          { name: 'Artisan Tasbih', loc: 'HANDCRAFTED' },
          { name: 'Oud Master', loc: 'SIGNATURE SCENTS' },
        ].map((brand) => (
          <div key={brand.name} className="flex flex-col items-center justify-center p-8 hover:bg-bg-card hover:text-gold-deep transition-colors cursor-pointer text-ink">
            <span className="font-display text-xl text-center leading-tight tracking-tight">{brand.name}</span>
            <span className="font-mono text-[9px] tracking-[0.16em] uppercase text-ink-muted mt-1 text-center">{brand.loc}</span>
          </div>
        ))}
      </section>

      {/* Featured Brand Spotlight */}
      {content.featured_brand && content.featured_brand.is_visible !== false && (
        <section className="section py-16 sm:py-24" style={{ background: '#FAF7F2' }}>
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
              
              {/* Brand Image */}
              {content.featured_brand.image && (
                <div className="order-1">
                  <img
                    src={content.featured_brand.image}
                    alt={content.featured_brand.title}
                    className="w-full h-auto object-contain"
                  />
                </div>
              )}

              {/* Editorial Text Card */}
              <div className="flex flex-col justify-center py-10 order-2 md:pl-10">
                <div className="eyebrow mb-5" style={{ color: '#9A9088', letterSpacing: '0.22em' }}>
                  {content.featured_brand.subtitle || 'FEATURED BRAND'}
                </div>
                <h2
                  className="font-display leading-[1.06] tracking-[-0.015em] mb-3"
                  style={{ fontSize: 'clamp(36px, 4vw, 58px)', color: '#2A2520' }}
                >
                  {content.featured_brand.title}
                </h2>
                {content.featured_brand.tagline && (
                  <p
                    className="font-display italic leading-[1.1] mb-6"
                    style={{ fontSize: 'clamp(24px, 2.8vw, 40px)', color: '#A8854A' }}
                  >
                    {content.featured_brand.tagline}
                  </p>
                )}
                <p className="text-ink-soft leading-relaxed mb-10 max-w-[440px]" style={{ fontSize: '14px' }}>
                  {content.featured_brand.description}
                </p>
                <div className="flex mt-2">
                  <button
                    onClick={() => {
                      const number = '923175587278';
                      const text = 'Hi, I am interested in your Al-MoaviaFragrance featured collection.';
                      window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-[0_4px_18px_rgba(37,211,102,0.35)] cursor-pointer group focus:outline-none"
                    aria-label="Contact us on WhatsApp"
                  >
                    <span className="absolute inset-0 rounded-full border border-[#25D366] opacity-75 animate-ping group-hover:animate-none"></span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 448 512"
                      className="w-8 h-8 sm:w-10 sm:h-10 fill-current transition-transform duration-300 group-hover:rotate-6"
                    >
                      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}


      {/* WhatsApp Order */}
      <section className="bg-ink text-bg py-24 sm:py-32 px-6 text-center">
        <div className="container max-w-3xl mx-auto">
          <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-gold-soft mb-6">DIRECT ORDER</div>
          <h2 className="text-4xl sm:text-6xl font-display mb-4 tracking-tight">Order directly via WhatsApp.</h2>
          <p className="text-bg/70 max-w-lg mx-auto mb-10 text-[15px] leading-relaxed">
            Skip the checkout process. Connect with our team on WhatsApp to place your order directly and get personalized assistance.
          </p>
          
          <button 
            onClick={() => {
              const number = '923175587278';
              const text = 'Hi, I would like to place an order.';
              window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="bg-[#25D366] text-white px-10 py-4 text-sm font-bold tracking-[0.1em] uppercase hover:bg-[#20bd5a] transition-colors rounded-full inline-flex items-center gap-3 shadow-lg shadow-[#25D366]/20 mx-auto relative overflow-hidden group"
          >
            <Zap size={18} className="text-yellow-300 animate-pulse" fill="currentColor" />
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="group-hover:scale-110 transition-transform">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
            </svg>
            Order via WhatsApp
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
