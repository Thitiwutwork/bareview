import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { LoadingSpinner } from '../components/Loading';
import type { Order } from '../types/database';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id(id, full_name, email),
          order_items(*, products(*))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data as Order[]) || []);
    } catch (err) {
      console.error('fetchOrders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const isCompleted = newStatus === 'completed';
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          payment_status: isCompleted ? 'paid' : 'pending',
          completed_at: isCompleted ? new Date().toISOString() : null,
        })
        .eq('id', orderId);

      if (error) throw error;
      await fetchOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการปรับสถานะ';
      alert(msg);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchSearch =
      o.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.profiles?.email && o.profiles.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.profiles?.full_name && o.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">รายการคำสั่งซื้อทั้งหมด (Orders)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดการสถานะการสั่งซื้อ เมื่อสถานะเป็น Completed ลูกค้าจะได้รับสิทธิ์เขียนรีวิว
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="ค้นหา Order No. หรืออีเมล..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
          >
            <option value="all">สถานะทั้งหมด</option>
            <option value="completed">Completed (มีสิทธิ์รีวิว)</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="กำลังโหลดคำสั่งซื้อ..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">Order Number</th>
                  <th className="p-4">ลูกค้า (Customer)</th>
                  <th className="p-4">รายการสินค้า</th>
                  <th className="p-4">ยอดรวม</th>
                  <th className="p-4">สถานะคำสั่งซื้อ</th>
                  <th className="p-4 text-right">ปรับเปลี่ยนสถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-slate-900">
                      #{o.order_number}
                      <div className="text-[11px] text-slate-400 font-sans font-normal">
                        {formatDateTime(o.created_at)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">
                        {o.profiles?.full_name || 'ลูกค้า'}
                      </div>
                      <div className="text-slate-400 text-[11px]">{o.profiles?.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {(o.order_items || []).map((item) => (
                          <div key={item.id} className="text-[11px] text-slate-700">
                            • {item.products?.name || 'สินค้า'} (x{item.quantity})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {formatCurrency(o.total_amount)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          o.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : o.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {o.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {o.status === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                        <span>{o.status.toUpperCase()}</span>
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                        className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white cursor-pointer font-medium"
                      >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed (Unlock Review)</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
