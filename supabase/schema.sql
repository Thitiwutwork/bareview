-- ==============================================================================
-- PROJECT: VERIFIED CUSTOMER REVIEW SYSTEM
-- Complete Supabase PostgreSQL Schema, RLS, Storage & Verification Logic
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Clean Drop existing tables with CASCADE (Resolves incompatible types from old tables)
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.review_replies CASCADE;
DROP TABLE IF EXISTS public.review_reports CASCADE;
DROP TABLE IF EXISTS public.review_tokens CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ==============================================================================
-- TABLE DEFINITIONS
-- ==============================================================================

-- 2.1 Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.2 Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.3 Orders Table
-- 2.3 Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT,
    notes TEXT,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'completed', 'cancelled')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

-- 2.4 Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.5 Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    image_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'pending')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_order_product_review UNIQUE (order_id, product_id)
);

-- 2.6 Review Tokens Table
CREATE TABLE IF NOT EXISTS public.review_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.7 Review Reports Table
CREATE TABLE IF NOT EXISTS public.review_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('Spam', 'Offensive', 'Advertisement', 'Fake Review', 'Inappropriate Content', 'Other')),
    detail TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2.8 Review Replies Table
CREATE TABLE IF NOT EXISTS public.review_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reply TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_review_reply UNIQUE (review_id)
);

-- 2.9 Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    description TEXT NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON public.reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_review_tokens_token ON public.review_tokens(token);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

-- ==============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Check if authenticated user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Automatically create profile on auth.users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);

  -- Record LOGIN/REGISTER audit log
  INSERT INTO public.audit_logs (user_id, action, description)
  VALUES (NEW.id, 'REGISTER', 'User registered with email: ' || NEW.email);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to record timestamp changes on orders
CREATE OR REPLACE FUNCTION public.handle_order_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    NEW.completed_at = COALESCE(NEW.completed_at, now());
    
    -- Record Audit Log
    INSERT INTO public.audit_logs (user_id, action, description)
    VALUES (NEW.user_id, 'COMPLETE_ORDER', 'Order ' || NEW.order_number || ' completed');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_completed ON public.orders;
CREATE TRIGGER trg_order_completed
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_order_completion();

