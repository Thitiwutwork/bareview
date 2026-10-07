import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  MessageSquare, 
  Flag, 
  Users, 
  ArrowLeft,
  Lock,
  QrCode
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/Loading';

export const AdminLayout: React.FC = () => {
  const { user, profile, isAdmin, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner text="กำลังตรวจสอบสิทธิ์ Admin..." className="min-h-screen" />;
  }

  // Strictly enforce Admin authorization (Testing Scenario 10)
  if (!user || !isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">การเข้าถึงถูกปฏิเสธ (Access Denied)</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            พื้นที่นี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Admin Role) เท่านั้น บัญชีของคุณ (<span className="font-semibold text-slate-700">{user?.email || 'Guest'}</span>) ไม่มีสิทธิ์เข้าถึงส่วนนี้
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>กลับสู่หน้าแรก</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navLinks = [
    { to: '/admin', label: 'ภาพรวม & สถิติ', icon: LayoutDashboard, exact: true },
    { to: '/admin/tokens', label: 'ออกรหัสรีวิว (LINE)', icon: QrCode },
    { to: '/admin/products', label: 'จัดการสินค้า', icon: ShoppingBag },
    { to: '/admin/orders', label: 'คำสั่งซื้อ', icon: Package },
    { to: '/admin/reviews', label: 'จัดการรีวิว', icon: MessageSquare },
    { to: '/admin/reports', label: 'รายงานปัญหา', icon: Flag },
    { to: '/admin/users', label: 'ผู้ใช้ & Audit Logs', icon: Users },
  ];

  const isCurrent = (to: string, exact?: boolean) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top Admin Header Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-sm tracking-wide">BA STORE Admin Portal</span>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded uppercase">
                Admin Mode
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400">เข้าสู่ระบบโดย:</span>
              <span className="font-semibold text-slate-200">{profile?.full_name || user.email}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-[7.5rem] z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto">
          <nav className="flex space-x-2 py-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isCurrent(link.to, link.exact);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Admin Page Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
