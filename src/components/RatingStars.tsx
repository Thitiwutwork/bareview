import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../lib/utils';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showValue?: boolean;
  className?: string;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onRatingChange,
  showValue = false,
  className,
}) => {
  const [hoverRating, setHoverRating] = React.useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const currentRating = hoverRating !== null ? hoverRating : rating;

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5" role={interactive ? 'radiogroup' : undefined}>
        {Array.from({ length: maxRating }, (_, idx) => {
          const starValue = idx + 1;
          const isFilled = starValue <= currentRating;
          const isHalf = !isFilled && starValue - 0.5 <= currentRating;

          return (
            <button
              key={starValue}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRatingChange?.(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(null)}
              className={cn(
                'transition-transform',
                interactive
                  ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-500 rounded-lg p-1.5 sm:p-1'
                  : 'cursor-default p-0'
              )}
              aria-label={interactive ? `${starValue} จาก ${maxRating} ดาว` : undefined}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  'transition-colors',
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : isHalf
                    ? 'fill-amber-200 text-amber-400'
                    : 'fill-slate-100 text-slate-300'
                )}
              />
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-slate-700 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
