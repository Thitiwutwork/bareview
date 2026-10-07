import React from 'react';
import { ShieldCheck, Lock, CheckCircle, Database } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-900">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span>TrustReview System</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              ระบบตรวจสอบและรับรองรีวิวจากลูกค้าตัวจริง การันตีสิทธิ์การรีวิวด้วยคำสั่งซื้อที่เสร็จสมบูรณ์ในฐานข้อมูล (PostgreSQL &amp; RLS) เท่านั้น ป้องกันรีวิวปลอมและคะแนนปั่นโดยสิ้นเชิง
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-emerald-400 font-mono">
                <Lock className="w-3.5 h-3.5" /> No Transaction = No Review
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-teal-400 font-mono">
                <Database className="w-3.5 h-3.5" /> Supabase RLS Protected
              </span>
            </div>
          </div>

          {/* Core Guarantees */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              มาตรฐานความปลอดภัย
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>ตรวจสอบ Transaction จริงผ่าน Database RPC</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Row Level Security (RLS) ระดับฐานข้อมูล</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Cryptographic Review Token ป้องกันการสวมรอย</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Audit Trail บันทึกทุกความเคลื่อนไหว</span>
              </li>
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              โครงสร้างระบบ
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>React + TypeScript + Vite</li>
              <li>Tailwind CSS + Lucide Icons</li>
              <li>Supabase PostgreSQL &amp; Auth</li>
              <li>Storage Buckets with MIME Check</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Verified Customer Review System. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-400">
            <span>Powering authentic customer confidence with integrity.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
