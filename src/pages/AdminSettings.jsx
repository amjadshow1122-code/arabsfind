import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Globe, 
  Lock, 
  Bell, 
  Palette, 
  ShieldCheck, 
  Mail, 
  CreditCard,
  User,
  ChevronRight,
  Monitor,
  Smartphone,
  Check,
  Save,
  Loader2,
  ShieldAlert,
  ShieldHalf,
  MailWarning,
  Eye,
  EyeOff,
  Link2,
  Package,
  MessageSquare,
  ShoppingBag,
  Layout,
  Plus,
  Trash2,
  Upload,
  Link,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { optimizeImage } from '../lib/imageOptimization';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('General Information');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [settings, setSettings] = useState({
    store_name: '',
    support_email: '',
    currency: 'USD',
    maintenance_mode: false,
    allow_registration: true,
    two_factor_auth: false,
    login_activity_alerts: true,
    email_new_orders: true,
    email_low_stock: true,
    email_customer_messages: true,
    primary_color: '#001236',
    secondary_color: '#775a19',
    stripe_connected: false,
    paypal_connected: false,
    stripe_publishable_key: '',
    stripe_secret_key: '',
    paypal_client_id: '',
    paypal_secret: '',
    header_config: {
      logo: '',
      top_bar: 'Free Express Shipping on orders over $500',
      nav_links: [
        { label: 'Shop', url: '/shop' },
        { label: 'Heritage', url: '/heritage' },
        { label: 'Collections', url: '/collections' }
      ]
    },
    footer_config: {
      logo: '',
      copyright: '© 2026 Arab Finds. All Rights Reserved.',
      description: 'Curating the finest Arabian heritage and luxury craftsmanship.',
      social_links: { instagram: '', facebook: '', twitter: '' },
      columns: [
        { title: 'Shop', links: [{ label: 'All Products', url: '/shop' }] },
        { title: 'Support', links: [{ label: 'Contact Us', url: '/contact' }] }
      ]
    }
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (data) {
        setSettings({
          ...settings,
          ...data,
          header_config: {
            ...settings.header_config,
            ...(data.header_config || {}),
            nav_links: data.header_config?.nav_links || settings.header_config.nav_links
          },
          footer_config: {
            ...settings.footer_config,
            ...(data.footer_config || {}),
            columns: data.footer_config?.columns || settings.footer_config.columns,
            social_links: data.footer_config?.social_links || settings.footer_config.social_links
          }
        });
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from('site_settings')
      .update(settings)
      .eq('id', 1);

    if (error) {
      alert('Error saving settings: ' + error.message);
    } else {
      alert('Appearance and system preferences synchronized!');
    }
    setIsSaving(false);
  };

  const handleLogoUpload = async (e, target = 'header') => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const optimizedFile = await optimizeImage(file, 0.9);
      const fileName = `logo-${target}-${Date.now()}.webp`;
      const filePath = `site/${fileName}`;

      const { data, error } = await supabase.storage
        .from('backups')
        .upload(filePath, optimizedFile);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('backups')
        .getPublicUrl(filePath);

      if (target === 'header') {
        setSettings({
          ...settings,
          header_config: { ...settings.header_config, logo: publicUrl }
        });
      } else {
        setSettings({
          ...settings,
          footer_config: { ...settings.footer_config, logo: publicUrl }
        });
      }
    } catch (err) {
      alert('Logo upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const addNavLink = () => {
    const currentLinks = settings.header_config?.nav_links || [];
    setSettings({
      ...settings,
      header_config: {
        ...settings.header_config,
        nav_links: [...currentLinks, { label: 'New Link', url: '/' }]
      }
    });
  };

  const updateNavLink = (index, field, value) => {
    const newLinks = [...(settings.header_config?.nav_links || [])];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setSettings({
      ...settings,
      header_config: { ...settings.header_config, nav_links: newLinks }
    });
  };

  const removeNavLink = (index) => {
    const newLinks = (settings.header_config?.nav_links || []).filter((_, i) => i !== index);
    setSettings({
      ...settings,
      header_config: { ...settings.header_config, nav_links: newLinks }
    });
  };

  const addFooterColumn = () => {
    const currentCols = settings.footer_config?.columns || [];
    setSettings({
      ...settings,
      footer_config: {
        ...settings.footer_config,
        columns: [...currentCols, { title: 'New Column', links: [] }]
      }
    });
  };

  const addFooterLink = (colIdx) => {
    const newCols = [...(settings.footer_config?.columns || [])];
    if (!newCols[colIdx].links) newCols[colIdx].links = [];
    newCols[colIdx].links = [...newCols[colIdx].links, { label: 'New Link', url: '/' }];
    setSettings({
      ...settings,
      footer_config: { ...settings.footer_config, columns: newCols }
    });
  };

  const updateFooterLink = (colIdx, linkIdx, field, value) => {
    const newCols = [...(settings.footer_config?.columns || [])];
    newCols[colIdx].links[linkIdx] = { ...newCols[colIdx].links[linkIdx], [field]: value };
    setSettings({
      ...settings,
      footer_config: { ...settings.footer_config, columns: newCols }
    });
  };

  const removeFooterColumn = (idx) => {
    const newCols = (settings.footer_config?.columns || []).filter((_, i) => i !== idx);
    setSettings({
      ...settings,
      footer_config: { ...settings.footer_config, columns: newCols }
    });
  };

  const tabs = [
    { name: 'General Information', icon: Globe },
    { name: 'Header & Footer', icon: Layout },
    { name: 'Security & Access', icon: Lock },
    { name: 'Notifications', icon: Bell },
    { name: 'Store Branding', icon: Palette },
    { name: 'Payment Gateways', icon: CreditCard },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-secondary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">System Settings</h1>
          <p className="text-gray-500 text-sm">Configure your administrative environment and platform preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="btn btn-primary px-8 py-2.5 gap-2"
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {isSaving ? 'Syncing...' : 'Save All Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-3">
          {tabs.map((tab) => (
            <button 
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all text-sm font-bold ${
                activeTab === tab.name 
                  ? 'bg-white border-secondary text-secondary shadow-sm' 
                  : 'bg-transparent border-transparent text-gray-500 hover:bg-white hover:border-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon size={18} />
                {tab.name}
              </div>
              <ChevronRight size={14} className={activeTab === tab.name ? 'opacity-100' : 'opacity-0'} />
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {activeTab === 'Header & Footer' && (
              <motion.div key="header-footer" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8 pb-20">
                {/* Header Configuration */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                    <Layout size={20} className="text-secondary" />
                    <h3 className="font-heading font-bold text-lg text-primary">Header Configuration</h3>
                  </div>
                  <div className="p-8 flex flex-col gap-8">
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Header Logo</label>
                      <div className="flex items-center gap-6">
                        <div className="w-32 h-16 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                          {settings.header_config?.logo ? (
                            <img src={settings.header_config.logo} alt="Header Logo" className="max-w-full max-h-full object-contain" />
                          ) : (
                            <ImageIcon className="text-gray-200" size={24} />
                          )}
                        </div>
                        <label className="btn border border-secondary text-secondary hover:bg-secondary/5 px-4 py-2 text-xs font-bold gap-2 cursor-pointer">
                          <Upload size={14} /> Upload Header Logo
                          <input type="file" className="hidden" onChange={(e) => handleLogoUpload(e, 'header')} />
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Top Bar Announcement</label>
                      <input 
                        type="text" 
                        value={settings.header_config?.top_bar || ''} 
                        onChange={(e) => setSettings({...settings, header_config: {...settings.header_config, top_bar: e.target.value}})} 
                        className="bg-gray-50 border border-transparent focus:bg-white focus:border-secondary px-4 py-3 rounded-lg text-sm outline-none transition-all" 
                      />
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Main Menu Links</label>
                        <button onClick={addNavLink} className="text-[10px] font-bold text-secondary uppercase tracking-widest hover:underline flex items-center gap-1"><Plus size={12}/> Add Link</button>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {(settings.header_config?.nav_links || []).map((link, idx) => (
                          <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl">
                            <input type="text" value={link.label} onChange={(e) => updateNavLink(idx, 'label', e.target.value)} placeholder="Label" className="flex-grow bg-white border border-transparent px-3 py-1.5 rounded-lg text-xs" />
                            <input type="text" value={link.url} onChange={(e) => updateNavLink(idx, 'url', e.target.value)} placeholder="URL" className="flex-grow bg-white border border-transparent px-3 py-1.5 rounded-lg text-xs" />
                            <button onClick={() => removeNavLink(idx)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14}/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Configuration */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                    <Layout size={20} className="text-secondary" />
                    <h3 className="font-heading font-bold text-lg text-primary">Footer Configuration</h3>
                  </div>
                  <div className="p-8 flex flex-col gap-8">
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Footer Logo (Optional)</label>
                      <div className="flex items-center gap-6">
                        <div className="w-32 h-16 bg-gray-50 rounded-lg border border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                          {settings.footer_config?.logo ? (
                            <img src={settings.footer_config.logo} alt="Footer Logo" className="max-w-full max-h-full object-contain" />
                          ) : (
                            <ImageIcon className="text-gray-200" size={24} />
                          )}
                        </div>
                        <label className="btn border border-secondary text-secondary hover:bg-secondary/5 px-4 py-2 text-xs font-bold gap-2 cursor-pointer">
                          <Upload size={14} /> Upload Footer Logo
                          <input type="file" className="hidden" onChange={(e) => handleLogoUpload(e, 'footer')} />
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Store Description (Footer)</label>
                      <textarea rows="3" value={settings.footer_config?.description || ''} onChange={(e) => setSettings({...settings, footer_config: {...settings.footer_config, description: e.target.value}})} className="bg-gray-50 border border-transparent focus:bg-white focus:border-secondary px-4 py-3 rounded-lg text-sm outline-none transition-all resize-none" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="flex flex-col gap-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2"><Link size={12}/> Instagram</label>
                         <input type="text" value={settings.footer_config?.social_links?.instagram || ''} onChange={(e) => setSettings({...settings, footer_config: {...settings.footer_config, social_links: {...settings.footer_config?.social_links, instagram: e.target.value}}})} className="bg-gray-50 border border-transparent px-4 py-2 rounded-lg text-xs" />
                       </div>
                       <div className="flex flex-col gap-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2"><Link size={12}/> Facebook</label>
                         <input type="text" value={settings.footer_config?.social_links?.facebook || ''} onChange={(e) => setSettings({...settings, footer_config: {...settings.footer_config, social_links: {...settings.footer_config?.social_links, facebook: e.target.value}}})} className="bg-gray-50 border border-transparent px-4 py-2 rounded-lg text-xs" />
                       </div>
                    </div>

                    <div className="flex flex-col gap-4 pt-4 border-t border-gray-50">
                       <div className="flex items-center justify-between">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Footer Navigation Columns</label>
                         <button onClick={addFooterColumn} className="text-[10px] font-bold text-secondary uppercase tracking-widest hover:underline flex items-center gap-1"><Plus size={12}/> Add Column</button>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {(settings.footer_config?.columns || []).map((col, colIdx) => (
                            <div key={colIdx} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4 relative group">
                               <button onClick={() => removeFooterColumn(colIdx)} className="absolute top-4 right-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                               <div className="flex flex-col gap-2">
                                  <label className="text-[10px] font-bold text-primary uppercase tracking-widest">Column Title</label>
                                  <input type="text" value={col.title} onChange={(e) => {
                                    const newCols = [...settings.footer_config.columns];
                                    newCols[colIdx].title = e.target.value;
                                    setSettings({...settings, footer_config: {...settings.footer_config, columns: newCols}});
                                  }} className="bg-white border border-transparent focus:border-secondary px-3 py-2 rounded-lg text-xs font-bold" />
                               </div>
                               <div className="flex flex-col gap-2">
                                  <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-bold text-gray-400">Links</label>
                                    <button onClick={() => addFooterLink(colIdx)} className="text-[10px] font-bold text-secondary uppercase tracking-widest"><Plus size={10}/> Add</button>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                     {(col.links || []).map((link, linkIdx) => (
                                       <div key={linkIdx} className="flex items-center gap-2">
                                          <input type="text" value={link.label} onChange={(e) => updateFooterLink(colIdx, linkIdx, 'label', e.target.value)} placeholder="Label" className="w-1/2 bg-white border border-transparent px-2 py-1 rounded text-[10px]" />
                                          <input type="text" value={link.url} onChange={(e) => updateFooterLink(colIdx, linkIdx, 'url', e.target.value)} placeholder="URL" className="w-1/2 bg-white border border-transparent px-2 py-1 rounded text-[10px]" />
                                          <button onClick={() => {
                                            const newCols = [...settings.footer_config.columns];
                                            newCols[colIdx].links = newCols[colIdx].links.filter((_, i) => i !== linkIdx);
                                            setSettings({...settings, footer_config: {...settings.footer_config, columns: newCols}});
                                          }} className="text-red-300 hover:text-red-500"><X size={12}/></button>
                                       </div>
                                     ))}
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-4 border-t border-gray-50">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Copyright Text</label>
                      <input type="text" value={settings.footer_config?.copyright || ''} onChange={(e) => setSettings({...settings, footer_config: {...settings.footer_config, copyright: e.target.value}})} className="bg-gray-50 border border-transparent focus:bg-white focus:border-secondary px-4 py-3 rounded-lg text-sm outline-none transition-all" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'General Information' && (
              <motion.div key="general" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                    <Globe size={20} className="text-secondary" />
                    <h3 className="font-heading font-bold text-lg text-primary">General Configuration</h3>
                  </div>
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Store Name</label>
                      <input type="text" value={settings.store_name} onChange={(e) => setSettings({...settings, store_name: e.target.value})} className="bg-gray-50 border border-transparent focus:bg-white focus:border-secondary px-4 py-3 rounded-lg text-sm outline-none transition-all" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Support Email</label>
                      <input type="email" value={settings.support_email} onChange={(e) => setSettings({...settings, support_email: e.target.value})} className="bg-gray-50 border border-transparent focus:bg-white focus:border-secondary px-4 py-3 rounded-lg text-sm outline-none transition-all" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {isUploading && (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-4">
             <Loader2 className="animate-spin text-secondary" />
             <span className="font-bold text-primary">Uploading your brand asset...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
