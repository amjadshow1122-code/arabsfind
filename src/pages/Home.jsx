import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Shield, Truck, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Home = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: 'Traditional Wear', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&q=80&w=800', count: '120+ Items' },
    { name: 'Home Decor', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&q=80&w=800', count: '85+ Items' },
    { name: 'Fragrances', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800', count: '45+ Items' },
    { name: 'Jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800', count: '60+ Items' },
  ];

  useEffect(() => {
    const fetchFeatured = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .limit(4)
        .order('rating', { ascending: false });
      
      if (data) setFeaturedProducts(data);
      setLoading(false);
    };
    fetchFeatured();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542125387-c7128488903c?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="container relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-white"
          >
            <span className="font-body text-secondary font-bold uppercase tracking-[0.3em] mb-4 block" style={{ color: 'var(--color-secondary)' }}>
              Legacy of Excellence
            </span>
            <h1 className="text-6xl md:text-8xl font-heading mb-8 leading-tight text-white">
              Discover the <span className="italic text-secondary" style={{ color: 'var(--color-secondary)' }}>Finer</span> Finds
            </h1>
            <p className="text-xl font-body mb-10 text-gray-200 leading-relaxed max-w-lg">
              A curated collection of traditional heritage and contemporary luxury, bringing the soul of Arabia to your modern lifestyle.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="btn btn-secondary px-10 py-4 text-base">
                Shop Collection
              </Link>
              <Link to="/about" className="btn bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 px-10 py-4 text-base">
                Our Story
              </Link>
            </div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/50 text-[10px] uppercase tracking-widest">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-secondary to-transparent" style={{ backgroundColor: 'var(--color-secondary)' }}></div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
              <Truck className="text-secondary" style={{ color: 'var(--color-secondary)' }} />
              <div>
                <h4 className="font-bold text-sm uppercase">Global Shipping</h4>
                <p className="text-xs text-gray-500">To over 50 countries</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Shield className="text-secondary" style={{ color: 'var(--color-secondary)' }} />
              <div>
                <h4 className="font-bold text-sm uppercase">Secure Payment</h4>
                <p className="text-xs text-gray-500">100% encrypted checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <RotateCcw className="text-secondary" style={{ color: 'var(--color-secondary)' }} />
              <div>
                <h4 className="font-bold text-sm uppercase">Easy Returns</h4>
                <p className="text-xs text-gray-500">30-day return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Star className="text-secondary" style={{ color: 'var(--color-secondary)' }} />
              <div>
                <h4 className="font-bold text-sm uppercase">Premium Quality</h4>
                <p className="text-xs text-gray-500">Authentic materials</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="section-padding bg-background">
        <div className="container">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-4xl md:text-5xl mb-4">Curated Collections</h2>
            <div className="w-20 h-1 bg-secondary mb-6" style={{ backgroundColor: 'var(--color-secondary)' }}></div>
            <p className="max-w-xl text-gray-500">Explore our diverse ranges, each piece selected for its story and craftsmanship.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => (
              <motion.div 
                key={cat.name}
                whileHover={{ y: -10 }}
                className="group relative h-[400px] overflow-hidden rounded-sm cursor-pointer"
              >
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <span className="text-secondary text-xs font-bold uppercase tracking-widest mb-2 block" style={{ color: 'var(--color-secondary)' }}>{cat.count}</span>
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

      {/* Featured Products */}
      <section className="section-padding bg-white">
        <div className="container">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl mb-4">Most Desired</h2>
              <p className="text-gray-500">Our most sought-after pieces, combining traditional aesthetics with modern luxury.</p>
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
                  <p className="font-bold text-secondary" style={{ color: 'var(--color-secondary)' }}>{formatPrice(product.price)}</p>
                  <button 
                    onClick={() => navigate('/cart')}
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

      {/* Newsletter */}
      <section className="section-padding bg-primary relative overflow-hidden" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary/10 skew-x-12 translate-x-1/2"></div>
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
            <h2 className="text-white text-4xl md:text-5xl mb-6">Join the Inner Circle</h2>
            <p className="text-gray-400 mb-10 text-lg">Subscribe to receive exclusive access to new collections, heritage stories, and special events.</p>
            <form className="w-full max-w-md flex flex-col md:flex-row gap-4">
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
    </div>
  );
};

export default Home;
