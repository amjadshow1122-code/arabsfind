import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Share2, ShoppingCart, ShieldCheck, Truck, RotateCcw, ChevronRight, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../lib/useCurrency';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('description');
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [siteSettings, setSiteSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('site_settings').select('footer_config').eq('id', 1).single();
      if (data) {
        setSiteSettings(data.footer_config);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products_secure')
        .select('*')
        .eq('id', id)
        .single();
      
      if (data) {
        setProduct(data);
        setMainImage(data.image_url);
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id]);


  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const checkWishlist = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !product?.id) return;

      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', parseInt(product.id))
        .maybeSingle();
      
      if (error) throw error;
      if (data) setIsInWishlist(true);
    } catch (err) {
      console.warn('Wishlist check suppressed:', err.message);
    }
  };

  useEffect(() => {
    if (product) checkWishlist();
  }, [product]);

  const toggleWishlist = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    setWishlistLoading(true);
    if (isInWishlist) {
      await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', product.id);
      setIsInWishlist(false);
    } else {
      await supabase
        .from('wishlist')
        .insert([{ user_id: user.id, product_id: product.id }]);
      setIsInWishlist(true);
    }
    setWishlistLoading(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out this amazing find: ${product.name}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleOrderNow = async () => {
    setAddingToCart(true);
    await addToCart(product, quantity);
    setAdded(true);
    setAddingToCart(false);
  };

  const handleAddMore = () => {
    navigate('/', { state: { showCartSuccess: true } });
  };

  const handleCompleteOrder = () => {
    navigate('/checkout');
  };

  const { formatPrice } = useCurrency();

  const handleWhatsappOrder = () => {
    const number = siteSettings?.whatsapp_order?.number?.replace(/\D/g, '') || '923175587278';
    const text = `Hi, I would like to order:\n\nProduct: ${product.name}\nQuantity: ${quantity}\nTotal: ${formatPrice(product.price * quantity)}`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="bg-white pb-20">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 py-4 mb-6 sm:mb-12">
        <div className="container flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 px-4 sm:px-0">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={10} className="sm:w-3.5 sm:h-3.5" />
          <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <ChevronRight size={10} className="sm:w-3.5 sm:h-3.5" />
          <Link to="/shop" className="hover:text-primary transition-colors truncate max-w-[80px] sm:max-w-none">{product.category}</Link>
          <ChevronRight size={10} className="sm:w-3.5 sm:h-3.5" />
          <span className="text-secondary truncate max-w-[120px] sm:max-w-none" style={{ color: 'var(--color-secondary)' }}>{product.name}</span>
        </div>
      </div>

      <div className="container">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Image Gallery */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-gray-50 rounded-sm overflow-hidden"
            >
              <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
            </motion.div>
            {product.images && product.images.length > 0 && (
              <div className="flex gap-4">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setMainImage(img)}
                    className={`w-24 h-24 rounded-sm overflow-hidden border-2 transition-all ${mainImage === img ? 'border-secondary' : 'border-transparent opacity-60'}`}
                    style={{ borderColor: mainImage === img ? 'var(--color-secondary)' : 'transparent' }}
                  >
                    <img src={img} alt={`${product.name} ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col gap-6 px-4 lg:px-0">
            <div className="flex flex-col gap-3 sm:gap-4">
              <span className="text-secondary font-bold uppercase tracking-[0.2em] text-[10px] sm:text-xs" style={{ color: 'var(--color-secondary)' }}>
                {product.category}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading leading-tight">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex gap-0.5 sm:gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < Math.floor(product.rating || 5) ? "var(--color-secondary)" : "none"} className="text-secondary" style={{ color: 'var(--color-secondary)' }} />
                  ))}
                </div>
                <span className="text-[11px] sm:text-sm text-gray-500 font-bold">({product.reviews || 0} Reviews)</span>
              </div>
              <div className="flex items-baseline gap-3 mt-1 sm:mt-2">
                {product.compare_at_price && (
                  <p className="text-xl sm:text-2xl font-medium text-gray-400 line-through">{formatPrice(product.compare_at_price)}</p>
                )}
                <p className="text-2xl sm:text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
              </div>
            </div>

            <p className="text-gray-500 leading-relaxed text-lg">
              {product.description}
            </p>

            <div className="flex flex-col gap-6 border-y border-gray-100 py-6 sm:py-8">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Quantity</span>
                <div className="flex items-center border border-gray-200 rounded-sm">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-gray-50 transition-colors text-gray-500">
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-gray-50 transition-colors text-gray-500">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-4 mt-2">
                {product.external_url ? (
                  <a 
                    href={product.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary flex-grow py-5 text-center flex items-center justify-center gap-3"
                  >
                    View on Retailer
                  </a>
                ) : !added ? (
                  <button 
                    onClick={handleOrderNow}
                    disabled={addingToCart}
                    className="btn btn-primary flex-grow py-5 text-center flex items-center justify-center gap-3"
                  >
                    {addingToCart ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <ShoppingCart size={20} />
                        Order Now
                      </>
                    )}
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={handleAddMore}
                      className="btn border border-primary text-primary flex-1 py-5 text-center flex items-center justify-center gap-3 hover:bg-gray-50 px-2"
                    >
                      <ShoppingCart size={20} className="shrink-0" />
                      <span className="truncate">Continue Shopping</span>
                    </button>
                    <button 
                      onClick={handleCompleteOrder}
                      className="btn btn-primary flex-1 py-5 text-center flex items-center justify-center gap-3 px-2"
                    >
                      <span className="truncate">Complete Order</span>
                    </button>
                    {siteSettings?.whatsapp_order?.enabled !== false && (
                      <button 
                        onClick={handleWhatsappOrder}
                        className="btn bg-[#25D366] hover:bg-[#128C7E] text-white flex-1 py-5 text-center flex items-center justify-center gap-3 px-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 fill-current shrink-0">
                          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                        </svg>
                        <span className="truncate">WhatsApp</span>
                      </button>
                    )}
                  </>
                )}

                <button 
                  onClick={handleShare}
                  className="btn border border-gray-200 text-primary hover:bg-gray-50 px-6"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 py-4">
              <div className="flex flex-col items-center text-center gap-1.5 p-3 sm:p-4 bg-gray-50 rounded-sm">
                <ShieldCheck size={20} className="text-secondary" style={{ color: 'var(--color-secondary)' }} />
                <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest leading-tight">Authentic</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 p-3 sm:p-4 bg-gray-50 rounded-sm">
                <Truck size={20} className="text-secondary" style={{ color: 'var(--color-secondary)' }} />
                <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest leading-tight">Fast Ship</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 p-3 sm:p-4 bg-gray-50 rounded-sm">
                <RotateCcw size={20} className="text-secondary" style={{ color: 'var(--color-secondary)' }} />
                <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest leading-tight">Easy Return</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16 sm:mt-24 px-4 sm:px-0">
          <div className="flex border-b border-gray-200 gap-6 sm:gap-12 overflow-x-auto no-scrollbar whitespace-nowrap">
            <button 
              onClick={() => setActiveTab('description')}
              className={`pb-4 sm:pb-6 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'description' ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
            >
              Description
              {activeTab === 'description' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-1 bg-secondary" style={{ backgroundColor: 'var(--color-secondary)' }} />}
            </button>
            <button 
              onClick={() => setActiveTab('details')}
              className={`pb-4 sm:pb-6 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'details' ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
            >
              Additional Info
              {activeTab === 'details' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-1 bg-secondary" style={{ backgroundColor: 'var(--color-secondary)' }} />}
            </button>
          </div>

          <div className="py-12 max-w-4xl">
            {activeTab === 'description' ? (
              <div className="flex flex-col gap-6 text-gray-500 leading-relaxed">
                <p>
                  {product.description || 'No description available for this exquisite piece.'}
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                {product.details ? (
                  product.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary" style={{ backgroundColor: 'var(--color-secondary)' }}></div>
                      {detail}
                    </li>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No additional details available.</p>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
