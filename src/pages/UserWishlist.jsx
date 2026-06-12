import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, Star, Loader2, PackageX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../lib/useCurrency';

const UserWishlist = () => {
  const { formatPrice } = useCurrency();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      try {
        // Step 1: Fetch the user's wishlist IDs
        const { data: wishlistData, error: wishlistError } = await supabase
          .from('wishlist')
          .select('*')
          .eq('user_id', user.id);

        if (wishlistError) {
          console.error('Error fetching wishlist (table might not exist):', wishlistError);
          setLoading(false);
          return;
        }

        if (wishlistData && wishlistData.length > 0) {
          // Step 2: Extract product IDs
          const productIds = wishlistData.map(item => item.product_id);

          // Step 3: Fetch the corresponding products
          const { data: productsData } = await supabase
            .from('products_secure')
            .select('*')
            .in('id', productIds);

          // Step 4: Merge them manually to avoid Supabase Foreign Key 400 errors
          const validItems = wishlistData.map(item => {
            const productMatch = productsData?.find(p => p.id === item.product_id);
            return {
              ...item,
              product: productMatch || null
            };
          }).filter(item => item.product !== null);

          setWishlist(validItems);
        } else {
          setWishlist([]);
        }
      } catch (err) {
        console.error('Error in wishlist fetching:', err);
      }
    }
    setLoading(false);
  };

  const handleRemoveFromWishlist = async (wishlistId) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistId)
        .eq('user_id', user.id);
        
      if (!error) {
        setWishlist(prev => prev.filter(item => item.id !== wishlistId));
      }
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-heading font-bold text-primary">My Wishlist</h2>
        <p className="text-gray-500 text-xs sm:text-sm">Save your favourite fragrances and collections for later.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-1 md:col-span-2 flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div>
        ) : wishlist.length > 0 ? (
          wishlist.map((item, idx) => {
            const product = item.product || {};
            return (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm flex gap-4 sm:gap-6 group hover:border-secondary transition-all"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                  <img src={product.image_url || 'https://images.unsplash.com/photo-1618365908648-e71bd5716cba?auto=format&fit=crop&q=80&w=200'} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="flex flex-col gap-0.5 sm:gap-1 flex-grow min-w-0">
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400">{product.category || 'Product'}</span>
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-base sm:text-lg font-heading font-bold text-primary hover:text-secondary transition-colors truncate">{product.name || 'Unknown Product'}</h3>
                  </Link>
                  <div className="flex gap-0.5 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={8} fill={i < Math.floor(product.rating || 5) ? "var(--color-secondary)" : "none"} className={i < Math.floor(product.rating || 5) ? "text-secondary" : "text-gray-200"} />
                    ))}
                  </div>
                  <p className="text-base sm:text-lg font-bold text-secondary" style={{ color: 'var(--color-secondary)' }}>{formatPrice(product.price || 0)}</p>
                </div>
                <div className="flex flex-col justify-between items-end shrink-0">
                  <button 
                    onClick={() => handleRemoveFromWishlist(item.id)}
                    className="p-1.5 sm:p-2 text-gray-300 hover:text-red-500 transition-colors active:scale-90"
                  >
                    <Trash2 size={16} className="sm:w-4.5 sm:h-4.5" />
                  </button>
                  <Link to={`/product/${product.id}`} className="p-1.5 sm:p-2 bg-primary text-white rounded-lg hover:bg-primary-light transition-all active:scale-90">
                    <ShoppingCart size={16} className="sm:w-4.5 sm:h-4.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-1 md:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-primary mb-1">Your wishlist is empty</h3>
            <p className="text-sm text-gray-500 mb-6">
              You haven't saved any items yet. Start exploring our collection!
            </p>
            <Link to="/shop" className="btn btn-secondary px-6 py-2 text-sm font-bold">
              Explore Shop
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserWishlist;
