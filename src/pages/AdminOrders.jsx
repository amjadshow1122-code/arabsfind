import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Printer, 
  Truck, 
  CheckCircle2, 
  Clock,
  XCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCurrency } from '../lib/useCurrency';

const AdminOrders = () => {
  const { formatPrice } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [orderDetails, setOrderDetails] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching orders:', error);
    } else if (data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const fetchOrderItems = async (orderId) => {
    setDetailsLoading(true);
    const { data, error } = await supabase
      .from('order_items')
      .select('*, products!fk_order_items_product(name, image_url)')
      .eq('order_id', orderId);
    
    if (!error && data) {
      setOrderDetails(data);
    }
    setDetailsLoading(false);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    
    if (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update status: ' + error.message);
    } else {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    }
    setActiveMenu(null);
  };

  const handlePrintInvoice = async (order) => {
    // 1. Fetch items if we don't have them
    const { data: items, error } = await supabase
      .from('order_items')
      .select('*, products(name)')
      .eq('order_id', order.id);

    if (error || !items) {
      alert('Could not fetch order items for invoice.');
      return;
    }

    // 2. Create printable content
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
            @media print { .no-print { display: none; } }
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
              <div class="label">Billed To</div>
              <div class="value">${order.customer_email}</div>
              <div class="value" style="margin-top: 5px;">${order.shipping_address?.firstName} ${order.shipping_address?.lastName}</div>
              <div class="value">${order.shipping_address?.phone}</div>
            </div>
            <div>
              <div class="label">Shipping Address</div>
              <div class="value">${order.shipping_address?.address}</div>
              <div class="value">${order.shipping_address?.city}, ${order.shipping_address?.country}</div>
              <div class="value">${order.shipping_address?.postalCode || ''}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
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
            <div class="total-row">
              <span class="label">Subtotal</span>
              <span class="value">${formatPrice(order.total_amount)}</span>
            </div>
            <div class="total-row" style="margin-top: 20px;">
              <span class="label" style="font-size: 14px; color: #1a1a1a;">Grand Total</span>
              <span class="value" style="font-size: 24px; color: #d4af37;">${formatPrice(order.total_amount)}</span>
            </div>
          </div>

          <div style="margin-top: 80px; text-align: center; font-size: 12px; color: #999;">
            Thank you for your purchase from Arab Finds. Your heritage treasure is on its way.
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
    fetchOrderItems(order.id);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleExportOrders = () => {
    if (orders.length === 0) return;

    const csvContent = "data:text/csv;charset=utf-8," 
      + "Order ID,Customer Email,Date,Total,Status,Payment Method\n"
      + orders.map(o => `${o.id},${o.customer_email},${new Date(o.created_at).toLocaleString()},${o.total_amount},${o.status},${o.payment_method}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_export_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-600';
      case 'In Transit': return 'bg-blue-100 text-blue-600';
      case 'Processing': return 'bg-yellow-100 text-yellow-600';
      case 'Pending': return 'bg-gray-100 text-gray-600';
      case 'Cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle2 size={12} />;
      case 'In Transit': return <Truck size={12} />;
      case 'Processing': return <Clock size={12} />;
      case 'Pending': return <Clock size={12} />;
      case 'Cancelled': return <XCircle size={12} />;
      default: return <Clock size={12} />;
    }
  };

  const filteredOrders = orders.filter(o => 
    (o.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Orders Management</h1>
          <p className="text-gray-500 text-sm">Track and fulfill your heritage acquisition orders.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportOrders}
            disabled={orders.length === 0}
            className="btn border border-gray-200 text-primary hover:bg-gray-50 px-6 py-2.5 text-xs font-bold gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <Download size={16} />
            Export Orders
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by order ID or customer..." 
            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-primary pl-12 pr-4 py-2.5 rounded-lg text-sm outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-100 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
            <Filter size={16} />
            Filter Status
          </button>
          <div className="h-8 w-[1px] bg-gray-100 mx-2"></div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Showing {filteredOrders.length} Orders</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="overflow-x-visible">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <th className="px-6 py-4">Order Details</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <Loader2 className="w-8 h-8 text-secondary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-primary">#ORD-{order.id.slice(0, 8)}</span>
                        <span className="text-[10px] text-gray-400">{new Date(order.created_at).toLocaleDateString()} • {order.items_count || 0} Items</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-primary">{order.customer_email || 'Guest User'}</span>
                        <span className="text-[10px] text-gray-400">{order.payment_method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit ${getStatusStyles(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-secondary" style={{ color: 'var(--color-secondary)' }}>{formatPrice(order.total_amount)}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleViewDetails(order)}
                          className="p-2 text-gray-400 hover:text-primary transition-colors bg-gray-50 rounded-lg hover:bg-gray-100" 
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handlePrintInvoice(order)}
                          className="p-2 text-gray-400 hover:text-primary transition-colors bg-gray-50 rounded-lg hover:bg-gray-100" 
                          title="Print Invoice"
                        >
                          <Printer size={18} />
                        </button>
                        <div className="relative">
                          <button 
                            onClick={() => setActiveMenu(activeMenu === order.id ? null : order.id)}
                            className="p-2 text-gray-400 hover:text-secondary transition-colors bg-gray-50 rounded-lg hover:bg-gray-100" 
                            title="Change Status"
                          >
                            <MoreVertical size={18} />
                          </button>
                          {activeMenu === order.id && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[50]">
                              {['Pending', 'Processing', 'In Transit', 'Delivered', 'Cancelled'].map((status) => (
                                <button 
                                  key={status}
                                  onClick={() => {
                                    handleUpdateStatus(order.id, status);
                                    setActiveMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-primary transition-all"
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-gray-500 italic text-sm">
                    No orders found in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
              Page 1 of {Math.ceil(filteredOrders.length / 10) || 1}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-50" disabled>
              <ChevronLeft size={18} />
            </button>
            <button className="p-2 border border-gray-100 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-50" disabled>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowDetails(false)}
            className="absolute inset-0 bg-primary/20 backdrop-blur-sm"
          ></motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-2xl rounded-xl shadow-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-primary text-white">
              <div>
                <h3 className="text-xl font-heading font-bold">Order Details</h3>
                <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-1">#ORD-{selectedOrder.id.slice(0, 8)}</p>
              </div>
              <button onClick={() => setShowDetails(false)} className="hover:rotate-90 transition-transform">
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 flex flex-col gap-8">
              {/* Customer & Status */}
              <div className="grid grid-cols-2 gap-8">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Customer Info</span>
                  <p className="text-sm font-bold text-primary">{selectedOrder.customer_email}</p>
                  <p className="text-xs text-gray-500">Method: {selectedOrder.payment_method}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Order Status</span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit ${getStatusStyles(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Shipping Address</span>
                <p className="text-sm text-primary leading-relaxed">
                  {selectedOrder.shipping_address?.firstName} {selectedOrder.shipping_address?.lastName}<br />
                  {selectedOrder.shipping_address?.address}<br />
                  {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.country}<br />
                  <span className="font-bold">Phone: {selectedOrder.shipping_address?.phone}</span>
                </p>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Purchased Items</span>
                <div className="flex flex-col gap-3">
                  {detailsLoading ? (
                    <div className="py-10 flex justify-center">
                      <Loader2 className="animate-spin text-secondary" />
                    </div>
                  ) : orderDetails.map((item) => {
                    const product = item?.['products!fk_order_items_product'] || item?.products;
                    return (
                      <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg">
                        <div className="w-12 h-12 rounded bg-gray-50 overflow-hidden border border-gray-50">
                          <img src={product?.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-primary">{product?.name || 'Product Item'}</p>
                          <p className="text-[10px] text-gray-400">Qty: {item.quantity} × {formatPrice(item.price_at_time || item.price)}</p>
                        </div>
                        <p className="text-sm font-bold text-primary">{formatPrice((item.price_at_time || item.price) * item.quantity)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-50 pt-6 flex justify-between items-center">
                <span className="text-sm font-bold text-primary uppercase tracking-widest">Total Amount</span>
                <span className="text-2xl font-bold text-secondary" style={{ color: 'var(--color-secondary)' }}>{formatPrice(selectedOrder.total_amount)}</span>
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex gap-4">
              <button 
                onClick={() => handleUpdateStatus(selectedOrder.id, 'Cancelled')}
                className="flex-1 py-3 border border-red-100 text-red-500 font-bold uppercase tracking-widest text-[10px] rounded hover:bg-red-50 transition-all"
              >
                Cancel Order
              </button>
              <button 
                onClick={() => handleUpdateStatus(selectedOrder.id, 'Delivered')}
                className="flex-1 btn btn-primary py-3 text-[10px]"
              >
                Mark as Delivered
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
