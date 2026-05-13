import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Initial fetch of user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load cart on start and user change
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (user) {
        // Fetch from database
        const { data, error } = await supabase
          .from('cart_items')
          .select(`
            id,
            product_id,
            quantity,
            product:products (*)
          `)
          .eq('user_id', user.id);

        if (!error && data) {
          // Format data to match local structure
          const formattedCart = data.map(item => ({
            id: item.id, // item id in cart_items table
            product_id: item.product_id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
            image: item.product.image_url,
            category: item.product.category
          }));
          setCartItems(formattedCart);
        }
      } else {
        // Fetch from localStorage
        const localCart = localStorage.getItem('cart');
        if (localCart) {
          setCartItems(JSON.parse(localCart));
        } else {
          setCartItems([]);
        }
      }
      setLoading(false);
    };

    loadCart();
  }, [user]);

  // Sync localStorage for guest users
  useEffect(() => {
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = async (product, quantity = 1) => {
    try {
      if (user) {
        // Check if item already exists in database
        const { data: existing } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .single();

        if (existing) {
          const newQty = existing.quantity + quantity;
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: newQty })
            .eq('id', existing.id);
          
          if (error) throw error;
          
          setCartItems(prev => prev.map(item => 
            item.product_id === product.id ? { ...item, quantity: newQty } : item
          ));
        } else {
          const { data, error } = await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: product.id,
              quantity: quantity
            })
            .select(`
              id,
              product_id,
              quantity,
              product:products (*)
            `)
            .single();

          if (error) throw error;
          
          if (data) {
            setCartItems(prev => [...prev, {
              id: data.id,
              product_id: data.product_id,
              name: data.product.name,
              price: data.product.price,
              quantity: data.quantity,
              image: data.product.image_url,
              category: data.product.category
            }]);
          }
        }
      } else {
        // Local cart logic
        setCartItems(prev => {
          const existing = prev.find(item => item.product_id === product.id);
          if (existing) {
            return prev.map(item => 
              item.product_id === product.id ? { ...item, quantity: item.quantity + quantity } : item
            );
          }
          return [...prev, {
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: product.image_url,
            category: product.category
          }];
        });
      }
    } catch (err) {
      console.error('Cart Error:', err);
      alert('Failed to add to cart: ' + err.message);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId);
        
        if (error) throw error;
        setCartItems(prev => prev.filter(item => item.id !== itemId));
      } else {
        setCartItems(prev => prev.filter(item => item.product_id !== itemId));
      }
    } catch (err) {
      console.error('Cart Error:', err);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    
    try {
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId);
        
        if (error) throw error;
        setCartItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        ));
      } else {
        setCartItems(prev => prev.map(item => 
          item.product_id === itemId ? { ...item, quantity } : item
        ));
      }
    } catch (err) {
      console.error('Cart Error:', err);
    }
  };

  const clearCart = async () => {
    if (user) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);
    }
    setCartItems([]);
    if (!user) {
      localStorage.removeItem('cart');
    }
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      loading, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      cartCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
      cartTotal: cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    }}>
      {children}
    </CartContext.Provider>
  );
};
