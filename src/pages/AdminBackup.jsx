import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, 
  Download, 
  RotateCcw, 
  Trash2, 
  ShieldCheck, 
  Cloud, 
  HardDrive,
  Clock,
  Plus,
  Settings,
  CheckCircle2,
  X,
  Save,
  Server,
  Upload,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminBackup = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBackups = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('backups')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setBackups(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    try {
      const tables = ['products', 'categories', 'profiles', 'orders', 'order_items', 'site_settings'];
      const backupData = {};

      for (const table of tables) {
        const { data } = await supabase.from(table).select('*');
        backupData[table] = data || [];
      }

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const filename = `al-moavia fragrance-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      
      // 1. Download to user
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 2. Upload to Supabase Storage (if bucket exists)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('backups')
        .upload(filename, blob);

      // 3. Save to history with storage path
      await supabase.from('backups').insert([{
        filename: filename,
        size: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
        status: 'Success',
        storage_path: uploadData?.path || null
      }]);

      fetchBackups();
    } catch (err) {
      console.error('Backup failed:', err);
      alert('Backup failed. Ensure you have created a "backups" bucket in Supabase Storage.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const processRestore = async (jsonData) => {
    setIsRestoring(true);
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      for (const [table, rows] of Object.entries(data)) {
        if (rows.length > 0) {
          const { error } = await supabase.from(table).upsert(rows);
          if (error) throw error;
        }
      }
      alert('System successfully restored to backup state!');
      fetchBackups();
    } catch (err) {
      console.error('Restore failed:', err);
      alert('Restore failed: ' + err.message);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleFileUploadRestore = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!window.confirm('Overwrite current data with this backup file?')) return;

    const reader = new FileReader();
    reader.onload = (e) => processRestore(e.target.result);
    reader.readAsText(file);
  };

  const handleRowRestore = async (backup) => {
    if (!backup.storage_path) {
      alert('This backup record does not have a linked cloud file. Please use the manual upload option.');
      return;
    }

    if (!window.confirm(`Restore system to state: ${backup.filename}?`)) return;

    setIsRestoring(true);
    try {
      const { data, error } = await supabase.storage
        .from('backups')
        .download(backup.storage_path);
      
      if (error) throw error;
      const text = await data.text();
      await processRestore(text);
    } catch (err) {
      console.error('Cloud restore failed:', err);
      alert('Cloud restore failed: ' + err.message);
      setIsRestoring(false);
    }
  };

  const handleDownload = async (backup) => {
    if (!backup.storage_path) return;
    const { data } = await supabase.storage.from('backups').download(backup.storage_path);
    if (data) {
      const url = URL.createObjectURL(data);
      const link = document.body.appendChild(document.createElement('a'));
      link.href = url;
      link.download = backup.filename;
      link.click();
      link.remove();
    }
  };

  const handleDelete = async (id, path) => {
    if (window.confirm('Delete this backup record and cloud file?')) {
      if (path) await supabase.storage.from('backups').remove([path]);
      await supabase.from('backups').delete().eq('id', id);
      fetchBackups();
    }
  };

  return (
    <div className="flex flex-col gap-8 relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">System Backups</h1>
          <p className="text-gray-500 text-sm">Secure your platform database and configuration files.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="btn border border-gray-200 text-primary hover:bg-gray-50 px-6 py-2.5 text-xs font-bold gap-2 cursor-pointer transition-all">
            <Upload size={16} />
            {isRestoring ? 'Restoring...' : 'Upload & Restore'}
            <input type="file" accept=".json" onChange={handleFileUploadRestore} className="hidden" disabled={isRestoring} />
          </label>
          <button 
            onClick={handleCreateBackup}
            disabled={isBackingUp}
            className="btn btn-primary gap-2 py-3 px-8 shadow-lg shadow-primary/10"
          >
            {isBackingUp ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {isBackingUp ? 'Generating...' : 'Create Full Backup'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-500">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-primary">System Integrity</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Database Live</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 border-t border-gray-50 pt-6">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-widest">Last Backup</span>
                <span className="text-primary font-bold">{backups.length > 0 ? new Date(backups[0].created_at).toLocaleDateString() : 'Never'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-widest">Saved Snapshots</span>
                <span className="text-primary font-bold">{backups.length} Files</span>
              </div>
            </div>
          </div>
        </div>

        {/* Backup History Table */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-primary">Backup History</h3>
              <button onClick={() => setShowSettings(true)} className="p-2 text-gray-400 hover:text-primary transition-colors bg-gray-50 rounded-lg"><Settings size={18} /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <th className="px-6 py-4">File Archive</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan="3" className="px-6 py-10 text-center"><Loader2 className="animate-spin mx-auto text-secondary" /></td></tr>
                  ) : backups.length > 0 ? backups.map((backup, idx) => (
                    <motion.tr key={backup.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-primary truncate max-w-[200px]">{backup.filename}</span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{new Date(backup.created_at).toLocaleString()} • {backup.size}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500" /><span className="text-[10px] font-bold uppercase tracking-widest text-green-600">{backup.status}</span></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleDownload(backup)} className="p-2 text-gray-400 hover:text-primary transition-colors" title="Download"><Download size={18} /></button>
                          <button onClick={() => handleRowRestore(backup)} className="p-2 text-gray-400 hover:text-secondary transition-colors" title="Restore this snapshot"><RotateCcw size={18} /></button>
                          <button onClick={() => handleDelete(backup.id, backup.storage_path)} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Delete record and cloud file"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  )) : (
                    <tr><td colSpan="3" className="px-6 py-20 text-center text-gray-400 italic">No backups found yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isRestoring && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/90 backdrop-blur-md">
            <div className="flex flex-col items-center gap-6 text-white">
              <Loader2 size={60} className="animate-spin text-secondary" />
              <div className="text-center"><h2 className="text-2xl font-bold font-heading">Restoring Platform Data</h2><p className="text-gray-400 mt-2">Synchronizing database tables, please do not close this window...</p></div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBackup;
