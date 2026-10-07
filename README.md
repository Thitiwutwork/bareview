# Verified Customer Review System (TrustReview)

ระบบเว็บไซต์สำหรับจัดเก็บและแสดงรีวิวจากลูกค้าตัวจริง โดยยึดหลักการความปลอดภัยสูงสุด:

> **“เฉพาะลูกค้าที่ซื้อสินค้า/ใช้บริการจริงเท่านั้น จึงจะสามารถเขียนรีวิวได้”**
>
> 🔐 **NO TRANSACTION = NO REVIEW**
>
> 🛒 **COMPLETED ORDER + PRODUCT IN ORDER = REVIEW PERMISSION**
>
> ✓ **VERIFIED CUSTOMER = DETERMINED BY DATABASE TRANSACTION ONLY**

ระบบไม่อนุญาตให้ผู้ที่ไม่เคยมีรายการสั่งซื้อที่สำเร็จสร้างรีวิวปลอมได้ และป้องกันไม่ให้ Frontend ส่งค่า `is_verified=true` เพื่อหลอกระบบได้โดยเด็ดขาด

---

## 1. Project Overview

ระบบจัดการรีวิวแบบดั้งเดิมมักเปิดให้ใครก็ได้เขียนรีวิว หรือตรวจสอบเพียงแค่ในระดับ Frontend ซึ่งง่ายต่อการถูกยิงบอทหรือดัดแปลง Request เพื่อสร้างรีวิวปลอม (Fake Reviews) 

**TrustReview System** แก้ปัญหานี้ด้วยสถาปัตยกรรม **Database-Driven Verification**:
- ทุกคำขอรีวิวต้องผ่าน PostgreSQL Stored Procedure / RPC (`create_verified_review`) ที่ทำงานในฝั่ง Supabase Server-side เท่านั้น
- มีการตรวจสอบแบบเรียลไทม์ว่า:
  1. ผู้ใช้ทำการยืนยันตัวตนแล้ว (`auth.uid()`)
  2. มี Order ID นั้นอยู่จริงและเป็นของบัญชีผู้ใช้นั้น
  3. สถานะคำสั่งซื้อต้องเป็น `completed` เท่านั้น
  4. สินค้าที่ระบุต้องอยู่ใน `order_items` ของคำสั่งซื้อนั้น
  5. ยังไม่เคยมีการรีวิวสินค้านี้จากคำสั่งซื้อนี้มาก่อน (Unique Constraint: `order_id + product_id`)
- หากผ่านเงื่อนไขครบถ้วน Database จะทำการบันทึกรีวิวพร้อมกำหนด `is_verified = TRUE` และบันทึกลง `audit_logs`
- หากไม่ผ่านเงื่อนไขแม้แต่ข้อเดียว Database จะ Raise Exception ปฏิเสธการบันทึกทันที

```
AUTH USER
    ↓
PROFILE
    ↓
ORDER (status = 'completed')
    ↓
ORDER ITEM (product_id match)
    ↓
DATABASE RPC VERIFICATION
    ↓
REVIEW (is_verified = TRUE)
    ↓
✓ VERIFIED CUSTOMER BADGE
```

---

## 2. Features

### Customer
- **Authentication**: สมัครสมาชิก และเข้าสู่ระบบผ่าน Supabase Auth พร้อม Zod Validation
- **Product Exploration**: ดูรายการสินค้า ค้นหา จัดเรียงตามคะแนน/ราคา/ล่าสุด และดูคะแนนเฉลี่ย
- **Product Details & Ratings Breakdown**: แสดงคะแนนเฉลี่ย, แถบแจกแจงดาว 1–5, ตัวกรองรีวิว (Latest, Highest, Lowest, Verified Only)
- **Order History**: ตรวจสอบประวัติการสั่งซื้อ วันที่ สถานะคำสั่งซื้อ (Completed, Pending, Cancelled)
- **Customer Dashboard**: สรุปจำนวนคำสั่งซื้อ สินค้าที่รอการรีวิว และประวัติรีวิวที่เขียนไปแล้ว
- **Review Submission**: ให้คะแนน 1–5 ดาว เขียนความคิดเห็น (ความยาว 5–1,000 ตัวอักษร) พร้อมแนบรูปภาพจริง
- **Review Management**: แก้ไขหรือลบรีวิวของตนเอง
- **Flag & Report**: ส่งรายงานรีวิวที่ไม่เหมาะสม (Spam, Offensive, Fake Review ฯลฯ)
- **QR Code Review**: รองรับการเปิดหน้ารีวิวผ่าน Cryptographically Secure Token และ QR Code

