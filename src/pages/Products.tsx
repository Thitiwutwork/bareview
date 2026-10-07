import React, { useState, useMemo } from 'react';
import { Search, ShoppingBag, Sparkles } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { ProductCard } from '../components/ProductCard';
import { ProductSkeleton, EmptyState, ErrorState } from '../components/Loading';

const CATEGORIES = ['ทั้งหมด', 'ซีรีส์ / หนัง', 'ฟังเพลง', 'ทำงาน / AI'];

export const Products: React.FC = () => {
  const { products, isLoading, error, refetch } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [sortBy, setSortBy] = useState<'latest' | 'rating' | 'price-asc' | 'price-desc'>('latest');

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const term = searchTerm.toLowerCase();
        const matchSearch =
          p.name.toLowerCase().includes(term) ||
          (p.description && p.description.toLowerCase().includes(term));

        let matchCategory = true;
        if (selectedCategory !== 'ทั้งหมด') {
          if (selectedCategory === 'ฟังเพลง') {
            matchCategory = p.name.includes('YouTube') || p.name.includes('Spotify');
          } else if (selectedCategory === 'ซีรีส์ / หนัง') {
            matchCategory =
              p.name.includes('Netflix') ||
              p.name.includes('Disney') ||
              p.name.includes('iQIYI') ||
              p.name.includes('Viu') ||
              p.name.includes('Bilibili') ||
              p.name.includes('WeTV');
          } else if (selectedCategory === 'ทำงาน / AI') {
            matchCategory =
              p.name.includes('Canva') ||
              p.name.includes('CapCut') ||
              p.name.includes('ChatGPT');
          }
        }

        return matchSearch && matchCategory;
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
  }, [products, searchTerm, selectedCategory, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="border-b border-pink-100 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>BA STORE Subscriptions</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-heading">
            แอพพรีเมียมทั้งหมด
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            เช็คราคาปลีกสุดคุ้ม พร้อมอ่านรีวิวการใช้งานจริงที่ผ่านการยืนยัน
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อแอพ เช่น YouTube, Netflix..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-2xl border border-pink-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 w-full sm:w-64"
            />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto px-3.5 py-2 text-sm rounded-2xl border border-pink-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500 cursor-pointer font-medium"
            >
              <option value="latest">มาใหม่ล่าสุด</option>
              <option value="rating">คะแนนรีวิวสูงสุด</option>
              <option value="price-asc">ราคา: ต่ำไปสูง</option>
              <option value="price-desc">ราคา: สูงไปต่ำ</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Filter Pills (Touch Target >= 44px as in DESIGN.md) */}
      <div className="flex flex-wrap gap-2 pt-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`min-h-[44px] px-5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer font-heading ${
              selectedCategory === cat
                ? 'bg-pink-600 text-white shadow-xs shadow-pink-200 scale-105'
                : 'bg-white text-slate-600 hover:bg-pink-50/60 border border-pink-100 hover:text-pink-600'
            }`}
          >
            {cat}
          </button>
        ))}
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
          icon={<ShoppingBag className="w-7 h-7 text-pink-400" />}
          title="ไม่พบแอพที่ตรงกับการค้นหา"
          description="ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อค้นหาแอพพรีเมียม"
          action={{
            label: 'แสดงแอพทั้งหมด',
            onClick: () => {
              setSearchTerm('');
              setSelectedCategory('ทั้งหมด');
            },
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
