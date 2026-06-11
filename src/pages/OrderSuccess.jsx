import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag, ArrowRight, Package, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../lib/useCurrency';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState(null);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (sessionId) {
      const fetchOrder = async () => {
        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .single();
        if (data) setOrder(data);
      };
      fetchOrder();
    }
    // Clear the cart on successful order
    localStorage.removeItem('cart');
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-100 p-10 sm:p-16 max-w-lg w-full text-center relative overflow-hidden"
      >
        {/* Background accent */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-400" />

        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 size={40} className="text-green-500" />
        </motion.div>

        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-primary mb-3">
          Order Confirmed!
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Thank you for your purchase from <strong>Al-Moavia Fragrance.com</strong>. Your order has been received and is being processed. You'll receive a confirmation email shortly.
        </p>

        {order && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 rounded-xl p-5 mb-8 text-left space-y-3"
          >
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
              <span>Order Reference</span>
              <span>#ORD-{order.id?.slice(0, 8)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Status</span>
              <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {order.status || 'Processing'}
              </span>
            </div>
            {order.total_amount && (
              <div className="flex justify-between items-center text-sm font-bold text-primary border-t border-gray-200 pt-3">
                <span>Total Paid</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            )}
            {order.customer_email && (
              <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                <Mail size={12} />
                <span>Confirmation sent to {order.customer_email}</span>
              </div>
            )}
          </motion.div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            to="/profile/orders"
            className="btn btn-primary py-3.5 text-xs font-bold gap-2"
          >
            <Package size={16} /> View My Orders
          </Link>
          <Link
            to="/sales"
            className="btn border border-gray-200 text-primary hover:bg-gray-50 py-3.5 text-xs font-bold gap-2"
          >
            <ShoppingBag size={16} /> Keep Browsing
          </Link>
        </div>

        <p className="text-[10px] text-gray-400 mt-8 leading-relaxed">
          Questions? Contact us at{' '}
          <a href="mailto:support@al-moavia fragrance.com" className="text-secondary hover:underline">
            support@al-moavia fragrance.com
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
