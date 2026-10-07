import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShoppingBag, 
  ArrowLeft,
  X
} from 'lucide-react';
import { RatingStars } from '../components/RatingStars';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { LoadingSpinner } from '../components/Loading';
import { useAuth } from '../hooks/useAuth';
import { useReviews } from '../hooks/useReviews';
import { supabase, uploadImage } from '../lib/supabase';
import { formatCurrency } from '../lib/utils';
import type { Product, Order } from '../types/database';

const reviewFormSchema = z.object({
  rating: z.number().min(1, 'กรุณาให้คะแนนอย่างน้อย 1 ดาว').max(5, 'คะแนนสูงสุด 5 ดาว'),
  comment: z
    .string()
    .min(5, 'ความคิดเห็นต้องมีความยาวอย่างน้อย 5 ตัวอักษร')
    .max(1000, 'ความคิดเห็นต้องไม่เกิน 1,000 ตัวอักษร'),
});

type ReviewFormData = z.infer<typeof reviewFormSchema>;

export const Review: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submitVerifiedReview, submitReviewByToken, isSubmitting } = useReviews();

  const tokenParam = searchParams.get('token');
  const productIdParam = searchParams.get('product_id');
  const orderIdParam = searchParams.get('order_id');

  // Verification state from backend
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [tokenEligibleItems, setTokenEligibleItems] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>(productIdParam || '');

  // Form states
  const [rating, setRating] = useState<number>(5);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 5,
      comment: '',
    },
  });

  // Verify authorization & backend transaction on mount
  useEffect(() => {
    async function verifyBackendEligibility() {
      setIsVerifying(true);
      setVerificationError(null);

      try {
        if (tokenParam) {
          // Token Verification RPC
          const { data: tokenResult, error: tokenErr } = await supabase.rpc('verify_review_token', {
            p_token: tokenParam,
          });

          if (tokenErr) throw tokenErr;
          if (!tokenResult || !tokenResult.valid) {
            setVerificationError(tokenResult?.error || 'Token ไม่ถูกต้องหรือหมดอายุแล้ว');
            return;
          }

          // User must match token user
          if (user && user.id !== tokenResult.user_id) {
            setVerificationError('คุณไม่มีสิทธิ์เข้าถึง Token นี้ (เป็นของบัญชีอื่น)');
            return;
          }

          const eligible = (tokenResult.items || []).filter((item: any) => !item.has_reviewed);
          if (eligible.length === 0) {
            setVerificationError('สินค้าทุกชิ้นในคำสั่งซื้อนี้ได้รับการรีวิวไปแล้ว');
            return;
          }

          setTokenEligibleItems(eligible);
          const firstItem = eligible[0];
          setSelectedProductId(firstItem.product_id);

          // Fetch full product info
          const { data: pData } = await supabase
            .from('products')
            .select('*')
            .eq('id', firstItem.product_id)
            .single();

          if (pData) setProduct(pData as Product);
        } else if (productIdParam && orderIdParam) {
          // Direct Product & Order verification
          if (!user) {
            setVerificationError('กรุณาเข้าสู่ระบบก่อนทำการเขียนรีวิว');
            return;
          }

          // 1. Fetch Order and check status + user_id
          const { data: oData, error: oErr } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderIdParam)
            .single();

          if (oErr || !oData) {
            setVerificationError('ไม่พบคำสั่งซื้อที่ระบุ');
            return;
          }

          if (oData.user_id !== user.id) {
            setVerificationError('การเข้าถึงถูกปฏิเสธ: คำสั่งซื้อนี้ไม่ใช่ของคุณ');
            return;
          }

          if (oData.status !== 'completed') {
            setVerificationError(
              `ไม่สามารถรีวิวได้: คำสั่งซื้อยังไม่สำเร็จ (สถานะปัจจุบัน: ${oData.status}) ตามกฎ No Transaction = No Review`
            );
            return;
          }

          // 2. Check if product is in order items
          const { data: itemData } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderIdParam)
            .eq('product_id', productIdParam)
            .maybeSingle();

          if (!itemData) {
            setVerificationError('สินค้านี้ไม่ได้อยู่ในคำสั่งซื้อที่คุณระบุ');
            return;
          }

          // 3. Check if already reviewed
          const { data: existingRev } = await supabase
            .from('reviews')
            .select('id')
            .eq('order_id', orderIdParam)
            .eq('product_id', productIdParam)
            .maybeSingle();

          if (existingRev) {
            setVerificationError('คุณได้ส่งรีวิวสำหรับสินค้านี้ในคำสั่งซื้อนี้ไปแล้ว (Already Reviewed)');
            return;
          }

          // 4. Fetch product details
          const { data: pData } = await supabase
            .from('products')
            .select('*')
            .eq('id', productIdParam)
            .single();

          setProduct(pData as Product);
          setOrder(oData as Order);
          setSelectedProductId(productIdParam);
        } else {
          setVerificationError('ไม่พบข้อมูลคำสั่งซื้อหรือ Token กรุณาเข้าหน้ารีวิวจากคำสั่งซื้อที่สำเร็จ');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์';
        setVerificationError(msg);
      } finally {
        setIsVerifying(false);
      }
    }

    verifyBackendEligibility();
  }, [tokenParam, productIdParam, orderIdParam, user]);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    setValue('rating', newRating);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('รองรับเฉพาะไฟล์ JPG, PNG หรือ WEBP เท่านั้น');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadError(null);
  };

  const onSubmit = async (data: ReviewFormData) => {
    setSubmitError(null);

    let uploadedImageUrl: string | null = null;
    if (imageFile) {
      const { url, error: imgErr } = await uploadImage(imageFile, 'review-images', user?.id);
      if (imgErr) {
        setUploadError(imgErr);
        return;
      }
      uploadedImageUrl = url;
    }

    let result;
    if (tokenParam) {
      // Submit via Token RPC
      result = await submitReviewByToken({
        token: tokenParam,
        productId: selectedProductId,
        rating: data.rating,
        comment: data.comment,
        imageUrl: uploadedImageUrl,
      });
    } else if (orderIdParam) {
      // Submit via verified RPC
      result = await submitVerifiedReview({
        productId: selectedProductId,
        orderId: orderIdParam,
        rating: data.rating,
        comment: data.comment,
        imageUrl: uploadedImageUrl,
      });
    }

    if (result && result.success) {
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate(`/products/${selectedProductId}`);
      }, 1800);
    } else if (result?.error) {
      setSubmitError(result.error);
    }
  };

  if (isVerifying) {
    return <LoadingSpinner text="กำลังตรวจสอบสิทธิ์การรีวิวกับฐานข้อมูล (Verifying Transaction)..." className="min-h-[50vh]" />;
  }

  if (verificationError) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">ไม่สามารถเขียนรีวิวได้</h1>
          <p className="text-sm text-rose-700 bg-rose-50 p-4 rounded-xl border border-rose-200/80 leading-relaxed">
            {verificationError}
          </p>
          <div className="pt-4 flex justify-center gap-3">
            <Link
              to="/orders"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
            >
              ดูคำสั่งซื้อของฉัน
            </Link>
            <Link
              to="/products"
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
            >
              กลับหน้ารวมสินค้า
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Back button */}
      <Link
        to={order ? `/orders/${order.id}` : '/products'}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>ย้อนกลับ</span>
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Verification Status Badge Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              เขียนรีวิวสินค้า
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              แบ่งปันประสบการณ์จริงจากการใช้งานเพื่อเป็นประโยชน์ต่อผู้อื่น
            </p>
          </div>

          <VerifiedBadge size="md" variant="card" />
        </div>

        {/* Selected Product Preview */}
        {product && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-slate-300 shrink-0">
                <ShoppingBag className="w-6 h-6" />
              </div>
            )}
            <div>
              <h2 className="text-sm font-bold text-slate-900 line-clamp-1">{product.name}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{formatCurrency(product.price)}</p>
              {order && (
                <p className="text-[11px] text-emerald-700 font-mono mt-0.5">
                  Order #{order.order_number} (Completed)
                </p>
              )}
            </div>
          </div>
        )}

        {/* If multiple items in token, allow selecting which item to review */}
        {tokenEligibleItems.length > 1 && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              เลือกสินค้าที่ต้องการรีวิว:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {tokenEligibleItems.map((item) => (
                <button
                  type="button"
                  key={item.product_id}
                  onClick={() => setSelectedProductId(item.product_id)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-colors ${
                    selectedProductId === item.product_id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {item.product_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {submitSuccess ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-emerald-900">
              บันทึกรีวิวสำเร็จเรียบร้อย!
            </h3>
            <p className="text-xs text-emerald-700">
              รีวิวของคุณได้รับการรับรองสิทธิ์ (Verified Customer) และแสดงบนหน้ารายละเอียดสินค้าแล้ว
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {submitError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Rating Stars Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                คะแนนความพึงพอใจ *
              </label>
              <div className="flex items-center gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-200 w-fit">
                <RatingStars
                  rating={rating}
                  size="xl"
                  interactive={true}
                  onRatingChange={handleRatingChange}
                />
                <span className="text-sm font-bold text-slate-800 ml-2">
                  {rating} ดาว
                </span>
              </div>
              {errors.rating && (
                <p className="text-xs text-rose-500">{errors.rating.message}</p>
              )}
            </div>

            {/* Review Comment Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  ความคิดเห็นของคุณ *
                </label>
                <span className="text-[11px] text-slate-400">ขั้นต่ำ 5 ตัวอักษร</span>
              </div>
              <textarea
                {...register('comment')}
                rows={4}
                placeholder="บอกเล่าประสบการณ์การใช้งาน คุณภาพสินค้า หรือความประทับใจ..."
                className="w-full text-sm rounded-xl border border-slate-300 p-3.5 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errors.comment && (
                <p className="text-xs text-rose-500">{errors.comment.message}</p>
              )}
            </div>

            {/* Image Upload Input */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                แนบรูปภาพสินค้าจริง (ไม่บังคับ)
              </label>

              {imagePreview ? (
                <div className="relative inline-block rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={imagePreview}
                    alt="รูปพรีวิว"
                    className="w-32 h-32 object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
                    title="ลบรูปภาพ"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div>
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-2xl hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/20 cursor-pointer transition-colors">
                    <Upload className="w-6 h-6 text-slate-400 mb-2" />
                    <span className="text-xs font-semibold text-slate-700">คลิกเพื่ออัปโหลดรูปภาพ</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WEBP (ไม่เกิน 5MB)</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {uploadError && (
                <p className="text-xs text-rose-500">{uploadError}</p>
              )}
            </div>

            {/* Submit Action Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <Link
                to={order ? `/orders/${order.id}` : '/products'}
                className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl"
              >
                ยกเลิก
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-200 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>ส่งรีวิว (Submit Verified Review)</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