### Admin
- **Admin Portal**: แดชบอร์ดสรุปตัวเลขสถิติ (Total Customers, Orders, Reviews, Verified Count, Average Rating, Pending Reports)
- **Analytics & Graphs**: กราฟแท่งแสดงการกระจายคะแนน 1–5 ดาว และข้อมูลเตรียมพร้อมสำหรับ AI Sentiment Analysis
- **Product Management**: เพิ่ม ลบ แก้ไข ข้อมูลสินค้า ราคา รายละเอียด และอัปโหลดรูปภาพ
- **Order Management**: ตรวจสอบคำสั่งซื้อทั้งหมด และสามารถปรับเปลี่ยนสถานะคำสั่งซื้อ (Pending ↔ Completed)
- **Review Management**: ตรวจสอบรีวิวทั้งหมด ตอบกลับรีวิวในฐานะผู้ดูแลระบบ (Official Admin Reply) สั่งซ่อน (Hide) หรือลบรีวิว
  > *หมายเหตุความปลอดภัย: Admin ไม่สามารถเปลี่ยนรีวิวจาก Unverified เป็น Verified ผ่านปุ่มธรรมดาได้ สถานะ Verified ต้องเกิดจาก Transaction เท่านั้น*
- **Report Moderation**: ตรวจสอบข้อร้องเรียนรีวิวจากผู้ใช้ ดำเนินการเพิกถอน (Dismiss) หรือตรวจสอบแล้ว (Reviewed) พร้อมปุ่มซ่อนรีวิวทันที
- **User Management & Audit Trail**: ดูรายชื่อผู้ใช้ ปรับแต่ง Role (Customer ↔ Admin) และตรวจสอบ Audit Logs ทุกเหตุการณ์สำคัญ

---

## 3. Tech Stack

- **Frontend Core**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **Routing**: React Router DOM v7
- **Form & Validation**: React Hook Form, Zod, @hookform/resolvers
- **QR Code Generation**: qrcode.react
- **Backend & Database**: Supabase PostgreSQL, Supabase Auth, Supabase Storage, Supabase Row Level Security (RLS), Supabase RPC Functions

---

## 4. Database Schema

โครงสร้างตารางถูกออกแบบใน `public` schema ของ PostgreSQL:

### 1. `profiles`
เชื่อมโยงกับ `auth.users` โดยอัตโนมัติผ่าน Database Trigger:
- `id` UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
- `full_name` TEXT
- `email` TEXT NOT NULL
- `role` TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin'))
- `avatar_url` TEXT
- `status` TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended'))
- `created_at`, `updated_at` TIMESTAMPTZ

### 2. `products`
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `name` TEXT NOT NULL
- `description` TEXT
- `price` NUMERIC(10, 2) NOT NULL CHECK (price >= 0)
- `image_url` TEXT
- `status` TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived'))
- `created_at`, `updated_at` TIMESTAMPTZ

### 3. `orders`
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `order_number` TEXT UNIQUE NOT NULL
- `user_id` UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
- `total_amount` NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0)
- `status` TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'completed', 'cancelled'))
- `payment_status` TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'))
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- `completed_at` TIMESTAMPTZ

