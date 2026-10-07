import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Review } from '../types/database';

export function useReviews() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Submit review using database RPC `create_verified_review`
   * Ensures 100% database verification:
   * - No client forgery of is_verified
   * - Checks order status = 'completed'
   * - Checks product exists in order
   * - Checks unique constraint
   */
  const submitVerifiedReview = async (params: {
    productId: string;
    orderId: string;
    rating: number;
    comment: string;
    imageUrl?: string | null;
  }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('create_verified_review', {
        p_product_id: params.productId,
        p_order_id: params.orderId,
        p_rating: params.rating,
        p_comment: params.comment.trim(),
        p_image_url: params.imageUrl || null,
      });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      return { success: true, data };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถบันทึกรีวิวได้';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Submit review using cryptographic review token RPC `create_review_with_token`
   */
  const submitReviewByToken = async (params: {
    token: string;
    productId: string;
    rating: number;
    comment: string;
    imageUrl?: string | null;
    reviewerName?: string | null;
  }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('create_review_with_token', {
        p_token: params.token,
        p_product_id: params.productId,
        p_rating: params.rating,
        p_comment: params.comment.trim(),
        p_image_url: params.imageUrl || null,
        p_reviewer_name: params.reviewerName?.trim() || null,
      });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      return { success: true, data };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถบันทึกรีวิวผ่าน Token ได้';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Admin issues review token for customer ordering via LINE @
   */
  const adminIssueLineToken = async (params: {
    productId: string;
    customerName: string;
    orderNumber?: string;
    notes?: string;
    days?: number;
  }) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('admin_issue_line_token', {
        p_product_id: params.productId,
        p_customer_name: params.customerName.trim(),
        p_order_number: params.orderNumber?.trim() || null,
        p_notes: params.notes?.trim() || null,
        p_days: params.days || 7,
      });

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      return { success: true, data };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถออกรหัสรีวิวได้';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Update own review
   */
  const updateReview = async (reviewId: string, rating: number, comment: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { data, error: updateErr } = await supabase
        .from('reviews')
        .update({
          rating,
          comment: comment.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .select()
        .single();

      if (updateErr) throw updateErr;
      return { success: true, data: data as Review };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถอัปเดตรีวิวได้';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Delete review
   */
  const deleteReview = async (reviewId: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { error: delErr } = await supabase.from('reviews').delete().eq('id', reviewId);
      if (delErr) throw delErr;
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถลบรีวิวได้';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Admin Reply
   */
  const adminReply = async (reviewId: string, replyText: string, adminId: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { data, error: replyErr } = await supabase
        .from('review_replies')
        .upsert(
          {
            review_id: reviewId,
            admin_id: adminId,
            reply: replyText.trim(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'review_id' }
        )
        .select()
        .single();

      if (replyErr) throw replyErr;
      return { success: true, data };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถส่งข้อความตอบกลับได้';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Admin Hide / Publish Review
   */
  const toggleReviewStatus = async (reviewId: string, newStatus: 'published' | 'hidden') => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { data, error: statusErr } = await supabase
        .from('reviews')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId)
        .select()
        .single();

      if (statusErr) throw statusErr;
      return { success: true, data };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ไม่สามารถเปลี่ยนสถานะรีวิวได้';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    error,
    submitVerifiedReview,
    submitReviewByToken,
    adminIssueLineToken,
    updateReview,
    deleteReview,
    adminReply,
    toggleReviewStatus,
  };
}
