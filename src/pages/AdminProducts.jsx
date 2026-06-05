import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit, Trash2, X, Upload, Package, Save, AlertCircle, Download, CheckCircle, FileSpreadsheet, Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../lib/useCurrency';

const AdminProducts = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'bulk-edit', 'import'
  const [products, setProducts] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Single Product Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    teaser_text: '',
    price: '',
    compare_at_price: '',
    sku: '',
    stock_qty: 0,
    stripe_price_id: '',
    category: '',
    category_ids: [],
    merchant_id: '',
    sale_id: '',
    image_url: '',
    image_urls: [''],
    is_external: false,
    external_url: '',
    is_featured: false,
    status: 'active'
  });

  // Spreadsheet Bulk Grid State
  const [gridData, setGridData] = useState([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // CSV Import State
  const [csvFile, setCsvFile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvRows, setCsvRows] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const [importStatus, setImportStatus] = useState('');

  const { formatPrice } = useCurrency();

  const fetchData = async () => {
    setLoading(true);
    // Fetch merchants
    const { data: merch } = await supabase.from('merchants').select('*');
    if (merch) setMerchants(merch);

    // Fetch categories
    const { data: cats } = await supabase.from('categories').select('*');
    if (cats) setCategories(cats);

    // Fetch sales
    const { data: salesList } = await supabase.from('sales_secure').select('*');
    if (salesList) setSales(salesList);

    // Fetch all products (raw secure table)
    const { data: prodList } = await supabase
      .from('products_secure')
      .select('*')
      .order('created_at', { ascending: false });

    if (prodList) {
      setProducts(prodList);
      setGridData(JSON.parse(JSON.stringify(prodList)));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || '',
      slug: p.slug || '',
      description: p.description || '',
      teaser_text: p.teaser_text || '',
      price: p.price || '',
      compare_at_price: p.compare_at_price || '',
      sku: p.sku || '',
      stock_qty: p.stock_qty || 0,
      stripe_price_id: p.stripe_price_id || '',
      category: p.category || '',
      category_ids: p.category_ids || [],
      merchant_id: p.merchant_id || '',
      sale_id: p.sale_id || '',
      image_url: p.image_url || '',
      image_urls: p.image_urls || (p.image_url ? [p.image_url] : ['']),
      is_external: p.is_external || false,
      external_url: p.external_url || '',
      is_featured: p.is_featured || false,
      status: p.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const { error } = await supabase.from('products_secure').delete().eq('id', id);
      if (error) alert('Delete failed: ' + error.message);
      else fetchData();
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      description: formData.description,
      teaser_text: formData.teaser_text,
      price: parseFloat(formData.price),
      compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
      sku: formData.sku,
      stock_qty: parseInt(formData.stock_qty),
      stripe_price_id: formData.stripe_price_id || null,
      category: formData.category,
      category_ids: formData.category_ids.map(Number),
      merchant_id: formData.merchant_id ? Number(formData.merchant_id) : null,
      sale_id: formData.sale_id ? Number(formData.sale_id) : null,
      image_url: formData.image_url || formData.image_urls[0] || '',
      image_urls: formData.image_urls.filter(Boolean),
      is_external: formData.is_external,
      external_url: formData.external_url || null,
      is_featured: formData.is_featured,
      status: formData.status
    };

    let error;
    if (editingProduct) {
      const { error: err } = await supabase.from('products_secure').update(payload).eq('id', editingProduct.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('products_secure').insert([payload]);
      error = err;
    }

    if (error) {
      alert('Save failed: ' + error.message);
    } else {
      setIsModalOpen(false);
      fetchData();
    }
    setLoading(false);
  };

  // Spreadsheet Cell Inline Update
  const handleGridCellChange = (index, field, value) => {
    const updated = [...gridData];
    updated[index][field] = value;
    setGridData(updated);
    setUnsavedChanges(true);
  };

  const saveBulkChanges = async () => {
    setLoading(true);
    let errorCount = 0;

    for (const row of gridData) {
      const original = products.find(p => p.id === row.id);
      if (JSON.stringify(original) !== JSON.stringify(row)) {
        const { error } = await supabase
          .from('products_secure')
          .update({
            name: row.name,
            price: parseFloat(row.price),
            stock_qty: parseInt(row.stock_qty),
            compare_at_price: row.compare_at_price ? parseFloat(row.compare_at_price) : null,
            status: row.status
          })
          .eq('id', row.id);
        
        if (error) errorCount++;
      }
    }

    if (errorCount > 0) {
      alert(`Bulk edit saved with ${errorCount} errors.`);
    } else {
      alert('All bulk edits saved successfully!');
      setUnsavedChanges(false);
      fetchData();
    }
    setLoading(false);
  };

  // CSV Import Parsing
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
      if (lines.length === 0) return;

      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      setCsvHeaders(headers);

      const rows = lines.slice(1).map(line => {
        return line.split(',').map(cell => cell.replace(/"/g, '').trim());
      });
      setCsvRows(rows);

      // Auto map matching headers
      const defaultMapping = {};
      const targetFields = ['name', 'slug', 'description', 'price', 'compare_at_price', 'sku', 'stock_qty', 'category', 'is_external', 'external_url', 'is_featured', 'status'];
      
      targetFields.forEach(field => {
        const index = headers.findIndex(h => h.toLowerCase() === field.toLowerCase());
        if (index !== -1) {
          defaultMapping[field] = index;
        }
      });
      setFieldMapping(defaultMapping);
    };
    reader.readAsText(file);
  };

  const triggerCsvImport = async () => {
    setLoading(true);
    setValidationErrors([]);
    setImportStatus('Validating rows...');

    const payloadRows = [];
    const errors = [];

    csvRows.forEach((row, idx) => {
      const rowNum = idx + 2;
      const getVal = (field) => {
        const headerIdx = fieldMapping[field];
        return (headerIdx !== undefined && row[headerIdx] !== undefined) ? row[headerIdx] : null;
      };

      const name = getVal('name');
      const price = parseFloat(getVal('price'));
      const stock = parseInt(getVal('stock_qty') || '0');

      if (!name) errors.push(`Row ${rowNum}: Name is required.`);
      if (isNaN(price) || price <= 0) errors.push(`Row ${rowNum}: Valid price is required.`);

      if (errors.length === 0) {
        payloadRows.push({
          name: name,
          slug: getVal('slug') || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          description: getVal('description') || '',
          price: price,
          compare_at_price: getVal('compare_at_price') ? parseFloat(getVal('compare_at_price')) : null,
          sku: getVal('sku') || '',
          stock_qty: stock,
          category: getVal('category') || '',
          is_external: getVal('is_external') === 'true' || getVal('is_external') === '1',
          external_url: getVal('external_url') || null,
          is_featured: getVal('is_featured') === 'true' || getVal('is_featured') === '1',
          status: getVal('status') || 'active'
        });
      }
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      setImportStatus('Import aborted due to validation errors.');
      setLoading(false);
      return;
    }

    setImportStatus(`Inserting ${payloadRows.length} rows...`);
    const { error } = await supabase.from('products_secure').insert(payloadRows);

    if (error) {
      setImportStatus('Error inserting rows: ' + error.message);
    } else {
      setImportStatus(`Successfully imported ${payloadRows.length} products!`);
      setCsvFile(null);
      setCsvRows([]);
      fetchData();
    }
    setLoading(false);
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "name,slug,description,price,compare_at_price,sku,stock_qty,category,is_external,external_url,is_featured,status\n"
      + "Luminosity Midi Dress,luminosity-midi-dress,Silk resort midi dress,595,1100,ZIM-LUM-001,5,Womenswear,false,,true,active";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "products_bulk_import_template.csv");
    document.body.appendChild(link);
    link.click();
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Manage Products</h1>
          <p className="text-gray-500 text-sm">Directly manage, bulk upload, and spreadsheet-edit all direct and affiliate fragrance products.</p>
        </div>
        <button 
          onClick={() => { setActiveTab('list'); setIsModalOpen(true); setEditingProduct(null); }}
          className="btn btn-primary gap-2 py-3 px-6 text-xs"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('list')}
          className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'list' ? 'border-secondary text-secondary' : 'border-transparent text-gray-400 hover:text-primary'
          }`}
        >
          <Package size={16} /> Product Listings
        </button>
        <button 
          onClick={() => setActiveTab('bulk-edit')}
          className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'bulk-edit' ? 'border-secondary text-secondary' : 'border-transparent text-gray-400 hover:text-primary'
          }`}
        >
          <FileSpreadsheet size={16} /> Bulk Grid Edit
        </button>
        <button 
          onClick={() => setActiveTab('import')}
          className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'import' ? 'border-secondary text-secondary' : 'border-transparent text-gray-400 hover:text-primary'
          }`}
        >
          <Upload size={16} /> CSV Import
        </button>
      </div>

      {/* 1. Product Listings Grid */}
      {activeTab === 'list' && (
        <div className="flex flex-col gap-6">
          <div className="relative max-w-sm">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-100 pl-12 pr-4 py-2.5 rounded-lg text-xs outline-none"
            />
          </div>

          <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Inventory</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12">
                      <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400 italic text-sm">No products cataloged yet.</td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover bg-gray-50 border shrink-0" />
                          <div>
                            <span className="font-bold text-primary block text-sm">{p.name}</span>
                            <span className="text-[10px] text-gray-400 tracking-wider uppercase block mt-0.5">{p.sku || p.slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600 font-medium">{p.category}</td>
                      <td className="px-6 py-4 text-xs font-bold text-secondary">{formatPrice(p.price)}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{p.is_external ? 'N/A (External)' : `${p.stock_qty} in stock`}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          p.is_external ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                        }`}>
                          {p.is_external ? 'Affiliate' : 'Direct'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-1">
                        <button onClick={() => handleEdit(p)} className="p-2 text-gray-400 hover:text-primary"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. Spreadsheet Bulk Grid Edit */}
      {activeTab === 'bulk-edit' && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Spreadsheet View (Click cells inline to edit)
            </span>
            {unsavedChanges && (
              <button 
                onClick={saveBulkChanges} 
                className="btn btn-secondary py-2.5 px-6 gap-2 text-xs font-bold"
              >
                <Save size={16} /> Save All Changes
              </button>
            )}
          </div>

          <div className="bg-white rounded-xl border shadow-sm overflow-x-auto max-h-[600px]">
            <table className="w-full text-left table-fixed min-w-[1000px]">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b">
                  <th className="w-1/4 px-4 py-3">Product Name</th>
                  <th className="w-1/6 px-4 py-3">Sku</th>
                  <th className="w-1/8 px-4 py-3">Price</th>
                  <th className="w-1/8 px-4 py-3">Compare At Price</th>
                  <th className="w-1/8 px-4 py-3">Stock Qty</th>
                  <th className="w-1/10 px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {gridData.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50/50">
                    <td className="px-2 py-1">
                      <input 
                        type="text" 
                        value={row.name} 
                        onChange={(e) => handleGridCellChange(idx, 'name', e.target.value)}
                        className="w-full bg-transparent hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-secondary border-0 px-2 py-1.5 rounded outline-none text-xs text-primary font-bold"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input 
                        type="text" 
                        value={row.sku || ''} 
                        onChange={(e) => handleGridCellChange(idx, 'sku', e.target.value)}
                        className="w-full bg-transparent hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-secondary border-0 px-2 py-1.5 rounded outline-none text-xs text-gray-600"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input 
                        type="number" 
                        value={row.price || ''} 
                        onChange={(e) => handleGridCellChange(idx, 'price', e.target.value)}
                        className="w-full bg-transparent hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-secondary border-0 px-2 py-1.5 rounded outline-none text-xs text-secondary font-bold text-center"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input 
                        type="number" 
                        value={row.compare_at_price || ''} 
                        onChange={(e) => handleGridCellChange(idx, 'compare_at_price', e.target.value)}
                        className="w-full bg-transparent hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-secondary border-0 px-2 py-1.5 rounded outline-none text-xs text-gray-400 text-center"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input 
                        type="number" 
                        value={row.stock_qty || 0} 
                        onChange={(e) => handleGridCellChange(idx, 'stock_qty', e.target.value)}
                        disabled={row.is_external}
                        className="w-full bg-transparent hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-secondary border-0 px-2 py-1.5 rounded outline-none text-xs text-primary font-bold text-center disabled:opacity-30"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <select 
                        value={row.status}
                        onChange={(e) => handleGridCellChange(idx, 'status', e.target.value)}
                        className="w-full bg-transparent hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-secondary border-0 px-2 py-1.5 rounded outline-none text-xs font-bold"
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. CSV Import Section */}
      {activeTab === 'import' && (
        <div className="bg-white p-8 rounded-xl border shadow-sm flex flex-col gap-8 max-w-3xl">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-lg font-heading font-bold text-primary">Bulk Products CSV Uploader</h3>
            <button 
              onClick={downloadTemplate}
              className="btn bg-gray-100 hover:bg-gray-200 text-primary text-xs py-2 px-4 gap-2 flex items-center"
            >
              <Download size={14} /> Download Template
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
            <Upload size={36} className="text-gray-300" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Upload Products CSV File</span>
            <input 
              type="file" 
              accept=".csv"
              onChange={handleCsvUpload}
              className="hidden" 
              id="prodCsvFileInput" 
            />
            <label 
              htmlFor="prodCsvFileInput"
              className="btn btn-secondary py-2 px-6 text-xs font-bold cursor-pointer"
            >
              Browse Files
            </label>
            {csvFile && <span className="text-xs font-bold text-secondary mt-1">{csvFile.name}</span>}
          </div>

          {csvRows.length > 0 && (
            <div className="flex flex-col gap-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary border-b pb-2">CSV File Data Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-xs font-medium text-gray-500 bg-gray-50 p-4 rounded-lg">
                <span>Total Columns: {csvHeaders.length}</span>
                <span>Total Rows Detected: {csvRows.length}</span>
              </div>

              {importStatus && (
                <div className={`p-4 rounded-lg text-xs font-bold flex items-center gap-2 ${
                  importStatus.includes('Success') ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {importStatus.includes('Success') ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {importStatus}
                </div>
              )}

              {validationErrors.length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500 flex flex-col gap-2">
                  <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                    <AlertCircle size={16} /> Validation Errors ({validationErrors.length})
                  </span>
                  <div className="max-h-40 overflow-y-auto divide-y divide-red-100">
                    {validationErrors.map((err, idx) => (
                      <p key={idx} className="text-[11px] text-red-500 py-1">{err}</p>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={triggerCsvImport}
                disabled={loading}
                className="btn btn-primary py-4 text-xs font-bold w-full"
              >
                Trigger Safe Import
              </button>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 overflow-hidden max-h-[85vh] flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xl font-heading font-bold text-primary">{editingProduct ? 'Edit Product' : 'Create Product'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X size={20} /></button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto flex flex-col gap-6">
                
                {/* Product Name */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Product Name</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" placeholder="e.g. Luminosity Midi Dress" />
                  </div>
                  
                  {/* Category select */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
                    <select required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none">
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                {/* Sku & Slug */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Slug (URLsafe)</label>
                    <input type="text" required value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Sku Code</label>
                    <input type="text" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" placeholder="e.g. ZIM-LUM-001" />
                  </div>
                </div>

                {/* Price & Compare price */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Price (AUD)</label>
                    <input type="number" required step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Compare at RRP Price</label>
                    <input type="number" step="0.01" value={formData.compare_at_price} onChange={(e) => setFormData({...formData, compare_at_price: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Direct Stock quantity</label>
                    <input type="number" disabled={formData.is_external} value={formData.stock_qty} onChange={(e) => setFormData({...formData, stock_qty: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none disabled:opacity-30" />
                  </div>
                </div>

                {/* Direct Checkout Stripe Price ID */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Stripe Price API ID (Direct Checkout)</label>
                  <input type="text" disabled={formData.is_external} value={formData.stripe_price_id} onChange={(e) => setFormData({...formData, stripe_price_id: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none disabled:opacity-30" placeholder="price_1H..." />
                </div>

                {/* Mappings to Boutique & Sale */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Brand Owner</label>
                    <select value={formData.merchant_id} onChange={(e) => setFormData({...formData, merchant_id: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none">
                      <option value="">Select Brand</option>
                      {merchants.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Linked Sale Event</label>
                    <select value={formData.sale_id} onChange={(e) => setFormData({...formData, sale_id: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none">
                      <option value="">Select Sale</option>
                      {sales.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                  </div>
                </div>

                {/* External/Affiliate toggle */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.is_external} onChange={(e) => setFormData({...formData, is_external: e.target.checked})} className="accent-secondary h-4 w-4 rounded cursor-pointer" id="isExternalCheck" />
                    <label htmlFor="isExternalCheck" className="text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer select-none">Affiliate Product (External Link)</label>
                  </div>
                  
                  {formData.is_external && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Outbound Affiliate Link</label>
                      <input type="url" required value={formData.external_url || ''} onChange={(e) => setFormData({...formData, external_url: e.target.value})} className="w-full bg-white border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" placeholder="https://example.com/product" />
                    </div>
                  )}
                </div>

                {/* Teaser & Description */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Teaser Text</label>
                  <input type="text" value={formData.teaser_text} onChange={(e) => setFormData({...formData, teaser_text: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" placeholder="Short public teaser..." />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Product Description</label>
                  <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none resize-none" />
                </div>

                {/* Primary Image CDN URL */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Primary Image CDN URL</label>
                  <input type="url" required value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value, image_urls: [e.target.value]})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" placeholder="https://cdn.com/image.jpg" />
                </div>

                {/* Toggles */}
                <div className="flex items-center justify-between border-t pt-6">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({...formData, is_featured: e.target.checked})} className="accent-secondary h-4 w-4 rounded cursor-pointer" id="isFeaturedCheck" />
                    <label htmlFor="isFeaturedCheck" className="text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer select-none">Featured Item</label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Publish Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-lg text-xs font-bold">
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary w-full py-4 text-xs font-bold mt-4">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
