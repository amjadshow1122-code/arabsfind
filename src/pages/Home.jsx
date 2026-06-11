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
  ChevronRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
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
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .limit(50);
    
    if (products && products.length > 0) {
      setFeaturedProducts(shuffleArray(products).slice(0, 12));
    } else {
      const { data: fallback } = await supabase
        .from('products')
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
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                      <span className="pill pill-ink shadow-sm">NEW IN</span>
                      <span className="pill pill-gold shadow-sm">
                        {Math.floor(Math.random() * 40 + 30)}% OFF
                      </span>
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
                      <span className="text-[12px] text-ink-muted line-through">{formatPrice(product.price * 1.5)}</span>
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
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    to={content.featured_brand.button_link || '/merchants'}
                    className="btn px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em]"
                    style={{ background: '#2A2520', color: '#FAF7F2', border: '1px solid #2A2520' }}
                  >
                    {content.featured_brand.button_text || 'SHOP THE BRAND'}
                  </Link>
                  {content.featured_brand.secondary_button_text && (
                    <Link
                      to={content.featured_brand.secondary_button_link || '/about'}
                      className="btn px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em]"
                      style={{ background: 'transparent', color: '#2A2520', border: '1px solid rgba(42,37,32,0.25)' }}
                    >
                      {content.featured_brand.secondary_button_text}
                    </Link>
                  )}
                  {!content.featured_brand.secondary_button_text && (
                    <Link
                      to="/about"
                      className="btn px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em]"
                      style={{ background: 'transparent', color: '#2A2520', border: '1px solid rgba(42,37,32,0.25)' }}
                    >
                      READ THE STORY
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}


      {/* Email Capture */}
      {content.newsletter && (
        <section className="bg-ink text-bg py-24 sm:py-32 px-6 text-center">
          <div className="container max-w-3xl mx-auto">
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-gold-soft mb-6">THE AL-MOAVIA FRAGRANCE LIST</div>
            <h2 className="text-4xl sm:text-6xl font-display mb-4 tracking-tight">Never miss a new arrival.</h2>
            <p className="text-bg/70 max-w-lg mx-auto mb-10 text-[15px] leading-relaxed">
              Join our newsletter for the latest premium fragrances, authentic attars, and traditional wear straight to your inbox.
            </p>
            
            {isSubscribed ? (
              <div className="w-full max-w-md mx-auto mt-8 mb-4 py-6 border border-white/10 bg-white/5 flex flex-col items-center justify-center">
                <h3 className="text-3xl font-display mb-2 text-gold">Thank you.</h3>
                <p className="text-sm text-bg/80">You're on the list. Keep an eye on your inbox.</p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full max-w-md gap-3 sm:gap-0 mx-auto mt-8 mb-4">
                <input 
                  type="email" 
                  placeholder="your@email.com" 
                  required 
                  className="flex-1 bg-white border border-line px-5 py-3.5 text-sm outline-none focus:border-gold transition-colors w-full sm:w-auto text-ink"
                />
                <button type="submit" className="bg-gold text-white px-8 py-3.5 text-xs font-semibold tracking-[0.16em] uppercase hover:bg-gold-deep transition-colors w-full sm:w-auto">
                  Subscribe &rarr;
                </button>
              </form>
            )}
            <div className="font-mono text-[9px] tracking-[0.16em] uppercase text-bg/40 mt-6">
              WE NEVER SHARE. UNSUBSCRIBE IN ONE CLICK.
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
