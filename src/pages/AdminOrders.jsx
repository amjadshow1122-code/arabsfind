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

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
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
                      <span className="text-sm font-bold text-secondary" style={{ color: 'var(--color-secondary)' }}>${order.total_amount}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-gray-400 hover:text-primary transition-colors" title="View Details">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-primary transition-colors" title="Print Invoice">
                          <Printer size={18} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-secondary transition-colors" title="Manage Order">
                          <MoreVertical size={18} />
                        </button>
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
    </div>
  );
};

export default AdminOrders;
