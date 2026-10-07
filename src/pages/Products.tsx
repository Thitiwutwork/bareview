import React, { useState, useMemo } from 'react';
import { Search, ShoppingBag } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { ProductSkeleton, EmptyState, ErrorState } from '../components/Loading';

export const Products: React.FC = () => {
  const { products, isLoading, error, refetch } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'price-asc' | 'price-desc'>('latest');

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const term = searchTerm.toLowerCase();
        return (
          p.name.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return (b.average_rating || 0) - (a.average_rating || 0);
        }
        if (sortBy === 'price-asc') {
          return a.price - b.price;
        }
        if (sortBy === 'price-desc') {
          return b.price - a.price;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [products, searchTerm, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">สินค้าทั้งหมด</h1>
          <p className="text-sm text-slate-500 mt-1">
            เลือกดูรายการสินค้าและอ่านรีวิวที่ผ่านการยืนยันจากลูกค้าจริง
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อสินค้า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
            />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="latest">มาใหม่ล่าสุด</option>
              <option value="rating">คะแนนรีวิวสูงสุด</option>
              <option value="price-asc">ราคา: ต่ำไปสูง</option>
              <option value="price-desc">ราคา: สูงไปต่ำ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product List Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ProductSkeleton />
          <ProductSkeleton />
          <ProductSkeleton />
          <ProductSkeleton />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="w-7 h-7" />}
          title="ไม่พบสินค้าที่ตรงกับการค้นหา"
          description="ลองเปลี่ยนคำค้นหา หรือเรียกดูสินค้าทั้งหมดอีกครั้ง"
          action={{
            label: 'ล้างการค้นหา',
            onClick: () => setSearchTerm(''),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