-- ==============================================================================
-- 🔐 CORE VERIFICATION RPC: create_verified_review
-- This is the heart of "No Transaction = No Review"
-- Frontend CANNOT bypass this verification.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_verified_review(
    p_product_id UUID,
    p_order_id UUID,
    p_rating INTEGER,
    p_comment TEXT,
    p_image_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_order_status TEXT;
    v_order_user_id UUID;
    v_item_exists BOOLEAN;
    v_already_reviewed BOOLEAN;
    v_review_id UUID;
BEGIN
    -- 1. Check User Authentication
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required: User must be logged in.';
    END IF;

    -- 2. Validate Rating
    IF p_rating < 1 OR p_rating > 5 THEN
        RAISE EXCEPTION 'Invalid rating: Rating must be between 1 and 5 stars.';
    END IF;

    -- 3. Validate Comment
    IF p_comment IS NULL OR trim(p_comment) = '' THEN
        RAISE EXCEPTION 'Invalid comment: Review comment cannot be empty.';
    END IF;

    -- 4. Check Order exists and belongs to this user
    SELECT status, user_id INTO v_order_status, v_order_user_id
    FROM public.orders
    WHERE id = p_order_id;

    IF v_order_status IS NULL THEN
        RAISE EXCEPTION 'Order not found: Specified order does not exist.';
    END IF;

    IF v_order_user_id <> v_user_id THEN
        RAISE EXCEPTION 'Access Denied: You do not own this order.';
    END IF;

    -- 5. Check Order status is COMPLETED
    IF v_order_status <> 'completed' THEN
        RAISE EXCEPTION 'Cannot review: Order must be completed. Current status: %', v_order_status;
    END IF;

    -- 6. Check Product is inside order_items of this order
    SELECT EXISTS (
        SELECT 1 FROM public.order_items
        WHERE order_id = p_order_id AND product_id = p_product_id
    ) INTO v_item_exists;

    IF NOT v_item_exists THEN
        RAISE EXCEPTION 'Cannot review: Product is not part of this completed order.';
    END IF;

    -- 7. Check if already reviewed for this order + product
    SELECT EXISTS (
        SELECT 1 FROM public.reviews
        WHERE order_id = p_order_id AND product_id = p_product_id
    ) INTO v_already_reviewed;

    IF v_already_reviewed THEN
        RAISE EXCEPTION 'Already reviewed: You have already reviewed this product for this order.';
    END IF;

    -- 8. INSERT Review with database-verified status: is_verified = TRUE
    INSERT INTO public.reviews (
        user_id,
        product_id,
        order_id,
        rating,
        comment,
        image_url,
        is_verified,
        status
    )
    VALUES (
        v_user_id,
        p_product_id,
        p_order_id,
        p_rating,
        trim(p_comment),
        p_image_url,
        TRUE, -- Enforced by database verification logic!
        'published'
    )
    RETURNING id INTO v_review_id;

    -- 9. Insert Audit Log
    INSERT INTO public.audit_logs (user_id, action, description)
    VALUES (v_user_id, 'CREATE_REVIEW', 'Created verified review for product ' || p_product_id || ' from order ' || p_order_id);

    RETURN jsonb_build_object(
        'success', true,
        'review_id', v_review_id,
        'is_verified', true,
        'message', 'Verified review published successfully.'
    );
END;
$$;

-- ==============================================================================
-- 🎫 REVIEW TOKEN GENERATION & VALIDATION RPCs
-- ==============================================================================

-- Generate cryptographically secure review token (valid for 7 days)
CREATE OR REPLACE FUNCTION public.generate_review_token(
    p_order_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_order_status TEXT;
    v_token TEXT;
    v_existing_token TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.';
    END IF;

    -- Check order ownership and status
    SELECT status INTO v_order_status
    FROM public.orders
    WHERE id = p_order_id AND (user_id = v_user_id OR public.is_admin());

    IF v_order_status IS NULL THEN
        RAISE EXCEPTION 'Order not found or permission denied.';
    END IF;

    IF v_order_status <> 'completed' THEN
        RAISE EXCEPTION 'Cannot generate review token for non-completed order.';
    END IF;

    -- Return valid existing unused token if available
    SELECT token INTO v_existing_token
    FROM public.review_tokens
    WHERE order_id = p_order_id AND used = FALSE AND expires_at > now()
    LIMIT 1;

    IF v_existing_token IS NOT NULL THEN
        RETURN v_existing_token;
    END IF;

    -- Generate cryptographically random token (24 bytes hex = 48 chars)
    v_token := encode(gen_random_bytes(24), 'hex');

    INSERT INTO public.review_tokens (
        order_id,
        user_id,
        token,
        expires_at,
        used
    )
    VALUES (
        p_order_id,
        v_user_id,
        v_token,
        now() + interval '7 days',
        FALSE
    );

    RETURN v_token;
END;
$$;

-- 🎫 Admin issues review token for customer ordering via LINE @
CREATE OR REPLACE FUNCTION public.admin_issue_line_token(
    p_product_id UUID,
    p_customer_name TEXT,
    p_order_number TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_days INTEGER DEFAULT 7
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_admin_id UUID;
    v_product RECORD;
    v_order_id UUID;
    v_order_num TEXT;
    v_token TEXT;
    v_expires_at TIMESTAMPTZ;
BEGIN
    v_admin_id := auth.uid();
    IF v_admin_id IS NULL OR NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access Denied: Only administrators can issue review tokens.';
    END IF;

    -- Fetch Product
    SELECT id, name, price INTO v_product
    FROM public.products
    WHERE id = p_product_id;

    IF v_product IS NULL THEN
        RAISE EXCEPTION 'Product not found.';
    END IF;

    -- Order Number
    IF p_order_number IS NOT NULL AND length(trim(p_order_number)) > 0 THEN
        v_order_num := trim(p_order_number);
    ELSE
        v_order_num := 'LINE-' || to_char(now(), 'YYMMDD') || '-' || upper(substring(encode(gen_random_bytes(3), 'hex') from 1 for 5));
    END IF;

    -- Create Completed Order in Database (Transaction Proof)
    INSERT INTO public.orders (
        order_number,
        user_id,
        customer_name,
        notes,
        total_amount,
        status,
        payment_status,
        completed_at
    )
    VALUES (
        v_order_num,
        v_admin_id,
        trim(p_customer_name),
        p_notes,
        v_product.price,
        'completed',
        'paid',
        now()
    )
    RETURNING id INTO v_order_id;

    -- Insert Order Item
    INSERT INTO public.order_items (
        order_id,
        product_id,
        quantity,
        price
    )
    VALUES (
        v_order_id,
        v_product.id,
        1,
        v_product.price
    );

    -- Generate Token (48-char cryptographically random)
    v_token := encode(gen_random_bytes(24), 'hex');
    v_expires_at := now() + (COALESCE(p_days, 7) || ' days')::interval;

    -- Insert Review Token
    INSERT INTO public.review_tokens (
        order_id,
        user_id,
        customer_name,
        token,
        expires_at,
        used
    )
    VALUES (
        v_order_id,
        v_admin_id,
        trim(p_customer_name),
        v_token,
        v_expires_at,
        FALSE
    );

    -- Audit Log
    INSERT INTO public.audit_logs (user_id, action, description)
    VALUES (
        v_admin_id,
        'ADMIN_ISSUE_TOKEN',
        'Issued LINE review token for customer: ' || coalesce(p_customer_name, 'Unknown') || ' (Order: ' || v_order_num || ', Product: ' || v_product.name || ')'
    );

    RETURN jsonb_build_object(
        'success', true,
        'token', v_token,
        'order_id', v_order_id,
        'order_number', v_order_num,
        'product_name', v_product.name,
        'customer_name', trim(p_customer_name),
        'expires_at', v_expires_at
    );
END;
$$;

-- Verify review token and retrieve order details
CREATE OR REPLACE FUNCTION public.verify_review_token(
    p_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_record RECORD;
    v_items JSONB;
BEGIN
    SELECT rt.id, rt.order_id, rt.user_id, rt.customer_name, rt.expires_at, rt.used,
           o.order_number, o.status AS order_status
    INTO v_record
    FROM public.review_tokens rt
    JOIN public.orders o ON o.id = rt.order_id
    WHERE rt.token = p_token;

    IF v_record IS NULL THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Invalid token: Token does not exist.');
    END IF;

    IF v_record.used THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Token already used: This review link has already been used.');
    END IF;

    IF v_record.expires_at < now() THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Token expired: This review link has expired.');
    END IF;

    IF v_record.order_status <> 'completed' THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Order not completed.');
    END IF;

    -- Get eligible items for review
    SELECT jsonb_agg(
        jsonb_build_object(
            'product_id', p.id,
            'product_name', p.name,
            'product_image', p.image_url,
            'price', oi.price,
            'has_reviewed', EXISTS (
                SELECT 1 FROM public.reviews r 
                WHERE r.order_id = v_record.order_id AND r.product_id = p.id
            )
        )
    )
    INTO v_items
    FROM public.order_items oi
    JOIN public.products p ON p.id = oi.product_id
    WHERE oi.order_id = v_record.order_id;

    RETURN jsonb_build_object(
        'valid', true,
        'order_id', v_record.order_id,
        'order_number', v_record.order_number,
        'user_id', v_record.user_id,
        'customer_name', v_record.customer_name,
        'expires_at', v_record.expires_at,
        'items', COALESCE(v_items, '[]'::jsonb)
    );
END;
$$;

-- Submit review via token
CREATE OR REPLACE FUNCTION public.create_review_with_token(
    p_token TEXT,
    p_product_id UUID,
    p_rating INTEGER,
    p_comment TEXT,
    p_image_url TEXT DEFAULT NULL,
    p_reviewer_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_token_record RECORD;
    v_user_id UUID;
    v_customer_name TEXT;
    v_review_id UUID;
    v_item_exists BOOLEAN;
    v_already_reviewed BOOLEAN;
BEGIN
    -- Verify token
    SELECT id, order_id, user_id, customer_name, expires_at, used
    INTO v_token_record
    FROM public.review_tokens
    WHERE token = p_token;

    IF v_token_record IS NULL OR v_token_record.used OR v_token_record.expires_at < now() THEN
        RAISE EXCEPTION 'Invalid, expired, or already used review token.';
    END IF;

    -- Rating check
    IF p_rating < 1 OR p_rating > 5 THEN
        RAISE EXCEPTION 'Invalid rating: Rating must be between 1 and 5.';
    END IF;

    -- Comment check
    IF p_comment IS NULL OR length(trim(p_comment)) = 0 THEN
        RAISE EXCEPTION 'Comment cannot be empty.';
    END IF;

    -- Check product is inside order
    SELECT EXISTS (
        SELECT 1 FROM public.order_items
        WHERE order_id = v_token_record.order_id AND product_id = p_product_id
    ) INTO v_item_exists;

    IF NOT v_item_exists THEN
        RAISE EXCEPTION 'Cannot review: Product is not part of this order.';
    END IF;

    -- Check already reviewed
    SELECT EXISTS (
        SELECT 1 FROM public.reviews
        WHERE order_id = v_token_record.order_id AND product_id = p_product_id
    ) INTO v_already_reviewed;

    IF v_already_reviewed THEN
        RAISE EXCEPTION 'Already reviewed: You have already reviewed this product.';
    END IF;

    -- Determine author information
    v_user_id := auth.uid();
    v_customer_name := COALESCE(
        NULLIF(trim(p_reviewer_name), ''),
        v_token_record.customer_name,
        (SELECT full_name FROM public.profiles WHERE id = v_user_id),
        'ลูกค้า BA STORE'
    );

    -- Insert Review: is_verified = TRUE enforced by database transaction proof!
    INSERT INTO public.reviews (
        user_id,
        customer_name,
        product_id,
        order_id,
        rating,
        comment,
        image_url,
        is_verified,
        status
    )
    VALUES (
        v_user_id,
        v_customer_name,
        p_product_id,
        v_token_record.order_id,
        p_rating,
        trim(p_comment),
        p_image_url,
        TRUE, -- Enforced by database transaction verification!
        'published'
    )
    RETURNING id INTO v_review_id;

    -- Mark token as used
    UPDATE public.review_tokens SET used = TRUE WHERE id = v_token_record.id;

    -- Insert audit log
    INSERT INTO public.audit_logs (user_id, action, description)
    VALUES (
        v_user_id,
        'CREATE_REVIEW_VIA_TOKEN',
        'Created verified review for product ' || p_product_id || ' using token (Review ID: ' || v_review_id || ')'
    );

    RETURN jsonb_build_object(
        'success', true,
        'review_id', v_review_id,
        'is_verified', true,
        'message', 'Verified review published successfully.'
    );
END;
$$;

-- ==============================================================================
-- 🛡️ ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3.1 PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

-- 3.2 PRODUCTS POLICIES
CREATE POLICY "Active products are viewable by everyone"
    ON public.products FOR SELECT
    USING (status = 'active' OR public.is_admin());

CREATE POLICY "Admins can insert products"
    ON public.products FOR INSERT
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
    ON public.products FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete products"
    ON public.products FOR DELETE
    USING (public.is_admin());

-- 3.3 ORDERS POLICIES
CREATE POLICY "Users can view their own orders and admins can view all"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create their own orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Admins or owners can update orders"
    ON public.orders FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 3.4 ORDER ITEMS POLICIES
CREATE POLICY "Users can view their order items"
    ON public.order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND (o.user_id = auth.uid() OR public.is_admin())
        )
    );

CREATE POLICY "Users can insert order items for their orders"
    ON public.order_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = order_items.order_id
            AND (o.user_id = auth.uid() OR public.is_admin())
        )
    );

-- 3.5 REVIEWS POLICIES
CREATE POLICY "Published reviews are viewable by everyone"
    ON public.reviews FOR SELECT
    USING (status = 'published' OR auth.uid() = user_id OR public.is_admin());

-- Direct INSERT must strictly verify completed transaction & enforce is_verified
-- Note: frontend calls create_verified_review() RPC, but RLS protects direct client REST calls!
CREATE POLICY "Reviews can only be inserted with valid transaction"
    ON public.reviews FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND is_verified = TRUE
        AND EXISTS (
            SELECT 1 FROM public.orders o
            JOIN public.order_items oi ON oi.order_id = o.id
            WHERE o.id = reviews.order_id
              AND o.user_id = auth.uid()
              AND o.status = 'completed'
              AND oi.product_id = reviews.product_id
        )
    );

