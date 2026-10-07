import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/Loading';
import { formatDateTime } from '../lib/utils';
import type { Profile, AuditLog } from '../types/database';

export const AdminUsers: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch profiles
      const { data: profs, error: profErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profErr) throw profErr;
      setProfiles((profs as Profile[]) || []);

      // Fetch audit logs
      const { data: logs, error: logErr } = await supabase
        .from('audit_logs')
        .select(`
          *,
          profiles:user_id(id, full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (logErr) throw logErr;
      setAuditLogs((logs as AuditLog[]) || []);
    } catch (err) {
      console.error('fetchData error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleRole = async (profileId: string, currentRole: string) => {
    const nextRole = currentRole === 'admin' ? 'customer' : 'admin';
    if (!confirm(`เปลี่ยน Role ผู้ใช้งานนี้เป็น ${nextRole.toUpperCase()}?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: nextRole })
        .eq('id', profileId);

      if (error) throw error;
      await fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถอัปเดตสิทธิ์ได้';
      alert(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">จัดการผู้ใช้งาน &amp; Audit Logs</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            บันทึกประวัติการกระทำสำคัญในระบบเพื่อความโปร่งใสและตรวจสอบได้ 100%
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-200/80 p-1 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'users' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            ผู้ใช้งาน ({profiles.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'audit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Audit Trail ({auditLogs.length})
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner text="กำลังโหลดข้อมูล..." />
      ) : activeTab === 'users' ? (
        /* Profiles Table */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">ชื่อ - นามสกุล</th>
                  <th className="p-4">อีเมล</th>
                  <th className="p-4">บทบาท (Role)</th>
                  <th className="p-4">สถานะ</th>
                  <th className="p-4">วันที่สมัคร</th>
                  <th className="p-4 text-right">ปรับบทบาท</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-900">
                      {p.full_name || '-'}
                    </td>
                    <td className="p-4 text-slate-600 font-mono text-[11px]">
                      {p.email}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          p.role === 'admin'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {p.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-500 capitalize">{p.status}</span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {formatDateTime(p.created_at)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleRole(p.id, p.role)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        {p.role === 'admin' ? 'ลดสิทธิ์เป็น Customer' : 'แต่งตั้งเป็น Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Audit Logs Table */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">เวลา (UTC)</th>
                  <th className="p-4">การกระทำ (Action)</th>
                  <th className="p-4">รายละเอียด (Description)</th>
                  <th className="p-4">ผู้กระทำ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono text-slate-400 whitespace-nowrap text-[11px]">
                      {formatDateTime(log.created_at)}
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-mono font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 font-mono text-[11px]">
                      {log.description}
                    </td>
                    <td className="p-4 text-slate-600">
                      {log.profiles?.email || (log.user_id ? log.user_id.slice(0, 8) : 'System')}
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
