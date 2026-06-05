import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Edit, Trash2, X, Upload, Tag, Calendar, DollarSign, ListFilter, FileSpreadsheet, Eye, Save, AlertCircle, ArrowLeft, Download, CheckCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminSales = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'bulk-edit', 'import'
  const [sales, setSales] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Single Sale Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [formData, setFormData] = useState({
    merchant_id: '',
    title: '',
    slug: '',
    description: '',
    teaser_text: '',
    sale_url: '',
    discount_min_pct: '',
    discount_max_pct: '',
    price_range_min: '',
    price_range_max: '',
    sale_start_date: '',
    sale_end_date: '',
    category_ids: [],
    image_urls: [''],
    is_featured: false,
    status: 'active'
  });

  // Spreadsheet-style Bulk Edit Grid State
  const [gridData, setGridData] = useState([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // CSV Import State
  const [csvFile, setCsvFile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvRows, setCsvRows] = useState([]);
  const [fieldMapping, setFieldMapping] = useState({});
  const [validationErrors, setValidationErrors] = useState([]);
  const [importStatus, setImportStatus] = useState('');

  // Fetch all database records
  const fetchData = async () => {
    setLoading(true);
    // Fetch merchants
    const { data: merch } = await supabase.from('merchants').select('*');
    if (merch) setMerchants(merch);

    // Fetch categories
    const { data: cats } = await supabase.from('categories').select('*');
    if (cats) setCategories(cats);

    // Fetch all sales (raw secured table so admin sees all columns)
    const { data: salesList } = await supabase
      .from('sales_secure')
      .select('*')
      .order('created_at', { ascending: false });

    if (salesList) {
      setSales(salesList);
      setGridData(JSON.parse(JSON.stringify(salesList))); // Clone for grid
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (sale) => {
    setEditingSale(sale);
    setFormData({
      merchant_id: sale.merchant_id || '',
      title: sale.title || '',
      slug: sale.slug || '',
      description: sale.description || '',
      teaser_text: sale.teaser_text || '',
      sale_url: sale.sale_url || '',
      discount_min_pct: sale.discount_min_pct || '',
      discount_max_pct: sale.discount_max_pct || '',
      price_range_min: sale.price_range_min || '',
      price_range_max: sale.price_range_max || '',
      sale_start_date: sale.sale_start_date || '',
      sale_end_date: sale.sale_end_date || '',
      category_ids: sale.category_ids || [],
      image_urls: sale.image_urls || [''],
      is_featured: sale.is_featured || false,
      status: sale.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale event?')) {
      const { error } = await supabase.from('sales_secure').delete().eq('id', id);
      if (error) alert('Delete failed: ' + error.message);
      else fetchData();
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      merchant_id: Number(formData.merchant_id),
      discount_min_pct: formData.discount_min_pct ? Number(formData.discount_min_pct) : null,
      discount_max_pct: formData.discount_max_pct ? Number(formData.discount_max_pct) : null,
      price_range_min: formData.price_range_min ? Number(formData.price_range_min) : null,
      price_range_max: formData.price_range_max ? Number(formData.price_range_max) : null,
      category_ids: formData.category_ids.map(Number),
      image_urls: formData.image_urls.filter(Boolean),
      sale_end_date: formData.sale_end_date || null
    };

    let error;
    if (editingSale) {
      const { error: err } = await supabase.from('sales_secure').update(payload).eq('id', editingSale.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('sales_secure').insert([payload]);
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
      const original = sales.find(s => s.id === row.id);
      if (JSON.stringify(original) !== JSON.stringify(row)) {
        const { error } = await supabase
          .from('sales_secure')
          .update({
            title: row.title,
            teaser_text: row.teaser_text,
            discount_max_pct: row.discount_max_pct ? Number(row.discount_max_pct) : null,
            price_range_min: row.price_range_min ? Number(row.price_range_min) : null,
            price_range_max: row.price_range_max ? Number(row.price_range_max) : null,
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

  // CSV Import Parsing & Setup
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
        // Simple comma split (not robust for commas in quotes, but standard mock parser)
        return line.split(',').map(cell => cell.replace(/"/g, '').trim());
      });
      setCsvRows(rows);

      // Auto map matching headers
      const defaultMapping = {};
      const targetFields = ['merchant_id', 'title', 'slug', 'description', 'teaser_text', 'sale_url', 'discount_min_pct', 'discount_max_pct', 'price_range_min', 'price_range_max', 'sale_start_date', 'sale_end_date', 'is_featured', 'status'];
      
      targetFields.forEach(field => {
        const index = headers.findIndex(h => h.toLowerCase() === field.toLowerCase() || h.toLowerCase().replace(/_/g, '') === field.toLowerCase().replace(/_/g, ''));
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

      const title = getVal('title');
      const merchantId = Number(getVal('merchant_id'));
      const saleUrl = getVal('sale_url');
      const saleStartDate = getVal('sale_start_date');

      // Validation Checks
      if (!title) errors.push(`Row ${rowNum}: Title is required.`);
      if (isNaN(merchantId) || merchantId <= 0) errors.push(`Row ${rowNum}: Valid merchant_id is required.`);
      if (!saleUrl) errors.push(`Row ${rowNum}: Sale URL is required.`);
      if (!saleStartDate) errors.push(`Row ${rowNum}: Start Date is required.`);

      if (errors.length === 0) {
        payloadRows.push({
          merchant_id: merchantId,
          title: title,
          slug: getVal('slug') || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          description: getVal('description') || '',
          teaser_text: getVal('teaser_text') || '',
          sale_url: saleUrl,
          discount_min_pct: getVal('discount_min_pct') ? Number(getVal('discount_min_pct')) : null,
          discount_max_pct: getVal('discount_max_pct') ? Number(getVal('discount_max_pct')) : null,
          price_range_min: getVal('price_range_min') ? Number(getVal('price_range_min')) : null,
          price_range_max: getVal('price_range_max') ? Number(getVal('price_range_max')) : null,
          sale_start_date: saleStartDate,
          sale_end_date: getVal('sale_end_date') || null,
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
    const { error } = await supabase.from('sales_secure').insert(payloadRows);

    if (error) {
      setImportStatus('Error inserting rows: ' + error.message);
    } else {
      setImportStatus(`Successfully imported ${payloadRows.length} sales events!`);
      setCsvFile(null);
      setCsvRows([]);
      fetchData();
    }
    setLoading(false);
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "merchant_id,title,slug,description,teaser_text,sale_url,discount_min_pct,discount_max_pct,price_range_min,price_range_max,sale_start_date,sale_end_date,is_featured,status\n"
      + "1,Zimmermann Winter Event,zimmermann-winter-event,Premium dresses and silk jumpsuits on markdown,Up to 40% off Winter items,https://zimmermann.com/sale,10,40,200,600,2026-06-01,2026-06-15,true,active";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sales_bulk_import_template.csv");
    document.body.appendChild(link);
    link.click();
  };

  const filteredSales = sales.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Manage Fragrance Sales</h1>
          <p className="text-gray-500 text-sm">Directly manage, bulk upload, and spreadsheet-edit all luxury sale events.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setActiveTab('list'); setIsModalOpen(true); setEditingSale(null); }}
            className="btn btn-primary gap-2 py-3 px-6 text-xs"
          >
            <Plus size={16} /> Add Sale
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('list')}
          className={`px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'list' ? 'border-secondary text-secondary' : 'border-transparent text-gray-400 hover:text-primary'
          }`}
        >
          <Tag size={16} /> Active Listings
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

      {/* 1. Active Listings Grid */}
      {activeTab === 'list' && (
        <div className="flex flex-col gap-6">
          <div className="relative max-w-sm">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search listings..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-100 pl-12 pr-4 py-2.5 rounded-lg text-xs outline-none"
            />
          </div>

          <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b">
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Brand</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Status</th>
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
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400 italic text-sm">No sales events registered yet.</td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => {
                    const merchant = merchants.find(m => m.id === sale.merchant_id) || { name: 'Brand' };
                    return (
                      <tr key={sale.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-primary block text-sm">{sale.title}</span>
                          <span className="text-[10px] text-gray-400 tracking-wider uppercase block mt-0.5">{sale.slug}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-600 font-medium">{merchant.name}</td>
                        <td className="px-6 py-4 text-xs font-bold text-secondary">{sale.discount_min_pct ? `${sale.discount_min_pct}% - ` : ''}{sale.discount_max_pct}% OFF</td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {new Date(sale.sale_start_date).toLocaleDateString()}{sale.sale_end_date && ` - ${new Date(sale.sale_end_date).toLocaleDateString()}`}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                            sale.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {sale.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-1">
                          <button onClick={() => handleEdit(sale)} className="p-2 text-gray-400 hover:text-primary"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(sale.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    );
                  })
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
                  <th className="w-1/4 px-4 py-3">Title</th>
                  <th className="w-1/4 px-4 py-3">Teaser text</th>
                  <th className="w-1/12 px-4 py-3">Discount %</th>
                  <th className="w-1/10 px-4 py-3">Min Price</th>
                  <th className="w-1/10 px-4 py-3">Max Price</th>
                  <th className="w-1/10 px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {gridData.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50/50">
                    <td className="px-2 py-1">
                      <input 
                        type="text" 
                        value={row.title} 
                        onChange={(e) => handleGridCellChange(idx, 'title', e.target.value)}
                        className="w-full bg-transparent hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-secondary border-0 px-2 py-1.5 rounded outline-none text-xs text-primary font-bold"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input 
                        type="text" 
                        value={row.teaser_text || ''} 
                        onChange={(e) => handleGridCellChange(idx, 'teaser_text', e.target.value)}
                        className="w-full bg-transparent hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-secondary border-0 px-2 py-1.5 rounded outline-none text-xs text-gray-600"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input 
                        type="number" 
                        value={row.discount_max_pct || ''} 
                        onChange={(e) => handleGridCellChange(idx, 'discount_max_pct', e.target.value)}
                        className="w-full bg-transparent hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-secondary border-0 px-2 py-1.5 rounded outline-none text-xs text-secondary font-bold text-center"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input 
                        type="number" 
                        value={row.price_range_min || ''} 
                        onChange={(e) => handleGridCellChange(idx, 'price_range_min', e.target.value)}
                        className="w-full bg-transparent hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-secondary border-0 px-2 py-1.5 rounded outline-none text-xs text-primary font-bold text-center"
                      />
                    </td>
                    <td className="px-2 py-1">
                      <input 
                        type="number" 
                        value={row.price_range_max || ''} 
                        onChange={(e) => handleGridCellChange(idx, 'price_range_max', e.target.value)}
                        className="w-full bg-transparent hover:bg-gray-100 focus:bg-white focus:ring-1 focus:ring-secondary border-0 px-2 py-1.5 rounded outline-none text-xs text-primary font-bold text-center"
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
                        <option value="expired">Expired</option>
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
            <h3 className="text-lg font-heading font-bold text-primary">Bulk Sales CSV Uploader</h3>
            <button 
              onClick={downloadTemplate}
              className="btn bg-gray-100 hover:bg-gray-200 text-primary text-xs py-2 px-4 gap-2 flex items-center"
            >
              <Download size={14} /> Download Template
            </button>
          </div>

          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
            <Upload size={36} className="text-gray-300" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Upload Sales CSV File</span>
            <input 
              type="file" 
              accept=".csv"
              onChange={handleCsvUpload}
              className="hidden" 
              id="csvFileInput" 
            />
            <label 
              htmlFor="csvFileInput"
              className="btn btn-secondary py-2 px-6 text-xs font-bold cursor-pointer"
            >
              Browse Files
            </label>
            {csvFile && <span className="text-xs font-bold text-secondary mt-1">{csvFile.name}</span>}
          </div>

          {/* Mapping & Summary */}
          {csvRows.length > 0 && (
            <div className="flex flex-col gap-6">
              <h4 className="text-xs font-bold uppercase tracking-widest text-primary border-b pb-2">CSV File Data Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-xs font-medium text-gray-500 bg-gray-50 p-4 rounded-lg">
                <span>Total Columns: {csvHeaders.length}</span>
                <span>Total Rows Detected: {csvRows.length}</span>
              </div>

              {/* Import status */}
              {importStatus && (
                <div className={`p-4 rounded-lg text-xs font-bold flex items-center gap-2 ${
                  importStatus.includes('Success') ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {importStatus.includes('Success') ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {importStatus}
                </div>
              )}

              {/* Validation errors */}
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
                <h3 className="text-xl font-heading font-bold text-primary">{editingSale ? 'Edit Sale Event' : 'Create Sale Event'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all"><X size={20} /></button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto flex flex-col gap-6">
                
                {/* Brand Selection */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Perfume Brand</label>
                    <select required value={formData.merchant_id} onChange={(e) => setFormData({...formData, merchant_id: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none">
                      <option value="">Select Brand</option>
                      {merchants.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  
                  {/* Title */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Event Title</label>
                    <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" placeholder="e.g. Zimmermann Winter Sale" />
                  </div>
                </div>

                {/* Slug */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Slug (URLsafe)</label>
                  <input type="text" required value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" />
                </div>

                {/* Gated Link */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Outbound Merchant Link (Gated)</label>
                  <input type="url" required value={formData.sale_url} onChange={(e) => setFormData({...formData, sale_url: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" placeholder="https://example.com/sale" />
                </div>

                {/* Discout & Price Ranges */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Min Discount %</label>
                    <input type="number" value={formData.discount_min_pct} onChange={(e) => setFormData({...formData, discount_min_pct: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Max Discount %</label>
                    <input type="number" value={formData.discount_max_pct} onChange={(e) => setFormData({...formData, discount_max_pct: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Min Price range</label>
                    <input type="number" value={formData.price_range_min} onChange={(e) => setFormData({...formData, price_range_min: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Max Price range</label>
                    <input type="number" value={formData.price_range_max} onChange={(e) => setFormData({...formData, price_range_max: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Start Date</label>
                    <input type="date" required value={formData.sale_start_date} onChange={(e) => setFormData({...formData, sale_start_date: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">End Date (Ongoing = Blank)</label>
                    <input type="date" value={formData.sale_end_date} onChange={(e) => setFormData({...formData, sale_end_date: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" />
                  </div>
                </div>

                {/* Teaser & Description */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Teaser Text</label>
                  <input type="text" value={formData.teaser_text} onChange={(e) => setFormData({...formData, teaser_text: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" placeholder="Short line shown publicly to guest browse grids..." />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Description (Gated)</label>
                  <textarea rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none resize-none" placeholder="Full rich details about sales, perfumes, sizes..." />
                </div>

                {/* Category Selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categories</label>
                  <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    {categories.map(c => {
                      const active = formData.category_ids.includes(c.id);
                      return (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => {
                            const updated = active 
                              ? formData.category_ids.filter(id => id !== c.id)
                              : [...formData.category_ids, c.id];
                            setFormData({...formData, category_ids: updated});
                          }}
                          className={`text-xs font-bold py-2 px-4 rounded-full border transition-all ${
                            active ? 'bg-secondary text-white border-secondary' : 'bg-white text-gray-500 border-gray-100'
                          }`}
                        >
                          {c.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Image CDN Link */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Primary Image CDN URL</label>
                  <input type="url" value={formData.image_urls[0]} onChange={(e) => setFormData({...formData, image_urls: [e.target.value]})} className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-lg text-sm outline-none" placeholder="https://cdn.example.com/image.jpg" />
                </div>

                {/* Toggles */}
                <div className="flex items-center justify-between border-t pt-6">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData({...formData, is_featured: e.target.checked})} className="accent-secondary h-4 w-4 rounded cursor-pointer" id="isFeaturedCheck" />
                    <label htmlFor="isFeaturedCheck" className="text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer select-none">Feature on Homepage</label>
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
                  {editingSale ? 'Update Sale event' : 'Publish Sale event'}
                </button>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSales;
