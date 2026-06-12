import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tag, ArrowRight, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../lib/useCurrency';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'created_at_desc' },
  { label: 'Oldest', value: 'created_at_asc' },
  { label: 'Discount (High→Low)', value: 'discount_desc' },
];

const CustomPageBrowse = () => {
  const { slug } = useParams();
  const { formatPrice } = useCurrency();
  const [pageData, setPageData] = useState(null);
  const [allPages, setAllPages] = useState([]);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [sort, setSort] = useState('created_at_desc');
  const [activeTab, setActiveTab] = useState('sales');

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const { data: { session: s } } = await supabase.auth.getSession();
      setSession(s);

      // Fetch all custom pages for sidebar
      const { data: pagesList } = await supabase.from('custom_pages').select('*').order('title');
      if (pagesList) setAllPages(pagesList);

      // Fetch this page
      const { data: pData, error: pError } = await supabase.from('custom_pages').select('*').eq('slug', slug).maybeSingle();
      if (pError) console.error("Error fetching custom page:", pError);
      setPageData(pData);

      if (pData) {
        // Fetch curated sales
        if (pData.curated_sale_ids && pData.curated_sale_ids.length > 0) {
          const { data: salesData } = await supabase
            .from('sales_secure')
            .select('*')
            .in('id', pData.curated_sale_ids)
            .eq('status', 'active')
            .order('created_at', { ascending: sort.includes('asc') });
          if (salesData) setSales(salesData);
        } else {
          setSales([]);
        }

        // Fetch curated products
        if (pData.curated_product_ids && pData.curated_product_ids.length > 0) {
          const { data: prodsData } = await supabase
            .from('products_secure')
            .select('*')
            .in('id', pData.curated_product_ids)
            .eq('status', 'active');
          if (prodsData) setProducts(prodsData);
        } else {
          setProducts([]);
        }
      } else {
        setSales([]);
        setProducts([]);
      }
      setLoading(false);
    };
    init();
  }, [slug, sort]);


  return (
    <div className="bg-background min-h-screen pt-24 pb-20">
      <div className="container">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-widest mb-8">
          <Link to="/" className="hover:text-secondary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-primary">{pageData?.title || 'Page'}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="lg:w-60 shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Browse Pages</p>
              <div className="flex flex-col gap-1">
                {allPages.map(p => (
                  <Link
                    key={p.id}
                    to={`/pages/${p.slug}`}
                    className={`text-sm px-3 py-2 rounded-lg font-bold transition-all ${
                      p.slug === slug ? 'bg-secondary/10 text-secondary' : 'text-gray-500 hover:text-primary hover:bg-gray-50'
                    }`}
                  >
                    {p.title}
                  </Link>
                ))}
              </div>
            </div>


          </aside>

          {/* Main */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-heading font-bold text-primary">
                  {pageData?.title || (slug ? slug.replace(/-/g, ' ') : 'All')}
                </h1>
                {pageData?.description && (
                  <p className="text-gray-400 text-sm mt-1">{pageData.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {/* Tabs */}
                <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
                  {['sales', 'products'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                        activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-primary'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <select value={sort} onChange={e => setSort(e.target.value)}
                  className="bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs font-bold outline-none">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 h-64 animate-pulse" />
                ))}
              </div>
            ) : activeTab === 'sales' ? (
              <>
                <p className="text-xs text-gray-400 font-bold mb-4 uppercase tracking-widest">
                {sales.length} active sale{sales.length !== 1 ? 's' : ''}
                </p>
                {sales.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-100 p-16 text-center text-gray-400 italic text-sm">
                    No active sales in this collection right now. Check back soon!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sales.map((sale, i) => (
                      <motion.div key={sale.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md hover:border-secondary/30 transition-all"
                      >
                        <div className="relative h-44 overflow-hidden bg-gray-50">
                          <img src={sale.image_urls?.[0] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=600'}
                            alt={sale.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          {sale.discount_max_pct && (
                            <span className="absolute top-3 left-3 bg-secondary text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                              Up to {sale.discount_max_pct}% off
                            </span>
                          )}
                          {sale.is_featured && (
                            <span className="absolute top-3 right-3 bg-primary text-white text-[10px] font-black px-2.5 py-1 rounded-full">Featured</span>
                          )}
                        </div>
                        <div className="p-5">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">
                            {sale.sale_end_date ? `Ends ${new Date(sale.sale_end_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}` : 'Ongoing Sale'}
                          </p>
                          <h3 className="font-heading font-bold text-primary text-sm mb-2 line-clamp-2">{sale.title}</h3>
                          <p className="text-xs text-gray-400 mb-4 line-clamp-2">{sale.teaser_text}</p>
                          {session ? (
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-primary">
                                {sale.price_range_min && formatPrice(sale.price_range_min)} {sale.price_range_max && `– ${formatPrice(sale.price_range_max)}`}
                              </span>
                              <Link to={`/sales/${sale.slug}`} className="btn btn-primary py-2 px-4 text-[10px] gap-1">
                                View Sale <ArrowRight size={11} />
                              </Link>
                            </div>
                          ) : (
                            <Link to="/login" className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:border-secondary hover:text-secondary transition-all">
                              <Lock size={12} /> Sign in to see prices
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-xs text-gray-400 font-bold mb-4 uppercase tracking-widest">
                  {products.length} product{products.length !== 1 ? 's' : ''}
                </p>
                {products.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-100 p-16 text-center text-gray-400 italic text-sm">
                    No products in this collection right now.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {products.map((prod, i) => (
                      <motion.div key={prod.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all"
                      >
                        <div className="h-44 overflow-hidden bg-gray-50">
                          <img src={prod.image_url || prod.image_urls?.[0]} alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-5">
                          <h3 className="font-heading font-bold text-primary text-sm mb-2 line-clamp-1">{prod.name}</h3>
                          <p className="text-xs text-gray-400 mb-4 line-clamp-2">{prod.teaser_text}</p>
                          {session ? (
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-sm font-bold text-primary">{prod.price && formatPrice(prod.price)}</span>
                                {prod.compare_at_price && <span className="text-xs text-gray-400 line-through ml-2">{formatPrice(prod.compare_at_price)}</span>}
                              </div>
                              <Link to={`/product/${prod.id}`} className="btn btn-primary py-2 px-4 text-[10px] gap-1">
                                View <ArrowRight size={11} />
                              </Link>
                            </div>
                          ) : (
                            <Link to="/login" className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-500 hover:border-secondary hover:text-secondary transition-all">
                              <Lock size={12} /> Sign in to see price
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomPageBrowse;
