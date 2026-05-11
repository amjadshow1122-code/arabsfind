import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon, 
  Search, 
  Grid, 
  List, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Upload, 
  Loader2,
  X,
  FileText,
  Filter,
  Check,
  HardDrive
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { optimizeImage } from '../lib/imageOptimization';

const AdminMedia = () => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [copySuccess, setCopySuccess] = useState(null);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      // Fetch from 'backups' bucket (our default for now)
      const { data, error } = await supabase.storage.from('backups').list('', {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'desc' }
      });

      if (error) throw error;
      
      // Also check subfolders like 'hero'
      const { data: heroData } = await supabase.storage.from('backups').list('hero');
      
      const allFiles = [
        ...(data || []).filter(f => f.id).map(f => ({ ...f, path: f.name })),
        ...(heroData || []).filter(f => f.id).map(f => ({ ...f, path: `hero/${f.name}` }))
      ];

      setMedia(allFiles);
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Optimize image to WebP before upload
      const optimizedFile = file.type.startsWith('image/') 
        ? await optimizeImage(file, 0.8) 
        : file;

      const fileName = `${Date.now()}-${file.name.replace(/\.[^/.]+$/, "")}.webp`;
      const { error } = await supabase.storage.from('backups').upload(fileName, optimizedFile);
      if (error) throw error;
      fetchMedia();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (path) => {
    if (window.confirm('Delete this file forever?')) {
      await supabase.storage.from('backups').remove([path]);
      fetchMedia();
      setSelectedFile(null);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    setCopySuccess(url);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const getPublicUrl = (path) => {
    const { data } = supabase.storage.from('backups').getPublicUrl(path);
    return data.publicUrl;
  };

  const filteredMedia = media.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Media Library</h1>
          <p className="text-gray-500 text-sm">Manage all heritage assets and platform imagery.</p>
        </div>
        <label className="btn btn-primary px-8 py-2.5 gap-2 cursor-pointer shadow-lg shadow-primary/10 transition-all hover:scale-105 active:scale-95">
          {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          {isUploading ? 'Vaulting...' : 'Upload Asset'}
          <input type="file" className="hidden" onChange={handleUpload} disabled={isUploading} />
        </label>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search filenames..." 
            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-secondary pl-12 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white text-secondary shadow-sm' : 'text-gray-400 hover:text-primary'}`}
          >
            <Grid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-secondary shadow-sm' : 'text-gray-400 hover:text-primary'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Media Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-secondary animate-spin" />
        </div>
      ) : filteredMedia.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredMedia.map((file) => (
              <motion.div 
                key={file.id}
                layoutId={file.id}
                onClick={() => setSelectedFile(file)}
                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100 cursor-pointer hover:border-secondary transition-all"
              >
                <img src={getPublicUrl(file.path)} alt={file.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <ExternalLink size={20} className="text-white" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <th className="px-6 py-4">Asset</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredMedia.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedFile(file)}>
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                        <img src={getPublicUrl(file.path)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-sm font-bold text-primary truncate max-w-[200px]">{file.name}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">{(file.metadata.size / 1024).toFixed(1)} KB</td>
                    <td className="px-6 py-4 text-xs text-gray-500 uppercase tracking-widest">{file.metadata.mimetype.split('/')[1]}</td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <button onClick={(e) => { e.stopPropagation(); copyToClipboard(getPublicUrl(file.path)); }} className="p-2 text-gray-400 hover:text-secondary" title="Copy URL">
                           {copySuccess === getPublicUrl(file.path) ? <Check size={16} /> : <Copy size={16} />}
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); handleDelete(file.path); }} className="p-2 text-gray-400 hover:text-red-500" title="Delete Asset">
                           <Trash2 size={16} />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="bg-white p-20 rounded-2xl border border-dashed border-gray-200 text-center flex flex-col items-center gap-4">
          <ImageIcon size={40} className="text-gray-200" />
          <p className="text-gray-400 italic">No media assets found in the vault.</p>
        </div>
      )}

      {/* Asset Preview Modal */}
      <AnimatePresence>
        {selectedFile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedFile(null)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col md:flex-row h-[80vh]"
            >
              <div className="flex-grow bg-gray-100 flex items-center justify-center p-8 overflow-hidden">
                <img src={getPublicUrl(selectedFile.path)} alt="" className="max-w-full max-h-full object-contain shadow-xl rounded-lg" />
              </div>
              <div className="w-full md:w-80 p-8 flex flex-col gap-6 border-l border-gray-100 bg-white overflow-y-auto">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-lg text-primary">Asset Details</h3>
                  <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-gray-50 rounded-full"><X size={20} /></button>
                </div>
                <div className="flex flex-col gap-4">
                   <div className="flex flex-col gap-1">
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filename</label>
                     <p className="text-sm font-bold text-primary break-all">{selectedFile.name}</p>
                   </div>
                   <div className="flex flex-col gap-1">
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Public URL</label>
                     <div className="flex items-center gap-2 mt-1">
                        <input readOnly value={getPublicUrl(selectedFile.path)} className="flex-grow bg-gray-50 border-none p-2 text-[10px] rounded" />
                        <button onClick={() => copyToClipboard(getPublicUrl(selectedFile.path))} className="p-2 bg-secondary text-white rounded hover:bg-secondary/90 transition-colors">
                          {copySuccess === getPublicUrl(selectedFile.path) ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                     </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4 mt-2">
                     <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</label>
                        <p className="text-xs font-bold text-primary uppercase">{selectedFile.metadata.mimetype.split('/')[1]}</p>
                     </div>
                     <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Size</label>
                        <p className="text-xs font-bold text-primary">{(selectedFile.metadata.size / 1024).toFixed(1)} KB</p>
                     </div>
                   </div>
                </div>
                <div className="mt-auto flex flex-col gap-3">
                   <a href={getPublicUrl(selectedFile.path)} target="_blank" className="btn border border-gray-200 text-primary w-full py-2.5 text-xs font-bold gap-2">
                     <ExternalLink size={14} /> View Original
                   </a>
                   <button onClick={() => handleDelete(selectedFile.path)} className="btn bg-red-50 text-red-600 hover:bg-red-100 border-none w-full py-2.5 text-xs font-bold gap-2">
                     <Trash2 size={14} /> Delete Forever
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Plus = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;

export default AdminMedia;
