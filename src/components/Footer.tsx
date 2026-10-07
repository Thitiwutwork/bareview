import React from 'react';
import { ShieldCheck, Lock, CheckCircle, MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info - BA STORE */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-pink-400/50 bg-white shrink-0">
                <img
                  src="/images/logo.jpg"
                  alt="BA STORE Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div>
                <span className="font-extrabold text-lg text-white font-heading block">
                  BA STORE
                </span>
                <span className="text-xs text-pink-400 font-medium">
                  จำหน่ายแอพพรีเมียม ราคาปลีก • รีวิวลูกค้าแท้ 100%
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              ขายแอพพรีเมียมราคาปลีกสุดคุ้ม 💖 บริการรวดเร็ว ปลอดภัย ได้วันใช้งานครบแน่นอน ดูแลตลอดการใช้งาน พร้อมระบบตรวจสอบรีวิวโปร่งใส ปราศจากรีวิวปลอม
            </p>

            <div className="flex flex-wrap gap-2 text-xs">
              <a
                href="https://line.me/ti/p/~@bastore"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>LINE: @bastore</span>
              </a>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 text-pink-300 font-mono text-[11px]">
                <Lock className="w-3.5 h-3.5" /> No Transaction = No Review
              </span>
            </div>
          </div>

          {/* Standard Guarantees */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 font-heading">
              มาตรฐานการบริการ BA STORE
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                <span>ได้วันใช้งานครบ 100% ของแท้ ปลอดภัย</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                <span>จัดส่งรวดเร็วภายใน 5 - 15 นาที</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                <span>เปิดบริการทุกวัน 09:00 - 23:00 น.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-pink-400 shrink-0 mt-0.5" />
                <span>ดูแลและรับประกันตลอดอายุการใช้งาน</span>
              </li>
            </ul>
          </div>

          {/* Security & Verification Guarantees */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 font-heading">
              ความโปร่งใสของรีวิว
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>เฉพาะลูกค้าที่ซื้อจริงเท่านั้นที่เขียนได้</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>ระบบ Supabase PostgreSQL Verification</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>ป้องกันการปั่นคะแนนและรีวิวปลอม 100%</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} BA STORE. All rights reserved.</p>
          <p className="text-slate-400">
            BA STORE — Premium Subscriptions with Authentic Customer Reviews.
          </p>
        </div>
      </div>
    </footer>
  );
};
