import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Globe, ArrowRight, ShieldAlert, Sparkles, Tag, ShoppingBag, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../lib/useCurrency';

const MerchantProfile = () => {
  const { slug } = useParams();
  const [merchant, setMerchant] = useState(null);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  const { formatPrice } = useCurrency();

  useEffect(() => {
    const fetchMerchantData = async () => {
      setLoading(true);

      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      // Fetch merchant
      const { data: merchData } = await supabase
        .from('merchants')
        .select('*')
        .eq('slug', slug)
        .single();

      if (merchData) {
        setMerchant(merchData);

        // Fetch their active sales
        const { data: salesData } = await supabase
          .from('sales')
          .select('*')
          .eq('merchant_id', merchData.id)
          .eq('status', 'active');
        if (salesData) setSales(salesData);

        // Fetch their active products
        const { data: prodData } = await supabase
          .from('products')
          .select('*')
          .eq('merchant_id', merchData.id)
          .eq('status', 'active');
        if (prodData) setProducts(prodData);
      }

      setLoading(false);
    };

    fetchMerchantData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
        <ShieldAlert size={48} className="text-secondary mb-4" />
        <h2 className="text-2xl font-heading font-bold mb-2">Brand Profile Not Found</h2>
        <p className="text-gray-500 mb-6 max-w-md">The brand profile you are looking for may have been removed or does not exist.</p>
        <Link to="/merchants" className="btn btn-primary">Back to Brands</Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-20 pt-24">
      <div className="container">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-12 mb-16 flex flex-col md:flex-row items-start gap-8 sm:gap-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-[100px] pointer-events-none"></div>
          
          {/* Logo */}
          <img 
            src={merchant.logo_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=300'} 
            alt={merchant.name} 
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover border bg-gray-50 shadow-md shrink-0"
          />

          <div className="flex flex-col gap-4 flex-grow">
            <div>
              <span className="text-[10px] text-secondary font-bold uppercase tracking-widest block mb-1">Partner Brand</span>
              <h1 className="text-3xl sm:text-4xl font-heading font-bold text-primary">{merchant.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-medium mt-2">
                <span className="flex items-center gap-1"><MapPin size={14} className="text-secondary" /> {merchant.location_city}, {merchant.location_state}</span>
              </div>
            </div>

            <p className="text-sm text-gray-500 font-light leading-relaxed max-w-3xl">
              {merchant.description || 'Exclusive n partner offering curated authentic fragrances, fine attars, and premium caps.'}
            </p>

            <div className="flex flex-wrap gap-4 mt-2">
              <a 
                href={merchant.website_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary py-2.5 px-5 text-xs font-bold gap-2"
              >
                <Globe size={14} /> Visit Website
              </a>
              {merchant.social_instagram && (
                <a 
                  href={merchant.social_instagram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn bg-gray-100 hover:bg-gray-200 text-primary py-2.5 px-5 text-xs font-bold gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> Instagram
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Sales Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-heading font-bold text-primary mb-8 flex items-center gap-2">
            <Tag size={22} className="text-secondary" /> Active Fragrance Sales
          </h2>

          {sales.length === 0 ? (
            <div className="bg-white p-10 rounded-xl border border-gray-100 text-center text-gray-400 italic text-sm shadow-sm">
              No active fragrance sales events registered for this brand currently. Check back later!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sales.map((sale) => (
                <div key={sale.id} className="group bg-white rounded-xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
                  <div className="relative aspect-[16/10] bg-gray-50 overflow-hidden">
                    <img src={sale.image_urls?.[0]} alt={sale.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    {sale.discount_max_pct && (
                      <div className="absolute top-4 left-4 bg-secondary text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">
                        Up to {sale.discount_max_pct}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col gap-3 flex-grow">
                    <h3 className="text-lg font-heading font-bold text-primary group-hover:text-secondary transition-colors line-clamp-1">{sale.title}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 font-light">{sale.teaser_text}</p>
                    <div className="border-t pt-3 mt-auto flex items-center justify-between">
                      {session && sale.price_range_min ? (
                        <span className="text-xs font-bold text-primary">${sale.price_range_min} - ${sale.price_range_max}</span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Gated Details</span>
                      )}
                      <Link to={`/sales/${sale.slug}`} className="text-xs font-bold text-secondary flex items-center gap-1">
                        View <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Products Section */}
        <div>
          <h2 className="text-2xl font-heading font-bold text-primary mb-8 flex items-center gap-2">
            <ShoppingBag size={22} className="text-secondary" /> Featured Products
          </h2>

          {products.length === 0 ? (
            <div className="bg-white p-10 rounded-xl border border-gray-100 text-center text-gray-400 italic text-sm shadow-sm">
              No products mapped directly to this brand profile currently.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <div key={product.id} className="group flex flex-col gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                  <Link to={`/product/${product.id}`} className="relative aspect-[4/5] overflow-hidden bg-gray-50 rounded-lg block">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </Link>
                  <div className="flex flex-col gap-1.5 flex-grow">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{product.category}</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} fill={i < Math.floor(product.rating) ? "var(--color-secondary)" : "none"} className={i < Math.floor(product.rating) ? "text-secondary" : "text-gray-200"} />
                        ))}
                      </div>
                    </div>
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-base font-heading font-bold text-primary group-hover:text-secondary transition-colors cursor-pointer line-clamp-1">{product.name}</h3>
                    </Link>
                    {session && product.price ? (
                      <div className="flex items-center gap-2 mt-auto">
                        <span className="font-bold text-secondary">{formatPrice(product.price)}</span>
                        {product.compare_at_price && (
                          <span className="text-xs text-gray-400 line-through">{formatPrice(product.compare_at_price)}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-auto">Login to view price</span>
                    )}
                    <Link to={`/product/${product.id}`} className="btn btn-primary py-2 text-xs font-bold text-center mt-2 w-full">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MerchantProfile;
