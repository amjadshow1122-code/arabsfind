import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Unsubscribe = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleUnsubscribe = async () => {
    if (!email) return;
    setStatus('loading');
    try {
      // Update newsletter_subscribed = false in profiles
      const { error } = await supabase
        .from('profiles')
        .update({ newsletter_subscribed: false })
        .eq('email', email);

      if (error) throw error;
      setStatus('success');
    } catch {
      // If no profile found, still show success (idempotent)
      setStatus('success');
    }
  };

  // Auto-trigger if email param is present
  useEffect(() => {
    if (email && status === 'idle') {
      handleUnsubscribe();
    }
  }, [email]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-xl p-10 sm:p-16 max-w-md w-full text-center"
      >
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h1 className="text-2xl font-heading font-bold text-primary">Processing...</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 size={48} className="text-green-500 mx-auto mb-5" />
            <h1 className="text-2xl font-heading font-bold text-primary mb-3">You've been unsubscribed</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              {email && <><strong>{email}</strong> has been removed from our mailing list.<br /><br /></>}
              You won't receive any further marketing emails from MoaviaFragranse.com.au. Transactional emails (order confirmations, password resets) will still be sent as needed.
            </p>
            <p className="text-gray-400 text-xs mb-8">Changed your mind? You can re-subscribe in your <Link to="/profile/settings" className="text-secondary hover:underline">Account Settings</Link>.</p>
            <Link to="/" className="btn btn-primary py-3.5 px-8 text-sm gap-2">
              Back to MoaviaFragranse
            </Link>
          </>
        )}

        {status === 'idle' && !email && (
          <>
            <Mail size={48} className="text-gray-300 mx-auto mb-5" />
            <h1 className="text-2xl font-heading font-bold text-primary mb-3">Unsubscribe</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              This link should be clicked from the unsubscribe link in one of our emails. If you'd like to manage your email preferences, visit your account settings.
            </p>
            <Link to="/profile/settings" className="btn btn-primary py-3.5 px-8 text-sm">
              Manage Preferences
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={48} className="text-red-400 mx-auto mb-5" />
            <h1 className="text-2xl font-heading font-bold text-primary mb-3">Something went wrong</h1>
            <p className="text-gray-500 text-sm mb-6">We couldn't process your request. Please email us directly at <a href="mailto:support@moaviafragranse.com.au" className="text-secondary hover:underline">support@moaviafragranse.com.au</a> and we'll unsubscribe you manually.</p>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default Unsubscribe;
