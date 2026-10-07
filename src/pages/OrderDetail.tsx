import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  PenSquare, 
  ShieldCheck, 
  ShoppingBag,
  Check,
  AlertCircle
} from 'lucide-react';
import { useOrderDetail } from '../hooks/useOrders';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner, ErrorState } from '../components/Loading';
import { QRCodeModal } from '../components/QRCodeModal';
import { formatCurrency, formatDateTime } from '../lib/utils';
import { supabase } from '../lib/supabase';

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAdmin } = useAuth();
  const { order, items, reviewToken, isLoading, error, refetch, requestNewToken } = useOrderDetail(id);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Admin shortcut to toggle order completion for testing
  const handleToggleCompleted = async () => {
    if (!order) return;
    setIsUpdatingStatus(true);
    try {
      const nextStatus = order.status === 'completed' ? 'pending' : 'completed';
      const { error: updErr } = await supabase
        .from('orders')
        .update({
          status: nextStatus,
          payment_status: nextStatus === 'completed' ? 'paid' : 'pending',
          completed_at: nextStatus === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', order.id);

      if (updErr) throw updErr;
      await refetch();
    } catch (err) {
      console.error('handleToggleCompleted error:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleOpenQR = async () => {
    if (!reviewToken) {
      await requestNewToken();
    }
    setQrModalOpen(true);
  };

  if (isLoading) {
    return <LoadingSpinner text="กำลังโหลดข้อมูลคำสั่งซื้อ..." className="min-h-[50vh]" />;
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorState
          title="ไม่พบคำสั่งซื้อนี้"
          message={error || 'คุณอาจไม่มีสิทธิ์เข้าถึง หรือคำสั่งซื้อนี้ไม่มีอยู่ในระบบ'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const isCompleted = order.status === 'completed';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back Link */}
      <Link
        to="/orders"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>กลับไปยังรายการคำสั่งซื้อ</span>
      </Link>

      {/* Order Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
                #{order.order_number}
              </h1>
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Completed
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  {order.status.toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              สั่งซื้อเมื่อ {formatDateTime(order.created_at)}
            </p>
          </div>

          {/* QR Code Action (Available only if order is completed) */}
          {isCompleted && (
            <button
              onClick={handleOpenQR}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>QR Code สำหรับรีวิว</span>
            </button>
          )}
        </div>

        {/* Business Rule Banner */}
        {!isCompleted ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-semibold block">ยังไม่สามารถเขียนรีวิวได้ (No Transaction = No Review)</strong>
              <p className="text-amber-700 leading-relaxed">
                ตามกฎความปลอดภัยของระบบ สิทธิ์การเขียนรีวิวจะปลดล็อกเมื่อสถานะคำสั่งซื้อเป็น <strong>Completed</strong> แล้วเท่านั้น เพื่อให้มั่นใจว่าลูกค้าได้รับสินค้าหรือใช้บริการจริง
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-emerald-800 leading-relaxed">
              คำสั่งซื้อนี้เสร็จสมบูรณ์แล้ว คุณมีสิทธิ์เขียนรีวิวสำหรับสินค้าในรายการนี้ ทุกรีวิวจะได้รับเครื่องหมาย <strong>✓ Verified Customer</strong>
            </p>
          </div>
        )}

        {/* Admin Debug / Test Controls */}
        {isAdmin && (
          <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono">
              [Admin Control: สลับสถานะ Order เพื่อทดสอบเงื่อนไข]
            </span>
            <button
              onClick={handleToggleCompleted}
              disabled={isUpdatingStatus}
              className="px-3 py-1 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {isCompleted ? 'เปลี่ยนเป็น Pending' : 'เปลี่ยนเป็น Completed'}
            </button>
          </div>
        )}

        {/* Order Items Table */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            รายการสินค้าในคำสั่งซื้อ ({items.length})
          </h2>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {item.products?.image_url ? (
                    <img
                      src={item.products.image_url}
                      alt={item.products.name}
                      className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 shrink-0">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
                      {item.products?.name || 'สินค้า'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      จำนวน: {item.quantity} ชิ้น × {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">รวม</span>
                    <span className="text-sm font-bold text-slate-900">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>

                  {/* Review Action */}
                  {isCompleted ? (
                    item.has_reviewed ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        <span>รีวิวแล้ว</span>
                      </span>
                    ) : (
                      <Link
                        to={`/review?product_id=${item.product_id}&order_id=${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <PenSquare className="w-3.5 h-3.5" />
                        <span>เขียนรีวิว</span>
                      </Link>
                    )
                  ) : (
                    <span className="text-xs text-slate-400 italic">
                      รอคำสั่งซื้อสำเร็จ
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Summary */}
        <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-sm font-bold text-slate-900">
          <span>ยอดรวมทั้งสิ้น (Total Amount)</span>
          <span className="text-lg font-black text-emerald-700">
            {formatCurrency(order.total_amount)}
          </span>
        </div>
      </div>

      {/* QR Code Modal */}
      {reviewToken && (
        <QRCodeModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          token={reviewToken}
          orderNumber={order.order_number}
          expiresAt={order.completed_at ? new Date(new Date(order.completed_at).getTime() + 7 * 86400000).toISOString() : undefined}
        />
      )}
    </div>
  );
};
