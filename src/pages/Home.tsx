import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  ShoppingBag, 
  CheckCircle2, 
  Lock, 
  ArrowRight, 
  Star, 
  Sparkles,
  Award
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
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-semibold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ระบบตรวจสอบรีวิวจากลูกค้าตัวจริง 100%</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              รีวิวแท้ โปร่งใส <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                ไม่มี Transaction = ไม่มีสิทธิ์รีวิว
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              หมดปัญหารีวิวปลอมและคะแนนจัดตั้ง ทุกรีวิวถูกตรวจสอบสิทธิ์กับประวัติการสั่งซื้อสำเร็จในฐานข้อมูล (Supabase Database Transaction) เท่านั้น
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 transition-all hover:shadow-lg cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>สำรวจสินค้าและรีวิว</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link
                to="/orders"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm shadow-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ดูสินค้าที่เขียนรีวิวได้</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 grid grid-cols-3 gap-4 border-t border-slate-200/60 max-w-xl mx-auto text-center">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center justify-center gap-1">
                  <span>{stats.avgRating}</span>
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">คะแนนเฉลี่ย</p>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {stats.totalReviews > 0 ? stats.totalReviews : 'Real-time'}
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">รีวิวที่บันทึกไว้</p>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                  100%
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">Verified Purchases</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Rules Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl font-bold text-slate-900">
            ระบบทำงานอย่างไรเพื่อป้องกันรีวิวปลอม?
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            มาตรฐานการตรวจสอบความถูกต้อง 4 ขั้นตอนที่ทำงานในระดับฐานข้อมูล PostgreSQL
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1">1. สั่งซื้อสินค้า</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ผู้ใช้ทำรายการสั่งซื้อสินค้าผ่านระบบ และชำระเงินจนสำเร็จ
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1">2. ตรวจสอบสถานะ</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ระบบตรวจสอบว่าคำสั่งซื้อมีสถานะ <span className="font-mono text-emerald-700">completed</span> และมีสินค้านั้นอยู่จริง
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1">3. Database RPC Check</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ฟังก์ชันใน Supabase ตรวจสอบสิทธิ์โดยตรง ปฏิเสธการยิงรีวิวปลอมจาก Frontend ทุกกรณี
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm mb-1">4. ได้รับตรา Verified</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              รีวิวจะได้รับสัญลักษณ์ <span className="text-emerald-700 font-semibold">✓ Verified Customer</span> โดยอัตโนมัติ
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">สินค้าแนะนำ</h2>
            <p className="text-xs text-slate-500 mt-1">สินค้าคุณภาพพร้อมรีวิวที่ผ่านการรับรอง</p>
          </div>
          <Link
            to="/products"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
          >
            <span>ดูสินค้าทั้งหมด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
            <ProductSkeleton />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            ไม่พบรายการสินค้าในขณะนี้ กรุณาเรียกใช้คำสั่ง SQL ใน supabase/schema.sql
          </div>
        )}
      </section>

      {/* Featured Verified Reviews */}
      {featuredReviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-2xl font-bold text-slate-900">รีวิวล่าสุดจากลูกค้าตัวจริง</h2>
                <p className="text-xs text-slate-500">ทุกข้อความได้รับการยืนยันรายการซื้อแล้ว</p>
              </div>
            </div>
            <Link
              to="/products"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
            >
              <span>ดูรีวิวทั้งหมด</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
