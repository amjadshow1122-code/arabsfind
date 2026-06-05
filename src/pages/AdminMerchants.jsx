import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit, Trash2, X, Store, MapPin, Globe, Save, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminMerchants = () => {
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo_url: '',
    website_url: '',
    description: '',
    location_city: '',
    location_state: '',
    social_instagram: '',
    status: 'active',
    affiliate_url_template: ''
  });

  const fetchMerchants = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('merchants')
      .select('*')
      .order('name', { ascending: true });
    
    if (data) setMerchants(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const handleEdit = (m) => {
    setEditingMerchant(m);
    setFormData({
      name: m.name || '',
      slug: m.slug || '',
      logo_url: m.logo_url || '',
      website_url: m.website_url || '',
      description: m.description || '',
      location_city: m.location_city || '',
      location_state: m.location_state || '',
      social_instagram: m.social_instagram || '',
      status: m.status || 'active',
      affiliate_url_template: m.affiliate_url_template || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this brand? This may delete linked sales.')) {
      const { error } = await supabase.from('merchants').delete().eq('id', id);
      if (error) alert('Delete failed: ' + error.message);
      else fetchMerchants();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let error;
    if (editingMerchant) {
      const { error: err } = await supabase
        .from('merchants')
        .update(formData)
        .eq('id', editingMerchant.id);
      error = err;
    } else {
      const { error: err } = await supabase
        .from('merchants')
        .insert([formData]);
      error = err;
    }

    if (error) {
      alert('Save failed: ' + error.message);
    } else {
      setIsModalOpen(false);
      fetchMerchants();
    }
    setLoading(false);
  };

  const filteredMerchants = merchants.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Brands & Brand Partners</h1>
          <p className="text-gray-500 text-sm">Create and manage Australia's premium partner brands and affiliate configurations.</p>
        </div>
        <button 
          onClick={() => { setEditingMerchant(null); setFormData({ name: '', slug: '', logo_url: '', website_url: '', description: '', location_city: '', location_state: '', social_instagram: '', status: 'active', affiliate_url_template: '' }); setIsModalOpen(true); }}
          className="btn btn-primary gap-2 py-3 px-6 text-xs"
        >
          <Plus size={16} /> Add Brand Partner
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search brands by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-secondary pl-12 pr-4 py-2.5 rounded-lg text-xs outline-none transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredMerchants.length === 0 ? (
          <div className="col-span-full py-20 text-center text-gray-400 italic text-sm">
            No brands registered yet. Click "Add Brand Partner" to start.
          </div>
        ) : filteredMerchants.map((m) => (
          <motion.div 
            layout
            key={m.id}
            className="bg-white p-6 rounded-xl border shadow-sm flex flex-col gap-4 group relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img src={m.logo_url} alt={m.name} className="w-14 h-14 rounded-xl object-cover bg-gray-50 border shadow-sm" />
                <div>
                  <h3 className="text-lg font-heading font-bold text-primary">{m.name}</h3>
                  <span className="text-[10px] text-gray-400 flex items-center gap-0.5 font-medium mt-1">
                    <MapPin size={12} className="text-secondary" /> {m.location_city}, {m.location_state}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(m)} className="p-2 text-gray-400 hover:text-primary"><Edit size={16} /></button>
                <button onClick={() => handleDelete(m.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>

            <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed font-light">
              {m.description || 'No description provided.'}
            </p>

            <div className="border-t pt-4 mt-auto flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span className="flex items-center gap-1"><Globe size={12} /> {m.website_url.replace('https://www.', '').replace('www.', '')}</span>
              <span className={`px-2 py-0.5 rounded-full ${
                m.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
              }`}>{m.status}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-xl rounded-2xl shadow-2xl relative z-10 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-heading font-bold text-primary">{editingMerchant ? 'Edit Brand Partner' : 'Create Brand Partner'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Brand Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" placeholder="e.g. Scanlan Theodore" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Slug (URLsafe)</label>
                  <input type="text" required value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Location City</label>
                    <input type="text" required value={formData.location_city} onChange={(e) => setFormData({...formData, location_city: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" placeholder="e.g. Melbourne" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Location State</label>
                    <input type="text" required value={formData.location_state} onChange={(e) => setFormData({...formData, location_state: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" placeholder="e.g. VIC" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Main Website URL</label>
                  <input type="url" required value={formData.website_url} onChange={(e) => setFormData({...formData, website_url: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" placeholder="https://www.brand.com" />
                </div>

                {/* Affiliate Link Template */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Affiliate Outbound Redirect Template</label>
                    <div className="group relative">
                      <HelpCircle size={14} className="text-gray-400 cursor-pointer" />
                      <div className="absolute right-0 bottom-6 bg-primary text-white text-[10px] leading-normal p-3 rounded-lg shadow-xl w-64 hidden group-hover:block z-20">
                        Customize URL wrapping for partner parameters. Use <code className="text-secondary font-bold font-mono">{"{{link}}"}</code> to insert the sale URL destination dynamically.
                      </div>
                    </div>
                  </div>
                  <input type="text" value={formData.affiliate_url_template} onChange={(e) => setFormData({...formData, affiliate_url_template: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" placeholder="e.g. https://brand.com/aff?url={{link}}" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Brand Description</label>
                  <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none resize-none" placeholder="Details about brand statements, flagships, and collections..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Logo CDN Image URL</label>
                    <input type="url" value={formData.logo_url} onChange={(e) => setFormData({...formData, logo_url: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" placeholder="https://cdn.com/logo.png" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Instagram URL</label>
                    <input type="url" value={formData.social_instagram} onChange={(e) => setFormData({...formData, social_instagram: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" placeholder="https://instagram.com/brand" />
                  </div>
                </div>

                <div className="flex justify-between items-center border-t pt-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Publish Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold">
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary py-4 text-xs font-bold w-full mt-2">
                  <Save size={16} className="mr-2" /> Save Boutique Partner
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMerchants;
