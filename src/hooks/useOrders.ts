import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Order, OrderItem } from '../types/database';

export function useOrders() {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id(id, full_name, email),
          order_items(*, products(*))
        `)
        .order('created_at', { ascending: false });

      // If not admin, filter by user_id (RLS also strictly protects this)
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data, error: ordersErr } = await query;
      if (ordersErr) throw ordersErr;

      setOrders((data as Order[]) || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงรายการคำสั่งซื้อ';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders, isLoading, error, refetch: fetchOrders };
}

export function useOrderDetail(orderId: string | undefined) {
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [reviewToken, setReviewToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetail = useCallback(async () => {
    if (!orderId || !isSupabaseConfigured() || !user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // 1. Fetch order
      const { data: ord, error: ordErr } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id(id, full_name, email)
        `)
        .eq('id', orderId)
        .single();

      if (ordErr) throw ordErr;

      // 2. Fetch order items with products
      const { data: itms, error: itmsErr } = await supabase
        .from('order_items')
        .select(`
          *,
          products(*)
        `)
        .eq('order_id', orderId);

      if (itmsErr) throw itmsErr;

      // 3. Check existing reviews for this order
      const { data: revs } = await supabase
        .from('reviews')
        .select('product_id')
        .eq('order_id', orderId);

      const reviewedProductIds = new Set((revs || []).map((r) => r.product_id));

      const enrichedItems: OrderItem[] = ((itms as OrderItem[]) || []).map((item) => ({
        ...item,
        has_reviewed: reviewedProductIds.has(item.product_id),
      }));

      setOrder(ord as Order);
      setItems(enrichedItems);

      // 4. If completed, fetch or generate review token
      if (ord.status === 'completed') {
        const { data: tokenData, error: tokenErr } = await supabase.rpc('generate_review_token', {
          p_order_id: orderId,
        });
        if (!tokenErr && tokenData) {
          setReviewToken(tokenData as string);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดรายละเอียดคำสั่งซื้อ';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, user]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  const requestNewToken = async (): Promise<string | null> => {
    if (!orderId) return null;
    const { data, error } = await supabase.rpc('generate_review_token', {
      p_order_id: orderId,
    });
    if (error) {
      throw error;
    }
    setReviewToken(data as string);
    return data as string;
  };

  return { order, items, reviewToken, isLoading, error, refetch: fetchOrderDetail, requestNewToken };
}
