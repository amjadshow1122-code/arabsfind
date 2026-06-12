import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Tag, ArrowRight, Lock, ExternalLink, ArrowLeft, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const SaleDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSaleDetails = async () => {
      setLoading(true);
      
      // Get session
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      // Fetch sale by slug (queries view public.sales which automatically returns nulls for gated columns if unauthenticated)
      const { data: saleData } = await supabase
        .from('sales_secure')
        .select('*')
        .eq('slug', slug)
        .single();
        
      if (saleData) {
        setSale(saleData);
        
        // Fetch merchant details
        const { data: merchData } = await supabase
          .from('merchants')
          .select('*')
          .eq('id', saleData.merchant_id)
          .single();
          
        if (merchData) setMerchant(merchData);
      }
      setLoading(false);
    };

    fetchSaleDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!sale || !merchant) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
        <ShieldAlert size={48} className="text-secondary mb-4" />
        <h2 className="text-2xl font-heading font-bold mb-2">Sale Event Not Found</h2>
        <p className="text-gray-500 mb-6 max-w-md">The fragrance sale event you are looking for may have expired, been archived, or does not exist.</p>
        <Link to="/sales" className="btn btn-primary">Back to Sales</Link>
      </div>
    );
  }

  // Check if gated fields are null (which means they are not logged in)
  const isGated = session === null || sale.sale_url === null;

  return (
    <div className="bg-background min-h-screen pb-20 pt-24">
      <div className="container">
        
        {/* Back Button */}
        <Link to="/sales" className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors uppercase tracking-widest mb-8">
          <ArrowLeft size={16} /> Back to active sales
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column - Main Details */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Image Banner */}
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden shadow-md">
              <img 
                src={sale.image_urls?.[0] || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200'} 
                alt={sale.title} 
                className="w-full h-full object-cover"
              />
              {sale.discount_max_pct && (
                <div className="absolute top-6 left-6 bg-secondary text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-sm" style={{ backgroundColor: 'var(--color-secondary)' }}>
                  Up to {sale.discount_max_pct}% OFF
                </div>
              )}
            </div>

            {/* Event Info */}
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-6">
              <div>
                <span className="text-xs text-secondary font-bold uppercase tracking-widest block mb-2">{merchant.name}</span>
                <h1 className="text-3xl sm:text-4xl font-heading font-bold text-primary mb-4">{sale.title}</h1>
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><MapPin size={16} className="text-secondary" /> {merchant.location_city}, {merchant.location_state}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={16} className="text-secondary" /> {new Date(sale.sale_start_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}{sale.sale_end_date && ` - ${new Date(sale.sale_end_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}`}</span>
                </div>
              </div>

              {/* Gated Description Block */}
              <div className="border-t pt-6 flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-primary">About this sale</h3>
                
                {isGated ? (
                  /* Blurred Teaser Description */
                  <div className="relative">
                    <p className="text-sm text-gray-500 leading-relaxed filter blur-sm select-none">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur vel sem a nunc tempor accumsan eget at est. Integer et lectus non nisl sollicitudin porttitor. Phasellus dictum justo a purus pulvinar, non efficitur ligula lacinia. Sed sit amet finibus sapien.
                    </p>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/90 px-6 py-4 rounded-xl border border-gray-100 shadow-md text-center max-w-sm flex flex-col items-center gap-2">
                        <Lock size={18} className="text-secondary" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Full Description Gated</h4>
                        <p className="text-[10px] text-gray-400">Join free to unlock details on fragrances, items, and sizes.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Full Description */
                  <p className="text-sm text-gray-600 leading-relaxed font-light whitespace-pre-line">
                    {sale.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Outbound Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            
            {/* Action Card */}
            <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-6 sticky top-28">
              <h3 className="text-xs font-bold uppercase tracking-widest text-primary border-b pb-3">Brand Offer</h3>
              
              {/* Discounts */}
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Discount Range</span>
                <span className="text-xl font-bold text-secondary">{sale.discount_min_pct ? `${sale.discount_min_pct}% - ` : ''}{sale.discount_max_pct}% OFF</span>
              </div>

              {/* Gated Price range */}
              <div className="flex justify-between items-center border-b pb-4">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Estimated Prices</span>
                {isGated ? (
                  <span className="flex items-center gap-1.5 text-xs text-secondary font-bold uppercase tracking-widest"><Lock size={12} /> Gated</span>
                ) : (
                  <span className="text-lg font-bold text-primary">${sale.price_range_min} - ${sale.price_range_max}</span>
                )}
              </div>

              {/* Main Button Redirect (Gated) */}
              {isGated ? (
                /* Registration Box */
                <div className="bg-secondary/5 rounded-xl p-6 border border-secondary/15 flex flex-col gap-4 text-center">
                  <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center mx-auto text-secondary mb-1">
                    <Lock size={18} />
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Unlock Gated Sale Details</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    This sale's direct outbound merchant store link is restricted. Create a free account to unlock shopping.
                  </p>
                  <Link 
                    to="/login"
                    className="btn btn-secondary w-full py-4 text-xs font-bold"
                  >
                    Register / Sign In
                  </Link>
                </div>
              ) : (
                /* Outbound tracked button */
                <div className="flex flex-col gap-3">
                  <Link 
                    to={`/go/sale/${sale.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary w-full py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    Shop This Sale <ExternalLink size={14} />
                  </Link>
                  <span className="text-[10px] text-gray-400 text-center leading-normal">
                    This outbound link is secure and tracks commission referrals for global brand partnerships.
                  </span>
                </div>
              )}

              {/* Merchant Details Mini Card */}
              <div className="border-t pt-6 flex flex-col gap-4">
                <h4 className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Brand Profile</h4>
                <div className="flex items-center gap-4">
                  <img src={merchant.logo_url} alt={merchant.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50 border" />
                  <div>
                    <Link to={`/merchants/${merchant.slug}`} className="font-bold text-primary hover:text-secondary transition-colors block text-sm">
                      {merchant.name}
                    </Link>
                    <span className="text-xs text-gray-400">{merchant.location_city}, {merchant.location_state}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-light leading-relaxed">
                  {merchant.description}
                </p>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default SaleDetail;
