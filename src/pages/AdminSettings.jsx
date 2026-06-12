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
  ChevronUp,
  ChevronDown,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { optimizeImage } from '../lib/imageOptimization';

import GeneralTab from '../components/AdminSettingsTabs/GeneralTab';
import HeaderFooterTab from '../components/AdminSettingsTabs/HeaderFooterTab';
import SecurityTab from '../components/AdminSettingsTabs/SecurityTab';
import NotificationsTab from '../components/AdminSettingsTabs/NotificationsTab';
import BrandingTab from '../components/AdminSettingsTabs/BrandingTab';
import PaymentTab from '../components/AdminSettingsTabs/PaymentTab';
import OrderSettingsTab from '../components/AdminSettingsTabs/OrderSettingsTab';

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
    primary_color: '#D4A373',
    secondary_color: '#775a19',
    stripe_connected: false,
    paypal_connected: false,
    stripe_publishable_key: '',
    stripe_secret_key: '',
    paypal_client_id: '',
    paypal_secret: '',
    header_config: {
      logo: '',
      top_bar: '',
      nav_links: []
    },
    footer_config: {
      logo: '',
      copyright: '',
      description: '',
      social_links: { instagram: '', facebook: '', twitter: '' },
      contact_info: {
        address: '',
        phone: '',
        email: ''
      },
      columns: [],
      whatsapp_order: {
        enabled: true,
        number: '+923175587278'
      },
      whatsapp_widget: {
        enabled: true,
        number: '+923175587278'
      }
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
            social_links: data.footer_config?.social_links || settings.footer_config.social_links,
            contact_info: data.footer_config?.contact_info || settings.footer_config.contact_info,
            whatsapp_order: data.footer_config?.whatsapp_order || settings.footer_config.whatsapp_order,
            whatsapp_widget: data.footer_config?.whatsapp_widget || settings.footer_config.whatsapp_widget
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
  const tabs = [
    { name: 'General Information', icon: Globe },
    { name: 'Order Settings', icon: ShoppingBag },
    { name: 'Header & Footer', icon: Layout },
    { name: 'Security & Access', icon: Lock },
    { name: 'Notifications', icon: Bell },
    { name: 'Store Branding', icon: Palette },
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
            {activeTab === 'General Information' && <GeneralTab settings={settings} setSettings={setSettings} />}
            {activeTab === 'Order Settings' && <OrderSettingsTab settings={settings} setSettings={setSettings} />}
            {activeTab === 'Header & Footer' && <HeaderFooterTab settings={settings} setSettings={setSettings} handleLogoUpload={handleLogoUpload} />}
            {activeTab === 'Security & Access' && <SecurityTab settings={settings} setSettings={setSettings} />}
            {activeTab === 'Notifications' && <NotificationsTab settings={settings} setSettings={setSettings} />}
            {activeTab === 'Store Branding' && <BrandingTab settings={settings} setSettings={setSettings} />}
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
