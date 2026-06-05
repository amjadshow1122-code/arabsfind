import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  ArrowLeft,
  Lock,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '../lib/useCurrency';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';

const Checkout = () => {
  const { formatPrice } = useCurrency();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Australia',
    phone: ''
  });
  const [saveAddress, setSaveAddress] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  useEffect(() => {
    const fetchUserAndAddresses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // Fetch all addresses
        const { data: addresses } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false });
        
        if (addresses && addresses.length > 0) {
          setSavedAddresses(addresses);
          
          // Pre-fill with default or first one
          const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
          const names = defaultAddr.full_name.split(' ');
          setFormData({
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || '',
            address: defaultAddr.address_line1 + (defaultAddr.address_line2 ? ', ' + defaultAddr.address_line2 : ''),
            city: defaultAddr.city,
            postalCode: defaultAddr.postal_code || '',
            country: defaultAddr.country,
            phone: defaultAddr.phone
          });
          setSaveAddress(false);
        } else {
          setSaveAddress(true);
        }
      }
    };
    fetchUserAndAddresses();
  }, []);

  const selectAddress = (addr) => {
    const names = addr.full_name.split(' ');
    setFormData({
      firstName: names[0] || '',
      lastName: names.slice(1).join(' ') || '',
      address: addr.address_line1 + (addr.address_line2 ? ', ' + addr.address_line2 : ''),
      city: addr.city,
      postalCode: addr.postal_code || '',
      country: addr.country,
      phone: addr.phone
    });
    setShowAddressPicker(false);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      alert('Please log in to place an order.');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          customer_email: user.email,
          total_amount: cartTotal + (cartTotal > 500 ? 0 : 25),
          status: 'Pending',
          shipping_address: formData,
          payment_method: 'Card',
          items_count: cartItems.length,
          image: cartItems[0]?.image
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 1.5. Save address if requested
      if (saveAddress) {
        await supabase
          .from('user_addresses')
          .insert([{
            user_id: user.id,
            full_name: `${formData.firstName} ${formData.lastName}`,
            address_line1: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
            country: formData.country,
            phone: formData.phone,
            is_default: savedAddresses.length === 0,
            label: 'Home'
          }]);
      }

      // 2. Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        price_at_time: item.price // Fixed: Matches your database constraint
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Clear cart
      await clearCart();

      setOrderNumber(`#ORD-${order.id.toString().slice(0, 8).toUpperCase()}`);
      // Redirect to the dedicated order success page
      navigate(`/order/success?session_id=${order.id}`);
      setStep(3); // fallback in case navigate is slow
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to place order: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-10 sm:py-20 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-8 sm:p-12 rounded-xl shadow-xl border border-gray-100 text-center flex flex-col items-center gap-4 sm:gap-6"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-2">
            <CheckCircle2 size={32} className="sm:w-12 sm:h-12" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary">Order Confirmed!</h1>
          <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
            Thank you for your purchase. Your premium fragrance purchase is being prepared for its journey to your doorstep.
          </p>
          <div className="w-full p-4 bg-gray-50 rounded-lg text-left">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
              <span>Order Number</span>
              <span className="text-primary">{orderNumber}</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gray-400">
              <span>Delivery</span>
              <span className="text-primary">3 - 5 Days</span>
            </div>
          </div>
          <Link to="/" className="btn btn-primary w-full py-4 mt-2">
            Back to Home
          </Link>
          <p className="text-[10px] text-gray-400">A confirmation email has been sent to your address.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen py-10 sm:py-20 px-4 sm:px-0">
      <div className="container">
        {/* Progress Header */}
        <div className="flex items-center justify-center gap-3 sm:gap-8 mb-10 sm:mb-16">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>1</div>
            <span className={`text-[10px] sm:text-sm font-bold uppercase tracking-widest ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>Shipping</span>
          </div>
          <div className="w-8 sm:w-12 h-[1px] bg-gray-200"></div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
            <span className={`text-[10px] sm:text-sm font-bold uppercase tracking-widest ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>Payment</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Main Form Area */}
          <div className="w-full lg:w-2/3 flex flex-col gap-10">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-2xl sm:text-3xl font-heading font-bold text-primary">Shipping Information</h2>
                    {savedAddresses.length > 0 && (
                      <button 
                        onClick={() => setShowAddressPicker(!showAddressPicker)}
                        className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-secondary hover:underline flex items-center gap-2 w-fit"
                      >
                        <CheckCircle2 size={14} className="sm:w-4 sm:h-4" />
                        {showAddressPicker ? 'Close Saved' : 'Use Saved Address'}
                      </button>
                    )}
                  </div>

                  {/* Saved Address Picker */}
                  <AnimatePresence>
                    {showAddressPicker && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-hidden"
                      >
                        {savedAddresses.map((addr) => (
                          <button 
                            key={addr.id}
                            onClick={() => selectAddress(addr)}
                            className="text-left p-4 rounded-lg border border-gray-100 hover:border-secondary hover:bg-secondary/5 transition-all flex flex-col gap-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-primary">{addr.full_name}</span>
                              <span className="text-[10px] uppercase font-bold text-gray-400">{addr.label}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 line-clamp-1">{addr.address_line1}, {addr.city}</p>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">First Name</label>
                      <input 
                        type="text" 
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full bg-white border border-gray-100 px-4 py-3.5 rounded-sm outline-none focus:border-secondary transition-all" 
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Last Name</label>
                      <input 
                        type="text" 
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full bg-white border border-gray-100 px-4 py-3.5 rounded-sm outline-none focus:border-secondary transition-all" 
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Street Address</label>
                      <input 
                        type="text" 
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        className="w-full bg-white border border-gray-100 px-4 py-3.5 rounded-sm outline-none focus:border-secondary transition-all" 
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">City</label>
                      <input 
                        type="text" 
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full bg-white border border-gray-100 px-4 py-3.5 rounded-sm outline-none focus:border-secondary transition-all" 
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Postal Code</label>
                      <input 
                        type="text" 
                        value={formData.postalCode}
                        onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                        className="w-full bg-white border border-gray-100 px-4 py-3.5 rounded-sm outline-none focus:border-secondary transition-all" 
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Phone Number</label>
                      <input 
                        type="text" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-white border border-gray-100 px-4 py-3.5 rounded-sm outline-none focus:border-secondary transition-all" 
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Country</label>
                      <select 
                        value={formData.country}
                        onChange={(e) => setFormData({...formData, country: e.target.value})}
                        className="w-full bg-white border border-gray-100 px-4 py-3.5 rounded-sm outline-none focus:border-secondary transition-all"
                      >
                        <option>Australia</option>
                        <option>New Zealand</option>
                      </select>
                    </div>
                  </div>

                  {user && (
                    <label className="flex items-center gap-3 cursor-pointer group mt-2">
                      <input 
                        type="checkbox" 
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary" 
                      />
                      <span className="text-sm text-gray-500 group-hover:text-primary transition-colors font-medium">
                        Save this address to my profile for future orders
                      </span>
                    </label>
                  )}

                  <button onClick={() => setStep(2)} className="btn btn-primary py-4 gap-3 w-full md:w-fit px-12 self-end">
                    Continue to Payment
                    <ChevronRight size={18} />
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-8"
                >
                  <div className="flex items-center gap-4 mb-2">
                    <button onClick={() => setStep(1)} className="p-2 -ml-2 text-gray-400 hover:text-primary">
                      <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-2xl sm:text-3xl font-heading font-bold text-primary">Payment Details</h2>
                  </div>

                  <div className="p-6 border border-secondary bg-secondary/5 rounded-sm flex flex-col gap-6" style={{ borderColor: 'var(--color-secondary)' }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreditCard className="text-secondary" />
                        <span className="font-bold text-primary">Credit or Debit Card</span>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-5 bg-gray-200 rounded-sm"></div>
                        <div className="w-8 h-5 bg-gray-200 rounded-sm"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Card Number</label>
                        <div className="relative">
                          <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white border border-gray-100 px-4 py-3.5 rounded-sm outline-none focus:border-secondary transition-all" />
                          <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Expiry Date</label>
                        <input type="text" placeholder="MM / YY" className="w-full bg-white border border-gray-100 px-4 py-3.5 rounded-sm outline-none focus:border-secondary transition-all" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">CVV</label>
                        <input type="text" placeholder="000" className="w-full bg-white border border-gray-100 px-4 py-3.5 rounded-sm outline-none focus:border-secondary transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary" />
                      <span className="text-sm text-gray-500 group-hover:text-primary transition-colors">Billing address is the same as shipping</span>
                    </label>
                  </div>

                  <button 
                    onClick={handlePlaceOrder} 
                    disabled={loading}
                    className="btn btn-primary py-5 gap-3 w-full shadow-xl shadow-primary/10 mt-4"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <ShieldCheck size={22} />
                        Complete Secure Purchase
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Order Review */}
          <aside className="w-full lg:w-1/3">
            <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-6 sm:gap-8 sticky top-32">
              <h3 className="text-lg sm:text-xl font-heading font-bold border-b border-gray-50 pb-4">Review Order</h3>
              
              <div className="flex flex-col gap-4 sm:gap-6 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gray-50 flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow flex flex-col gap-0.5">
                      <span className="text-xs sm:text-sm font-bold text-primary truncate max-w-[150px] sm:max-w-none">{item.name}</span>
                      <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase tracking-widest">Qty: {item.quantity}</span>
                      <span className="text-xs sm:text-sm font-bold text-secondary" style={{ color: 'var(--color-secondary)' }}>{formatPrice(item.price)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:gap-4 border-t border-gray-100 pt-5 sm:pt-6">
                <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-bold text-primary">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                  <span>Shipping</span>
                  <span className="font-bold text-primary">{cartTotal > 500 ? 'FREE' : formatPrice(25)}</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-bold border-t border-gray-50 pt-4">
                  <span className="text-primary uppercase tracking-widest">Total</span>
                  <span className="text-xl sm:text-2xl font-bold text-secondary" style={{ color: 'var(--color-secondary)' }}>{formatPrice(cartTotal + (cartTotal > 500 ? 0 : 25))}</span>
                </div>
              </div>

              <div className="p-3 sm:p-4 bg-gray-50 rounded-lg flex gap-3 items-start">
                <Info size={14} className="text-primary mt-0.5 flex-shrink-0 sm:w-4 sm:h-4" />
                <p className="text-[9px] sm:text-[10px] text-gray-400 leading-relaxed uppercase tracking-widest font-bold">
                  All fragrance items are carefully inspected and securely packaged to ensure safe delivery of your purchases.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