### 4. `order_items`
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `order_id` UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE
- `product_id` UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT
- `quantity` INTEGER NOT NULL CHECK (quantity > 0)
- `price` NUMERIC(10, 2) NOT NULL CHECK (price >= 0)
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### 5. `reviews`
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `user_id` UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
- `product_id` UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE
- `order_id` UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE
- `rating` INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5)
- `comment` TEXT NOT NULL
- `image_url` TEXT
- `is_verified` BOOLEAN NOT NULL DEFAULT FALSE
- `status` TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'pending'))
- `created_at`, `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- **Constraint**: `CONSTRAINT uq_order_product_review UNIQUE (order_id, product_id)`

### 6. `review_tokens`
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `order_id` UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE
- `user_id` UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
- `token` TEXT UNIQUE NOT NULL
- `expires_at` TIMESTAMPTZ NOT NULL
- `used` BOOLEAN NOT NULL DEFAULT FALSE
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### 7. `review_reports`
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `review_id` UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE
- `user_id` UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
- `reason` TEXT NOT NULL CHECK (reason IN ('Spam', 'Offensive', 'Advertisement', 'Fake Review', 'Inappropriate Content', 'Other'))
- `detail` TEXT
- `status` TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed'))
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

### 8. `review_replies`
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `review_id` UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE
- `admin_id` UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
- `reply` TEXT NOT NULL
- `created_at`, `updated_at` TIMESTAMPTZ NOT NULL DEFAULT now()
- **Constraint**: `CONSTRAINT uq_review_reply UNIQUE (review_id)`

### 9. `audit_logs`
- `id` UUID PRIMARY KEY DEFAULT gen_random_uuid()
- `user_id` UUID REFERENCES public.profiles(id) ON DELETE SET NULL
- `action` TEXT NOT NULL
- `description` TEXT NOT NULL
- `ip_address` TEXT
- `created_at` TIMESTAMPTZ NOT NULL DEFAULT now()

---

## 5. Supabase Setup

1. สร้างโปรเจกต์ใหม่ใน [Supabase](https://supabase.com)
2. ไปที่เมนู **SQL Editor**
3. เปิดไฟล์ `supabase/schema.sql` ในโปรเจกต์นี้ คัดลอกเนื้อหาทั้งหมดไปวางใน SQL Editor แล้วกด **Run**
4. สคริปต์จะดำเนินการอัตโนมัติ:
   - เปิด Extension `uuid-ossp` และ `pgcrypto`
   - สร้างตารางทั้ง 9 ตาราง พร้อม Constraints และ Foreign Keys
   - สร้าง Storage Buckets: `product-images`, `review-images`, `avatars`
   - สร้าง Triggers สำหรับ User Registration (`handle_new_user`) และ Order Completion
   - สร้าง Stored Procedures สำหรับ Verification:
     * `create_verified_review(...)`
     * `generate_review_token(...)`
     * `verify_review_token(...)`
     * `create_review_with_token(...)`
   - เปิดใช้งานและกำหนด Row Level Security (RLS) ครบทุกตาราง
   - แทรกข้อมูลสินค้าตัวอย่าง (Seed Products)

---

## 6. Environment Variables

สร้างไฟล์ `.env` ที่ root directory ของโปรเจกต์ (หรือแก้ไขจาก `.env.example`):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> **ข้อควรระวังเรื่องความปลอดภัย**: 
> - ห้ามนำ `service_role key` มาใส่ใน `.env` หรือโค้ด Frontend เด็ดขาด 
> - ให้ใช้เฉพาะ `anon public key` เท่านั้น ความปลอดภัยทั้งหมดถูกควบคุมโดย RLS และ RPC ในระดับฐานข้อมูล

---

## 7. Row Level Security (RLS) Policies

ทุกตารางเปิดใช้งาน `ROW LEVEL SECURITY`:

- **profiles**:
  - `SELECT`: ทุกคนสามารถดูโปรไฟล์สาธารณะได้
  - `UPDATE`: เจ้าของบัญชี หรือ Admin เท่านั้นที่แก้ไขได้
- **products**:
  - `SELECT`: ทุกคนสามารถดูสินค้าสถานะ active ได้ (Admin ดูได้ทั้งหมด)
  - `INSERT / UPDATE / DELETE`: บัญชีที่มี `role = 'admin'` เท่านั้น
- **orders**:
  - `SELECT`: เจ้าของ Order (`user_id = auth.uid()`) หรือ Admin
  - `INSERT`: ผู้ใช้งานสร้าง Order ของตัวเองได้
  - `UPDATE`: เจ้าของ Order หรือ Admin
- **order_items**:
  - `SELECT`: ผู้ที่มีสิทธิ์เข้าถึงคำสั่งซื้อนั้น
  - `INSERT`: เจ้าของคำสั่งซื้อในขั้นตอนสร้าง Order
- **reviews**:
  - `SELECT`: ทุกคนดูรีวิวที่ `status = 'published'` ได้ (ผู้เขียนและ Admin ดูรีวิวที่ hidden/pending ได้)
  - `INSERT`: ป้องกันการสร้างรีวิวตรงผ่าน REST API โดยกำหนด `WITH CHECK` ตรวจสอบคำสั่งซื้อ completed จริง และ `is_verified = TRUE` (หรือผ่าน `create_verified_review` RPC)
  - `UPDATE / DELETE`: เจ้าของรีวิว หรือ Admin
- **review_tokens**:
  - `SELECT`: เจ้าของ Token หรือ Admin
- **review_reports**:
  - `INSERT`: ผู้ใช้ที่เข้าสู่ระบบ
  - `SELECT / UPDATE`: Admin และผู้สร้างรายงาน
- **review_replies**:
  - `SELECT`: ทุกคนสามารถอ่านคำตอบกลับได้
  - `ALL`: Admin เท่านั้นที่ตอบกลับได้
- **audit_logs**:
  - `SELECT`: Admin เท่านั้น
  - `INSERT`: ผู้ใช้งานและระบบ

---

## 8. Local Development

### ความต้องการของระบบ
- Node.js (v18 ขึ้นไป)
- npm

### ขั้นตอนการรันโปรเจกต์
```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. ตั้งค่าตัวแปรใน .env ให้เชื่อมต่อ Supabase
cp .env.example .env

