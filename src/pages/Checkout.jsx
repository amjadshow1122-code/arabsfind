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
  Info,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '../lib/useCurrency';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { useEffect } from 'react';

const Checkout = () => {
  const { formatPrice } = useCurrency();
  const { cartItems, cartTotal, clearCart, addToCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Auth States for inline Login/Signup (Step 0)
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: ''
  });
  const [saveAddress, setSaveAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [suggestedProducts, setSuggestedProducts] = useState([]);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [useDifferentDelivery, setUseDifferentDelivery] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    firstName: '', lastName: '', address: '', city: '', phone: ''
  });
  const [saveDeliveryAddress, setSaveDeliveryAddress] = useState(false);

  useEffect(() => {
    const fetchUserAndAddresses = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStep(0);
        return;
      }
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
          country: defaultAddr.country || 'Pakistan',
          phone: defaultAddr.phone || ''
        });
        setSaveAddress(false);
      } else {
        setSaveAddress(true);
      }
    };
    fetchUserAndAddresses();
  }, [navigate]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    
    try {
      let data, error;
      if (authMode === 'signup') {
        const res = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: { data: { full_name: authName } }
        });
        data = res.data; error = res.error;
      } else {
        const res = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });
        data = res.data; error = res.error;
      }
      
      if (error) throw error;
      
      if (data.user) {
        setUser(data.user);
        setStep(1); // Move to Shipping
        
        if (authMode === 'login') {
          const { data: addresses } = await supabase
            .from('user_addresses')
            .select('*')
            .eq('user_id', data.user.id)
            .order('is_default', { ascending: false });
          
          if (addresses && addresses.length > 0) {
            setSavedAddresses(addresses);
            const defaultAddr = addresses.find(a => a.is_default) || addresses[0];
            const names = defaultAddr.full_name.split(' ');
            setFormData({
              firstName: names[0] || '',
              lastName: names.slice(1).join(' ') || '',
              address: defaultAddr.address_line1 + (defaultAddr.address_line2 ? ', ' + defaultAddr.address_line2 : ''),
              city: defaultAddr.city,
              postalCode: defaultAddr.postal_code || '',
              country: defaultAddr.country || 'Pakistan',
              phone: defaultAddr.phone || ''
            });
            setSaveAddress(false);
          } else {
            setSaveAddress(true);
          }
        } else {
          setSaveAddress(true);
        }
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const selectAddress = (addr) => {
    const names = addr.full_name.split(' ');
    setFormData({
      firstName: names[0] || '',
      lastName: names.slice(1).join(' ') || '',
      address: addr.address_line1 + (addr.address_line2 ? ', ' + addr.address_line2 : ''),
      city: addr.city,
      postalCode: addr.postal_code || '',
      country: addr.country || 'Pakistan',
      phone: addr.phone || ''
    });
    setShowNewAddressForm(false);
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
          shipping_address: useDifferentDelivery 
            ? { ...deliveryData, country: 'Pakistan' } 
            : formData,
          payment_method: paymentMethod,
          items_count: cartItems.length,
          image: cartItems[0]?.image
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 1.5. Save address if requested
      if (useDifferentDelivery && saveDeliveryAddress) {
        await supabase
          .from('user_addresses')
          .insert([{
            user_id: user.id,
            full_name: `${deliveryData.firstName} ${deliveryData.lastName}`,
            address_line1: deliveryData.address,
            city: deliveryData.city,
            postal_code: '',
            country: 'Pakistan',
            phone: deliveryData.phone,
            is_default: false,
            label: 'Other'
          }]);
      } else if (!useDifferentDelivery && saveAddress) {
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
        <div className="flex items-center justify-center gap-2 sm:gap-6 mb-10 sm:mb-16">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${step >= 0 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>1</div>
            <span className={`text-[9px] sm:text-sm font-bold uppercase tracking-widest ${step >= 0 ? 'text-primary' : 'text-gray-400'}`}>Account</span>
          </div>
          <div className="w-6 sm:w-8 h-[1px] bg-gray-200"></div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
            <span className={`text-[9px] sm:text-sm font-bold uppercase tracking-widest ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>Shipping</span>
          </div>
          <div className="w-6 sm:w-8 h-[1px] bg-gray-200"></div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>3</div>
            <span className={`text-[9px] sm:text-sm font-bold uppercase tracking-widest ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>Payment</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Main Form Area */}
          <div className="w-full lg:w-2/3 flex flex-col gap-10">
            <AnimatePresence mode="wait">
              {step === 0 ? (
                <motion.div 
                  key="step0"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-6 w-full max-w-md mx-auto"
                >
                  <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
                    <h2 className="text-2xl font-heading font-bold text-primary mb-2">
                      {authMode === 'login' ? 'Sign In to Checkout' : 'Create an Account'}
                    </h2>
                    <p className="text-sm text-gray-500 mb-6">
                      {authMode === 'login' 
                        ? 'Log in to use your saved addresses and speed up checkout.' 
                        : 'Sign up to track orders, save addresses, and more.'}
                    </p>

                    {authError && (
                      <div className="bg-red-50 text-red-500 p-3 rounded text-sm mb-4">
                        {authError}
                      </div>
                    )}

                    <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                      {authMode === 'signup' && (
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Full Name</label>
                          <input 
                            type="text" required value={authName} onChange={e => setAuthName(e.target.value)}
                            className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-sm outline-none focus:border-secondary transition-all" 
                          />
                        </div>
                      )}
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Email Address</label>
                        <input 
                          type="email" required value={authEmail} onChange={e => setAuthEmail(e.target.value)}
                          className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-sm outline-none focus:border-secondary transition-all" 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Password</label>
                        <input 
                          type="password" required value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                          className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-sm outline-none focus:border-secondary transition-all" 
                        />
                      </div>

                      <button type="submit" disabled={authLoading} className="btn btn-primary w-full py-4 mt-2">
                        {authLoading ? 'Please wait...' : authMode === 'login' ? 'Sign In & Continue' : 'Sign Up & Continue'}
                      </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                      <span className="text-gray-500">
                        {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                      </span>
                      <button 
                        onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                        className="text-secondary font-bold hover:underline"
                      >
                        {authMode === 'login' ? 'Sign Up' : 'Log In'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ) : step === 1 ? (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col gap-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-2xl sm:text-3xl font-heading font-bold text-primary">Billing Information</h2>
                  </div>

                  <div className="flex flex-col gap-6 mt-2">
                    {/* Always show the primary billing profile if we have data, or just the title if empty (though it shouldn't be empty for new users) */}
                    {(formData.firstName || formData.address) && (
                      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm flex flex-col gap-2">
                        <span className="font-bold text-primary text-lg">{formData.firstName} {formData.lastName}</span>
                        <p className="text-sm text-gray-500">{formData.phone}</p>
                        <p className="text-sm text-gray-500">{formData.address}{formData.city ? `, ${formData.city}` : ''}</p>
                        <p className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500 uppercase tracking-widest font-bold w-fit mt-2">Primary Billing Profile</p>
                      </div>
                    )}

                    {!useDifferentDelivery ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button 
                          onClick={() => setUseDifferentDelivery(true)}
                          className="btn bg-white text-secondary border border-secondary hover:bg-secondary hover:text-white py-4 transition-colors font-bold shadow-sm"
                        >
                          Delivery to new address
                        </button>
                        <button 
                          onClick={() => setStep(2)}
                          className="btn btn-primary py-4 gap-2 flex items-center justify-center shadow-lg shadow-primary/10"
                        >
                          Continue Payment
                          <ChevronRight size={18} />
                        </button>
                      </div>
                    ) : (
                      <AnimatePresence>
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex flex-col gap-6 overflow-hidden"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-primary text-lg">New Delivery Address</h3>
                            <button 
                              onClick={() => setUseDifferentDelivery(false)} 
                              className="text-xs text-gray-400 hover:text-red-500 font-bold uppercase tracking-widest"
                            >
                              Cancel
                            </button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg border border-gray-100">
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">First Name</label>
                              <input 
                                type="text" 
                                required={useDifferentDelivery}
                                value={deliveryData.firstName}
                                onChange={(e) => setDeliveryData({...deliveryData, firstName: e.target.value})}
                                className="w-full bg-white border border-gray-200 px-4 py-3.5 rounded-sm outline-none focus:border-secondary transition-all" 
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Last Name</label>
                              <input 
                                type="text" 
                                required={useDifferentDelivery}
                                value={deliveryData.lastName}
                                onChange={(e) => setDeliveryData({...deliveryData, lastName: e.target.value})}
                                className="w-full bg-white border border-gray-200 px-4 py-3.5 rounded-sm outline-none focus:border-secondary transition-all" 
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Phone Number</label>
                              <input 
                                type="tel" 
                                required={useDifferentDelivery}
                                value={deliveryData.phone}
                                onChange={(e) => setDeliveryData({...deliveryData, phone: e.target.value})}
                                className="w-full bg-white border border-gray-200 px-4 py-3.5 rounded-sm outline-none focus:border-secondary transition-all" 
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">City</label>
                              <input 
                                type="text" 
                                required={useDifferentDelivery}
                                value={deliveryData.city}
                                onChange={(e) => setDeliveryData({...deliveryData, city: e.target.value})}
                                className="w-full bg-white border border-gray-200 px-4 py-3.5 rounded-sm outline-none focus:border-secondary transition-all" 
                              />
                            </div>
                            <div className="md:col-span-2 flex flex-col gap-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Complete Address</label>
                              <textarea 
                                rows="2"
                                required={useDifferentDelivery}
                                value={deliveryData.address}
                                onChange={(e) => setDeliveryData({...deliveryData, address: e.target.value})}
                                className="w-full bg-white border border-gray-200 px-4 py-3.5 rounded-sm outline-none focus:border-secondary transition-all resize-none" 
                              />
                            </div>
                            <label className="md:col-span-2 flex items-center gap-3 cursor-pointer group mt-2">
                              <input 
                                type="checkbox" 
                                checked={saveDeliveryAddress}
                                onChange={(e) => setSaveDeliveryAddress(e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary" 
                              />
                              <span className="text-sm text-gray-500 group-hover:text-primary transition-colors font-medium">
                                Save this address to my profile for future orders
                              </span>
                            </label>
                          </div>
                          <button 
                            onClick={() => setStep(2)} 
                            className="btn btn-primary py-4 gap-2 flex items-center justify-center w-full md:w-fit self-end shadow-lg shadow-primary/10 mt-2"
                          >
                            Continue Payment
                            <ChevronRight size={18} />
                          </button>
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>
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

                  <div className="flex flex-col gap-6">
                    {/* Card Option */}
                    <div 
                      onClick={() => setPaymentMethod('Card')}
                      className={`p-6 border rounded-sm flex flex-col gap-6 cursor-pointer transition-all ${paymentMethod === 'Card' ? 'border-secondary bg-secondary/5' : 'border-gray-100 bg-white hover:border-gray-300'}`}
                      style={paymentMethod === 'Card' ? { borderColor: 'var(--color-secondary)' } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'Card' ? 'border-secondary' : 'border-gray-300'}`}>
                            {paymentMethod === 'Card' && <div className="w-2 h-2 rounded-full bg-secondary" />}
                          </div>
                          <CreditCard className={paymentMethod === 'Card' ? 'text-secondary' : 'text-gray-400'} />
                          <span className={`font-bold ${paymentMethod === 'Card' ? 'text-primary' : 'text-gray-500'}`}>Credit or Debit Card</span>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-8 h-5 bg-gray-200 rounded-sm"></div>
                          <div className="w-8 h-5 bg-gray-200 rounded-sm"></div>
                        </div>
                      </div>

                      {paymentMethod === 'Card' && (
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
                      )}
                    </div>

                    {/* COD Option */}
                    <div 
                      onClick={() => setPaymentMethod('COD')}
                      className={`p-6 border rounded-sm flex flex-col gap-6 cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-secondary bg-secondary/5' : 'border-gray-100 bg-white hover:border-gray-300'}`}
                      style={paymentMethod === 'COD' ? { borderColor: 'var(--color-secondary)' } : {}}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'COD' ? 'border-secondary' : 'border-gray-300'}`}>
                            {paymentMethod === 'COD' && <div className="w-2 h-2 rounded-full bg-secondary" />}
                          </div>
                          <Truck className={paymentMethod === 'COD' ? 'text-secondary' : 'text-gray-400'} />
                          <span className={`font-bold ${paymentMethod === 'COD' ? 'text-primary' : 'text-gray-500'}`}>Cash on Delivery (COD)</span>
                        </div>
                      </div>
                      {paymentMethod === 'COD' && (
                        <p className="text-sm text-gray-500 pl-7">Pay with cash upon delivery of your order.</p>
                      )}
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

            {/* Order More Section */}
            {suggestedProducts.length > 0 && (
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-6 mt-8">
                <h3 className="text-lg sm:text-xl font-heading font-bold border-b border-gray-50 pb-4">Order More Items</h3>
                <div className="flex flex-col gap-4">
                  {suggestedProducts.map((product) => {
                    const inCart = cartItems.some(item => item.product_id === product.id);
                    return (
                      <div key={product.id} className="flex gap-4 items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <img src={product.image_url} alt={product.name} className="w-14 h-14 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-primary truncate">{product.name}</h4>
                          <span className="text-xs font-bold text-secondary" style={{ color: 'var(--color-secondary)' }}>{formatPrice(product.price)}</span>
                        </div>
                        <button 
                          onClick={() => {
                            if (!inCart) {
                              addToCart(product, 1);
                            }
                          }}
                          disabled={inCart}
                          className={`w-8 h-8 rounded-full flex flex-shrink-0 items-center justify-center transition-colors ${
                            inCart 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : 'bg-secondary/10 text-secondary hover:bg-secondary hover:text-white'
                          }`}
                        >
                          {inCart ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
