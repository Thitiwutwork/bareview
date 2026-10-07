import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { LoadingSpinner, EmptyState, ErrorState } from '../components/Loading';
import { formatCurrency, formatDate } from '../lib/utils';
import type { OrderStatus } from '../types/database';

export const Orders: React.FC = () => {
  const { orders, isLoading, error, refetch } = useOrders();

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          คำสั่งซื้อของฉัน
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          ประวัติคำสั่งซื้อทั้งหมด สิทธิ์การเขียนรีวิวจะเปิดใช้งานเมื่อคำสั่งซื้อมีสถานะ Completed
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner text="กำลังโหลดรายการคำสั่งซื้อ..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8" />}
          title="ยังไม่มีประวัติการสั่งซื้อ"
          description="เมื่อคุณสั่งซื้อสินค้า รายการคำสั่งซื้อจะปรากฏที่นี่"
          action={{
            label: 'เริ่มช้อปปิ้ง',
            onClick: () => (window.location.href = '/products'),
          }}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.order_items?.length || 0;
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      #{order.order_number}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span>วันที่สั่ง: {formatDate(order.created_at)}</span>
                    {order.completed_at && (
                      <span className="text-emerald-700">
                        สำเร็จเมื่อ: {formatDate(order.completed_at)}
                      </span>
                    )}
                    <span>{itemCount} รายการสินค้า</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">ยอดรวมทั้งสิ้น</span>
                    <span className="text-base font-extrabold text-slate-900">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>

                  <Link
                    to={`/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <span>ดูรายละเอียด</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
