import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  CheckCircle, 
  PenSquare, 
  Star, 
  ShoppingBag, 
  Clock, 
  ArrowRight,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useOrders } from '../hooks/useOrders';
import { useReviews } from '../hooks/useReviews';
import { ReviewCard } from '../components/ReviewCard';
import { LoadingSpinner, EmptyState } from '../components/Loading';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import type { Review } from '../types/database';

interface ReviewableItem {
  orderId: string;
  orderNumber: string;
  completedAt: string;
  productId: string;
  productName: string;
  productImage: string | null;
  productPrice: number;
}

export const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const { orders, isLoading: ordersLoading, refetch: refetchOrders } = useOrders();
  const { deleteReview } = useReviews();

  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewableItems, setReviewableItems] = useState<ReviewableItem[]>([]);
  const [isCreatingDemoOrder, setIsCreatingDemoOrder] = useState(false);
  const [demoOrderMessage, setDemoOrderMessage] = useState<string | null>(null);

  // Fetch reviews written by current user
  const fetchMyReviews = async () => {
    if (!user) return;
    try {
      setReviewsLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id(id, full_name, email),
          products:product_id(id, name, image_url, price),
          orders:order_id(id, order_number, created_at, completed_at),
          replies:review_replies(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMyReviews(data as Review[]);
      }
    } catch (err) {
      console.warn('fetchMyReviews error:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReviews();
  }, [user]);

  // Compute reviewable products from completed orders
  useEffect(() => {
    if (!orders || orders.length === 0) {
      setReviewableItems([]);
      return;
    }

    const reviewedKeys = new Set(myReviews.map((r) => `${r.order_id}_${r.product_id}`));
    const items: ReviewableItem[] = [];

    orders
      .filter((o) => o.status === 'completed')
      .forEach((ord) => {
        (ord.order_items || []).forEach((item) => {
          const key = `${ord.id}_${item.product_id}`;
          if (!reviewedKeys.has(key) && item.products) {
            items.push({
              orderId: ord.id,
              orderNumber: ord.order_number,
              completedAt: ord.completed_at || ord.created_at,
              productId: item.product_id,
              productName: item.products.name,
              productImage: item.products.image_url,
              productPrice: item.price,
            });
          }
        });
      });

    setReviewableItems(items);
  }, [orders, myReviews]);

  // Quick helper to create real orders in Supabase for testing (Pending or Completed)
  const handleCreateTestOrder = async (orderStatus: 'pending' | 'completed') => {
    if (!user) return;
    setIsCreatingDemoOrder(true);
    setDemoOrderMessage(null);

    try {
      // Pick the first available product
      const { data: prods } = await supabase.from('products').select('*').limit(2);
      if (!prods || prods.length === 0) {
        setDemoOrderMessage('ไม่พบสินค้าในระบบ กรุณารัน schema.sql ก่อน');
        return;
      }

      const selectedProd = prods[0];
      const ordNum = `ORD-${Date.now().toString().slice(-6)}`;

      // 1. Insert order
      const { data: newOrder, error: ordErr } = await supabase
        .from('orders')
        .insert({
          order_number: ordNum,
          user_id: user.id,
          total_amount: selectedProd.price,
          status: orderStatus,
          payment_status: orderStatus === 'completed' ? 'paid' : 'pending',
          completed_at: orderStatus === 'completed' ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (ordErr) throw ordErr;

      // 2. Insert order items
      const { error: itemErr } = await supabase.from('order_items').insert({
        order_id: newOrder.id,
        product_id: selectedProd.id,
        quantity: 1,
        price: selectedProd.price,
      });

      if (itemErr) throw itemErr;

      // 3. Insert audit log
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'CREATE_ORDER',
        description: `Created test order ${ordNum} with status ${orderStatus}`,
      });

      setDemoOrderMessage(
        `สร้างคำสั่งซื้อ ${ordNum} (สถานะ: ${orderStatus}) เรียบร้อยแล้ว!`
      );
      await refetchOrders();
      await fetchMyReviews();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ';
      setDemoOrderMessage(`Error: ${msg}`);
    } finally {
      setIsCreatingDemoOrder(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรีวิวนี้?')) return;
    const res = await deleteReview(reviewId);
    if (res.success) {
      await fetchMyReviews();
      await refetchOrders();
    }
  };

  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'completed').length;
  const reviewsWritten = myReviews.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/60 border border-pink-300/40 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>BA STORE Customer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-heading">
            สวัสดี, {profile?.full_name || user?.email}
          </h1>
          <p className="text-pink-100 text-xs sm:text-sm leading-relaxed">
            ยินดีต้อนรับสู่แดชบอร์ดตรวจสอบสิทธิ์การรีวิว คุณสามารถดูประวัติคำสั่งซื้อและเขียนรีวิวที่มีเครื่องหมาย Verified Customer ได้ที่นี่
          </p>
        </div>

        {/* Quick Testing Order Generator Button in Corner */}
        <div className="mt-6 pt-4 border-t border-pink-300/40 flex flex-wrap items-center gap-3 relative z-10">
          <span className="text-xs text-pink-100 font-semibold">เครื่องมือทดสอบระบบ:</span>
          <button
            onClick={() => handleCreateTestOrder('completed')}
            disabled={isCreatingDemoOrder}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 border border-white/30"
            title="ทดสอบ Scenario 3: คำสั่งซื้อ Completed -> มีสิทธิ์รีวิว"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-300" />
            <span>+ สร้าง Order ที่สำเร็จแล้ว (Completed)</span>
          </button>
          <button
            onClick={() => handleCreateTestOrder('pending')}
            disabled={isCreatingDemoOrder}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black/20 hover:bg-black/30 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 border border-white/20"
            title="ทดสอบ Scenario 2: คำสั่งซื้อ Pending -> ต้องไม่มีสิทธิ์รีวิว"
          >
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span>+ สร้าง Order รอดำเนินการ (Pending)</span>
          </button>
        </div>

        {demoOrderMessage && (
          <div className="mt-3 p-2.5 rounded-lg bg-white/15 backdrop-blur-xs text-xs text-white flex items-center gap-2 border border-white/20">
            <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{demoOrderMessage}</span>
          </div>
        )}
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{totalOrders}</div>
            <p className="text-xs text-slate-500 font-medium">คำสั่งซื้อทั้งหมด</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">{completedOrders}</div>
            <p className="text-xs text-slate-500 font-medium">Completed Orders</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
            <PenSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-teal-600">{reviewableItems.length}</div>
            <p className="text-xs text-slate-500 font-medium">สินค้าที่รอรีวิว</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600">{reviewsWritten}</div>
            <p className="text-xs text-slate-500 font-medium">รีวิวที่เขียนแล้ว</p>
          </div>
        </div>
      </div>

      {/* Reviewable Products Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenSquare className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">สินค้าที่คุณสามารถเขียนรีวิวได้</h2>
          </div>
          <span className="text-xs text-slate-500">
            {reviewableItems.length} รายการ
          </span>
        </div>

        {ordersLoading ? (
          <LoadingSpinner text="กำลังตรวจสอบสิทธิ์การรีวิว..." />
        ) : reviewableItems.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag className="w-7 h-7" />}
            title="ไม่มีสินค้าที่รอการรีวิว"
            description="คุณได้รีวิวสินค้าที่ซื้อทั้งหมดแล้ว หรือยังไม่มีคำสั่งซื้อที่เสร็จสมบูรณ์"
            action={{
              label: 'เลือกดูสินค้าเพื่อสั่งซื้อ',
              onClick: () => (window.location.href = '/products'),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviewableItems.map((item) => (
              <div
                key={`${item.orderId}_${item.productId}`}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-emerald-300 transition-colors flex flex-col justify-between"
              >
                <div className="flex items-center gap-3 mb-3">
                  {item.productImage ? (
                    <img
                      src={item.productImage}
                      alt={item.productName}
                      className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 shrink-0">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {item.productName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {formatCurrency(item.productPrice)}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Order #{item.orderNumber}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> ยืนยันการสั่งซื้อแล้ว
                  </span>
                  <Link
                    to={`/review?product_id=${item.productId}&order_id=${item.orderId}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>เขียนรีวิว</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews Written by User */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900">รีวิวทั้งหมดของคุณ</h2>
          </div>
          <span className="text-xs text-slate-500">
            {myReviews.length} รีวิว
          </span>
        </div>

        {reviewsLoading ? (
          <LoadingSpinner text="กำลังโหลดรีวิวของคุณ..." />
        ) : myReviews.length === 0 ? (
          <EmptyState
            title="คุณยังไม่ได้เขียนรีวิวใดๆ"
            description="เมื่อคุณสั่งซื้อสินค้าและได้รับของแล้ว สามารถมาแบ่งปันประสบการณ์จริงได้ที่นี่"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myReviews.map((rev) => (
              <ReviewCard
                key={rev.id}
                review={rev}
                showProductInfo={true}
                onDelete={handleDeleteReview}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
