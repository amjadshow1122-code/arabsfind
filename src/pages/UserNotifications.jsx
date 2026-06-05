import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  CheckCircle2, 
  Trash2, 
  Clock, 
  ShoppingBag, 
  Tag, 
  ShieldAlert, 
  Info,
  MoreVertical,
  MailOpen,
  Filter,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const UserNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNotifications(data);
      }
    }
    setLoading(false);
  };

  const markAsRead = async (id) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (!error) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      }
    }
  };

  const deleteNotification = async (id) => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order': return { icon: ShoppingBag, color: 'text-green-500', bg: 'bg-green-50' };
      case 'promo': return { icon: Tag, color: 'text-secondary', bg: 'bg-secondary/10' };
      case 'security': return { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50' };
      default: return { icon: Info, color: 'text-primary', bg: 'bg-primary/5' };
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-heading font-bold text-primary">Notifications</h2>
          <p className="text-gray-500 text-sm">Stay updated on new sales, brand launches, and your orders.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${filter === 'all' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-primary'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('unread')}
              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${filter === 'unread' ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-primary'}`}
            >
              Unread
            </button>
          </div>
          <button 
            onClick={markAllAsRead}
            className="btn btn-primary px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest gap-2"
          >
            <MailOpen size={14} />
            Mark all read
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div>
        ) : filteredNotifications.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filteredNotifications.map((notif, idx) => {
              const { icon: Icon, color, bg } = getIcon(notif.type);
              return (
                <motion.div 
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-white p-6 rounded-xl border transition-all flex gap-6 relative group ${
                    notif.is_read ? 'border-gray-100 opacity-75' : 'border-secondary/30 shadow-md shadow-secondary/5 bg-secondary/[0.01]'
                  }`}
                >
                  {!notif.is_read && (
                    <div className="absolute top-6 right-6 w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                  )}

                  <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={color} size={24} />
                  </div>

                  <div className="flex flex-col gap-1 flex-grow">
                    <div className="flex items-center gap-3">
                      <h3 className={`font-bold transition-colors ${notif.is_read ? 'text-gray-600' : 'text-primary text-lg'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-gray-50 text-gray-400 rounded-full">
                        {notif.type}
                      </span>
                    </div>
                    <p className={`text-sm leading-relaxed ${notif.is_read ? 'text-gray-400' : 'text-gray-600'}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <Clock size={12} />
                        {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex items-center gap-2">
                        {!notif.is_read && (
                          <button 
                            onClick={() => markAsRead(notif.id)}
                            className="text-[10px] font-bold text-secondary uppercase tracking-widest hover:underline"
                          >
                            Mark as Read
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(notif.id)}
                          className="text-[10px] font-bold text-gray-300 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mx-auto mb-6">
              <Bell size={40} />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">No Notifications Yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              We'll notify you here when there are updates on your orders or new treasures arrive.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserNotifications;
