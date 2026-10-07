import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import type { Product } from '../types/database';
import { RatingStars } from './RatingStars';
import { formatCurrency } from '../lib/utils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const avgRating = product.average_rating || 0;
  const reviewCount = product.review_count || 0;

  return (
    <div className="group bg-white rounded-3xl border border-pink-100/80 p-5 shadow-xs hover:shadow-md hover:border-pink-300 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* App Logo / Product Image */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="w-16 h-16 rounded-2xl p-2 bg-gradient-to-tr from-pink-50 to-white border border-pink-100 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-contain"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = '/images/logo.jpg';
                }}
              />
            ) : (
              <ShoppingBag className="w-8 h-8 text-pink-400 stroke-[1.5]" />
            )}
          </div>

          <div className="text-right">
            <span className="text-lg font-black text-pink-600 font-heading block">
              {formatCurrency(product.price)}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">ราคาปลีกสุดคุ้ม</span>
          </div>
        </div>

        {/* Product Title & Info */}
        <div className="space-y-1.5">
          <h3 className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-pink-600 transition-colors font-heading">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>
      </div>

      {/* Ratings, Verified Status & Button */}
      <div className="mt-5 pt-3.5 border-t border-pink-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <RatingStars rating={avgRating} size="sm" />
          <span className="text-xs font-semibold text-slate-700">
            {avgRating > 0 ? avgRating.toFixed(1) : '5.0'}
          </span>
          <span className="text-[11px] text-slate-400">
            ({reviewCount} รีวิว)
          </span>
        </div>

        <Link
          to={`/products/${product.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl text-xs font-bold transition-all group-hover:translate-x-0.5 cursor-pointer"
        >
          <span>ดูรีวิว</span>
          <ArrowRight className="w-3.5 h-3.5 text-pink-500" />
        </Link>
      </div>
    </div>
  );
};
