import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShoppingBag, 
  ArrowRight, 
  Star, 
  Sparkles, 
  Zap, 
  Clock, 
  HeartHandshake, 
  MessageCircle
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { ReviewCard } from '../components/ReviewCard';
import { ProductSkeleton } from '../components/Loading';
import { supabase } from '../lib/supabase';
import type { Review } from '../types/database';

export const Home: React.FC = () => {
  const { products, isLoading: productsLoading } = useProducts();
  const [featuredReviews, setFeaturedReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({
    avgRating: 4.9,
    totalReviews: 0,
    verifiedPercent: 100,
  });

  useEffect(() => {
    async function loadStatsAndFeaturedReviews() {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            profiles:user_id(id, full_name, email, avatar_url),
            products:product_id(id, name, image_url, price),
            orders:order_id(id, order_number, completed_at, created_at),
            replies:review_replies(*)
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(4);

        if (!error && data) {
          setFeaturedReviews(data as Review[]);
          
          const total = data.length;
          if (total > 0) {
            const sum = data.reduce((acc, curr) => acc + curr.rating, 0);
            setStats({
              avgRating: Number((sum / total).toFixed(1)),
              totalReviews: total,
              verifiedPercent: 100,
            });
          }
        }
      } catch (err) {
        console.warn('Home fetch stats error:', err);
      }
    }

    loadStatsAndFeaturedReviews();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Announcement Bar (from BA STORE) */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white text-xs py-2 px-4 shadow-xs overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-center font-medium">
          <span className="flex items-center gap-1.5 animate-pulse">
            <Zap className="w-3.5 h-3.5" />
            <span>⚡ จัดส่งรวดเร็วทันใจภายใน 5 - 15 นาที • รับประกันดูแลตลอดการใช้งาน • รีวิวแท้จากลูกค้าตัวจริง 100%</span>
          </span>
        </div>
      </div>

      {/* 2. Store Hero & Banner Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden border border-pink-200/80 shadow-md bg-white">
          {/* Cover Banner */}
          <div className="h-44 sm:h-64 lg:h-72 w-full overflow-hidden bg-gradient-to-r from-pink-200 to-rose-100 relative">
            <img
              src="/images/banner.jpg"
              alt="BA STORE Banner"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                // Fallback elegant gradient if banner.jpg is not yet loaded
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full text-xs font-bold text-pink-700 shadow-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ร้านค้าแท้ 100% มีใบเสร็จยืนยัน</span>
            </div>
          </div>

          {/* Profile Card & Store Introduction */}
          <div className="p-6 sm:p-8 relative pt-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-pink-100 shrink-0">
                  <img
                    src="/images/logo.jpg"
                    alt="BA STORE"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
                      BA STORE
                    </h1>
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Store
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-pink-600 font-bold font-heading">
                    จำหน่ายแอพพรีเมียม ราคาปลีก • รีวิวจากลูกค้าจริง 100%
                  </p>
                  <p className="text-xs text-slate-500">
                    ขายแอพพรีเมียมราคาปลีกสุดคุ้ม 💖 ได้วันใช้งานครบแน่นอน ดูแลตลอดการใช้งาน
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <a
                  href="https://line.me/ti/p/~@bastore"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>LINE: @bastore</span>
                </a>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ดูแอพทั้งหมด</span>
                </Link>
              </div>
            </div>

            {/* 3 Guarantee Badges (From BA STORE specification) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-pink-100">
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-pink-50/60 border border-pink-100">
                <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">ได้วันใช้งานครบ 100%</div>
                  <div className="text-[11px] text-slate-500">ของแท้ ปลอดภัย ไม่เด้ง</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-pink-50/60 border border-pink-100">
                <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">จัดส่งไว 5-15 นาที</div>
                  <div className="text-[11px] text-slate-500">เปิดบริการ 09:00 - 23:00 น.</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-pink-50/60 border border-pink-100">
                <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800">ดูแลตลอดการใช้งาน</div>
                  <div className="text-[11px] text-slate-500">มีทีมงานคอยบริการตลอด</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Core Trust Rule Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-pink-50 p-6 rounded-3xl border border-emerald-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>การันตีความโปร่งใส 100%</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
              เฉพาะลูกค้าที่สั่งซื้อจริงเท่านั้น จึงจะเขียนรีวิวได้
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              ระบบตรวจสอบประวัติคำสั่งซื้อสำเร็จ (Completed Order) ในฐานข้อมูลโดยตรง ป้องกันรีวิวปลอมและคะแนนปั่น เพื่อให้คุณเลือกซื้อแอพพรีเมียมได้อย่างมั่นใจที่สุด
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-center bg-white px-5 py-3 rounded-2xl border border-emerald-100 shadow-xs">
              <div className="text-2xl font-black text-slate-900 flex items-center justify-center gap-1 font-heading">
                <span>{stats.avgRating}</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">คะแนนเฉลี่ย</p>
            </div>
            <div className="text-center bg-white px-5 py-3 rounded-2xl border border-emerald-100 shadow-xs">
              <div className="text-2xl font-black text-emerald-600 font-heading">
                100%
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Verified Buyers</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Products Catalog (BA STORE Apps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 font-heading">
              แอพพรีเมียมยอดนิยม (Popular Subscriptions)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              เลือกดูราคา รายละเอียด และรีวิวจากลูกค้าที่ใช้งานจริง
            </p>
          </div>
          <Link
            to="/products"
            className="text-xs font-bold text-pink-600 hover:text-pink-700 inline-flex items-center gap-1 font-heading"
          >
            <span>ดูทั้งหมด ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-pink-100 text-slate-500 text-xs">
            ไม่พบรายการแอพในขณะนี้ กรุณารันคำสั่งใน supabase/schema.sql
          </div>
        )}
      </section>

      {/* 5. Featured Verified Customer Reviews */}
      {featuredReviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              <div>
                <h2 className="text-2xl font-black text-slate-900 font-heading">
                  รีวิวล่าสุดจากลูกค้าตัวจริง
                </h2>
                <p className="text-xs text-slate-500">
                  ทุกข้อความยืนยันจากประวัติการสั่งซื้อจริงในระบบ (Verified Purchase)
                </p>
              </div>
            </div>
            <Link
              to="/products"
              className="text-xs font-bold text-pink-600 hover:text-pink-700 inline-flex items-center gap-1 font-heading"
            >
              <span>ดูรีวิวทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredReviews.map((rev) => (
              <ReviewCard
                key={rev.id}
                review={rev}
                showProductInfo={true}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
