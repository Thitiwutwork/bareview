import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Product, Review } from '../types/database';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch active products
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (prodError) throw prodError;

      // Fetch reviews to calculate average ratings and review counts
      const { data: revData, error: revError } = await supabase
        .from('reviews')
        .select('product_id, rating')
        .eq('status', 'published');

      if (revError) console.warn('Could not load reviews rating summary:', revError.message);

      const reviewStats: Record<string, { total: number; sum: number }> = {};
      (revData || []).forEach((r) => {
        if (!reviewStats[r.product_id]) {
          reviewStats[r.product_id] = { total: 0, sum: 0 };
        }
        reviewStats[r.product_id].total += 1;
        reviewStats[r.product_id].sum += r.rating;
      });

      const enrichedProducts: Product[] = (prodData || []).map((p) => {
        const stats = reviewStats[p.id];
        return {
          ...p,
          review_count: stats ? stats.total : 0,
          average_rating: stats && stats.total > 0 ? Number((stats.sum / stats.total).toFixed(1)) : 0,
        };
      });

      setProducts(enrichedProducts);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, isLoading, error, refetch: fetchProducts };
}

export function useProductDetail(productId: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProductDetail = useCallback(async () => {
    if (!productId || !isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. Fetch product
      const { data: prod, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (prodErr) throw prodErr;

      // 2. Fetch published reviews with author profile and orders
      const { data: revList, error: revErr } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id(id, full_name, email, avatar_url, role),
          orders:order_id(id, order_number, created_at, completed_at),
          replies:review_replies(*)
        `)
        .eq('product_id', productId)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (revErr) throw revErr;

      const loadedReviews = (revList as Review[]) || [];
      const totalRatings = loadedReviews.reduce((acc, curr) => acc + curr.rating, 0);
      const avg = loadedReviews.length > 0 ? Number((totalRatings / loadedReviews.length).toFixed(1)) : 0;

      setProduct({
        ...prod,
        review_count: loadedReviews.length,
        average_rating: avg,
      });
      setReviews(loadedReviews);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดรายละเอียดสินค้า';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductDetail();
  }, [fetchProductDetail]);

  return { product, reviews, isLoading, error, refetch: fetchProductDetail };
}