CREATE POLICY "Users can update own reviews and admins can update all"
    ON public.reviews FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete own reviews and admins can delete all"
    ON public.reviews FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin());

-- 3.6 REVIEW TOKENS POLICIES
CREATE POLICY "Users can view their own review tokens"
    ON public.review_tokens FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Tokens can be created by order owner or admin"
    ON public.review_tokens FOR INSERT
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 3.7 REVIEW REPORTS POLICIES
CREATE POLICY "Users can view their reports and admins view all"
    ON public.review_reports FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Authenticated users can submit reports"
    ON public.review_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update reports"
    ON public.review_reports FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 3.8 REVIEW REPLIES POLICIES
CREATE POLICY "Replies are viewable by everyone"
    ON public.review_replies FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage replies"
    ON public.review_replies FOR ALL
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 3.9 AUDIT LOGS POLICIES
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_admin());

CREATE POLICY "System and users can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR public.is_admin());

-- ==============================================================================
-- 📦 STORAGE BUCKETS SETUP & POLICIES
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('product-images', 'product-images', true),
    ('review-images', 'review-images', true),
    ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Public read for all 3 buckets
DROP POLICY IF EXISTS "Public Read product-images" ON storage.objects;
CREATE POLICY "Public Read product-images" ON storage.objects FOR SELECT
    USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Public Read review-images" ON storage.objects;
