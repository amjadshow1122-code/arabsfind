import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Filter, Grid, List, ChevronDown, Search, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../lib/useCurrency';

const Shop = () => {
  const [view, setView] = useState('grid');
  const [activeCategory, setActiveCategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const navigate = useNavigate();

  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch categories
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
        
      if (catData) {
        setCategories(['All', ...catData.map(c => c.name)]);
      }

      // Fetch products
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (prodData) {
        setProducts(prodData);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const { formatPrice } = useCurrency();

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
      <div className="bg-primary py-12 sm:py-20 text-center relative overflow-hidden" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="container relative z-10 px-4">
          <h1 className="text-white text-3xl sm:text-5xl md:text-6xl mb-4">Our Catalog</h1>
          <div className="flex items-center justify-center gap-2 text-gray-400 text-xs sm:text-sm">
            <a href="/" className="hover:text-secondary transition-colors uppercase tracking-widest">Home</a>
            <span className="opacity-50">/</span>
            <span className="text-white uppercase tracking-widest font-bold">Shop</span>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="grid grid-cols-12 h-full">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="border-r border-white/20 h-full"></div>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-8 sm:py-12">
        {/* Mobile Filter Toggle */}
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="lg:hidden w-full flex items-center justify-center gap-2 bg-white border border-gray-100 py-4 mb-6 rounded-sm text-sm font-bold uppercase tracking-widest text-primary shadow-sm active:bg-gray-50 transition-all"
        >
          <Filter size={18} className={isFilterOpen ? 'text-secondary' : ''} />
          {isFilterOpen ? 'Close Filters' : 'Filter & Search'}
        </button>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Sidebar */}
          <aside className={`w-full lg:w-1/4 flex flex-col gap-10 ${isFilterOpen ? 'block' : 'hidden lg:flex'}`}>
            {/* Search */}
            <div className="flex flex-col gap-4 px-4 lg:px-0">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary">Search</h3>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="What are you looking for?" 
                  className="w-full bg-white border border-gray-200 px-4 py-3 rounded-sm outline-none focus:border-secondary text-sm shadow-sm"
                />
                <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-col gap-4 px-4 lg:px-0">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary">Categories</h3>
              <div className="flex flex-col gap-1 bg-white lg:bg-transparent p-4 lg:p-0 rounded-sm border border-gray-50 lg:border-0">
                {categories.map((cat) => (
                  <button 
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setCurrentPage(1);
                      if (window.innerWidth < 1024) setIsFilterOpen(false);
                    }}
                    className={`text-left text-sm py-2.5 transition-all flex justify-between items-center px-2 rounded-sm ${
                      activeCategory === cat ? 'bg-secondary/5 text-secondary font-bold border-l-4 border-secondary' : 'text-gray-500 hover:text-primary hover:bg-gray-50'
                    }`}
                  >
                    {cat}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeCategory === cat ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {cat === 'All' ? products.length : products.filter(p => p.category === cat).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Price */}
            <div className="flex flex-col gap-4 px-4 lg:px-0">
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary">Price Range</h3>
              <div className="bg-white lg:bg-transparent p-6 lg:p-0 rounded-sm border border-gray-50 lg:border-0 flex flex-col gap-4">
                <input type="range" className="accent-secondary w-full cursor-pointer" />
                <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                  <span>{formatPrice(0)}</span>
                  <span>{formatPrice(1000)}+</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="w-full lg:w-3/4">
            {/* Toolbar */}
            <div className="bg-white p-4 rounded-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 mb-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setView('grid')}
                    className={`p-2 rounded-sm transition-all ${view === 'grid' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-primary active:bg-gray-50'}`}
                  >
                    <Grid size={18} />
                  </button>
                  <button 
                    onClick={() => setView('list')}
                    className={`p-2 rounded-sm transition-all ${view === 'list' ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-primary active:bg-gray-50'}`}
                  >
                    <List size={18} />
                  </button>
                </div>
                <span className="text-gray-400 text-xs sm:text-sm font-medium">
                  Showing {filteredProducts.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                  {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length}
                </span>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-center sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0">
                <span className="text-xs sm:text-sm text-gray-500 font-medium">Sort:</span>
                <button className="flex items-center gap-2 text-xs sm:text-sm font-bold text-primary active:text-secondary">
                  Newest First <ChevronDown size={14} />
                </button>
              </div>
            </div>

            {/* Product Grid */}
            <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8' : 'flex flex-col gap-8'}>
              {paginatedProducts.map((product) => (
                <motion.div 
                  layout
                  key={product.id} 
                  className={`group bg-white rounded-sm overflow-hidden transition-all duration-300 hover:shadow-xl border border-transparent hover:border-gray-100 ${
                    view === 'list' ? 'flex flex-col md:flex-row' : 'flex flex-col'
                  }`}
                >
                  <Link to={`/product/${product.id}`} className={`relative overflow-hidden bg-gray-50 block ${view === 'list' ? 'w-full md:w-1/3' : 'aspect-[4/5]'}`}>
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    {/* New Label (Optional) */}
                    {new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                      <div className="absolute top-4 left-4 bg-secondary text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-sm" style={{ backgroundColor: 'var(--color-secondary)' }}>
                        New
                      </div>
                    )}
                  </Link>
                  
                  <div className="p-6 flex flex-col gap-3 flex-grow">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 uppercase tracking-widest">{product.category}</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={10} fill={i < Math.floor(product.rating) ? "var(--color-secondary)" : "none"} className={i < Math.floor(product.rating) ? "text-secondary" : "text-gray-200"} />
                        ))}
                      </div>
                    </div>
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-lg font-heading group-hover:text-secondary transition-colors cursor-pointer">{product.name}</h3>
                    </Link>
                    <p className="text-xl font-bold text-primary">{formatPrice(product.price)}</p>
                    {view === 'list' && (
                      <p className="text-sm text-gray-500 mb-4">
                        A curated fragrance piece, hand-selected for its quality and exceptional scent.
                      </p>
                    )}
                    <Link 
                      to={`/product/${product.id}`}
                      className="mt-auto btn btn-primary w-full py-3 text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-16">
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 flex items-center justify-center rounded-sm transition-all font-bold ${
                      currentPage === i + 1 
                        ? 'bg-primary text-white' 
                        : 'bg-white border border-gray-200 hover:border-primary text-primary'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                {currentPage < totalPages && (
                  <button 
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="flex items-center gap-2 text-sm font-bold text-primary hover:text-secondary transition-colors ml-4 uppercase tracking-widest"
                  >
                    Next <ArrowRight size={16} />
                  </button>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Shop;
