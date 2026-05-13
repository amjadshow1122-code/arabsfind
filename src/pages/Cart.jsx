import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '../lib/useCurrency';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { formatPrice } = useCurrency();
  const { cartItems, removeFromCart, updateQuantity, cartTotal, loading } = useCart();

  const subtotal = cartTotal;
  const shipping = subtotal > 500 ? 0 : 25.00;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
          <ShoppingBag size={48} />
        </div>
        <h1 className="text-3xl font-heading font-bold text-primary">Your cart is empty</h1>
        <p className="text-gray-500 text-center max-w-md">
          Explore our curated collections and find the perfect heritage piece to add to your collection.
        </p>
        <Link to="/shop" className="btn btn-primary px-10 py-4 mt-4">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-10 sm:py-20 px-4 sm:px-0">
      <div className="container">
        <div className="flex flex-col gap-3 sm:gap-4 mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-primary">Shopping Cart</h1>
          <p className="text-gray-500 text-sm sm:text-base">Review your selected finds before proceeding to checkout.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items List */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div 
                  layout
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-6"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-grow flex flex-col gap-0.5 sm:gap-1 text-center sm:text-left w-full sm:w-auto">
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-secondary" style={{ color: 'var(--color-secondary)' }}>{item.category}</span>
                    <h3 className="text-base sm:text-lg font-heading font-bold text-primary truncate max-w-[200px] sm:max-w-none mx-auto sm:mx-0">{item.name}</h3>
                    <p className="text-xs sm:text-sm font-bold text-secondary" style={{ color: 'var(--color-secondary)' }}>{formatPrice(item.price)}</p>
                  </div>

                  <div className="flex items-center border border-gray-100 rounded-lg bg-gray-50 sm:bg-transparent">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 sm:p-3 text-gray-400 hover:text-primary transition-colors"
                    >
                      <Minus size={12} className="sm:w-3.5 sm:h-3.5" />
                    </button>
                    <span className="w-8 sm:w-10 text-center text-xs sm:text-sm font-bold">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 sm:p-3 text-gray-400 hover:text-primary transition-colors"
                    >
                      <Plus size={12} className="sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>

                  <div className="text-center sm:text-right min-w-[80px] sm:min-w-[100px] flex flex-col items-center sm:items-end">
                    <p className="text-base sm:text-lg font-bold text-primary">{formatPrice(item.price * item.quantity)}</p>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest mt-1 sm:mt-2 active:scale-95"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Back to Shop */}
            <Link to="/shop" className="flex items-center gap-2 text-sm font-bold text-primary hover:text-secondary transition-all group w-fit">
              <span className="border-b-2 border-transparent group-hover:border-secondary pb-1">Continue Shopping</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Summary Sidebar */}
          <aside className="w-full lg:w-1/3 flex flex-col gap-6">
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-6">
              <h3 className="text-lg sm:text-xl font-heading font-bold border-b border-gray-50 pb-4">Order Summary</h3>
              
              <div className="flex flex-col gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="flex justify-between items-center text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-primary">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span>Shipping</span>
                  <span className="font-bold text-primary">{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <span>Estimated Tax</span>
                  <span className="font-bold text-primary">{formatPrice(0)}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-5 sm:pt-6 flex justify-between items-center">
                <span className="text-base sm:text-lg font-bold text-primary uppercase tracking-widest">Total</span>
                <span className="text-xl sm:text-2xl font-bold text-secondary" style={{ color: 'var(--color-secondary)' }}>{formatPrice(total)}</span>
              </div>

              <Link to="/checkout" className="btn btn-primary w-full py-3.5 sm:py-4 gap-3 text-sm sm:text-base shadow-lg shadow-primary/10 flex items-center justify-center active:scale-[0.98] transition-transform">
                Proceed to Checkout
                <ShieldCheck size={18} className="sm:w-5 sm:h-5" />
              </Link>

              <div className="flex flex-col gap-3 sm:gap-4 mt-2">
                <div className="flex items-center gap-3 text-[10px] sm:text-xs text-gray-500">
                  <Truck size={14} className="text-secondary shrink-0" style={{ color: 'var(--color-secondary)' }} />
                  <span>Free shipping on orders over {formatPrice(500)}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] sm:text-xs text-gray-500">
                  <ShieldCheck size={14} className="text-secondary shrink-0" style={{ color: 'var(--color-secondary)' }} />
                  <span>Secure 256-bit SSL encrypted payment</span>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Promo Code</h4>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter code" 
                  className="flex-grow bg-gray-50 border border-transparent focus:bg-white focus:border-secondary px-4 py-3 rounded-lg text-sm outline-none transition-all"
                />
                <button className="btn border border-primary text-primary hover:bg-primary hover:text-white px-6 py-2 text-xs">
                  Apply
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Cart;
