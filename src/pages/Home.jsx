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
import { useCart } from '../context/CartContext';

const Home = () => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

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

    const { data: products } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .limit(4);
    
    if (products && products.length > 0) {
      setFeaturedProducts(products);
    } else {
      const { data: fallback } = await supabase
        .from('products')
        .select('*')
        .order('rating', { ascending: false })
        .limit(4);
      if (fallback) setFeaturedProducts(fallback);
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

  const slides = content.hero?.slides || [
    {
      title: content.hero?.title || 'Discover the Finer Finds',
      subtitle: content.hero?.subtitle || 'A curated collection of traditional heritage.',
      image: content.hero?.bg_image || 'https://images.unsplash.com/photo-1542125387-c7128488903c?auto=format&fit=crop&q=80&w=2000',
      cta_text: content.hero?.cta_text || 'Shop Collection'
    }
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Slider Section */}
      {content.hero && (
        <section className="relative h-[90vh] flex items-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 z-0"
            >
              <img 
                src={slides[currentSlide].image} 
                alt="" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </motion.div>
          </AnimatePresence>

          <div className="container relative z-10">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="max-w-2xl text-white"
              >
                <span className="font-body text-secondary font-bold uppercase tracking-[0.3em] mb-4 block">
                  Legacy of Excellence
                </span>
                <h1 className="text-6xl md:text-7xl font-heading mb-8 leading-tight text-white">
                  {slides[currentSlide].title}
                </h1>
                <p className="text-xl font-body mb-10 text-gray-200 leading-relaxed max-w-lg">
                  {slides[currentSlide].subtitle}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/shop" className="btn btn-secondary px-10 py-4 text-base">
                    {slides[currentSlide].cta_text || 'Shop Collection'}
                  </Link>
                  <Link to="/about" className="btn bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 px-10 py-4 text-base">
                    Our Story
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slider Controls */}
          {slides.length > 1 && (
            <>
              <button 
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                className="absolute left-10 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-20"
              >
                <ChevronLeft size={40} />
              </button>
              <button 
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                className="absolute right-10 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-colors z-20"
              >
                <ChevronRight size={40} />
              </button>
              
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {slides.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1 transition-all duration-500 rounded-full ${idx === currentSlide ? 'w-12 bg-secondary' : 'w-4 bg-white/30'}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Features Section */}
      {content.features && (
        <section className="bg-white py-12 border-b border-gray-100">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex items-center gap-4">
                <Truck className="text-secondary" />
                <div>
                  <h4 className="font-bold text-sm uppercase">{content.features.shipping_title}</h4>
                  <p className="text-xs text-gray-500">{content.features.shipping_desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Shield className="text-secondary" />
                <div>
                  <h4 className="font-bold text-sm uppercase">{content.features.secure_title}</h4>
                  <p className="text-xs text-gray-500">{content.features.secure_desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <RotateCcw className="text-secondary" />
                <div>
                  <h4 className="font-bold text-sm uppercase">{content.features.returns_title}</h4>
                  <p className="text-xs text-gray-500">{content.features.returns_desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Star className="text-secondary" />
                <div>
                  <h4 className="font-bold text-sm uppercase">{content.features.quality_title}</h4>
                  <p className="text-xs text-gray-500">{content.features.quality_desc}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Collections Section */}
      {content.collections_intro && (
        <section className="section-padding bg-background">
          <div className="container">
            <div className="flex flex-col items-center text-center mb-16">
              <h2 className="text-4xl md:text-5xl mb-4">{content.collections_intro.title}</h2>
              <div className="w-20 h-1 bg-secondary mb-6"></div>
              <p className="max-w-xl text-gray-500">{content.collections_intro.subtitle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Traditional Wear', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=800' },
                { name: 'Home Decor', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&q=80&w=800' },
                { name: 'Fragrances', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800' },
                { name: 'Jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800' },
              ].map((cat) => (
                <motion.div 
                  key={cat.name}
                  whileHover={{ y: -10 }}
                  className="group relative h-[400px] overflow-hidden rounded-sm cursor-pointer"
                >
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <h3 className="text-white text-2xl mb-4">{cat.name}</h3>
                    <div className="flex items-center text-white text-sm font-semibold group-hover:gap-3 transition-all duration-300">
                      Explore <ArrowRight size={16} className="ml-2" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {content.products_section && (
        <section className="section-padding bg-white">
          <div className="container">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
              <div className="max-w-xl">
                <h2 className="text-4xl md:text-5xl mb-4">{content.products_section.title}</h2>
                <p className="text-gray-500">{content.products_section.subtitle}</p>
              </div>
              <Link to="/shop" className="btn border border-primary text-primary hover:bg-primary hover:text-white px-8">
                View All Products
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="group flex flex-col gap-4">
                  <Link to={`/product/${product.id}`} className="relative aspect-[4/5] overflow-hidden bg-gray-100 rounded-sm block">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute top-4 right-4 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight size={16} className="text-primary" />
                    </div>
                  </Link>
                  <div className="flex flex-col items-center text-center">
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < Math.floor(product.rating) ? "var(--color-secondary)" : "none"} className={i < Math.floor(product.rating) ? "text-secondary" : "text-gray-300"} />
                      ))}
                    </div>
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-xl mb-1 group-hover:text-secondary transition-colors cursor-pointer">{product.name}</h3>
                    </Link>
                    <p className="font-bold text-secondary">{formatPrice(product.price)}</p>
                    <button 
                      onClick={async () => {
                        await addToCart(product);
                        navigate('/cart');
                      }} 
                      className="mt-4 btn btn-primary w-full py-2 text-xs"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      {content.newsletter && (
        <section className="section-padding bg-primary relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary/10 skew-x-12 translate-x-1/2"></div>
          <div className="container relative z-10">
            <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
              <h2 className="text-white text-4xl md:text-5xl mb-6">{content.newsletter.title}</h2>
              <p className="text-gray-400 mb-10 text-lg">{content.newsletter.subtitle}</p>
              <form className="w-full max-w-md flex flex-col md:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="flex-grow bg-white/10 border border-white/20 text-white px-6 py-4 rounded-sm outline-none focus:border-secondary transition-colors"
                />
                <button className="btn btn-secondary whitespace-nowrap px-8">Subscribe Now</button>
              </form>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
