import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, Activity, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Check if user is admin
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw new Error('Could not verify admin status.');
      
      if (!profileData.is_admin) {
        await supabase.auth.signOut();
        throw new Error('Access denied. Administrator privileges required.');
      }

      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#001236] flex items-center justify-center py-20 px-4 relative overflow-hidden">
      {/* Abstract Tech Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #775a19 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      </div>
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px]"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-[#001c4d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10"
      >
        <div className="p-10 md:p-12 flex flex-col gap-10">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center justify-center">
              <img src="/ARAB_FINDS-removebg-preview.png" alt="Arab Finds" className="h-16 w-auto object-contain brightness-0 invert" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Admin Terminal</h1>
              <p className="text-gray-400 text-sm mt-1 uppercase tracking-[0.2em] font-bold">Arab Finds Management System</p>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 text-red-500 p-4 rounded-xl text-xs font-bold border border-red-500/20 text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Admin Identifier</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@arabfinds.com"
                  className="w-full bg-[#002a70] border border-white/5 px-12 py-4 rounded-xl outline-none focus:border-secondary focus:bg-[#00348a] transition-all text-sm text-white placeholder:text-gray-600"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">Security Key</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#002a70] border border-white/5 px-12 py-4 rounded-xl outline-none focus:border-secondary focus:bg-[#00348a] transition-all text-sm text-white placeholder:text-gray-600"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="bg-secondary hover:bg-secondary-light text-white w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Terminal size={18} />
                  Initialize Session
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-green-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">System Online</span>
            </div>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">v2.4.0-Stable</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
