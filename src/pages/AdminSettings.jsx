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
  ShoppingBag
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('General Information');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
    paypal_secret: ''
  });

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (data) {
      setSettings(data);
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
      alert('System preferences synchronized successfully!');
    }
    setIsSaving(false);
  };

  const tabs = [
    { name: 'General Information', icon: Globe },
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
        {/* Navigation Sidebar */}
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

        {/* Settings Form Content */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
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
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Store Currency</label>
                      <select value={settings.currency} onChange={(e) => setSettings({...settings, currency: e.target.value})} className="bg-gray-50 border border-transparent focus:bg-white focus:border-secondary px-4 py-3 rounded-lg text-sm outline-none transition-all">
                        <option value="USD">USD ($)</option>
                        <option value="AED">AED (د.إ)</option>
                        <option value="SAR">SAR (﷼)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">User Registration</label>
                      <div className="flex items-center gap-3 h-full pt-2">
                         <input type="checkbox" checked={settings.allow_registration} onChange={(e) => setSettings({...settings, allow_registration: e.target.checked})} className="w-5 h-5 accent-secondary" />
                         <span className="text-sm text-gray-500 font-bold">Allow new signups</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`p-8 rounded-xl border flex items-center justify-between transition-colors ${settings.maintenance_mode ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                  <div className="flex flex-col gap-1">
                    <span className={`text-sm font-bold ${settings.maintenance_mode ? 'text-red-600' : 'text-green-600'}`}>Maintenance Mode: {settings.maintenance_mode ? 'ACTIVE' : 'INACTIVE'}</span>
                    <span className={`text-xs ${settings.maintenance_mode ? 'text-red-400' : 'text-green-400'}`}>{settings.maintenance_mode ? 'Front-end access is currently disabled.' : 'Your store is live and accessible to collectors.'}</span>
                  </div>
                  <button onClick={() => setSettings({...settings, maintenance_mode: !settings.maintenance_mode})} className={`px-6 py-2 text-white text-xs font-bold rounded-lg transition-colors ${settings.maintenance_mode ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>{settings.maintenance_mode ? 'Deactivate' : 'Activate'}</button>
                </div>
              </motion.div>
            )}

            {activeTab === 'Security & Access' && (
              <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                    <ShieldCheck size={20} className="text-secondary" />
                    <h3 className="font-heading font-bold text-lg text-primary">Security Protocols</h3>
                  </div>
                  <div className="p-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-gray-100"><ShieldHalf size={20} className="text-primary" /></div>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-primary">Two-Factor Authentication</span>
                          <span className="text-xs text-gray-400">Add an extra layer of security to your admin account.</span>
                        </div>
                      </div>
                      <input type="checkbox" checked={settings.two_factor_auth} onChange={(e) => setSettings({...settings, two_factor_auth: e.target.checked})} className="w-12 h-6 accent-secondary cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-gray-100"><ShieldAlert size={20} className="text-primary" /></div>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-primary">Login Activity Alerts</span>
                          <span className="text-xs text-gray-400">Get notified of new logins from unknown devices.</span>
                        </div>
                      </div>
                      <input type="checkbox" checked={settings.login_activity_alerts} onChange={(e) => setSettings({...settings, login_activity_alerts: e.target.checked})} className="w-12 h-6 accent-secondary cursor-pointer" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Notifications' && (
              <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                    <Bell size={20} className="text-secondary" />
                    <h3 className="font-heading font-bold text-lg text-primary">Notification Center</h3>
                  </div>
                  <div className="p-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-gray-100"><ShoppingBag size={20} className="text-primary" /></div>
                        <div>
                          <p className="text-sm font-bold text-primary">New Order Notifications</p>
                          <p className="text-xs text-gray-400">Receive an email for every purchase.</p>
                        </div>
                      </div>
                      <input type="checkbox" checked={settings.email_new_orders} onChange={(e) => setSettings({...settings, email_new_orders: e.target.checked})} className="w-10 h-5 accent-secondary cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-gray-100"><Package size={20} className="text-primary" /></div>
                        <div>
                          <p className="text-sm font-bold text-primary">Low Stock Alerts</p>
                          <p className="text-xs text-gray-400">Notify when products fall below threshold.</p>
                        </div>
                      </div>
                      <input type="checkbox" checked={settings.email_low_stock} onChange={(e) => setSettings({...settings, email_low_stock: e.target.checked})} className="w-10 h-5 accent-secondary cursor-pointer" />
                    </div>
                    <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-gray-100"><MessageSquare size={20} className="text-primary" /></div>
                        <div>
                          <p className="text-sm font-bold text-primary">Collector Inquiries</p>
                          <p className="text-xs text-gray-400">Notify of new support messages.</p>
                        </div>
                      </div>
                      <input type="checkbox" checked={settings.email_customer_messages} onChange={(e) => setSettings({...settings, email_customer_messages: e.target.checked})} className="w-10 h-5 accent-secondary cursor-pointer" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Store Branding' && (
              <motion.div key="branding" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-50 flex items-center gap-3">
                    <Palette size={20} className="text-secondary" />
                    <h3 className="font-heading font-bold text-lg text-primary">Visual Identity</h3>
                  </div>
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Primary Color</label>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg shadow-inner" style={{ backgroundColor: settings.primary_color }}></div>
                          <input type="text" value={settings.primary_color} onChange={(e) => setSettings({...settings, primary_color: e.target.value})} className="flex-grow bg-gray-50 border border-transparent px-4 py-2 rounded-lg text-sm" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Secondary Color (Gold Accent)</label>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg shadow-inner" style={{ backgroundColor: settings.secondary_color }}></div>
                          <input type="text" value={settings.secondary_color} onChange={(e) => setSettings({...settings, secondary_color: e.target.value})} className="flex-grow bg-gray-50 border border-transparent px-4 py-2 rounded-lg text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Payment Gateways' && (
              <motion.div key="payments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-8">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard size={20} className="text-[#635BFF]" />
                      <h3 className="font-heading font-bold text-lg text-primary">Stripe Infrastructure</h3>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${settings.stripe_connected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {settings.stripe_connected ? 'Live & Connected' : 'Disconnected'}
                    </div>
                  </div>
                  <div className="p-8 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Publishable Key</label>
                        <input type={showKeys ? "text" : "password"} value={settings.stripe_publishable_key || ''} onChange={(e) => setSettings({...settings, stripe_publishable_key: e.target.value})} placeholder="pk_test_..." className="bg-gray-50 border border-transparent focus:bg-white focus:border-[#635BFF] px-4 py-3 rounded-lg text-sm outline-none transition-all font-mono" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Secret Key</label>
                        <div className="relative">
                          <input type={showKeys ? "text" : "password"} value={settings.stripe_secret_key || ''} onChange={(e) => setSettings({...settings, stripe_secret_key: e.target.value})} placeholder="sk_test_..." className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-[#635BFF] px-4 py-3 rounded-lg text-sm outline-none transition-all font-mono" />
                          <button onClick={() => setShowKeys(!showKeys)} type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">{showKeys ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"><input type="checkbox" id="stripe_active" checked={settings.stripe_connected} onChange={(e) => setSettings({...settings, stripe_connected: e.target.checked})} className="w-5 h-5 accent-[#635BFF]" /><label htmlFor="stripe_active" className="text-sm font-bold text-primary cursor-pointer">Enable Stripe Checkout</label></div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Link2 size={20} className="text-[#003087]" />
                      <h3 className="font-heading font-bold text-lg text-primary">PayPal Business</h3>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${settings.paypal_connected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>{settings.paypal_connected ? 'Live & Connected' : 'Disconnected'}</div>
                  </div>
                  <div className="p-8 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Client ID</label><input type={showKeys ? "text" : "password"} value={settings.paypal_client_id || ''} onChange={(e) => setSettings({...settings, paypal_client_id: e.target.value})} className="bg-gray-50 border border-transparent focus:bg-white focus:border-[#003087] px-4 py-3 rounded-lg text-sm outline-none transition-all font-mono" /></div>
                      <div className="flex flex-col gap-2"><label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Client Secret</label><input type={showKeys ? "text" : "password"} value={settings.paypal_secret || ''} onChange={(e) => setSettings({...settings, paypal_secret: e.target.value})} className="bg-gray-50 border border-transparent focus:bg-white focus:border-[#003087] px-4 py-3 rounded-lg text-sm outline-none transition-all font-mono" /></div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl"><input type="checkbox" id="paypal_active" checked={settings.paypal_connected} onChange={(e) => setSettings({...settings, paypal_connected: e.target.checked})} className="w-5 h-5 accent-[#003087]" /><label htmlFor="paypal_active" className="text-sm font-bold text-primary cursor-pointer">Enable PayPal Payments</label></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
