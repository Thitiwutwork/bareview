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
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col">
      {/* Product Image */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 bg-slate-50">
            <ShoppingBag className="w-12 h-12 stroke-[1.5]" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-xs font-semibold px-2.5 py-1 rounded-full text-slate-700 shadow-xs">
          {formatCurrency(product.price)}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
            {product.description}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <RatingStars rating={avgRating} size="sm" />
            <span className="text-xs text-slate-500 font-medium">
              ({reviewCount})
            </span>
          </div>

          <Link
            to={`/products/${product.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors group-hover:translate-x-0.5"
          >
            <span>ดูรายละเอียด</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
