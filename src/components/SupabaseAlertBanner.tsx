import React, { useState } from 'react';
import { Database, AlertTriangle, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export const SupabaseAlertBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const isConfigured = isSupabaseConfigured();

  if (isConfigured) return null;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(
`VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside aria-label="Supabase Setup Required" className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-3 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong className="font-semibold">โปรดตั้งค่า Supabase Connection:</strong> ระบบต้องการ Supabase URL และ Anon Key จริงในไฟล์ <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-800 text-xs font-mono">.env</code> เพื่อเริ่มใช้งาน
          </span>
        </div>
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 font-medium rounded-lg text-xs transition-colors cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{expanded ? 'ซ่อนคำแนะนำ' : 'ดูขั้นตอนติดตั้ง (3 ขั้นตอน)'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto mt-4 p-4 bg-white/80 rounded-xl border border-amber-200/80 text-xs text-slate-700 space-y-3">
          <ol className="list-decimal list-inside space-y-2 leading-relaxed">
            <li>
              <strong>สร้างโปรเจกต์ Supabase:</strong> ไปที่ <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-600 underline">supabase.com</a> แล้วสร้างโปรเจกต์ใหม่ฟรี
            </li>
            <li>
              <strong>รันสคริปต์ Database Schema:</strong> นำเนื้อหาในไฟล์ <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-emerald-700">supabase/schema.sql</code> ไปวางและกด Run ใน <em>SQL Editor</em> ของ Supabase (ระบบจะสร้าง Tables, RLS, Storage และฟังก์ชันตรวจสอบ <code>create_verified_review</code> ให้ทันที)
            </li>
            <li>
              <strong>ใส่ Keys ใน .env:</strong> คัดลอก Project URL และ Public Anon Key จาก <em>Project Settings &gt; API</em> มาใส่ในไฟล์ <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">.env</code> แล้วรีสตาร์ท Dev Server
            </li>
          </ol>
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleCopyEnv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกเรียบร้อย' : 'คัดลอกรูปแบบ .env'}</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