# 3. รัน Development Server
npm run dev
```

เปิดเบราว์เซอร์ไปที่ `http://localhost:5173`

### ทดสอบการ Build Production
```bash
npm run build
npm run preview
```

---

## 9. Testing Scenarios Walkthrough

ระบบถูกออกแบบให้ครอบคลุม Scenario การทดสอบทั้ง 10 กรณีตามข้อกำหนด:

### Test 1: User ไม่เคยซื้อสินค้า
- เมื่อเข้าหน้าสินค้านั้น จะไม่พบปุ่ม "เขียนรีวิว"
- หากพยายามเข้า URL `/review?product_id=xxx&order_id=yyy` โดยไม่มี Order:
  - **ผลลัพธ์**: ระบบแสดงข้อความปฏิเสธจาก Backend: *"Order not found: Specified order does not exist."*

### Test 2: User สั่งซื้อสินค้า แต่สถานะ Order = `pending`
- ไปที่หน้าแดชบอร์ดกด "+ สร้าง Order รอดำเนินการ (Pending)"
- เข้าหน้ารายละเอียด Order จะพบแถบแจ้งเตือน *"ยังไม่สามารถเขียนรีวิวได้ (No Transaction = No Review)"*
- หากพยายามส่งรีวิว:
  - **ผลลัพธ์**: Database RPC Raise Exception: *"Cannot review: Order must be completed. Current status: pending"*

### Test 3: User สั่งซื้อสินค้า และ Order = `completed`
- ไปที่แดชบอร์ดกด "+ สร้าง Order ที่สำเร็จแล้ว (Completed)" หรือให้ Admin ปรับสถานะเป็น Completed
- รายการสินค้าจะปรากฏใน "สินค้าที่คุณสามารถเขียนรีวิวได้"
- กดปุ่ม "เขียนรีวิว" ให้คะแนน กรอกความเห็น และกดยืนยัน:
  - **ผลลัพธ์**: บันทึกสำเร็จทันที รีวิวได้รับเครื่องหมาย `✓ Verified Customer` และแสดงบนหน้ารายละเอียดสินค้า

### Test 4: User ซื้อ Product A แต่พยายามรีวิว Product B
- นำ Order ID ของสินค้า A ไปจับคู่กับ Product ID ของสินค้า B ใน URL `/review?product_id=PROD_B&order_id=ORDER_A`
- **ผลลัพธ์**: Backend RPC ปฏิเสธ: *"Cannot review: Product is not part of this completed order."*

### Test 5: User รีวิว Product A ใน Order แล้ว พยายามรีวิวซ้ำ
- หลังจากส่งรีวิวแล้ว พยายามเข้า URL เดิมเพื่อส่งรีวิวอีกครั้ง
- **ผลลัพธ์**: ระบบและ Database Unique Constraint (`order_id + product_id`) ปฏิเสธ: *"Already reviewed: You have already reviewed this product for this order."*

