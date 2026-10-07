import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, QrCode, ExternalLink, Calendar, ShieldCheck } from 'lucide-react';
import { formatDate } from '../lib/utils';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  orderNumber: string;
  expiresAt?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  token,
  orderNumber,
  expiresAt,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const reviewUrl = `${window.location.origin}/review?token=${token}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reviewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-inner">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900">QR Code สำหรับเขียนรีวิว</h3>
        <p className="text-xs text-slate-500 mt-1">
          คำสั่งซื้อหมายเลข <span className="font-mono font-semibold text-slate-700">#{orderNumber}</span>
        </p>

        {/* QR Code Canvas */}
        <div className="my-6 p-4 bg-white border border-slate-200 rounded-2xl inline-block shadow-sm">
          <QRCodeSVG
            value={reviewUrl}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-left text-xs space-y-1.5 mb-5">
          <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cryptographic Review Token</span>
          </div>
          <p className="text-emerald-700 text-[11px] leading-relaxed">
            ลิงก์และ QR Code นี้ผูกกับคำสั่งซื้อและบัญชีของคุณโดยเฉพาะ ไม่สามารถสวมสิทธิ์หรือนำไปใช้กับ Order อื่นได้
          </p>
          {expiresAt && (
            <div className="flex items-center gap-1 text-slate-500 text-[11px] pt-1 border-t border-emerald-200/60">
              <Calendar className="w-3.5 h-3.5" />
              <span>หมดอายุ: {formatDate(expiresAt)}</span>
            </div>
          )}
        </div>

        {/* Copy Link & Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'คัดลอกลิงก์สำเร็จแล้ว!' : 'คัดลอก Review Link'}</span>
          </button>

          <a
            href={reviewUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>เปิดหน้ารีวิวทันที</span>
          </a>
        </div>
      </div>
    </div>
  );
};
