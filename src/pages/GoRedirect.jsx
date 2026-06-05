import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';

const GoRedirect = () => {
  const { type, id } = useParams(); // type can be 'sale' or 'product'
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const processRedirect = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        let targetUrl = '';
        let merchantId = null;
        let saleId = null;
        let productId = null;

        if (type === 'sale') {
          // Fetch sale details (including gated sale_url which is visible since user is authenticated/this route is gated)
          const { data: sale, error: saleErr } = await supabase
            .from('sales_secure') // Admin/secured table because we want the raw, unmasked URL
            .select('*')
            .eq('id', id)
            .single();

          if (saleErr || !sale) throw new Error('Sale event not found.');
          targetUrl = sale.sale_url;
          merchantId = sale.merchant_id;
          saleId = sale.id;

        } else if (type === 'product') {
          // Fetch product details
          const { data: product, error: prodErr } = await supabase
            .from('products_secure') // Raw secured table
            .select('*')
            .eq('id', id)
            .single();

          if (prodErr || !product) throw new Error('Product not found.');
          if (!product.is_external || !product.external_url) {
            throw new Error('This product is sold directly on our platform and cannot be redirected.');
          }
          targetUrl = product.external_url;
          merchantId = product.merchant_id;
          productId = product.id;
        } else {
          throw new Error('Invalid redirect request.');
        }

        // Fetch merchant template if exists
        const { data: merchant } = await supabase
          .from('merchants')
          .select('affiliate_url_template')
          .eq('id', merchantId)
          .single();

        let finalUrl = targetUrl;
        if (merchant?.affiliate_url_template) {
          finalUrl = merchant.affiliate_url_template.replace('{{link}}', encodeURIComponent(targetUrl));
        }

        // Log the affiliate click
        await supabase.from('affiliate_clicks').insert({
          user_id: session?.user?.id || null,
          sale_id: saleId,
          product_id: productId,
          merchant_id: merchantId,
          referrer_url: document.referrer || null,
          session_id: session?.access_token?.slice(-20) || null
        });

        // 302 client replacement redirect
        window.location.replace(finalUrl);

      } catch (err) {
        console.error('Redirect failed:', err);
        setError(err.message);
      }
    };

    processRedirect();
  }, [type, id]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-heading font-bold mb-2">Redirect Failed</h2>
        <p className="text-gray-500 mb-6 max-w-sm text-sm">{error}</p>
        <button onClick={() => navigate(-1)} className="btn btn-primary text-xs py-2 px-6">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center">
      <Loader2 className="w-10 h-10 text-secondary animate-spin mb-4" />
      <h2 className="text-xl font-heading font-bold text-primary mb-1">Redirecting to Brand</h2>
      <p className="text-xs text-gray-400 font-light">Securing connection & establishing affiliate referral tracking...</p>
    </div>
  );
};

export default GoRedirect;
