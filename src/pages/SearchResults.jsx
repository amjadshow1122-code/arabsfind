import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Tag, ShoppingBag, Store, MapPin, Star, ArrowRight, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../lib/useCurrency';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchInput, setSearchInput] = useState(query);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState(null);

  const { formatPrice } = useCurrency();

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    setSession(currentSession);

    // 1. Search Sales (using secure view)
    const { data: salesData } = await supabase
      .from('sales')
      .select('*')
      .eq('status', 'active')
      .ilike('title', `%${searchQuery}%`);
    if (salesData) setSales(salesData);

    // 2. Search Products (using secure view)
    const { data: prodData } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'active')
      .ilike('name', `%${searchQuery}%`);
    if (prodData) setProducts(prodData);

    // 3. Search Merchants
    const { data: merchData } = await supabase
      .from('merchants')
      .select('*')
      .eq('status', 'active')
      .ilike('name', `%${searchQuery}%`);
    if (merchData) setMerchants(merchData);

    setLoading(false);
  };

  useEffect(() => {
    if (query) {
      setSearchInput(query);
      performSearch(query);
    }
  }, [query]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: searchInput });
  };

  const totalResults = sales.length + products.length + merchants.length;

  return (
    <div className="bg-background min-h-screen pb-20 pt-24">
      <div className="container">
        
        {/* Search Header Form */}
        <div className="max-w-2xl mx-auto text-center mb-16 flex flex-col gap-6">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-primary">Unified Search</h1>
          <form onSubmit={handleSearchSubmit} className="relative flex shadow-md rounded-xl overflow-hidden">
            <input 
              type="text" 
              placeholder="Search sales, products, and brand partners..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-white border border-gray-100 focus:border-secondary px-6 py-4 outline-none text-sm font-light"
            />
            <button type="submit" className="bg-primary hover:bg-secondary text-white px-8 transition-colors flex items-center justify-center">
              <Search size={18} />
            </button>
          </form>
          {query && (
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
            </p>
          )}
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : query && totalResults === 0 ? (
          <div className="bg-white p-16 rounded-xl border border-gray-100 shadow-sm text-center flex flex-col items-center justify-center">
            <ShieldAlert size={48} className="text-secondary mb-4" />
            <h3 className="text-xl font-heading font-bold text-primary mb-2">No Results Found</h3>
            <p className="text-gray-500 font-light max-w-sm leading-relaxed">
              We couldn't find matches for "{query}". Try checking spelling or searching for brand names like Amouage or categories like oud.
            </p>
          </div>
        ) : query ? (
          <div className="flex flex-col gap-16">
            
            {/* 1. Brands Results */}
            {merchants.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-heading font-bold text-primary mb-6 flex items-center gap-2 border-b pb-2">
                  <Store size={18} className="text-secondary" /> Partner Brands ({merchants.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {merchants.map((m) => (
                    <div key={m.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                      <img src={m.logo_url} alt={m.name} className="w-14 h-14 rounded-lg object-cover border bg-gray-50 shrink-0" />
                      <div className="flex-grow min-w-0">
                        <Link to={`/merchants/${m.slug}`} className="font-bold text-primary hover:text-secondary transition-colors block text-sm truncate">
                          {m.name}
                        </Link>
                        <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <MapPin size={12} className="text-secondary" /> {m.location_city}, {m.location_state}
                        </span>
                      </div>
                      <Link to={`/merchants/${m.slug}`} className="text-secondary hover:translate-x-1 transition-transform p-1">
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Sales Results */}
            {sales.length > 0 && (
              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-6 flex items-center gap-2 border-b pb-3">
                  <Tag size={18} className="text-secondary" /> Active Fragrance Sales ({sales.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sales.map((sale) => (
                    <div key={sale.id} className="group bg-white rounded-xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
                      <div className="relative aspect-[16/10] bg-gray-50 overflow-hidden">
                        <img src={sale.image_urls?.[0]} alt={sale.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        {sale.discount_max_pct && (
                          <div className="absolute top-4 left-4 bg-secondary text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm">
                            Up to {sale.discount_max_pct}% OFF
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex flex-col gap-3 flex-grow">
                        <h3 className="text-base font-heading font-bold text-primary group-hover:text-secondary transition-colors line-clamp-1">{sale.title}</h3>
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
              </div>
            )}

            {/* 3. Products Results */}
            {products.length > 0 && (
              <div>
                <h2 className="text-xl font-heading font-bold text-primary mb-6 flex items-center gap-2 border-b pb-3">
                  <ShoppingBag size={18} className="text-secondary" /> Catalog Products ({products.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {products.map((product) => (
                    <div key={product.id} className="group flex flex-col gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
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
                          <h3 className="text-sm font-heading font-bold text-primary group-hover:text-secondary transition-colors cursor-pointer line-clamp-1">{product.name}</h3>
                        </Link>
                        {session && product.price ? (
                          <span className="font-bold text-secondary text-sm mt-auto">{formatPrice(product.price)}</span>
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
              </div>
            )}

          </div>
        ) : (
          <div className="text-center py-20 text-gray-400 italic text-sm">
            Enter a search term above to begin searching across fragrance brands, sales, and products.
          </div>
        )}

      </div>
    </div>
  );
};

export default SearchResults;
