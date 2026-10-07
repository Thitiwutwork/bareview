import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Package, 
  LayoutDashboard, 
  ShieldAlert, 
  LogIn, 
  LogOut, 
  UserPlus, 
  Menu, 
  X,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Navbar: React.FC = () => {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - BA STORE */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-pink-300 shadow-sm shadow-pink-200 group-hover:scale-105 transition-transform bg-pink-100 shrink-0">
              <img
                src="/images/logo.jpg"
                alt="BA STORE Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback icon if image not available
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl leading-tight text-slate-800 tracking-tight font-heading group-hover:text-pink-600 transition-colors">
                  BA STORE
                </span>
                <span className="text-[10px] bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded-full font-bold">
                  Reviews
                </span>
              </div>
              <span className="text-[10px] font-medium text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                รีวิวลูกค้าแท้ 100% (Verified Only)
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/') 
                  ? 'text-pink-700 bg-pink-50' 
                  : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50/50'
              }`}
            >
              หน้าแรก
            </Link>
            <Link
              to="/products"
              className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors inline-flex items-center gap-1.5 ${
                isActive('/products') 
                  ? 'text-pink-700 bg-pink-50' 
                  : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50/50'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-pink-500" />
              แอพพรีเมียมทั้งหมด
            </Link>

            {user && (
              <>
                <Link
                  to="/orders"
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors inline-flex items-center gap-1.5 ${
                    isActive('/orders') 
                      ? 'text-pink-700 bg-pink-50' 
                      : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50/50'
                  }`}
                >
                  <Package className="w-4 h-4 text-pink-500" />
                  คำสั่งซื้อของฉัน
                </Link>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors inline-flex items-center gap-1.5 ${
                    isActive('/dashboard') 
                      ? 'text-pink-700 bg-pink-50' 
                      : 'text-slate-600 hover:text-pink-600 hover:bg-pink-50/50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-pink-500" />
                  แดชบอร์ด
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-xl text-sm font-bold transition-colors inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200/80 shadow-xs ${
                  location.pathname.startsWith('/admin') ? 'ring-2 ring-amber-400' : ''
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Admin Portal</span>
              </Link>
            )}
          </div>

          {/* User & Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50/80 border border-pink-200 text-xs">
                  <div className="w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <span className="font-semibold text-slate-800 max-w-[120px] truncate">
                    {profile?.full_name || user.email}
                  </span>
                  {isAdmin && (
                    <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase">
                      Admin
                    </span>
                  )}
                </div>

                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ออก</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบ</span>
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-xl shadow-xs shadow-pink-200 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>สมัครสมาชิก</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-pink-50 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-pink-100 bg-white px-4 pt-2 pb-5 space-y-2">
          {user && (
            <div className="flex items-center gap-2.5 p-3 mb-2 rounded-2xl bg-pink-50/60 border border-pink-100">
              <div className="w-9 h-9 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold text-sm uppercase">
                {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-900">
                  {profile?.full_name || 'ลูกค้าผู้ใช้งาน'}
                </span>
                <span className="text-xs text-slate-500 truncate max-w-[200px]">
                  {user.email}
                </span>
              </div>
            </div>
          )}

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-xl text-sm font-semibold ${
              isActive('/') ? 'text-pink-700 bg-pink-50' : 'text-slate-700 hover:bg-pink-50/40'
            }`}
          >
            หน้าแรก
          </Link>
          <Link
            to="/products"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold ${
              isActive('/products') ? 'text-pink-700 bg-pink-50' : 'text-slate-700 hover:bg-pink-50/40'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-pink-500" />
            แอพพรีเมียมทั้งหมด
          </Link>

          {user && (
            <>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive('/orders') ? 'text-pink-700 bg-pink-50' : 'text-slate-700 hover:bg-pink-50/40'
                }`}
              >
                <Package className="w-4 h-4 text-pink-500" />
                คำสั่งซื้อของฉัน
              </Link>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                  isActive('/dashboard') ? 'text-pink-700 bg-pink-50' : 'text-slate-700 hover:bg-pink-50/40'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-pink-500" />
                แดชบอร์ด
              </Link>
            </>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold bg-amber-50 text-amber-900 border border-amber-200"
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              Admin Portal
            </Link>
          )}

          <div className="pt-3 border-t border-pink-100 flex flex-col gap-2">
            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                ออกจากระบบ
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  เข้าสู่ระบบ
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold text-white bg-pink-600 hover:bg-pink-700 rounded-xl shadow-xs transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
