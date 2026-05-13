import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Heart, Share2, ShoppingCart, ShieldCheck, Truck, RotateCcw, ChevronRight, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../lib/useCurrency';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { addToCart } = useCart();
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isAdding, setIsAdding] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
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

  const handleAddToCart = async () => {
    setIsAdding(true);
    await addToCart(product, quantity);
    setIsAdding(false);
    navigate('/cart');
  };

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

  const { formatPrice } = useCurrency();

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
      <div className="bg-gray-50 py-4 mb-12">
        <div className="container flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <ChevronRight size={14} />
          <Link to="/shop" className="hover:text-primary transition-colors">{product.category}</Link>
          <ChevronRight size={14} />
          <span className="text-secondary" style={{ color: 'var(--color-secondary)' }}>{product.name}</span>
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
          <div className="w-full lg:w-1/2 flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <span className="text-secondary font-bold uppercase tracking-[0.2em] text-xs" style={{ color: 'var(--color-secondary)' }}>
                {product.category}
              </span>
              <h1 className="text-5xl font-heading leading-tight">{product.name}</h1>
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill={i < Math.floor(product.rating || 5) ? "var(--color-secondary)" : "none"} className="text-secondary" style={{ color: 'var(--color-secondary)' }} />
                  ))}
                </div>
                <span className="text-sm text-gray-500 font-bold">({product.reviews || 0} Customer Reviews)</span>
              </div>
              <p className="text-3xl font-bold text-primary mt-2">{formatPrice(product.price)}</p>
            </div>

            <p className="text-gray-500 leading-relaxed text-lg">
              {product.description}
            </p>

            <div className="flex flex-col gap-6 border-y border-gray-100 py-8">
              <div className="flex items-center gap-6">
                <span className="text-sm font-bold uppercase tracking-widest w-24">Quantity</span>
                <div className="flex items-center border border-gray-200 rounded-sm">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-bold">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <button 
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="btn btn-primary flex-grow py-5 gap-3"
                >
                  {isAdding ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      Add to Cart
                    </>
                  )}
                </button>
                <button 
                  onClick={toggleWishlist}
                  disabled={wishlistLoading}
                  className={`btn border border-gray-200 px-6 transition-all ${isInWishlist ? 'bg-red-50 border-red-100 text-red-500' : 'text-primary hover:bg-gray-50'}`}
                >
                  <Heart size={20} fill={isInWishlist ? "currentColor" : "none"} />
                </button>
                <button 
                  onClick={handleShare}
                  className="btn border border-gray-200 text-primary hover:bg-gray-50 px-6"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-4">
              <div className="flex flex-col items-center text-center gap-2 p-4 bg-gray-50 rounded-sm">
                <ShieldCheck size={24} className="text-secondary" style={{ color: 'var(--color-secondary)' }} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Guaranteed Authentic</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-4 bg-gray-50 rounded-sm">
                <Truck size={24} className="text-secondary" style={{ color: 'var(--color-secondary)' }} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-4 bg-gray-50 rounded-sm">
                <RotateCcw size={24} className="text-secondary" style={{ color: 'var(--color-secondary)' }} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-24">
          <div className="flex border-b border-gray-200 gap-12">
            <button 
              onClick={() => setActiveTab('description')}
              className={`pb-6 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'description' ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
            >
              Description
              {activeTab === 'description' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-1 bg-secondary" style={{ backgroundColor: 'var(--color-secondary)' }} />}
            </button>
            <button 
              onClick={() => setActiveTab('details')}
              className={`pb-6 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === 'details' ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
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
