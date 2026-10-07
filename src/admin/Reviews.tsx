import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Eye, 
  EyeOff, 
  Trash2, 
  X, 
  Loader2, 
  Lock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useReviews } from '../hooks/useReviews';
import { RatingStars } from '../components/RatingStars';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { LoadingSpinner } from '../components/Loading';
import type { Review } from '../types/database';

export const AdminReviews: React.FC = () => {
  const { user } = useAuth();
  const { toggleReviewStatus, deleteReview, adminReply } = useReviews();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeReviewId, setActiveReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id(id, full_name, email),
          products:product_id(id, name, image_url),
          orders:order_id(id, order_number, completed_at),
          replies:review_replies(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews((data as Review[]) || []);
    } catch (err) {
      console.error('fetchReviews error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleHide = async (review: Review) => {
    const nextStatus = review.status === 'hidden' ? 'published' : 'hidden';
    const res = await toggleReviewStatus(review.id, nextStatus);
    if (res.success) {
      await fetchReviews();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('ยืนยันที่จะลบรีวิวนี้ถาวร?')) return;
    const res = await deleteReview(id);
    if (res.success) {
      await fetchReviews();
    }
  };

  const openReplyModal = (r: Review) => {
    setActiveReviewId(r.id);
    setReplyText(r.replies?.[0]?.reply || '');
    setReplyModalOpen(true);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewId || !user || !replyText.trim()) return;

    setSubmittingReply(true);
    try {
      const res = await adminReply(activeReviewId, replyText, user.id);
      if (res.success) {
        setReplyModalOpen(false);
        await fetchReviews();
      }
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">จัดการรีวิว (Review Management)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            ตรวจสอบ ซ่อน/แสดง ลบ หรือตอบกลับรีวิวของลูกค้า
          </p>
        </div>

        {/* Security Rule Note */}
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <Lock className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>กฎความปลอดภัย:</strong> แอดมินไม่สามารถกดเปลี่ยนรีวิวจาก Unverified เป็น Verified ได้ สถานะนี้ถูกล็อกโดย Transaction เท่านั้น
          </span>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="กำลังโหลดรีวิว..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">สินค้า</th>
                  <th className="p-4">ลูกค้า &amp; Order</th>
                  <th className="p-4">คะแนน &amp; ข้อความ</th>
                  <th className="p-4">การยืนยัน (Verification)</th>
                  <th className="p-4">สถานะ</th>
                  <th className="p-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="p-4 max-w-[200px]">
                      <div className="font-bold text-slate-900 text-xs line-clamp-1">
                        {r.products?.name}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">
                        {r.profiles?.full_name || 'ลูกค้า'}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        Order #{r.orders?.order_number || r.order_id.slice(0, 8)}
                      </div>
                    </td>
                    <td className="p-4 max-w-sm">
                      <div className="flex items-center gap-1.5 mb-1">
                        <RatingStars rating={r.rating} size="sm" />
                        <span className="font-bold text-slate-700">{r.rating}/5</span>
                      </div>
                      <p className="text-slate-800 line-clamp-2 leading-relaxed">
                        {r.comment}
                      </p>
                      {r.replies && r.replies.length > 0 && (
                        <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                          <strong>Admin Reply:</strong> {r.replies[0].reply}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      {r.is_verified ? (
                        <VerifiedBadge size="sm" />
                      ) : (
                        <span className="text-[11px] text-slate-400">Unverified</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          r.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => openReplyModal(r)}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="ตอบกลับรีวิว"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleHide(r)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          r.status === 'hidden'
                            ? 'text-emerald-700 hover:bg-emerald-50'
                            : 'text-amber-600 hover:bg-amber-50'
                        }`}
                        title={r.status === 'hidden' ? 'แสดงรีวิว (Publish)' : 'ซ่อนรีวิว (Hide)'}
                      >
                        {r.status === 'hidden' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="ลบรีวิวถาวร"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Admin Reply Modal */}
      {replyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setReplyModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-slate-900 mb-2">
              ตอบกลับความคิดเห็นของลูกค้า
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              ข้อความนี้จะแสดงใต้รีวิวของลูกค้าโดยมีสัญลักษณ์ผู้ดูแลระบบอย่างเป็นทางการ
            </p>

            <form onSubmit={handleSendReply} className="space-y-4">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={4}
                placeholder="พิมพ์ข้อความตอบกลับ เช่น ขอบคุณสำหรับคำติชม..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReplyModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submittingReply}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl disabled:opacity-50"
                >
                  {submittingReply && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>ส่งคำตอบกลับ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
