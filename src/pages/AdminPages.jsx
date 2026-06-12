import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Search, Edit, Trash2, X, Save, ArrowLeft, Package, Tag, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' | 'edit'
  const [activePage, setActivePage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Search state for curation
  const [productSearch, setProductSearch] = useState('');
  const [saleSearch, setSaleSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [saleResults, setSaleResults] = useState([]);
  
  const [initialProducts, setInitialProducts] = useState([]);
  const [initialSales, setInitialSales] = useState([]);
  
  // Selected items (cached full objects for rendering)
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedSales, setSelectedSales] = useState([]);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('custom_pages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setPages(data);
    setLoading(false);
  };

  const generateSlug = (text) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const slug = generateSlug(newTitle);
    
    const { data, error } = await supabase
      .from('custom_pages')
      .insert([{ 
        title: newTitle, 
        slug, 
        description: newDescription,
        curated_product_ids: [],
        curated_sale_ids: []
      }])
      .select()
      .single();

    if (error) {
      alert('Error creating page: ' + error.message);
    } else if (data) {
      setPages([data, ...pages]);
      setIsCreateOpen(false);
      setNewTitle('');
      setNewDescription('');
    }
    setIsSaving(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      const { error } = await supabase.from('custom_pages').delete().eq('id', id);
      if (!error) {
        setPages(pages.filter(p => p.id !== id));
      }
    }
  };

  const openEditor = async (page) => {
    setActivePage(page);
    setView('edit');
    setLoading(true);
    
    // Fetch full objects for selected IDs
    if (page.curated_product_ids?.length > 0) {
      const { data } = await supabase.from('products_secure').select('id, name, image_url, image_urls').in('id', page.curated_product_ids);
      if (data) setSelectedProducts(data);
    } else {
      setSelectedProducts([]);
    }

    if (page.curated_sale_ids?.length > 0) {
      const { data } = await supabase.from('sales_secure').select('id, title, image_urls').in('id', page.curated_sale_ids);
      if (data) setSelectedSales(data);
    } else {
      setSelectedSales([]);
    }

    // Fetch initial list of items to pick from
    const { data: prods } = await supabase.from('products_secure').select('id, name, image_url, image_urls').limit(20).order('created_at', { ascending: false });
    if (prods) setInitialProducts(prods);

    const { data: sales } = await supabase.from('sales_secure').select('id, title, image_urls').limit(20).order('created_at', { ascending: false });
    if (sales) setInitialSales(sales);

    setLoading(false);
  };

  const handleProductSearch = async (term) => {
    setProductSearch(term);
    if (term.length > 2) {
      const { data } = await supabase.from('products_secure').select('id, name, image_url, image_urls').ilike('name', `%${term}%`).limit(10);
      if (data) setProductResults(data);
    } else {
      setProductResults([]);
    }
  };

  const handleSaleSearch = async (term) => {
    setSaleSearch(term);
    if (term.length > 2) {
      const { data } = await supabase.from('sales_secure').select('id, title, image_urls').ilike('title', `%${term}%`).limit(10);
      if (data) setSaleResults(data);
    } else {
      setSaleResults([]);
    }
  };

  const toggleProduct = (prod) => {
    if (selectedProducts.find(p => p.id === prod.id)) {
      setSelectedProducts(selectedProducts.filter(p => p.id !== prod.id));
    } else {
      setSelectedProducts([...selectedProducts, prod]);
    }
  };

  const toggleSale = (sale) => {
    if (selectedSales.find(s => s.id === sale.id)) {
      setSelectedSales(selectedSales.filter(s => s.id !== sale.id));
    } else {
      setSelectedSales([...selectedSales, sale]);
    }
  };

  const savePageCurations = async () => {
    setIsSaving(true);
    const pIds = selectedProducts.map(p => p.id);
    const sIds = selectedSales.map(s => s.id);

    const { error } = await supabase
      .from('custom_pages')
      .update({
        curated_product_ids: pIds,
        curated_sale_ids: sIds
      })
      .eq('id', activePage.id);

    if (error) {
      alert('Error saving curations: ' + error.message);
    } else {
      alert('Page saved successfully!');
      setActivePage({
        ...activePage,
        curated_product_ids: pIds,
        curated_sale_ids: sIds
      });
      fetchPages(); // refresh list in background
    }
    setIsSaving(false);
  };

  if (view === 'edit' && activePage) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('list')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-heading font-bold text-primary">{activePage.title}</h1>
              <p className="text-xs text-gray-500 font-mono">/pages/{activePage.slug}</p>
            </div>
          </div>
          <button onClick={savePageCurations} disabled={isSaving} className="btn btn-primary py-2.5 px-6 text-xs gap-2">
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Layout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Products Column */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
              <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl flex items-center justify-between">
                <h3 className="font-bold text-primary flex items-center gap-2"><Package size={18} /> Available Products</h3>
              </div>
              <div className="p-3 border-b border-gray-100 relative">
                <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => handleProductSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-transparent focus:border-secondary pl-9 pr-4 py-2 text-sm rounded-lg outline-none"
                />
              </div>
              <div className="flex-grow overflow-y-auto p-2">
                {(productSearch.length > 2 ? productResults : initialProducts).map(p => {
                  const isSelected = selectedProducts.find(sp => sp.id === p.id);
                  return (
                    <div key={p.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <img src={p.image_url || p.image_urls?.[0]} className="w-10 h-10 object-cover rounded bg-gray-100" />
                        <span className="text-sm font-medium line-clamp-1">{p.name}</span>
                      </div>
                      <button onClick={() => toggleProduct(p)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${isSelected ? 'bg-secondary text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-secondary hover:text-white'}`}>
                        {isSelected ? 'Added' : 'Add'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-[300px]">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-primary">Selected Products ({selectedProducts.length})</h3>
              </div>
              <div className="flex-grow overflow-y-auto p-3 flex flex-col gap-2 bg-gray-50/30">
                {selectedProducts.map(p => (
                  <div key={p.id} className="bg-white border border-gray-100 rounded-lg p-2.5 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <img src={p.image_url || p.image_urls?.[0]} className="w-10 h-10 object-cover rounded bg-gray-100" />
                      <span className="text-sm font-bold text-primary line-clamp-1">{p.name}</span>
                    </div>
                    <button onClick={() => toggleProduct(p)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                ))}
                {selectedProducts.length === 0 && <p className="text-center text-sm text-gray-400 italic mt-6">No products selected.</p>}
              </div>
            </div>
          </div>

          {/* Sales Column */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-[400px]">
              <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl flex items-center justify-between">
                <h3 className="font-bold text-primary flex items-center gap-2"><Tag size={18} /> Available Sales</h3>
              </div>
              <div className="p-3 border-b border-gray-100 relative">
                <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search sales..."
                  value={saleSearch}
                  onChange={(e) => handleSaleSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-transparent focus:border-secondary pl-9 pr-4 py-2 text-sm rounded-lg outline-none"
                />
              </div>
              <div className="flex-grow overflow-y-auto p-2">
                {(saleSearch.length > 2 ? saleResults : initialSales).map(s => {
                  const isSelected = selectedSales.find(ss => ss.id === s.id);
                  return (
                    <div key={s.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <img src={s.image_urls?.[0]} className="w-10 h-10 object-cover rounded bg-gray-100" />
                        <span className="text-sm font-medium line-clamp-1">{s.title}</span>
                      </div>
                      <button onClick={() => toggleSale(s)} className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${isSelected ? 'bg-secondary text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-secondary hover:text-white'}`}>
                        {isSelected ? 'Added' : 'Add'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col h-[300px]">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-primary">Selected Sales ({selectedSales.length})</h3>
              </div>
              <div className="flex-grow overflow-y-auto p-3 flex flex-col gap-2 bg-gray-50/30">
                {selectedSales.map(s => (
                  <div key={s.id} className="bg-white border border-gray-100 rounded-lg p-2.5 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <img src={s.image_urls?.[0]} className="w-10 h-10 object-cover rounded bg-gray-100" />
                      <span className="text-sm font-bold text-primary line-clamp-1">{s.title}</span>
                    </div>
                    <button onClick={() => toggleSale(s)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                  </div>
                ))}
                {selectedSales.length === 0 && <p className="text-center text-sm text-gray-400 italic mt-6">No sales selected.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Custom Pages</h1>
          <p className="text-gray-500 text-sm mt-1">Create dynamic category pages and curate their content.</p>
        </div>
        <button 
          onClick={() => setIsCreateOpen(true)}
          className="btn btn-primary py-2.5 px-6 gap-2 text-xs font-bold"
        >
          <Plus size={16} /> Create Page
        </button>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <th className="px-6 py-4">Page Title</th>
              <th className="px-6 py-4">URL Slug</th>
              <th className="px-6 py-4">Curated Items</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400">Loading pages...</td></tr>
            ) : pages.length === 0 ? (
              <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic">No custom pages created yet.</td></tr>
            ) : (
              pages.map(page => (
                <tr key={page.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-primary text-sm">{page.title}</p>
                        {page.description && <p className="text-[10px] text-gray-400 line-clamp-1">{page.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">/pages/{page.slug}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Products</span>
                        <span className="text-sm font-bold text-primary">{page.curated_product_ids?.length || 0}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sales</span>
                        <span className="text-sm font-bold text-primary">{page.curated_sale_ids?.length || 0}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditor(page)} className="p-2 text-gray-400 hover:text-primary transition-colors">
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(page.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                      <a href={`/pages/${page.slug}`} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-secondary transition-colors">
                        <ArrowRight size={18} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCreateOpen(false)} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-heading font-bold text-primary">Create New Page</h3>
                <button onClick={() => setIsCreateOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreate} className="p-8 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Page Title (e.g. MAXI DRESSES)</label>
                  <input type="text" required value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl outline-none focus:border-secondary transition-all" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description (Optional)</label>
                  <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl outline-none focus:border-secondary transition-all resize-none h-24" />
                </div>
                <button type="submit" disabled={isSaving || !newTitle} className="btn btn-primary w-full py-4 gap-2 mt-2">
                  {isSaving ? "Creating..." : "Create Page"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPages;
