import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X,
  Upload,
  Tags,
  Hash
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminCategories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  });

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching categories:', error);
    } else if (data) {
      setCategories(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This might affect products using this category.')) {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) {
        alert('Error deleting category: ' + error.message);
      } else {
        fetchCategories();
      }
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let error;
    if (editingCategory) {
      const { error: editError } = await supabase
        .from('categories')
        .update(formData)
        .eq('id', editingCategory.id);
      error = editError;
    } else {
      const { error: addError } = await supabase
        .from('categories')
        .insert([formData]);
      error = addError;
    }

    if (error) {
      alert('Error saving category: ' + error.message);
    } else {
      setIsModalOpen(false);
      setEditingCategory(null);
      setFormData({ name: '', slug: '', description: '' });
      fetchCategories();
    }
    setLoading(false);
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Categories</h1>
          <p className="text-gray-500 text-sm">Organize your heritage collection by catalog segments.</p>
        </div>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setFormData({ name: '', slug: '', description: '' });
            setIsModalOpen(true);
          }}
          className="btn btn-primary gap-2 py-3 px-6"
        >
          <Plus size={18} />
          Add New Category
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search categories..." 
            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-primary pl-12 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
             <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredCategories.map((cat) => (
          <motion.div 
            layout
            key={cat.id}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center text-primary">
                <Tags size={24} />
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(cat)} className="p-2 text-gray-400 hover:text-primary"><Edit size={16} /></button>
                <button onClick={() => handleDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-primary mb-1">{cat.name}</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3 flex items-center gap-1">
              <Hash size={10} /> {cat.slug}
            </p>
            <p className="text-sm text-gray-500 line-clamp-2">{cat.description || 'No description provided.'}</p>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-heading font-bold text-primary">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl outline-none focus:border-secondary transition-all" placeholder="e.g. Traditional Wear" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Slug (URL Identifier)</label>
                  <input type="text" required value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl outline-none focus:border-secondary transition-all" placeholder="e.g. traditional-wear" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
                  <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl outline-none focus:border-secondary transition-all resize-none" placeholder="Describe this category..." />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary w-full py-4 gap-2 mt-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Upload size={18} /> {editingCategory ? 'Update Category' : 'Create Category'}</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCategories;
