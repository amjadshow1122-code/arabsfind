import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Mail, MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      // Store in Supabase notifications table or call an email edge function
      // For now we log to console and show success — wire to Resend/Postmark later
      const { error } = await supabase.from('notifications').insert([{
        user_id: null,
        type: 'contact_enquiry',
        title: `Contact: ${form.subject}`,
        message: `From: ${form.name} <${form.email}>\n\n${form.message}`,
        is_read: false
      }]);
      if (error) throw error;
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
    setLoading(false);
  };

  return (
    <div className="bg-background min-h-screen py-24">
      <div className="container max-w-5xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-3">Get in Touch</span>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-primary mb-4">Contact Us</h1>
          <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
            Have a question about a sale listing, partnership enquiry, or need support? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Cards */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex flex-col gap-4">
            {[
              { icon: Mail, label: 'Email', value: 'support@moaviafragranse.com.au', href: 'mailto:support@moaviafragranse.com.au' },
              { icon: Clock, label: 'Response Time', value: 'Within 1–2 business days' },
              { icon: MapPin, label: 'Based In', value: 'Australia 🇦🇺' },
            ].map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-secondary" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                  {href ? (
                    <a href={href} className="text-sm font-bold text-primary hover:text-secondary transition-colors">{value}</a>
                  ) : (
                    <p className="text-sm font-bold text-primary">{value}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Quick Links</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'Privacy Policy', href: '/privacy' },
                  { label: 'Terms of Use', href: '/terms' },
                  { label: 'Cookie Policy', href: '/cookies' },
                  { label: 'How It Works', href: '/how-it-works' },
                ].map(l => (
                  <a key={l.href} href={l.href} className="text-xs font-bold text-gray-500 hover:text-secondary transition-colors">
                    → {l.label}
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-6">
              <MessageSquare size={20} className="text-secondary" />
              <h2 className="text-xl font-heading font-bold text-primary">Send a Message</h2>
            </div>

            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                  <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-primary mb-2">Message Sent!</h3>
                  <p className="text-gray-500 text-sm">We'll get back to you within 1–2 business days.</p>
                  <button onClick={() => setStatus(null)} className="mt-6 text-xs font-bold text-secondary hover:underline">
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {status === 'error' && (
                    <div className="bg-red-50 border-l-4 border-red-400 text-red-600 p-4 rounded-lg text-xs flex items-center gap-2">
                      <AlertCircle size={14} /> Failed to send. Please email us directly.
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Your Name</label>
                      <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                        className="bg-gray-50 border border-gray-100 focus:border-secondary focus:bg-white px-4 py-3 rounded-lg text-sm outline-none transition-all"
                        placeholder="Jane Smith" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                      <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                        className="bg-gray-50 border border-gray-100 focus:border-secondary focus:bg-white px-4 py-3 rounded-lg text-sm outline-none transition-all"
                        placeholder="jane@example.com" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Subject</label>
                    <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}
                      className="bg-gray-50 border border-gray-100 focus:border-secondary focus:bg-white px-4 py-3 rounded-lg text-sm outline-none transition-all">
                      <option value="">Select a topic...</option>
                      <option>Sale listing enquiry</option>
                      <option>Partnership / brand listing</option>
                      <option>Order or payment support</option>
                      <option>Technical issue</option>
                      <option>Press or media</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Message</label>
                    <textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                      className="bg-gray-50 border border-gray-100 focus:border-secondary focus:bg-white px-4 py-3 rounded-lg text-sm outline-none transition-all resize-none"
                      placeholder="Tell us how we can help..." />
                  </div>
                  <button type="submit" disabled={loading} className="btn btn-primary py-4 text-sm font-bold gap-2 mt-1 disabled:opacity-60">
                    <Send size={16} />
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
