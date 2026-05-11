import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Package,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  GripVertical
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { optimizeImage } from '../lib/imageOptimization';

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    images: [], // Multiple images array
    rating: 5,
    is_featured: false
  });
  const [dbCategories, setDbCategories] = useState([]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching products:', error);
    } else if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const fetchDbCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('name')
      .order('name', { ascending: true });
    if (data) setDbCategories(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchDbCategories();
  }, []);

  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        // Optimize image to WebP before upload
        const optimizedFile = file.type.startsWith('image/') 
          ? await optimizeImage(file, 0.8) 
          : file;

        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.webp`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('backups')
          .upload(filePath, optimizedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('backups')
          .getPublicUrl(filePath);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      const newImages = [...formData.images, ...uploadedUrls];
      setFormData({ 
        ...formData, 
        images: newImages,
        image_url: formData.image_url || uploadedUrls[0] // Set first image as main if none exists
      });
    } catch (err) {
      alert('Error uploading images: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ 
      ...formData, 
      images: newImages,
      image_url: formData.image_url === formData.images[index] ? (newImages[0] || '') : formData.image_url
    });
  };

  const setMainImage = (url) => {
    setFormData({ ...formData, image_url: url });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        alert('Error deleting product: ' + error.message);
      } else {
        fetchProducts();
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category || '',
      image_url: product.image_url || '',
      images: product.images || (product.image_url ? [product.image_url] : []),
      rating: product.rating || 5,
      is_featured: product.is_featured || false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      price: parseFloat(formData.price)
    };

    let error;
    if (editingProduct) {
      const { error: editError } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingProduct.id);
      error = editError;
    } else {
      const { error: addError } = await supabase
        .from('products')
        .insert([payload]);
      error = addError;
    }

    if (error) {
      alert('Error saving product: ' + error.message);
    } else {
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', category: '', image_url: '', images: [], rating: 5, is_featured: false });
      fetchProducts();
    }
    setLoading(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price || 0);
  };

  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Products Management</h1>
          <p className="text-gray-500 text-sm">Create, edit and manage your luxury collection.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setFormData({ name: '', description: '', price: '', category: '', image_url: '', images: [], rating: 5, is_featured: false });
            setIsModalOpen(true);
          }}
          className="btn btn-primary gap-2 py-3 px-6"
        >
          <Plus size={18} />
          Add New Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-primary pl-12 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-bold text-primary">{product.name}</div>
                          {product.is_featured && (
                            <span className="text-[8px] font-bold uppercase tracking-widest bg-secondary/10 text-secondary px-1.5 py-0.5 rounded">Featured</span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400">ID: #PROD-{product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-gray-600 px-2 py-1 bg-gray-100 rounded-md">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-primary">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="p-2 text-gray-400 hover:text-primary transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-heading font-bold text-primary">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
                {/* Multi-Image Upload Area */}
                <div className="flex flex-col gap-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Product Gallery</label>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${formData.image_url === img ? 'border-secondary shadow-lg' : 'border-gray-100'}`}>
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                           <button type="button" onClick={() => setMainImage(img)} className="text-[10px] font-bold bg-white text-primary px-2 py-1 rounded">Set Main</button>
                           <button type="button" onClick={() => removeImage(idx)} className="text-[10px] font-bold bg-red-500 text-white px-2 py-1 rounded">Remove</button>
                        </div>
                        {formData.image_url === img && (
                          <div className="absolute top-2 left-2 bg-secondary text-white text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded">Main</div>
                        )}
                      </div>
                    ))}
                    
                    <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-secondary transition-all group bg-gray-50/50">
                       {isUploading ? (
                         <Loader2 size={24} className="text-secondary animate-spin" />
                       ) : (
                         <>
                           <Plus size={24} className="text-gray-300 group-hover:text-secondary mb-1" />
                           <span className="text-[10px] font-bold text-gray-400 uppercase">Add Image</span>
                         </>
                       )}
                       <input type="file" multiple className="hidden" accept="image/*" onChange={handleMultipleImageUpload} disabled={isUploading} />
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-400">Upload multiple images. Click "Set Main" to pick the primary thumbnail.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-50 pt-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Product Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl outline-none focus:border-secondary transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
                    <select 
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl outline-none focus:border-secondary transition-all"
                    >
                      <option value="">Select Category</option>
                      {dbCategories.map(cat => (
                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Price (USD)</label>
                    <input 
                      type="number" 
                      required
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl outline-none focus:border-secondary transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rating (1-5)</label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      max="5"
                      value={formData.rating}
                      onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                      className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl outline-none focus:border-secondary transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
                  <textarea 
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-secondary px-4 py-3 rounded-xl text-sm outline-none transition-all resize-none shadow-inner"
                  ></textarea>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <input 
                    type="checkbox" 
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                    className="w-5 h-5 accent-secondary"
                  />
                  <div>
                    <label htmlFor="is_featured" className="text-sm font-bold text-primary cursor-pointer block">Featured Product</label>
                    <p className="text-[10px] text-gray-400">Show this product on the homepage slider/grid.</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-50 mt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-primary">Cancel</button>
                  <button type="submit" disabled={loading || isUploading} className="btn btn-primary px-10 py-3 gap-2 shadow-lg shadow-primary/20">
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <><Upload size={18} /> {editingProduct ? 'Update Product' : 'Create Product'}</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
