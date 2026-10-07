import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { 
  Star, 
  ShoppingBag, 
  CheckCircle2, 
  ArrowLeft, 
  Filter, 
  PenSquare, 
  Info
} from 'lucide-react';
import { useProductDetail } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';
import { RatingStars } from '../components/RatingStars';
import { ReviewCard } from '../components/ReviewCard';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { LoadingSpinner, EmptyState, ErrorState } from '../components/Loading';
import { formatCurrency } from '../lib/utils';
import { supabase } from '../lib/supabase';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const location = useLocation();
  const { product, reviews, isLoading, error, refetch } = useProductDetail(id);

  // Review Filter states
  const [filterType, setFilterType] = useState<'all' | 'latest' | 'highest' | 'lowest' | 'verified_only'>('latest');
  
  // Eligibility state for currently logged-in user
  const [eligibleOrderId, setEligibleOrderId] = useState<string | null>(null);

  // Check if current user has an unreviewed completed order for this product
  useEffect(() => {
    async function checkUserEligibility() {
      if (!user || !id) {
        setEligibleOrderId(null);
        return;
      }
      try {
        // Find completed order of this user that contains this product
        const { data: userOrders, error: orderErr } = await supabase
          .from('orders')
          .select(`
            id,
            status,
            order_items!inner(product_id)
          `)
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .eq('order_items.product_id', id);

        if (orderErr || !userOrders || userOrders.length === 0) {
          setEligibleOrderId(null);
          return;
        }

        // For each candidate order, check if user has already reviewed it
        for (const order of userOrders) {
          const { data: existingReview } = await supabase
            .from('reviews')
            .select('id')
            .eq('order_id', order.id)
            .eq('product_id', id)
            .maybeSingle();

          if (!existingReview) {
            setEligibleOrderId(order.id);
            return;
          }
        }

        setEligibleOrderId(null);
      } catch (err) {
        console.warn('checkUserEligibility error:', err);
      }
    }

    checkUserEligibility();
  }, [user, id, reviews]);

  // Rating Distribution Calculation
  const ratingDistribution = useMemo(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
      distribution[star] += 1;
    });
    return distribution;
  }, [reviews]);

  // Filtered and Sorted Reviews
  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    if (filterType === 'verified_only') {
      result = result.filter((r) => r.is_verified);
    }

    switch (filterType) {
      case 'highest':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        result.sort((a, b) => a.rating - b.rating);
        break;
      case 'latest':
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return result;
  }, [reviews, filterType]);

  if (isLoading) {
    return <LoadingSpinner text="กำลังโหลดรายละเอียดสินค้าและรีวิว..." className="min-h-[50vh]" />;
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorState
          title="ไม่พบสินค้านี้"
          message={error || 'สินค้าอาจถูกลบหรือไม่มีอยู่ในระบบ'}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Back button */}
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>กลับไปหน้ารวมสินค้า</span>
      </Link>

      {/* Product Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-pink-100 shadow-xs">
        {/* Product Image */}
        <div className="aspect-square rounded-3xl p-8 bg-gradient-to-tr from-pink-50 via-white to-pink-50/30 border border-pink-100 flex items-center justify-center relative overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-3/4 h-3/4 object-contain drop-shadow-md"
              onError={(e) => {
                e.currentTarget.src = '/images/logo.jpg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-pink-300">
              <ShoppingBag className="w-20 h-20 stroke-[1.5]" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <VerifiedBadge size="sm" variant="badge" />
              <span className="text-xs text-slate-500">บัญชีแท้ 100% รับประกันการใช้งาน</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight font-heading">
              {product.name}
            </h1>

            <div className="flex items-center gap-3">
              <RatingStars rating={product.average_rating || 0} size="md" />
              <span className="text-sm font-bold text-slate-800">
                {(product.average_rating || 0).toFixed(1)}
              </span>
              <span className="text-xs text-slate-500">
                ({product.review_count || 0} รีวิวจากลูกค้าจริง)
              </span>
            </div>

            <div className="text-3xl font-black text-pink-600 pt-1 font-heading">
              {formatCurrency(product.price)}
              <span className="text-xs text-slate-400 font-normal ml-2 font-sans">
                (ราคาปลีกสุดคุ้ม)
              </span>
            </div>

            <div className="border-t border-pink-50 pt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-heading">
                รายละเอียดแพ็กเกจ
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
              </p>
            </div>

            {/* Quick Order via LINE Action */}
            <div className="pt-2">
              <a
                href={`https://line.me/ti/p/~@bastore?text=${encodeURIComponent('สนใจสั่งซื้อ ' + product.name)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-2xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <span>สั่งซื้อแพ็กเกจนี้ผ่าน LINE (@bastore)</span>
              </a>
            </div>
          </div>

          {/* Verification Eligibility Banner */}
          <div className="pt-4 border-t border-pink-100">
            {eligibleOrderId ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900 font-heading">
                      คุณมีสิทธิ์เขียนรีวิวสำหรับแอพนี้!
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      พบคำสั่งซื้อที่เสร็จสมบูรณ์แล้วในระบบ
                    </p>
                  </div>
                </div>
                <Link
                  to={`/review?product_id=${product.id}&order_id=${eligibleOrderId}`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                >
                  <PenSquare className="w-3.5 h-3.5" />
                  <span>เขียนรีวิวเลย</span>
                </Link>
              </div>
            ) : user ? (
              <div className="p-3.5 rounded-2xl bg-pink-50/50 border border-pink-100 text-slate-600 flex items-start gap-2.5 text-xs">
                <Info className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                <p>
                  เฉพาะลูกค้าที่เคยสั่งซื้อสินค้านี้และคำสั่งซื้อเสร็จสมบูรณ์แล้วเท่านั้นจึงจะสามารถเขียนรีวิวได้ (No Transaction = No Review)
                </p>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-pink-50/50 border border-pink-100 text-slate-600 flex items-center justify-between gap-2 text-xs">
                <span>เข้าสู่ระบบเพื่อตรวจสอบสิทธิ์การเขียนรีวิว</span>
                <Link to="/login" state={{ from: location }} className="font-bold text-pink-600 hover:text-pink-700">
                  เข้าสู่ระบบ &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ratings & Reviews Section */}
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-pink-100 pb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 font-heading">รีวิวจากลูกค้าตัวจริง</h2>
            <p className="text-xs text-slate-500 mt-1">
              ความคิดเห็นทั้งหมดจากผู้ซื้อที่มีรายการสั่งซื้อจริงในระบบ 100%
            </p>
          </div>

          {/* Filter options */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" /> กรองรีวิว:
            </span>
            <button
              onClick={() => setFilterType('latest')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filterType === 'latest'
                  ? 'bg-pink-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-pink-50 border border-pink-100'
              }`}
            >
              ล่าสุด
            </button>
            <button
              onClick={() => setFilterType('highest')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filterType === 'highest'
                  ? 'bg-pink-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-pink-50 border border-pink-100'
              }`}
            >
              คะแนนสูงสุด
            </button>
            <button
              onClick={() => setFilterType('lowest')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filterType === 'lowest'
                  ? 'bg-pink-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-pink-50 border border-pink-100'
              }`}
            >
              คะแนนต่ำสุด
            </button>
            <button
              onClick={() => setFilterType('verified_only')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                filterType === 'verified_only'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              ✓ Verified Only
            </button>
          </div>
        </div>

        {/* Rating Breakdown Summary Bar */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Average score big */}
          <div className="text-center md:border-r md:border-slate-100 md:pr-6">
            <div className="text-5xl font-extrabold text-slate-900 leading-none">
              {(product.average_rating || 0).toFixed(1)}
            </div>
            <div className="my-2 flex justify-center">
              <RatingStars rating={product.average_rating || 0} size="md" />
            </div>
            <p className="text-xs text-slate-500">
              อ้างอิงจาก {reviews.length} รีวิวที่ผ่านการยืนยัน
            </p>
          </div>

          {/* Rating Bars Distribution */}
          <div className="md:col-span-2 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star as keyof typeof ratingDistribution];
              const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-12 text-slate-600 font-medium">
                    <span>{star}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  </div>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-slate-400 font-mono">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <EmptyState
            title="ยังไม่มีรีวิวสำหรับเงื่อนไขนี้"
            description="ลูกค้าที่เคยสั่งซื้อสินค้านี้สามารถเขียนรีวิวได้หลังจากคำสั่งซื้อสำเร็จ"
          />
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((rev) => (
              <ReviewCard
                key={rev.id}
                review={rev}
                showProductInfo={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
