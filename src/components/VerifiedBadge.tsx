import React from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'text' | 'card';
  className?: string;
  showTooltip?: boolean;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({
  size = 'md',
  variant = 'badge',
  className,
}) => {
  if (variant === 'card') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-xs',
          className
        )}
      >
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>✓ ยืนยันการสั่งซื้อจริง (Verified Customer)</span>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300',
        sizeClasses[size],
        className
      )}
      title="รีวิวนี้ได้รับการยืนยันจากรายการคำสั่งซื้อสำเร็จในฐานข้อมูลจริง (Verified Purchase)"
    >
      <CheckCircle2 className={cn(iconSizes[size], 'text-emerald-600 fill-emerald-100 shrink-0')} />
      <span className="font-semibold tracking-tight">Verified Customer</span>
    </span>
  );
};
