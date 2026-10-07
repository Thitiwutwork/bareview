import React, { useState, useEffect } from 'react';
import { EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/Loading';
import { formatDateTime } from '../lib/utils';
import type { ReviewReport } from '../types/database';

export const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<ReviewReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('review_reports')
        .select(`
          *,
          profiles:user_id(id, full_name, email),
          reviews:review_id(
            id,
            comment,
            rating,
            status,
            user_id,
            products:product_id(name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports((data as ReviewReport[]) || []);
    } catch (err) {
      console.error('fetchReports error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleUpdateStatus = async (reportId: string, newStatus: 'pending' | 'reviewed' | 'dismissed') => {
    try {
      const { error } = await supabase
        .from('review_reports')
        .update({ status: newStatus })
        .eq('id', reportId);

      if (error) throw error;
      await fetchReports();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการอัปเดตสถานะ';
      alert(msg);
    }
  };

  const handleHideReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ status: 'hidden' })
        .eq('id', reviewId);

      if (error) throw error;
      await fetchReports();
      alert('ซ่อนรีวิวนี้เรียบร้อยแล้ว');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการซ่อนรีวิว';
      alert(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">รายงานปัญหาเกี่ยวกับรีวิว (Reports)</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          ตรวจสอบข้อร้องเรียนจากผู้ใช้งานเกี่ยวกับเนื้อหาที่ไม่เหมาะสมหรือสแปม
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="กำลังโหลดรายงาน..." />
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
          ยังไม่มีการรายงานปัญหาเกี่ยวกับรีวิวในระบบ
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">เวลาที่แจ้ง</th>
                  <th className="p-4">ผู้รายงาน</th>
                  <th className="p-4">เหตุผล &amp; รายละเอียด</th>
                  <th className="p-4">เนื้อหารีวิวที่ถูกรายงาน</th>
                  <th className="p-4">สถานะรายงาน</th>
                  <th className="p-4 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/50">
                    <td className="p-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {formatDateTime(rep.created_at)}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">
                        {rep.profiles?.full_name || 'ผู้ใช้งาน'}
                      </div>
                      <div className="text-[11px] text-slate-400">{rep.profiles?.email}</div>
                    </td>
                    <td className="p-4 max-w-xs">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] mb-1">
                        {rep.reason}
                      </span>
                      {rep.detail && (
                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {rep.detail}
                        </p>
                      )}
                    </td>
                    <td className="p-4 max-w-sm">
                      {rep.reviews ? (
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                          <div className="text-[10px] text-slate-400 font-semibold">
                            {rep.reviews.products?.name} (สถานะ: {rep.reviews.status})
                          </div>
                          <p className="text-slate-800 text-[11px] line-clamp-2">
                            "{rep.reviews.comment}"
                          </p>
                          {rep.reviews.status !== 'hidden' && (
                            <button
                              onClick={() => handleHideReview(rep.review_id)}
                              className="inline-flex items-center gap-1 text-[10px] text-rose-600 hover:text-rose-800 font-bold mt-1 cursor-pointer"
                            >
                              <EyeOff className="w-3 h-3" />
                              <span>สั่งซ่อนรีวิวนี้ทันที</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">รีวิวนี้ถูกลบแล้ว</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          rep.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : rep.status === 'reviewed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {rep.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => handleUpdateStatus(rep.id, 'reviewed')}
                        className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-medium text-[11px] cursor-pointer"
                        title="ทำเครื่องหมายว่าตรวจสอบแล้ว"
                      >
                        Reviewed
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(rep.id, 'dismissed')}
                        className="px-2 py-1 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium text-[11px] cursor-pointer"
                        title="เพิกถอนคำร้อง"
                      >
                        Dismiss
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