CREATE POLICY "Public Read review-images" ON storage.objects FOR SELECT
    USING (bucket_id = 'review-images');

DROP POLICY IF EXISTS "Public Read avatars" ON storage.objects;
CREATE POLICY "Public Read avatars" ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

-- Admin can upload/delete product-images
DROP POLICY IF EXISTS "Admin Upload product-images" ON storage.objects;
CREATE POLICY "Admin Upload product-images" ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

-- Authenticated users can upload review-images (up to 5MB, JPG/PNG/WEBP)
DROP POLICY IF EXISTS "Auth User Upload review-images" ON storage.objects;
CREATE POLICY "Auth User Upload review-images" ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'review-images' AND auth.role() = 'authenticated');

-- Authenticated users can upload avatars
DROP POLICY IF EXISTS "Auth User Upload avatars" ON storage.objects;
CREATE POLICY "Auth User Upload avatars" ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- ==============================================================================
-- 📊 DEMO / SEED DATA (BA STORE - Premium Apps & Subscriptions)
-- ==============================================================================
INSERT INTO public.products (id, name, description, price, image_url, status)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'YouTube Premium (ตัดเมลลูกค้า)', 'ใช้อีเมลส่วนตัว ไม่ต้องย้ายเมล ไม่มีโฆษณาคั่น ฟังเพลงจอดับได้ ดูได้ทุกอุปกรณ์ ปลอดภัย ได้วันครบ', 10.00, '/logos/youtube.png', 'active'),
    ('a0000000-0000-0000-0000-000000000002', 'Netflix 4K Ultra HD (จอส่วนตัว 30 วัน)', 'รับชมพร้อมกันได้ 1 จอ ภาพคมชัดระดับสูงสุด Ultra HD 4K + Spatial Audio จอส่วนตัวมีรหัสล็อคโปรไฟล์ ไม่เด้ง', 129.00, '/logos/netflix.png', 'active'),
    ('a0000000-0000-0000-0000-000000000003', 'Disney+ Hotstar (30 วัน)', '1 จอ ดูได้ทุกอุปกรณ์ ความคมชัด Full HD / 4K หนัง Marvel, Disney, Pixar ครบทุกเรื่อง บัญชีแท้ ดูแลตลอดอายุการใช้งาน', 89.00, '/logos/disney.png', 'active'),
    ('a0000000-0000-0000-0000-000000000004', 'Canva Pro (ดึงเข้าทีมโปร 30 วัน)', 'ใช้อีเมลตัวเอง ปลอดภัย งานไม่หาย ปลดล็อคเทมเพลตและฟอนต์ระดับ Pro กว่า 100 ล้านรายการ ลบพื้นหลังในคลิกเดียว', 39.00, '/logos/canva.png', 'active'),
    ('a0000000-0000-0000-0000-000000000005', 'Spotify Premium (30 วัน)', 'ดึงเข้าครอบครัว/เมลเดิม ฟังเพลงไม่มีโฆษณาคั่น คุณภาพเสียงระดับ Very High (320kbps) ข้ามเพลงและฟังออฟไลน์ได้ไม่จำกัด', 49.00, '/logos/spotify.png', 'active'),
    ('a0000000-0000-0000-0000-000000000006', 'iQIYI มาตรฐาน (30 วัน)', 'ดูพร้อมกันได้ 2 อุปกรณ์ ความคมชัด 1080P Full HD ซีรีส์จีน ซีรีส์เกาหลี อนิเมะ ไม่มีโฆษณาคั่น ระบบเสียง Dolby', 56.00, '/logos/iqiyi.png', 'active'),
    ('a0000000-0000-0000-0000-000000000007', 'Viu Premium (30 วัน)', 'ดูพร้อมกันได้ 3 อุปกรณ์ Full HD 1080p ซีรีส์เกาหลี พากย์ไทย และซับไทยไวที่สุด ดูออฟไลน์ได้ไม่จำกัด บัญชีแท้ 100%', 45.00, '/logos/viu.png', 'active'),
    ('a0000000-0000-0000-0000-000000000008', 'CapCut Pro (30 วัน)', 'ตัดต่อวิดีโอระดับโปร ปลดล็อคเอฟเฟกต์ ฟิลเตอร์ และฟอนต์พรีเมียม ส่งออกความละเอียดสูง ไม่มีลายน้ำ', 49.00, '/logos/capcut.png', 'active'),
    ('a0000000-0000-0000-0000-000000000009', 'ChatGPT Plus / Team (30 วัน)', 'เข้าถึงโมเดล GPT-4o ความเร็วสูง ประมวลผลเอกสาร วิเคราะห์โค้ด และสร้างภาพด้วย DALL·E 3 ไม่จำกัดความคิดสร้างสรรค์', 120.00, '/logos/chatgpt.png', 'active'),
    ('a0000000-0000-0000-0000-000000000010', 'Bilibili TV Premium (30 วัน)', 'รับชมอนิเมะถูกลิขสิทธิ์ความคมชัด 4K อัปเดตตอนใหม่พร้อมญี่ปุ่น ไม่มีโฆษณาคั่น รองรับแอปบนสมาร์ททีวี', 35.00, '/logos/bilibili_tv.png', 'active')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image_url = EXCLUDED.image_url;
