import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Globe, ArrowRight, ShieldAlert, Store } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const MerchantDirectory = () => {
  const [merchants, setMerchants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMerchants = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });
        
      if (data) setMerchants(data);
      setLoading(false);
    };

    fetchMerchants();
  }, []);

  const filteredMerchants = merchants.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.location_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.location_state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group by first letter for alphabetical navigation
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Page Header */}
      <div className="bg-primary py-16 sm:py-24 text-center relative overflow-hidden" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="container relative z-10 px-4">
          <span className="text-secondary text-xs font-bold uppercase tracking-[0.2em] mb-4 block">Master Perfumers</span>
          <h1 className="text-white text-3xl sm:text-5xl md:text-6xl mb-4">Brand Directory</h1>
          <p className="text-gray-300 max-w-xl mx-auto text-sm sm:text-base font-light">
            Browse our network of premier independent fragrance houses, attar artisans, and traditional perfumeries.
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

      <div className="container py-12">
        {/* Search Toolbar */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
          <div className="relative w-full sm:w-96">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by brand name or location..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-secondary pl-12 pr-4 py-3 rounded-lg text-sm outline-none transition-all shadow-inner"
            />
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {filteredMerchants.length} Perfume Houses Listed
          </span>
        </div>

        {/* Directory Cards */}
        {filteredMerchants.length === 0 ? (
          <div className="bg-white p-16 rounded-xl text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
            <Store size={48} className="text-gray-200 mb-4" />
            <p className="text-gray-500 font-light mb-2">No brands found matching "{searchTerm}"</p>
            <button 
              onClick={() => setSearchTerm('')}
              className="text-xs font-bold text-secondary uppercase tracking-widest hover:underline"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMerchants.map((merchant) => (
              <motion.div 
                layout
                key={merchant.id}
                className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col p-6 gap-5 group"
              >
                <div className="flex items-center gap-4">
                  {/* Logo */}
                  <img 
                    src={merchant.logo_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=150'} 
                    alt={merchant.name} 
                    className="w-16 h-16 rounded-xl object-cover bg-gray-50 border shadow-sm"
                  />
                  <div>
                    <h3 className="text-xl font-heading font-bold text-primary group-hover:text-secondary transition-colors">
                      {merchant.name}
                    </h3>
                    <span className="flex items-center gap-1 text-xs text-gray-400 font-medium mt-1">
                      <MapPin size={12} className="text-secondary" /> {merchant.location_city}, {merchant.location_state}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-light line-clamp-3">
                  {merchant.description || 'Premium fragrance label showcasing the best in high-end perfumes, luxury attars, and artisan scents.'}
                </p>

                <div className="border-t pt-4 flex items-center justify-between mt-auto">
                  <a 
                    href={merchant.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[10px] font-bold text-gray-400 hover:text-secondary uppercase tracking-widest flex items-center gap-1"
                  >
                    <Globe size={12} /> Visit website
                  </a>
                  
                  <Link 
                    to={`/merchants/${merchant.slug}`}
                    className="text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    View Profile <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default MerchantDirectory;
