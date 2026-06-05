import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Tag, Calendar, MapPin, ArrowRight, Lock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const SalesBrowse = () => {
  const [sales, setSales] = useState([]);
  const [categories, setCategories] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [minDiscount, setMinDiscount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      setLoading(true);
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      // Fetch categories
      const { data: catData } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (catData) setCategories(catData);

      // Fetch merchants
      const { data: merchData } = await supabase.from('merchants').select('*');
      if (merchData) setMerchants(merchData);

      // Fetch Sales (uses the public.sales view which handles data masking automatically)
      const { data: salesData } = await supabase.from('sales').select('*').eq('status', 'active');
      if (salesData) setSales(salesData);

      setLoading(false);
    };

    checkAuthAndFetch();

    // Listen for auth change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getMerchant = (id) => merchants.find(m => m.id === id) || { name: 'Brand' };

  // Filter Logic
  const filteredSales = sales.filter(sale => {
    const merchant = getMerchant(sale.merchant_id);
    const matchesSearch = 
      sale.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      merchant.name.toLowerCase().includes(searchTerm.toLowerCase());
      
    // Category matches if selectedCategory is 'All' or matches any ID
    const catObject = categories.find(c => c.name === selectedCategory);
    const matchesCategory = selectedCategory === 'All' || 
      (sale.category_ids && catObject && sale.category_ids.includes(catObject.id));

    // State match
    const matchesState = selectedState === 'All' || merchant.location_state === selectedState;

    // Discount match
    const matchesDiscount = (sale.discount_max_pct || 0) >= minDiscount;

    return matchesSearch && matchesCategory && matchesState && matchesDiscount;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="bg-primary py-16 sm:py-24 text-center relative overflow-hidden" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="container relative z-10 px-4">
          <span className="text-secondary text-xs font-bold uppercase tracking-[0.2em] mb-4 block">MoaviaFragranse</span>
          <h1 className="text-white text-3xl sm:text-5xl md:text-6xl mb-4">Active Fragrance Sales</h1>
          <p className="text-gray-300 max-w-xl mx-auto text-sm sm:text-base font-light">
            Discover curated authentic fragrances, premium attars, and exclusive perfume offers from top artisans.
          </p>
        </div>
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 h-full">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="border-r border-white/20 h-full"></div>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-10 sm:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-1/4 flex flex-col gap-8 bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary border-b pb-3 flex items-center gap-2">
              <Filter size={16} /> Filters
            </h3>
            
            {/* Search */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Search</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Brand or sale name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 focus:border-secondary px-4 py-3 rounded-lg outline-none text-sm"
                />
                <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Category</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 focus:border-secondary px-4 py-3 rounded-lg outline-none text-sm"
              >
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            {/* Location (State) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Location</label>
              <select 
                value={selectedState} 
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 focus:border-secondary px-4 py-3 rounded-lg outline-none text-sm"
              >
                <option value="All">All States</option>
                <option value="NSW">New South Wales (NSW)</option>
                <option value="VIC">Victoria (VIC)</option>
                <option value="QLD">Queensland (QLD)</option>
                <option value="WA">Western Australia (WA)</option>
                <option value="SA">South Australia (SA)</option>
                <option value="TAS">Tasmania (TAS)</option>
              </select>
            </div>

            {/* Discount Percentage */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Min Discount</label>
                <span className="text-xs font-bold text-secondary">{minDiscount}% off</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="80" 
                step="10"
                value={minDiscount}
                onChange={(e) => setMinDiscount(Number(e.target.value))}
                className="w-full accent-secondary cursor-pointer"
              />
            </div>
          </aside>

          {/* Grid View */}
          <main className="w-full lg:w-3/4 flex flex-col gap-8">
            <div className="flex items-center justify-between border-b pb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Showing {filteredSales.length} active fragrance sale{filteredSales.length !== 1 ? 's' : ''}
              </span>
            </div>

            {filteredSales.length === 0 ? (
              <div className="bg-white p-12 rounded-xl text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                <Tag size={48} className="text-gray-200 mb-4" />
                <p className="text-gray-500 font-light mb-2">No active moaviafragranse match your filters.</p>
                <button 
                  onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedState('All'); setMinDiscount(0); }}
                  className="text-xs font-bold text-secondary uppercase tracking-widest hover:underline"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredSales.map((sale) => {
                  const merchant = getMerchant(sale.merchant_id);
                  return (
                    <motion.div 
                      layout
                      key={sale.id}
                      className="group bg-white rounded-xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col"
                    >
                      {/* Image Banner */}
                      <div className="relative aspect-[16/9] bg-gray-50 overflow-hidden">
                        <img 
                          src={sale.image_urls?.[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800'} 
                          alt={sale.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Discount Tag */}
                        {sale.discount_max_pct && (
                          <div className="absolute top-4 left-4 bg-secondary text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm" style={{ backgroundColor: 'var(--color-secondary)' }}>
                            Up to {sale.discount_max_pct}% OFF
                          </div>
                        )}
                        {/* Featured Badge */}
                        {sale.is_featured && (
                          <div className="absolute top-4 right-4 bg-primary text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
                            <Sparkles size={10} className="text-secondary" /> Featured
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col gap-4 flex-grow">
                        <div>
                          {/* Brand Name */}
                          <Link to={`/merchants/${merchant.slug}`} className="text-xs text-secondary font-bold uppercase tracking-widest hover:underline mb-1 block">
                            {merchant.name}
                          </Link>
                          {/* Title */}
                          <Link to={`/sales/${sale.slug}`}>
                            <h3 className="text-xl font-heading font-bold text-primary group-hover:text-secondary transition-colors line-clamp-1">
                              {sale.title}
                            </h3>
                          </Link>
                        </div>

                        {/* Teaser Text */}
                        <p className="text-sm text-gray-500 line-clamp-2 font-light">
                          {sale.teaser_text || 'Premium sales event featuring exclusive fragrance collections.'}
                        </p>

                        {/* Metadata grid */}
                        <div className="grid grid-cols-2 gap-3 text-xs text-gray-400 font-medium border-t border-b py-3.5 my-2">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-gray-400" />
                            {merchant.location_city}, {merchant.location_state}
                          </span>
                          <span className="flex items-center gap-1.5 justify-end">
                            <Calendar size={14} className="text-gray-400" />
                            {new Date(sale.sale_start_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                            {sale.sale_end_date && ` - ${new Date(sale.sale_end_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`}
                          </span>
                        </div>

                        {/* Gated Details Teaser */}
                        <div className="mt-auto">
                          {!session ? (
                            /* Guest / Gated Detail Prompter */
                            <div className="bg-gray-50 rounded-lg p-4 flex flex-col gap-3 border border-dashed border-gray-200">
                              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                <Lock size={12} className="text-secondary animate-pulse" /> Details Gated
                              </div>
                              <p className="text-[11px] text-gray-400 leading-normal">
                                Price ranges and merchant store links are masked. Sign in free to view full details.
                              </p>
                              <Link 
                                to="/login" 
                                className="w-full text-center text-xs font-bold text-secondary hover:text-white border border-secondary hover:bg-secondary py-2 rounded transition-all duration-300 uppercase tracking-wider"
                              >
                                Unlock Free
                              </Link>
                            </div>
                          ) : (
                            /* Logged-In User Details Preview */
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block">Estimated Prices</span>
                                <span className="text-lg font-bold text-primary">
                                  {sale.price_range_min ? `$${sale.price_range_min} - $${sale.price_range_max}` : 'Prices Gated'}
                                </span>
                              </div>
                              <Link 
                                to={`/sales/${sale.slug}`}
                                className="p-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                              >
                                <ArrowRight size={16} />
                              </Link>
                            </div>
                          )}
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
};

export default SalesBrowse;
