import React, { useState } from 'react';
import { User, MessageSquare, Flag, Trash2, Edit3, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import type { Review } from '../types/database';
import { RatingStars } from './RatingStars';
import { VerifiedBadge } from './VerifiedBadge';
import { formatDate } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { ReportModal } from './ReportModal';

interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  onAdminReply?: (reviewId: string) => void;
  showProductInfo?: boolean;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  onEdit,
  onDelete,
  onAdminReply,
  showProductInfo = false,
}) => {
  const { user, isAdmin } = useAuth();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const isOwner = user && user.id === review.user_id;
  const authorName = review.profiles?.full_name || 'ลูกค้าผู้ใช้งานจริง';
  const purchaseDate = review.orders?.completed_at || review.orders?.created_at;
  const reviewDate = review.created_at;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-slate-300 transition-colors">
      {/* Product Banner (optional if shown on general reviews list or customer profile) */}
      {showProductInfo && review.products && (
        <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {review.products.image_url && (
              <img
                src={review.products.image_url}
                alt={review.products.name}
                className="w-10 h-10 object-cover rounded-lg border border-slate-200"
              />
            )}
            <div>
              <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                {review.products.name}
              </p>
              <p className="text-[11px] text-slate-500">
                คำสั่งซื้อ #{review.orders?.order_number || review.order_id.slice(0, 8)}
              </p>
            </div>
          </div>
          {review.is_verified && <VerifiedBadge size="sm" />}
        </div>
      )}

      {/* Header: Stars & Verification */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <RatingStars rating={review.rating} size="md" />
          <span className="text-xs font-bold text-slate-700">
            {review.rating} / 5
          </span>
        </div>

        <div className="flex items-center gap-2">
          {review.is_verified ? (
            <VerifiedBadge size="sm" />
          ) : (
            <span className="text-[11px] text-slate-400 font-medium">Unverified</span>
          )}

          {review.status === 'hidden' && (
            <span className="text-[11px] px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-semibold">
              ถูกซ่อนโดย Admin
            </span>
          )}
        </div>
      </div>

      {/* Review Comment Body */}
      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line mb-4 font-normal">
        {review.comment}
      </p>

      {/* Attached Image if exists */}
      {review.image_url && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowFullImage(true)}
            className="group relative inline-block rounded-xl overflow-hidden border border-slate-200 hover:border-emerald-500 transition-colors cursor-pointer"
          >
            <img
              src={review.image_url}
              alt="รูปภาพประกอบการรีวิว"
              className="w-24 h-24 sm:w-32 sm:h-32 object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <ImageIcon className="w-5 h-5 drop-shadow-md" />
            </div>
          </button>
        </div>
      )}

      {/* Author and Transaction Details Section */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200">
            <User className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 block leading-tight">
              {authorName}
            </span>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
              {purchaseDate && <span>สั่งซื้อ: {formatDate(purchaseDate)}</span>}
              <span>รีวิว: {formatDate(reviewDate)}</span>
            </div>
          </div>
        </div>

        {/* Action buttons (Report / Edit / Delete / Admin Reply) */}
        <div className="flex items-center gap-1">
          {user && !isOwner && (
            <button
              onClick={() => setReportModalOpen(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="รายงานรีวิวนี้"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          )}

          {isOwner && onEdit && (
            <button
              onClick={() => onEdit(review)}
              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
              title="แก้ไขรีวิว"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {(isOwner || isAdmin) && onDelete && (
            <button
              onClick={() => onDelete(review.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              title="ลบรีวิว"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {isAdmin && onAdminReply && (
            <button
              onClick={() => onAdminReply(review.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3 h-3" />
              <span>ตอบกลับ</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Replies Section */}
      {review.replies && review.replies.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-100">
          {review.replies.map((reply) => (
            <div
              key={reply.id}
              className="bg-slate-50 border-l-4 border-emerald-600 rounded-r-xl p-3.5 text-xs text-slate-700 space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  การตอบกลับจากผู้ดูแลระบบ
                </span>
                <span className="text-[11px] text-slate-400">
                  {formatDate(reply.created_at)}
                </span>
              </div>
              <p className="leading-relaxed mt-1 text-slate-600">{reply.reply}</p>
            </div>
          ))}
        </div>
      )}

      {/* Image Lightbox Modal */}
      {showFullImage && review.image_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs cursor-pointer"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-black">
            <img
              src={review.image_url}
              alt="รูปภาพรีวิวขนาดเต็ม"
              className="w-full h-full object-contain max-h-[85vh]"
            />
            <p className="text-center text-white/80 text-xs py-2">คลิกที่ใดก็ได้เพื่อปิดรูปภาพ</p>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reviewId={review.id}
      />
    </div>
  );
};
