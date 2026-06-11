import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  X, 
  Loader2,
  Home,
  Briefcase,
  MoreVertical
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const UserAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    is_default: false,
    label: 'Home' // 'Home', 'Work', 'Other'
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAddresses(data);
      }
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const addressData = {
        ...formData,
        user_id: user.id
      };

      if (formData.is_default) {
        // Unset other defaults first
        await supabase
          .from('user_addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      let error;
      if (editingAddress) {
        const { error: editError } = await supabase
          .from('user_addresses')
          .update(addressData)
          .eq('id', editingAddress.id);
        error = editError;
      } else {
        const { error: insertError } = await supabase
          .from('user_addresses')
          .insert([addressData]);
        error = insertError;
      }

      if (!error) {
        setShowModal(false);
        setEditingAddress(null);
        setFormData({
          full_name: '',
          phone: '',
          address_line1: '',
          address_line2: '',
          city: '',
          state: '',
          postal_code: '',
          country: '',
          is_default: false,
          label: 'Home'
        });
        fetchAddresses();
      }
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      full_name: address.full_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state || '',
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default,
      label: address.label || 'Home'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', id);

    if (!error) {
      fetchAddresses();
    }
  };

  const handleSetDefault = async (id) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // 1. Unset all defaults
      await supabase
        .from('user_addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // 2. Set this one as default
      await supabase
        .from('user_addresses')
        .update({ is_default: true })
        .eq('id', id);

      fetchAddresses();
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-primary">My Addresses</h2>
          <p className="text-gray-500 text-sm">Manage your shipping and billing locations.</p>
        </div>
        <button 
          onClick={() => {
            setEditingAddress(null);
            setFormData({
              full_name: '',
              phone: '',
              address_line1: '',
              address_line2: '',
              city: '',
              state: '',
              postal_code: '',
              country: '',
              is_default: false,
              label: 'Home'
            });
            setShowModal(true);
          }}
          className="btn btn-primary px-6 py-2.5 text-xs font-bold gap-2"
        >
          <Plus size={18} />
          Add New Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div>
        ) : addresses.length > 0 ? (
          addresses.map((address, idx) => (
            <motion.div 
              key={address.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-white p-6 rounded-xl border transition-all flex flex-col gap-4 relative group ${
                address.is_default ? 'border-secondary shadow-md shadow-secondary/5' : 'border-gray-100 shadow-sm hover:border-gray-200'
              }`}
            >
              {address.is_default && (
                <div className="absolute top-6 right-6 flex items-center gap-1.5 text-secondary">
                  <CheckCircle2 size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Default</span>
                </div>
              )}

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  {address.label === 'Home' ? <Home size={20} /> : address.label === 'Work' ? <Briefcase size={20} /> : <MapPin size={20} />}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    {address.full_name}
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                      {address.label}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">{address.phone}</p>
                </div>
              </div>

              <div className="flex flex-col gap-0.5 pl-14 text-sm text-gray-600">
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>{address.city}, {address.state} {address.postal_code}</p>
                <p>{address.country}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(address)}
                    className="p-2 text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"
                  >
                    <Edit2 size={14} />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(address.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
                {!address.is_default && (
                  <button 
                    onClick={() => handleSetDefault(address.id)}
                    className="text-[10px] font-bold uppercase tracking-widest text-secondary hover:underline"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4">
              <MapPin size={32} />
            </div>
            <h3 className="text-lg font-bold text-primary mb-1">No Addresses Saved</h3>
            <p className="text-sm text-gray-500 mb-6">
              Please add a shipping address to speed up your checkout process.
            </p>
          </div>
        )}
      </div>

      {/* Address Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-xl rounded-xl shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-primary text-white">
                <h3 className="text-xl font-heading font-bold">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                <button onClick={() => setShowModal(false)} className="hover:rotate-90 transition-transform">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Label</label>
                    <div className="flex gap-2">
                      {['Home', 'Work', 'Other'].map(l => (
                        <button 
                          key={l}
                          type="button"
                          onClick={() => setFormData({...formData, label: l})}
                          className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-sm border transition-all ${
                            formData.label === l ? 'bg-secondary border-secondary text-white' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.full_name}
                      onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                      className="w-full bg-white border border-gray-100 px-4 py-3 rounded-sm outline-none focus:border-secondary transition-all text-sm" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Phone Number</label>
                    <input 
                      required
                      type="text" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-white border border-gray-100 px-4 py-3 rounded-sm outline-none focus:border-secondary transition-all text-sm" 
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Street Address</label>
                    <input 
                      required
                      type="text" 
                      placeholder="House No, Building Name, Street"
                      value={formData.address_line1}
                      onChange={(e) => setFormData({...formData, address_line1: e.target.value})}
                      className="w-full bg-white border border-gray-100 px-4 py-3 rounded-sm outline-none focus:border-secondary transition-all text-sm" 
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Apartment / Suite (Optional)</label>
                    <input 
                      type="text" 
                      value={formData.address_line2}
                      onChange={(e) => setFormData({...formData, address_line2: e.target.value})}
                      className="w-full bg-white border border-gray-100 px-4 py-3 rounded-sm outline-none focus:border-secondary transition-all text-sm" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">City</label>
                    <input 
                      required
                      type="text" 
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full bg-white border border-gray-100 px-4 py-3 rounded-sm outline-none focus:border-secondary transition-all text-sm" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Postal Code</label>
                    <input 
                      required
                      type="text" 
                      value={formData.postal_code}
                      onChange={(e) => setFormData({...formData, postal_code: e.target.value})}
                      className="w-full bg-white border border-gray-100 px-4 py-3 rounded-sm outline-none focus:border-secondary transition-all text-sm" 
                    />
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Country</label>
                    <select 
                      value={formData.country}
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                      className="w-full bg-white border border-gray-100 px-4 py-3 rounded-sm outline-none focus:border-secondary transition-all text-sm"
                    >
                      <option></option>
                      <option>New Zealand</option>
                      <option>United Kingdom</option>
                      <option>United States</option>
                      <option>Canada</option>
                      <option>Singapore</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer group mt-2">
                  <input 
                    type="checkbox" 
                    checked={formData.is_default}
                    onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
                    className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary" 
                  />
                  <span className="text-sm text-gray-500 group-hover:text-primary transition-colors font-medium">Set as default address</span>
                </label>

                <div className="flex gap-4 mt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 border border-gray-100 text-gray-400 font-bold uppercase tracking-widest text-xs hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 btn btn-primary py-4"
                  >
                    {editingAddress ? 'Update Address' : 'Save Address'}
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

export default UserAddresses;
