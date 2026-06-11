import React, { useState, useEffect } from 'react';
import { ArrowUpRight, BarChart3, Calendar, Download, Eye, FileText, Globe, Loader2, RefreshCw, ShoppingBag, Tag, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminClicks = () => {
  const [clicks, setClicks] = useState([]);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClickLogs = async () => {
    setLoading(true);
    // Fetch clicks
    const { data: clickLogs } = await supabase
      .from('affiliate_clicks')
      .select('*')
      .order('clicked_at', { ascending: false });
    
    if (clickLogs) setClicks(clickLogs);

    // Fetch details
    const { data: s } = await supabase.from('sales_secure').select('id, title');
    const { data: p } = await supabase.from('products_secure').select('id, name');
    const { data: m } = await supabase.from('merchants').select('id, name');

    if (s) setSales(s);
    if (p) setProducts(p);
    if (m) setMerchants(m);

    setLoading(false);
  };

  useEffect(() => {
    fetchClickLogs();
  }, []);

  const getMerchantName = (id) => merchants.find(m => m.id === id)?.name || 'Boutique';
  const getEntityName = (click) => {
    if (click.sale_id) {
      return `Sale: ${sales.find(s => s.id === click.sale_id)?.title || 'Sale Event'}`;
    } else if (click.product_id) {
      return `Product: ${products.find(p => p.id === click.product_id)?.name || 'Catalog Item'}`;
    }
    return 'Direct Outbound';
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Click ID,Merchant,Referrer Destination,Timestamp,Referrer Source,Session Token\n"
      + clicks.map(c => `${c.id},"${getMerchantName(c.merchant_id)}","${getEntityName(c)}",${c.clicked_at},"${c.referrer_url || ''}","${c.session_id || ''}"`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `affiliate_outbound_clicks_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  // Stats Breakdown
  const totalClicks = clicks.length;
  const uniqueSessions = new Set(clicks.map(c => c.session_id).filter(Boolean)).size;
  const saleClicks = clicks.filter(c => c.sale_id).length;
  const productClicks = clicks.filter(c => c.product_id).length;

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">Affiliate Click Tracking</h1>
          <p className="text-gray-500 text-sm">Monitor outbound conversion redirects and reconcile commission logs.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchClickLogs}
            className="btn bg-gray-100 hover:bg-gray-200 text-primary text-xs py-2.5 px-5 gap-2 flex items-center"
          >
            <RefreshCw size={14} /> Refresh Logs
          </button>
          <button 
            onClick={handleExport}
            disabled={clicks.length === 0}
            className="btn btn-secondary py-2.5 px-6 gap-2 text-xs font-bold flex items-center"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2">Total Clicks</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-primary">{totalClicks}</span>
            <span className="text-xs font-bold text-green-500 flex items-center gap-0.5"><ArrowUpRight size={14} /> 100%</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2">Unique Visitors</span>
          <span className="text-3xl font-bold text-primary">{uniqueSessions}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2">Sales Clicks</span>
          <span className="text-3xl font-bold text-secondary">{saleClicks}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-2">Products Clicks</span>
          <span className="text-3xl font-bold text-primary">{productClicks}</span>
        </div>
      </div>

      {/* Grid List */}
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b">
              <th className="px-6 py-4">Click ID</th>
              <th className="px-6 py-4">Boutique</th>
              <th className="px-6 py-4">Direct Destination</th>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Session Key</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-secondary" />
                </td>
              </tr>
            ) : clicks.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-400 italic text-sm">No click logs captured yet. Clicks are logged during direct redirections.</td>
              </tr>
            ) : (
              clicks.map((click) => (
                <tr key={click.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-xs font-bold text-primary">#CLK-{click.id}</td>
                  <td className="px-6 py-4 text-xs text-gray-600 font-bold">{getMerchantName(click.merchant_id)}</td>
                  <td className="px-6 py-4 text-xs font-medium text-gray-500">{getEntityName(click)}</td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(click.clicked_at).toLocaleString('en-AU', { timeZone: '/Sydney' })}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-gray-400">{click.session_id ? `...${click.session_id}` : 'Anonymous'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminClicks;
