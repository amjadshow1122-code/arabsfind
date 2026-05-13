import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Search, 
  Filter, 
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../lib/useCurrency';

const UserOrders = () => {
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [orderItems, setOrderItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  const fetchOrderItems = async (orderId) => {
    setItemsLoading(true);
    // Use a more resilient join syntax
    const { data, error } = await supabase
      .from('order_items')
      .select('*, product:products!fk_order_items_product(name, image_url)')
      .eq('order_id', orderId);
    
    if (error) {
      console.error('Error fetching order items:', error);
      // Fallback: try without the join if join fails
      const { data: simpleData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);
      if (simpleData) setOrderItems(simpleData);
    } else if (data) {
      setOrderItems(data);
    }
    setItemsLoading(false);
  };

  const handlePrintInvoice = async (order) => {
    // Fetch items specifically for the invoice
    const { data: items } = await supabase
      .from('order_items')
      .select('*, products(name)')
      .eq('order_id', order.id);

    if (!items) return;

    const printWindow = window.open('', '_blank');
    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice - #ORD-${order.id.slice(0, 8)}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; margin-bottom: 40px; }
            .logo { font-size: 24px; font-weight: bold; color: #1a1a1a; }
            .invoice-info { text-align: right; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .label { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #999; font-weight: bold; margin-bottom: 5px; }
            .value { font-size: 14px; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { text-align: left; background: #f9f9f9; padding: 12px; font-size: 10px; text-transform: uppercase; color: #999; }
            td { padding: 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
            .total-section { text-align: right; border-top: 2px solid #1a1a1a; pt: 20px; }
            .total-row { display: flex; justify-content: flex-end; gap: 40px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">ARAB FINDS</div>
            <div class="invoice-info">
              <div class="label">Invoice Number</div>
              <div class="value">#ORD-${order.id.slice(0, 8)}</div>
              <div class="label" style="margin-top: 10px;">Date</div>
              <div class="value">${new Date(order.created_at).toLocaleDateString()}</div>
            </div>
          </div>
          <div class="grid">
            <div>
              <div class="label">Shipping To</div>
              <div class="value">${order.shipping_address?.firstName} ${order.shipping_address?.lastName}</div>
              <div class="value">${order.shipping_address?.phone}</div>
            </div>
            <div>
              <div class="label">Address</div>
              <div class="value">${order.shipping_address?.address}</div>
              <div class="value">${order.shipping_address?.city}, ${order.shipping_address?.country}</div>
            </div>
          </div>
          <table>
            <thead><tr><th>Description</th><th>Qty</th><th>Price</th><th style="text-align: right;">Total</th></tr></thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.products?.name}</td>
                  <td>${item.quantity}</td>
                  <td>${formatPrice(item.price_at_time || item.price)}</td>
                  <td style="text-align: right;">${formatPrice((item.price_at_time || item.price) * item.quantity)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total-section">
            <div class="total-row"><span class="label">Total</span><span class="value" style="font-size: 24px; color: #d4af37;">${formatPrice(order.total_amount)}</span></div>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  useEffect(() => {
    const fetchUserOrders = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // DIRECT DATABASE QUERY: No client-side filtering
        const { data: userOrders, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              quantity,
              price_at_time,
              products!fk_order_items_product (
                name,
                image_url
              )
            )
          `)
          .or(`customer_email.eq.${user.email},user_id.eq.${user.id}`)
          .order('created_at', { ascending: false });

        if (!error && userOrders) {
          const mappedOrders = userOrders.map(o => {
            const firstItem = o.order_items?.[0];
            const product = firstItem?.['products!fk_order_items_product'] || firstItem?.products;
            const productImage = product?.image_url;
            
            return {
              ...o,
              displayId: `#ORD-${o.id.toString().slice(0, 8)}`,
              date: new Date(o.created_at).toLocaleDateString(),
              items: o.order_items?.length || 0,
              image: productImage || '/placeholder-treasure.jpg'
            };
          });
          
          setOrders(mappedOrders);
        } else if (error) {
          console.error('Database Query Error:', error);
        }
      }
      setLoading(false);
    };

    fetchUserOrders();

    // REAL-TIME SUBSCRIPTION: Listen for status updates
    const subscription = supabase
      .channel('user_orders_changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders' 
        }, 
        (payload) => {
          setOrders(currentOrders => 
            currentOrders.map(order => 
              order.id === payload.new.id 
                ? { ...order, ...payload.new, displayId: `#ORD-${payload.new.id.toString().slice(0, 8)}` } 
                : order
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'In Transit': return <Truck size={14} />;
      case 'Delivered': return <CheckCircle2 size={14} />;
      default: return <Clock size={14} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Transit': return 'bg-blue-50 text-blue-600';
      case 'Delivered': return 'bg-green-50 text-green-600';
      case 'Cancelled': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const filteredOrders = orders.filter(order => 
    order.displayId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    order.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      {/* ... (Header) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-primary">My Orders</h2>
          <p className="text-gray-500 text-xs sm:text-sm">Track your heritage acquisitions and order history.</p>
        </div>
        <div className="relative w-full sm:w-auto">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search Order ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border border-gray-100 pl-12 pr-4 py-3 rounded-lg text-sm outline-none focus:border-secondary w-full sm:w-64"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order, idx) => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:border-secondary transition-all"
            >
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                    <img src={order.image} alt="Product" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-0.5 sm:gap-1">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="text-base sm:text-lg font-bold text-primary">{order.displayId}</span>
                      <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm text-gray-400">Ordered on {order.date} • {order.items} {order.items === 1 ? 'Item' : 'Items'}</span>
                    <span className="text-base sm:text-lg font-bold text-secondary" style={{ color: 'var(--color-secondary)' }}>{formatPrice(order.total_amount)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button 
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowTracking(true);
                    }}
                    className="flex-1 sm:flex-none btn border border-gray-100 text-primary hover:bg-gray-50 px-4 sm:px-6 py-2.5 text-[10px] sm:text-xs font-bold transition-all"
                  >
                    Track
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetails(true);
                      fetchOrderItems(order.id);
                    }}
                    className="flex-1 sm:flex-none btn btn-primary px-4 sm:px-6 py-2.5 text-[10px] sm:text-xs font-bold gap-2 transition-all active:scale-95"
                  >
                    Details
                    <ExternalLink size={12} className="sm:w-3.5 sm:h-3.5" />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 px-4 sm:px-6 py-2.5 sm:py-3 border-t border-gray-50 flex items-center justify-between">
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {order.status === 'Delivered' ? 'Order delivered successfully' : 'Status will update dynamically'}
                </p>
                <button 
                  onClick={() => handlePrintInvoice(order)}
                  className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-secondary hover:underline"
                >
                  Invoice (PDF)
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-primary mb-1">No Orders Found</h3>
            <p className="text-sm text-gray-500">
              {searchTerm ? "No orders match your search query." : "You haven't placed any orders yet."}
            </p>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowDetails(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-lg rounded-xl shadow-2xl relative z-10 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-primary">Order Details {selectedOrder.displayId}</h3>
              <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-primary">✕</button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="flex flex-col gap-4">
                {itemsLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin text-secondary" /></div>
                ) : orderItems.map(item => {
                  const product = item?.product || item?.['products!fk_order_items_product'] || item?.products;
                  return (
                    <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-50 rounded-lg">
                      <img src={product?.image_url || 'https://images.unsplash.com/photo-1618365908648-e71bd5716cba?auto=format&fit=crop&q=80&w=100'} className="w-12 h-12 rounded object-cover" alt="" />
                      <div className="flex-1">
                        <p className="text-sm font-bold">{product?.name || 'Product Item'}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity} × {formatPrice(item.price_at_time || item.price)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-50 flex justify-between items-center">
              <span className="font-bold text-primary">Total Paid</span>
              <span className="text-xl font-bold text-secondary">{formatPrice(selectedOrder.total_amount)}</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Track Order Modal */}
      {showTracking && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowTracking(false)} className="absolute inset-0 bg-primary/20 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-sm rounded-xl shadow-2xl relative z-10 p-6 sm:p-8">
            <h3 className="text-lg sm:text-xl font-bold text-primary mb-6 sm:mb-8 text-center">Track Your Order</h3>
            <div className="flex flex-col gap-6 sm:gap-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
              {[
                { label: 'Order Placed', status: ['Pending', 'Processing', 'In Transit', 'Delivered'] },
                { label: 'Processing', status: ['Processing', 'In Transit', 'Delivered'] },
                { label: 'In Transit', status: ['In Transit', 'Delivered'] },
                { label: 'Delivered', status: ['Delivered'] }
              ].map((step, i) => {
                const isCompleted = step.status.includes(selectedOrder.status);
                return (
                  <div key={i} className="flex items-center gap-4 sm:gap-6 relative z-10">
                    <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'bg-secondary border-secondary text-white' : 'bg-white border-gray-100 text-gray-300'}`}>
                      {isCompleted && <CheckCircle2 size={10} className="sm:w-3 sm:h-3" />}
                    </div>
                    <span className={`text-xs sm:text-sm font-bold ${isCompleted ? 'text-primary' : 'text-gray-300'}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setShowTracking(false)} className="w-full mt-8 sm:mt-10 btn btn-primary py-3 text-sm">Close Tracking</button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