### Test 6: Token หมดอายุ / ใช้แล้ว
- พยายามใช้ Review Token ที่มี `expires_at < now()` หรือ `used = TRUE`
- **ผลลัพธ์**: `verify_review_token` RPC ส่งคืน `valid: false` พร้อมข้อความแจ้งเตือน และไม่อนุญาตให้กรอกรีวิว

### Test 7: User แก้ไข URL เพื่อเปลี่ยน Order ID ของผู้อื่น
- ใส่ Order ID ของบัญชีอื่นใน URL:
  - **ผลลัพธ์**: ระบบตรวจพบ `v_order_user_id <> v_user_id` และตอบกลับ *"Access Denied: You do not own this order."*

### Test 8: Client พยายามส่ง `is_verified=true` เอง
- พยายามส่ง Payload REST API โดยกำหนด `is_verified=true` โดยไม่มี Transaction หรือส่งค่า `is_verified=false`:
  - **ผลลัพธ์**: ฟังก์ชัน RPC `create_verified_review` เพิกเฉยต่อ Input จาก Client และกำหนดค่าจาก Logic ในระดับ Database Transaction เท่านั้น

### Test 9: User พยายามดู Order ของบุคคลอื่น
- เข้า URL `/orders/OTHER_USER_ORDER_ID`
- **ผลลัพธ์**: Supabase RLS กรองข้อมูลออก ส่งผลให้หน้าจอแสดง *"ไม่พบคำสั่งซื้อนี้ หรือคุณไม่มีสิทธิ์เข้าถึง"*

### Test 10: Customer พยายามเข้าหน้า Admin Portal
- เข้า URL `/admin` ด้วยบัญชีที่มี Role เป็น `customer`
- **ผลลัพธ์**: หน้าจอแสดง *"การเข้าถึงถูกปฏิเสธ (Access Denied)"* ทันที

---

## 10. Security Considerations

1. **Defense in Depth**:
   - การตรวจสอบถูกวางไว้ 2 ชั้น: ชั้น Application Hook/Page UI และชั้น Database RPC + PostgreSQL Table Constraints + RLS
2. **No Trust in Client**:
   - ไม่มี Parameter ใดจาก Frontend ที่สามารถกำหนดสถานะ Verified ได้โดยตรง
3. **Cryptographic Tokens**:
   - Review Token ถูกสร้างด้วย `gen_random_bytes(24)` (ความยาว 48 Hex characters) ซึ่งไม่สามารถเดาหรือ Brute-force ได้
4. **Input Validation**:
   - ใช้ Zod Schema และ Form Validation บน Frontend พร้อม PostgreSQL Constraints (`CHECK (rating >= 1 AND rating <= 5)`)
5. **File Upload Security**:
   - ตรวจสอบ MIME Type (เฉพาะ JPG, PNG, WEBP) และจำกัดขนาดไม่เกิน 5MB พร้อมแยก Bucket ตามสิทธิ์
6. **Immutable Audit Trail**:
   - ทุกความเคลื่อนไหว (Login, Order, Review, Report, Reply) ถูกบันทึกลงตาราง `audit_logs` ซึ่งมี RLS ป้องกันการแก้ไขย้อนหลัง

---

## 11. Future Improvements

1. **AI Natural Language Sentiment Analysis**:
   - เชื่อมต่อ Supabase Edge Functions ร่วมกับ Google Gemini API เพื่อจัดหมวดหมู่ความรู้สึก (Positive, Neutral, Negative) และสกัดประเด็นปัญหา (e.g., Shipping, Quality, Service) อัตโนมัติ
2. **Helpful Vote System**:
   - ระบบโหวตรีวิวที่มีประโยชน์ ("Was this review helpful?") พร้อมการป้องกันการปั๊มโหวต
3. **Automated QR Code on Receipts / Email**:
   - สร้าง Trigger ส่ง Webhook ไปยังผู้ให้บริการ Email เพื่อแนบ QR Code อัตโนมัติเมื่อสถานะคำสั่งซื้อเปลี่ยนเป็น Completed
4. **Multi-image Upload & Video Reviews**:
   - ขยายขีดความสามารถ Storage ให้รองรับการอัปโหลดวิดีโอสั้นหรือรูปภาพหลายรูปต่อหนึ่งรีวิว
