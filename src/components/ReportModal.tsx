import React, { useState } from 'react';
import { X, Flag, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId: string;
  onReportSuccess?: () => void;
}

const REPORT_REASONS = [
  'Spam',
  'Offensive',
  'Advertisement',
  'Fake Review',
  'Inappropriate Content',
  'Other',
] as const;

type ReportReason = typeof REPORT_REASONS[number];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  reviewId,
  onReportSuccess,
}) => {
  const { user } = useAuth();
  const [reason, setReason] = useState<ReportReason>('Spam');
  const [detail, setDetail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('กรุณาเข้าสู่ระบบก่อนรายงานรีวิว');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase.from('review_reports').insert({
        review_id: reviewId,
        user_id: user.id,
        reason,
        detail: detail.trim() || null,
        status: 'pending',
      });

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onReportSuccess?.();
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการรายงานรีวิว';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">รายงานรีวิวนี้</h3>
            <p className="text-xs text-slate-500">แจ้งให้ผู้ดูแลระบบตรวจสอบข้อความหรือเนื้อหาที่ไม่เหมาะสม</p>
          </div>
        </div>

        {success ? (
          <div className="py-6 text-center text-emerald-600 space-y-2">
            <p className="font-semibold text-base">ขอบคุณสำหรับรายงานของคุณ</p>
            <p className="text-xs text-slate-500">ทีมงานผู้ดูแลระบบจะดำเนินการตรวจสอบโดยเร็วที่สุด</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                เหตุผลในการรายงาน *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReportReason)}
                className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                รายละเอียดเพิ่มเติม (ถ้ามี)
              </label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                rows={3}
                placeholder="ระบุข้อเท็จจริงเพิ่มเติมเพื่อให้ทีมงานตรวจสอบได้แม่นยำ..."
                className="w-full text-sm rounded-lg border border-slate-300 p-3 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm disabled:opacity-50 transition-colors"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>ส่งรายงาน</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
