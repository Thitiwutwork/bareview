import React, { useState, useEffect } from 'react';
import { 
  QrCode, 
  Copy, 
  Check, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Loader2,
  Calendar,
  User,
  ShoppingBag,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '../lib/supabase';
import { useProducts } from '../hooks/useProducts';
import { useReviews } from '../hooks/useReviews';
import { formatCurrency, formatDate, formatDateTime } from '../lib/utils';
import { LoadingSpinner } from '../components/Loading';

interface IssuedToken {
  id: string;
  order_id: string;
  customer_name: string | null;
  token: string;
  expires_at: string;
  used: boolean;
  created_at: string;
  orders?: {
    order_number: string;
    total_amount: number;
    order_items?: {
      products?: {
        name: string;
        image_url: string | null;
      };
    }[];
  };
}

export const AdminTokens: React.FC = () => {
  const { products, isLoading: productsLoading } = useProducts();
  const { adminIssueLineToken, isSubmitting } = useReviews();

  const [tokens, setTokens] = useState<IssuedToken[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);

  // Form state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [expiryDays, setExpiryDays] = useState(7);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success modal/box state
  const [newlyCreated, setNewlyCreated] = useState<{
    token: string;
    orderNumber: string;
    productName: string;
    customerName: string;
    expiresAt: string;
    url: string;
    lineMessage: string;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchTokens = async () => {
    try {
      setLoadingTokens(true);
      const { data, error } = await supabase
        .from('review_tokens')
        .select(`
          id,
          order_id,
          customer_name,
          token,
          expires_at,
          used,
          created_at,
          orders:order_id(
            order_number,
            total_amount,
            order_items(
              products(name, image_url)
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setTokens((data as any) || []);
    } catch (err) {
      console.error('fetchTokens error:', err);
    } finally {
      setLoadingTokens(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  // Pre-select first product once loaded
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedProductId) {
      setErrorMessage('กรุณาเลือกสินค้าที่ลูกค้าสั่งซื้อ');
      return;
    }

    if (!customerName.trim()) {
      setErrorMessage('กรุณาระบุชื่อลูกค้าหรือชื่อบัญชี LINE');
      return;
    }

    const selectedProduct = products.find((p) => p.id === selectedProductId);
    const prodName = selectedProduct ? selectedProduct.name : 'สินค้า BA STORE';

    const res = await adminIssueLineToken({
      productId: selectedProductId,
      customerName: customerName.trim(),
      orderNumber: orderNumber.trim() || undefined,
      notes: notes.trim() || undefined,
      days: expiryDays,
    });

    if (res.success && res.data) {
      const token = res.data.token;
      const origin = window.location.origin;
      const reviewUrl = `${origin}/review?token=${token}`;

      const lineMessage = `ขอบคุณที่อุดหนุน ${prodName} กับร้าน BA STORE นะคะ ❤️\n\nรบกวนลูกค้ารีวิวบริการเพื่อสะสมความน่าเชื่อถือและรับประกันตลอดอายุการใช้งานได้ที่ลิงก์นี้เลยค่า:\n👉 ${reviewUrl}\n\n(สิทธิ์รีวิวลูกค้าจริง Verified Customer ✓ | ลิงก์นี้ใช้ได้ ${expiryDays} วันนะคะ)`;

      setNewlyCreated({
        token,
        orderNumber: res.data.order_number,
        productName: prodName,
        customerName: customerName.trim(),
        expiresAt: res.data.expires_at,
        url: reviewUrl,
        lineMessage,
      });

      // Reset input fields
      setCustomerName('');
      setOrderNumber('');
      setNotes('');
      await fetchTokens();
    } else {
      setErrorMessage(res.error || 'เกิดข้อผิดพลาดในการออกรหัสรีวิว');
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <span>ออกรหัสรีวิวให้ลูกค้า (LINE @ Orders)</span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-100 text-pink-700 border border-pink-200">
            BA STORE Exclusive
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          เมื่อลูกค้าสั่งซื้อและชำระเงินผ่าน LINE @bastore เรียบร้อยแล้ว แอดมินสามารถสร้าง Token ลิงก์รีวิว หรือ QR Code สำหรับส่งให้ลูกค้าใน LINE ได้ทันที (ลูกค้าจะได้รับตรา ✓ Verified Customer โดยอัตโนมัติ)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Token Generator Form Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">สร้าง Token รีวิวด่วน</h2>
              <p className="text-xs text-slate-500">สร้างคำสั่งซื้อสำเร็จและสิทธิ์รีวิวในระบบ</p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* Select Product */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-pink-600" />
                <span>สินค้าที่ลูกค้าสั่งซื้อ *</span>
              </label>
              {productsLoading ? (
                <div className="text-xs text-slate-400 py-2">กำลังโหลดสินค้า...</div>
              ) : (
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-pink-500 focus:outline-none"
                  required
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatCurrency(p.price)})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-pink-600" />
                <span>ชื่อลูกค้า / บัญชี LINE *</span>
              </label>
              <input
                type="text"
                placeholder="เช่น น้องมุก (LINE), @aom_premium"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white placeholder:text-slate-400 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                required
              />
            </div>

            {/* Optional Custom Order Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                เลขอ้างอิง / เลขสลิป (ไม่บังคับ)
              </label>
              <input
                type="text"
                placeholder="เว้นว่างไว้เพื่อสร้างเลขอัตโนมัติ (เช่น LINE-2610-XXX)"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
            </div>

            {/* Expiry Days */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>อายุของ Token</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 7, 14].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setExpiryDays(days)}
                    className={`py-2 text-xs rounded-xl font-bold border transition-colors cursor-pointer ${
                      expiryDays === days
                        ? 'bg-pink-50 text-pink-700 border-pink-300'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {days} วัน {days === 7 && '(แนะนำ)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                บันทึกภายในร้าน (Notes)
              </label>
              <input
                type="text"
                placeholder="เช่น ลูกค้าประจำ, จ่าย KBank ฿10"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-pink-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังออกรหัสรีวิว...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>ออกรหัสรีวิว & สร้างข้อความ LINE</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Generated Token Result Card (or Instructions) */}
        <div className="lg:col-span-7 space-y-6">
          {newlyCreated ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-pink-400 shadow-md space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-pink-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      ออกรหัสรีวิวสำเร็จ! ({newlyCreated.orderNumber})
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      สำหรับ: {newlyCreated.customerName} | สินค้า: {newlyCreated.productName}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  หมดอายุ {formatDate(newlyCreated.expiresAt)}
                </span>
              </div>

              {/* Ready-to-copy LINE Message Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>💬 ข้อความสำเร็จรูปสำหรับคัดลอกส่งใน LINE:</span>
                  </label>
                  <button
                    onClick={() => copyToClipboard(newlyCreated.lineMessage, 'line-msg')}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    {copiedKey === 'line-msg' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>คัดลอกเรียบร้อย!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอกข้อความ LINE</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed">
                  {newlyCreated.lineMessage}
                </div>
              </div>

              {/* QR Code and Direct Link Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* QR Code */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center space-y-3">
                  <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200">
                    <QRCodeSVG value={newlyCreated.url} size={130} />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    ลูกค้าสามารถสแกน QR Code นี้ผ่าน LINE เพื่อเขียนรีวิวได้ทันที
                  </p>
                </div>

                {/* Direct Link */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-700 block">ลิงก์รีวิวเฉพาะบุคคล:</span>
                    <input
                      type="text"
                      readOnly
                      value={newlyCreated.url}
                      className="w-full p-2 bg-white rounded-xl border border-slate-300 text-[11px] font-mono text-slate-600"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(newlyCreated.url, 'url-link')}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {copiedKey === 'url-link' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>คัดลอกเฉพาะลิงก์</span>
                        </>
                      )}
                    </button>
                    <a
                      href={newlyCreated.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-colors"
                      title="ทดสอบเปิดหน้ารีวิว"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mx-auto">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">ขั้นตอนการส่งต่อให้ลูกค้า LINE</h3>
              <ol className="text-xs text-slate-600 text-left max-w-md mx-auto space-y-2.5 list-decimal pl-5">
                <li>เมื่อลูกค้าทักซื้อสินค้าใน LINE @bastore และโอนเงินพร้อมส่งสลิปแล้ว</li>
                <li>กรอกฟอร์มด้านซ้าย: เลือกสินค้าที่ลูกค้าซื้อ และใส่ชื่อลูกค้า LINE</li>
                <li>กดปุ่ม <strong>"ออกรหัสรีวิว"</strong> ระบบจะสร้างคำสั่งซื้อที่เสร็จสมบูรณ์และ Token ความปลอดภัยสูงให้ทันที</li>
                <li>กดปุ่ม <strong>"คัดลอกข้อความ LINE"</strong> แล้วนำไปส่งให้ลูกค้าในแชท LINE</li>
                <li>ลูกค้าคลิกลิงก์เข้ามารีวิว จะได้รับตราประทับ <strong>✓ Verified Customer</strong> โดยอัตโนมัติ</li>
              </ol>
            </div>
          )}

          {/* Tokens Issued History Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900">
                  ประวัติรหัสรีวิวที่ออกให้ลูกค้า ({tokens.length})
                </h3>
              </div>
              <button
                onClick={fetchTokens}
                className="inline-flex items-center gap-1 text-xs text-pink-600 hover:text-pink-700 font-semibold cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>รีเฟรช</span>
              </button>
            </div>

            {loadingTokens ? (
              <LoadingSpinner text="กำลังโหลดประวัติ Token..." />
            ) : tokens.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">ยังไม่มีประวัติการออก Token</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-1">
                {tokens.map((t) => {
                  const prod = t.orders?.order_items?.[0]?.products?.name || 'สินค้า';
                  const isExpired = new Date(t.expires_at).getTime() < Date.now();
                  const reviewUrl = `${window.location.origin}/review?token=${t.token}`;

                  return (
                    <div key={t.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">
                            {t.customer_name || 'ลูกค้า LINE'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({t.orders?.order_number || 'ORD'})
                          </span>
                          {t.used ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                              รีวิวแล้ว
                            </span>
                          ) : isExpired ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              หมดอายุ
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                              ยังไม่ใช้
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">
                          สินค้า: <strong className="text-slate-700">{prod}</strong> • ออกเมื่อ {formatDateTime(t.created_at)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(reviewUrl, t.id)}
                          className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === t.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-[11px]">คัดลอกแล้ว</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span className="text-[11px]">คัดลอกลิงก์</span>
                            </>
                          )}
                        </button>
                        <a
                          href={reviewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-400 hover:text-slate-700"
                          title="เปิดดู"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
