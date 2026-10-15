import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT_DIR = process.cwd();
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const DOCS_DIR = path.join(ROOT_DIR, 'docs');

function getBase64Image(filePath, mimeType) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath);
      return `data:${mimeType};base64,${data.toString('base64')}`;
    }
  } catch (err) {
    console.warn(`Could not read ${filePath}:`, err.message);
  }
  return '';
}

const logoBase64 = getBase64Image(path.join(PUBLIC_DIR, 'images', 'logo.jpg'), 'image/jpeg');
const bannerBase64 = getBase64Image(path.join(PUBLIC_DIR, 'images', 'banner.jpg'), 'image/jpeg');
const ytBase64 = getBase64Image(path.join(PUBLIC_DIR, 'logos', 'youtube.png'), 'image/png');
const nfBase64 = getBase64Image(path.join(PUBLIC_DIR, 'logos', 'netflix.png'), 'image/png');
const canvaBase64 = getBase64Image(path.join(PUBLIC_DIR, 'logos', 'canva.png'), 'image/png');
const spotifyBase64 = getBase64Image(path.join(PUBLIC_DIR, 'logos', 'spotify.png'), 'image/png');
const disneyBase64 = getBase64Image(path.join(PUBLIC_DIR, 'logos', 'disney.png'), 'image/png');
const capcutBase64 = getBase64Image(path.join(PUBLIC_DIR, 'logos', 'capcut.png'), 'image/png');
const chatgptBase64 = getBase64Image(path.join(PUBLIC_DIR, 'logos', 'chatgpt.png'), 'image/png');

const htmlContent = `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>คู่มือการใช้งานระบบรีวิวยืนยันลูกค้าจริง — BA STORE</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Mitr:wght@400;500;600;700&family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 14mm 12mm 14mm 12mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Prompt', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #374151;
      background-color: #ffffff;
      line-height: 1.5;
      font-size: 11pt;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    h1, h2, h3, h4, .font-heading {
      font-family: 'Mitr', 'Prompt', sans-serif;
      font-weight: 600;
      color: #111827;
    }
    .page-break {
      page-break-before: always;
      break-before: page;
    }
    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }

    /* Container */
    .container {
      width: 100%;
      max-width: 100%;
    }

    /* Colors */
    .text-pink-600 { color: #ec4899; }
    .text-pink-700 { color: #be185d; }
    .text-emerald-600 { color: #059669; }
    .text-emerald-700 { color: #047857; }
    .text-slate-500 { color: #64748b; }
    .text-slate-700 { color: #334155; }
    .text-slate-900 { color: #0f172a; }
    .bg-pink-50 { background-color: #fdf2f8; }
    .bg-pink-100 { background-color: #fce7f3; }
    .bg-pink-600 { background-color: #ec4899; }
    .bg-emerald-50 { background-color: #ecfdf5; }
    .bg-emerald-100 { background-color: #d1fae5; }
    .bg-emerald-600 { background-color: #059669; }
    .bg-slate-50 { background-color: #f8fafc; }
    .bg-slate-100 { background-color: #f1f5f9; }
    .bg-slate-900 { background-color: #0f172a; }

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 8.5pt;
      font-weight: 600;
    }
    .badge-verified {
      background-color: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
    }
    .badge-pink {
      background-color: #fdf2f8;
      color: #be185d;
      border: 1px solid #fbcfe8;
    }
    .badge-slate {
      background-color: #f1f5f9;
      color: #334155;
      border: 1px solid #cbd5e1;
    }

    /* Cover / Header */
    .header-box {
      border: 2px solid #fbcfe8;
      background: linear-gradient(135deg, #fdf5f8 0%, #ffffff 50%, #fdf2f8 100%);
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 20px;
      position: relative;
    }
    .header-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .logo-img {
      width: 80px;
      height: 80px;
      border-radius: 18px;
      border: 3px solid #ffffff;
      box-shadow: 0 4px 12px rgba(236, 72, 153, 0.2);
      object-fit: cover;
    }

    /* Cards */
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 16px;
      margin-bottom: 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
    }
    .card-highlight {
      border-color: #fbcfe8;
      background-color: #fffafc;
    }

    /* Section titles */
    .section-title {
      font-size: 15pt;
      border-bottom: 2px solid #f472b6;
      padding-bottom: 6px;
      margin-top: 22px;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-number {
      background-color: #ec4899;
      color: #ffffff;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11pt;
      font-weight: 700;
    }

    /* Step boxes */
    .step-box {
      display: flex;
      gap: 14px;
      margin-bottom: 14px;
      padding: 14px;
      border-radius: 12px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
    }
    .step-num {
      width: 32px;
      height: 32px;
      background: #ec4899;
      color: #ffffff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 12pt;
      flex-shrink: 0;
    }

    /* Mockups / UI representations */
    .browser-mockup {
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      overflow: hidden;
      background: #ffffff;
      margin: 12px 0 16px 0;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }
    .browser-bar {
      background: #f1f5f9;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 8pt;
      color: #64748b;
    }
    .browser-dots {
      display: flex;
      gap: 4px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .dot-red { background: #ef4444; }
    .dot-yellow { background: #eab308; }
    .dot-green { background: #22c55e; }
    .browser-url {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 2px 12px;
      font-family: monospace;
      font-size: 8pt;
      color: #475569;
      flex-grow: 1;
    }
    .browser-content {
      padding: 14px;
      background: #fdf5f8;
    }

    /* Grid layout */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
    }
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }

    /* Table */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 9.5pt;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 8px 10px;
      text-align: left;
    }
    th {
      background-color: #f8fafc;
      font-weight: 600;
      color: #1e293b;
    }
    tr:nth-child(even) {
      background-color: #fafaf9;
    }

    /* Callout */
    .callout {
      border-left: 4px solid #ec4899;
      background: #fff5f8;
      padding: 10px 14px;
      border-radius: 0 10px 10px 0;
      margin: 10px 0;
      font-size: 10pt;
    }
    .callout-emerald {
      border-left-color: #059669;
      background: #f0fdf4;
    }
    .callout-amber {
      border-left-color: #d97706;
      background: #fffbeb;
    }

    /* Star rating */
    .stars {
      color: #f59e0b;
      font-size: 11pt;
      letter-spacing: 2px;
    }

    /* App item pill */
    .app-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      background: #ffffff;
      border: 1px solid #fbcfe8;
      border-radius: 10px;
    }
    .app-icon {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }

    /* Flowchart Node */
    .flow-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      margin: 14px 0;
    }
    .flow-node {
      flex: 1;
      background: #ffffff;
      border: 1.5px solid #fbcfe8;
      border-radius: 12px;
      padding: 10px 8px;
      text-align: center;
      font-size: 8.5pt;
      font-weight: 600;
      box-shadow: 0 2px 5px rgba(236,72,153,0.05);
    }
    .flow-node-active {
      border-color: #ec4899;
      background: #fff0f6;
      color: #be185d;
    }
    .flow-node-verified {
      border-color: #10b981;
      background: #ecfdf5;
      color: #047857;
    }
    .flow-arrow {
      color: #ec4899;
      font-weight: bold;
      font-size: 14pt;
    }
  </style>
</head>
<body>

  <!-- ==================== หน้า 1: บทนำ & ภาพรวมระบบ ==================== -->
  <div class="container">
    <!-- Header Box -->
    <div class="header-box">
      <div class="header-content">
        ${logoBase64 ? `<img src="${logoBase64}" class="logo-img" alt="BA STORE Logo">` : ''}
        <div>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span class="badge badge-pink">คู่มือการใช้งานระบบฉบับสมบูรณ์ (Official User Manual)</span>
            <span class="badge badge-verified">✓ 100% Verified Customer Reviews</span>
          </div>
          <h1 style="font-size: 20pt; line-height: 1.2; color: #111827;">
            BA STORE — ระบบรีวิวเฉพาะลูกค้าที่ซื้อจริง
          </h1>
          <p style="font-size: 10pt; color: #64748b; margin-top: 4px;">
            จำหน่ายแอพพลิเคชั่นพรีเมียมราคาปลีกสุดคุ้ม • สั่งซื้อผ่าน LINE: <strong>@bastore</strong> • ปลอดรีวิวปลอม 100%
          </p>
        </div>
      </div>
    </div>

    <!-- กฎเหล็กของระบบ (Core Business Rule) -->
    <div class="callout callout-emerald avoid-break">
      <strong style="color: #047857; font-size: 11pt;">🛡️ กฎเหล็กความปลอดภัย: "No Transaction = No Review"</strong>
      <p style="margin-top: 4px; color: #065f46; font-size: 9.5pt;">
        ผู้ใช้ทั่วไปจะไม่สามารถสุ่มเขียนรีวิวเองได้ และผู้ใช้ไม่สามารถส่งค่า <code>is_verified=true</code> จากหน้าบ้านเพื่อหลอกระบบได้ 
        รีวิวจะได้รับสิทธิ์และประทับตรา <strong>✓ Verified Customer</strong> ได้ต่อเมื่อมีรายการคำสั่งซื้อที่เสร็จสมบูรณ์ (Completed Order) ในฐานข้อมูล PostgreSQL จริงเท่านั้น
      </p>
    </div>

    <!-- แผนภาพภาพรวมการทำงาน (End-to-End Workflow) -->
    <h2 class="section-title">
      <span class="section-number">1</span>
      <span>ผังกระบวนการซื้อขายและรีวิวจริง (End-to-End Workflow)</span>
    </h2>

    <div class="flow-row avoid-break">
      <div class="flow-node">
        <div style="font-size: 14pt; margin-bottom: 3px;">💬</div>
        1. ทักแชท LINE<br><span style="font-size: 7.5pt; color: #64748b;">ลูกค้าสั่งซื้อแอพทาง @bastore</span>
      </div>
      <div class="flow-arrow">➔</div>
      <div class="flow-node">
        <div style="font-size: 14pt; margin-bottom: 3px;">💸</div>
        2. โอนเงิน & รับแอพ<br><span style="font-size: 7.5pt; color: #64748b;">ลูกค้าส่งสลิป แอดมินส่งมอบบัญชี</span>
      </div>
      <div class="flow-arrow">➔</div>
      <div class="flow-node flow-node-active">
        <div style="font-size: 14pt; margin-bottom: 3px;">🎫</div>
        3. ออก Token รีวิว<br><span style="font-size: 7.5pt; color: #be185d;">แอดมินออก Token ส่งใน LINE</span>
      </div>
      <div class="flow-arrow">➔</div>
      <div class="flow-node">
        <div style="font-size: 14pt; margin-bottom: 3px;">✍️</div>
        4. ลูกค้าเปิดลิงก์รีวิว<br><span style="font-size: 7.5pt; color: #64748b;">ให้ 1-5 ดาว + แนบรูป</span>
      </div>
      <div class="flow-arrow">➔</div>
      <div class="flow-node flow-node-verified">
        <div style="font-size: 14pt; margin-bottom: 3px;">✓</div>
        5. ได้รับ Verified Badge<br><span style="font-size: 7.5pt; color: #047857;">ขึ้นหน้าร้านทันที ปลอดรีวิวปลอม</span>
      </div>
    </div>

    <!-- แอพพลิเคชั่นที่จำหน่าย -->
    <div class="card avoid-break">
      <h3 style="font-size: 11pt; margin-bottom: 8px; color: #0f172a;">📱 แอพพลิเคชั่นที่จำหน่ายในร้าน BA STORE:</h3>
      <div class="grid-4">
        <div class="app-pill">
          ${ytBase64 ? `<img src="${ytBase64}" class="app-icon">` : ''}
          <div><div style="font-size: 8.5pt; font-weight: bold;">YouTube Prem.</div><div style="font-size: 7.5pt; color: #ec4899;">฿10 / เดือน</div></div>
        </div>
        <div class="app-pill">
          ${nfBase64 ? `<img src="${nfBase64}" class="app-icon">` : ''}
          <div><div style="font-size: 8.5pt; font-weight: bold;">Netflix 4K UHD</div><div style="font-size: 7.5pt; color: #ec4899;">฿129 / เดือน</div></div>
        </div>
        <div class="app-pill">
          ${canvaBase64 ? `<img src="${canvaBase64}" class="app-icon">` : ''}
          <div><div style="font-size: 8.5pt; font-weight: bold;">Canva Pro Edu</div><div style="font-size: 7.5pt; color: #ec4899;">฿39 / เดือน</div></div>
        </div>
        <div class="app-pill">
          ${spotifyBase64 ? `<img src="${spotifyBase64}" class="app-icon">` : ''}
          <div><div style="font-size: 8.5pt; font-weight: bold;">Spotify Prem.</div><div style="font-size: 7.5pt; color: #ec4899;">฿49 / เดือน</div></div>
        </div>
      </div>
      <div class="grid-4" style="margin-top: 6px;">
        <div class="app-pill">
          ${disneyBase64 ? `<img src="${disneyBase64}" class="app-icon">` : ''}
          <div><div style="font-size: 8.5pt; font-weight: bold;">Disney+ Hotstar</div><div style="font-size: 7.5pt; color: #ec4899;">฿89 / เดือน</div></div>
        </div>
        <div class="app-pill">
          ${capcutBase64 ? `<img src="${capcutBase64}" class="app-icon">` : ''}
          <div><div style="font-size: 8.5pt; font-weight: bold;">CapCut Pro</div><div style="font-size: 7.5pt; color: #ec4899;">฿49 / เดือน</div></div>
        </div>
        <div class="app-pill">
          ${chatgptBase64 ? `<img src="${chatgptBase64}" class="app-icon">` : ''}
          <div><div style="font-size: 8.5pt; font-weight: bold;">ChatGPT Plus</div><div style="font-size: 7.5pt; color: #ec4899;">฿120 / เดือน</div></div>
        </div>
        <div class="app-pill" style="justify-content: center; background: #fdf2f8;">
          <div style="font-size: 8pt; color: #be185d; font-weight: bold; text-align: center;">และแอพอื่นๆ อีกมากมาย</div>
        </div>
      </div>
    </div>

    <!-- ตารางบทบาทผู้ใช้ (User Roles) -->
    <h3 style="font-size: 11pt; margin-top: 14px; margin-bottom: 6px;">👥 สิทธิ์และบทบาทของผู้ใช้งาน (User Roles)</h3>
    <table class="avoid-break">
      <thead>
        <tr>
          <th style="width: 25%;">บทบาท (Role)</th>
          <th style="width: 45%;">สิทธิ์การทำงาน</th>
          <th style="width: 30%;">ความปลอดภัย / การเข้าถึง</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>ลูกค้า (Customer / Guest)</strong></td>
          <td>• เลือกดูสินค้า & สั่งซื้อผ่าน LINE<br>• เขียนรีวิวเมื่อมี Token จากคำสั่งซื้อที่สำเร็จ<br>• ให้คะแนน 1-5 ดาว, คอมเมนต์, แนบรูปจริง<br>• รายงานรีวิวที่ไม่เหมาะสม</td>
          <td>เข้าถึงเฉพาะคำสั่งซื้อและรีวิวของตนเอง ไม่สามารถปรับสถานะ Verified เองได้</td>
        </tr>
        <tr>
          <td><strong>ผู้ดูแลระบบ (Admin)</strong></td>
          <td>• ออกรหัส Token สำหรับลูกค้าที่ซื้อทาง LINE<br>• จัดการคำสั่งซื้อและสถานะ (Completed)<br>• ตอบกลับรีวิวลูกค้า (Official Reply)<br>• ซ่อนรีวิวที่ไม่เหมาะสม / ดู Audit Logs</td>
          <td>ต้องล็อกอินด้วย Role Admin ในระบบ มีหน้าพอร์ทัล <code>/admin</code> โดยเฉพาะ</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ==================== หน้า 2: หน้าตาเว็บและ UI Preview ==================== -->
  <div class="page-break"></div>
  <div class="container">
    <h2 class="section-title">
      <span class="section-number">2</span>
      <span>หน้าตาเว็บจริงและองค์ประกอบของระบบ (UI Previews)</span>
    </h2>
    <p style="font-size: 9.5pt; color: #64748b; margin-bottom: 12px;">
      ภาพจำลองหน้าจอและองค์ประกอบสำคัญในเว็บไซต์ BA STORE ตามโครงสร้างที่พัฒนาขึ้นจริง
    </p>

    <!-- UI Preview 1: หน้าหลัก Home Page -->
    <div class="browser-mockup avoid-break">
      <div class="browser-bar">
        <div class="browser-dots">
          <div class="dot dot-red"></div>
          <div class="dot dot-yellow"></div>
          <div class="dot dot-green"></div>
        </div>
        <div class="browser-url">https://bastore.com/ (หน้าแรก BA STORE)</div>
      </div>
      <div class="browser-content">
        <!-- Banner Mockup -->
        <div style="background: linear-gradient(135deg, #fbcfe8, #f472b6); border-radius: 12px; padding: 14px; color: #ffffff; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 8pt; background: rgba(255,255,255,0.25); display: inline-block; padding: 2px 8px; border-radius: 12px; margin-bottom: 4px;">ร้านค้าแท้ 100% มีใบเสร็จยืนยัน</div>
            <div style="font-size: 14pt; font-weight: bold; font-family: 'Mitr', sans-serif;">BA STORE — จำหน่ายแอพพรีเมียมราคาปลีก</div>
            <div style="font-size: 8.5pt; opacity: 0.9;">ได้วันใช้งานครบแน่นอน • จัดส่งไว 5-15 นาที • รีวิวจากลูกค้าจริง 100%</div>
          </div>
          <div style="background: #06C755; color: #fff; padding: 6px 12px; border-radius: 10px; font-size: 8.5pt; font-weight: bold;">
            LINE: @bastore
          </div>
        </div>

        <!-- 3 Feature Cards -->
        <div class="grid-3" style="margin-bottom: 10px;">
          <div style="background: #fff; padding: 8px 10px; border-radius: 8px; border: 1px solid #fce7f3; font-size: 8pt;">
            <strong style="color: #047857;">✓ ได้วันใช้งานครบ 100%</strong>
            <div style="color: #64748b; font-size: 7pt;">ของแท้ ปลอดภัย ไม่เด้ง</div>
          </div>
          <div style="background: #fff; padding: 8px 10px; border-radius: 8px; border: 1px solid #fce7f3; font-size: 8pt;">
            <strong style="color: #ec4899;">⚡ จัดส่งไว 5-15 นาที</strong>
            <div style="color: #64748b; font-size: 7pt;">เปิดบริการ 09:00 - 23:00 น.</div>
          </div>
          <div style="background: #fff; padding: 8px 10px; border-radius: 8px; border: 1px solid #fce7f3; font-size: 8pt;">
            <strong style="color: #ec4899;">🛡️ ดูแลตลอดการใช้งาน</strong>
            <div style="color: #64748b; font-size: 7pt;">มีทีมงานคอยบริการตลอด</div>
          </div>
        </div>

        <!-- Product Cards Showcase in Mockup -->
        <div style="font-size: 9pt; font-weight: bold; margin-bottom: 6px; color: #1e293b;">แอพพรีเมียมยอดนิยม:</div>
        <div class="grid-3">
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; text-align: center;">
            ${ytBase64 ? `<img src="${ytBase64}" style="width: 32px; height: 32px; margin: 0 auto 4px auto; display: block;">` : ''}
            <div style="font-size: 8.5pt; font-weight: bold;">YouTube Premium</div>
            <div style="font-size: 7.5pt; color: #64748b;">ไม่มีโฆษณา • เล่นพื้นหลัง</div>
            <div style="font-size: 10pt; font-weight: bold; color: #ec4899; margin: 4px 0;">฿10 <span style="font-size: 7pt; color: #94a3b8;">/เดือน</span></div>
            <div style="background: #06C755; color: #fff; border-radius: 6px; padding: 3px; font-size: 7.5pt; font-weight: bold;">สั่งซื้อทาง LINE</div>
          </div>
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; text-align: center;">
            ${nfBase64 ? `<img src="${nfBase64}" style="width: 32px; height: 32px; margin: 0 auto 4px auto; display: block;">` : ''}
            <div style="font-size: 8.5pt; font-weight: bold;">Netflix 4K UHD</div>
            <div style="font-size: 7.5pt; color: #64748b;">ภาพคมชัดระดับ 4K HDR</div>
            <div style="font-size: 10pt; font-weight: bold; color: #ec4899; margin: 4px 0;">฿129 <span style="font-size: 7pt; color: #94a3b8;">/เดือน</span></div>
            <div style="background: #06C755; color: #fff; border-radius: 6px; padding: 3px; font-size: 7.5pt; font-weight: bold;">สั่งซื้อทาง LINE</div>
          </div>
          <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; text-align: center;">
            ${canvaBase64 ? `<img src="${canvaBase64}" style="width: 32px; height: 32px; margin: 0 auto 4px auto; display: block;">` : ''}
            <div style="font-size: 8.5pt; font-weight: bold;">Canva Pro</div>
            <div style="font-size: 7.5pt; color: #64748b;">เทมเพลตพรีเมียมครบ</div>
            <div style="font-size: 10pt; font-weight: bold; color: #ec4899; margin: 4px 0;">฿39 <span style="font-size: 7pt; color: #94a3b8;">/เดือน</span></div>
            <div style="background: #06C755; color: #fff; border-radius: 6px; padding: 3px; font-size: 7.5pt; font-weight: bold;">สั่งซื้อทาง LINE</div>
          </div>
        </div>
      </div>
    </div>

    <!-- UI Preview 2: แผงควบคุมของแอดมินสำหรับออก Token -->
    <div class="browser-mockup avoid-break">
      <div class="browser-bar">
        <div class="browser-dots">
          <div class="dot dot-red"></div>
          <div class="dot dot-yellow"></div>
          <div class="dot dot-green"></div>
        </div>
        <div class="browser-url">https://bastore.com/admin/tokens (ระบบออกรหัสรีวิวให้ลูกค้า LINE)</div>
      </div>
      <div class="browser-content" style="background: #f8fafc;">
        <div class="grid-2">
          <!-- ฟอร์มออก Token -->
          <div style="background: #fff; padding: 12px; border-radius: 10px; border: 1px solid #e2e8f0; font-size: 8.5pt;">
            <div style="font-weight: bold; margin-bottom: 8px; color: #ec4899; font-size: 9pt;">✨ 1. ฟอร์มออก Token ด่วน:</div>
            <div style="margin-bottom: 6px;">
              <label style="color: #475569; display: block; font-size: 7.5pt; font-weight: bold;">เลือกสินค้าที่ลูกค้าซื้อ:</label>
              <div style="background: #f1f5f9; padding: 4px 8px; border-radius: 6px; border: 1px solid #cbd5e1;">Netflix 4K UHD (฿129.00)</div>
            </div>
            <div style="margin-bottom: 6px;">
              <label style="color: #475569; display: block; font-size: 7.5pt; font-weight: bold;">ชื่อลูกค้า / บัญชี LINE:</label>
              <div style="background: #f1f5f9; padding: 4px 8px; border-radius: 6px; border: 1px solid #cbd5e1;">@nongmook_line</div>
            </div>
            <div style="margin-bottom: 8px;">
              <label style="color: #475569; display: block; font-size: 7.5pt; font-weight: bold;">อายุ Token:</label>
              <span class="badge badge-pink" style="font-size: 7.5pt;">7 วัน (แนะนำ)</span>
            </div>
            <div style="background: #ec4899; color: #fff; text-align: center; padding: 6px; border-radius: 8px; font-weight: bold;">
              ออกรหัสรีวิว & สร้างข้อความ LINE
            </div>
          </div>

          <!-- กล่องข้อความสำเร็จรูปพร้อมส่ง -->
          <div style="background: #ffffff; padding: 12px; border-radius: 10px; border: 1.5px solid #a7f3d0; font-size: 8.5pt;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-weight: bold; color: #047857;">💬 2. ข้อความพร้อมส่งใน LINE:</span>
              <span class="badge badge-verified" style="font-size: 7pt;">📋 คลิกเดียวคัดลอก</span>
            </div>
            <div style="background: #ecfdf5; border: 1px dashed #6ee7b7; border-radius: 8px; padding: 8px; font-size: 7.5pt; line-height: 1.4; color: #065f46;">
              ขอบคุณที่อุดหนุน Netflix 4K UHD กับ BA STORE นะคะ ❤️<br><br>
              รบกวนลูกค้ารีวิวบริการเพื่อสะสมความน่าเชื่อถือและรับประกันตลอดอายุการใช้งานได้ที่ลิงก์นี้เลยค่า:<br>
              👉 <u>https://bastore.com/review?token=4f8a9e...</u><br><br>
              (สิทธิ์รีวิวลูกค้าจริง Verified Customer ✓ | ใช้ได้ภายใน 7 วันนะคะ)
            </div>
            <div style="margin-top: 8px; font-size: 7pt; color: #64748b; text-align: center;">
              * แอดมินสามารถบันทึกภาพ QR Code ส่งในแชทให้ลูกค้าสแกนได้ทันที
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== หน้า 3: ขั้นตอนการใช้งานทีละสเต็ป ==================== -->
  <div class="page-break"></div>
  <div class="container">
    <h2 class="section-title">
      <span class="section-number">3</span>
      <span>ขั้นตอนการใช้งานทีละสเต็ป (Step-by-Step Instructions)</span>
    </h2>

    <!-- สเต็ปที่ 1: ลูกค้าทักแชท -->
    <div class="step-box avoid-break">
      <div class="step-num">1</div>
      <div>
        <h3 style="font-size: 11pt; color: #0f172a; margin-bottom: 4px;">ลูกค้าทักแชทสั่งซื้อผ่าน LINE @bastore</h3>
        <p style="font-size: 9.5pt; color: #475569; margin-bottom: 6px;">
          ลูกค้าเข้าชมแคตตาล็อกหน้าเว็บ <code>/products</code> เพื่อดูราคาและแพ็กเกจ จากนั้นกดปุ่มสีเขียว <strong>"สั่งซื้อผ่าน LINE (@bastore)"</strong> ระบบจะเปิดแชท LINE พร้อมพิมพ์ข้อความสนใจสั่งซื้อให้อัตโนมัติ ลูกค้าชำระเงินโดยการโอนและส่งสลิปในแชท
        </p>
        <span class="badge badge-slate">ช่องทางติดต่อ: LINE Official Account @bastore</span>
      </div>
    </div>

    <!-- สเต็ปที่ 2: แอดมินออกรหัส Token -->
    <div class="step-box avoid-break">
      <div class="step-num">2</div>
      <div>
        <h3 style="font-size: 11pt; color: #0f172a; margin-bottom: 4px;">แอดมินส่งมอบบัญชี และออกรหัส Token รีวิว</h3>
        <p style="font-size: 9.5pt; color: #475569; margin-bottom: 6px;">
          หลังจากส่งมอบบัญชีแอพให้ลูกค้าในแชทเรียบร้อยแล้ว แอดมินเปิดระบบที่หน้า <code>/admin/tokens</code>:
        </p>
        <ol style="font-size: 9pt; color: #334155; padding-left: 18px; line-height: 1.5; margin-bottom: 6px;">
          <li>เลือกสินค้าที่ลูกค้าสั่งซื้อ (เช่น Netflix 4K, YouTube Premium)</li>
          <li>กรอกชื่อลูกค้าหรือชื่อบัญชี LINE (เช่น <em>@น้องพิม</em>, <em>ลูกค้าประจำ 081-xxx</em>)</li>
          <li>กดปุ่ม <strong>"ออกรหัสรีวิว & สร้างข้อความ LINE"</strong></li>
          <li>กดปุ่มสีเขียว <strong>"📋 คัดลอกข้อความ LINE"</strong> เพียงคลิกเดียว แล้วนำไปวางส่งในแชท LINE ของลูกค้า</li>
        </ol>
        <div class="callout callout-amber" style="margin-top: 6px;">
          <strong>ความปลอดภัยในขั้นตอนนี้:</strong> ระบบจะสร้างรายการคำสั่งซื้อสถานะ <code>completed</code> ในฐานข้อมูลพร้อมกันทันที เป็นหลักฐานการซื้อขายที่แท้จริง
        </div>
      </div>
    </div>

    <!-- สเต็ปที่ 3: ลูกค้าเปิดลิงก์รีวิว -->
    <div class="step-box avoid-break">
      <div class="step-num">3</div>
      <div>
        <h3 style="font-size: 11pt; color: #0f172a; margin-bottom: 4px;">ลูกค้าเปิดลิงก์รีวิวและเขียนรีวิว (Customer Experience)</h3>
        <p style="font-size: 9.5pt; color: #475569; margin-bottom: 8px;">
          เมื่อลูกค้าคลิกลิงก์ที่ได้รับจากแอดมินในแชท LINE (เช่น <code>/review?token=...</code>) ระบบจะเปิดหน้าเขียนรีวิวขึ้นมาทันที:
        </p>

        <!-- Mockup หน้าเขียนรีวิว -->
        <div style="background: #ffffff; border: 1.5px solid #fbcfe8; border-radius: 12px; padding: 12px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #fce7f3; padding-bottom: 6px; margin-bottom: 8px;">
            <div style="font-weight: bold; font-size: 9pt;">เขียนรีวิวสินค้า</div>
            <span class="badge badge-verified">✓ Verified Customer Guaranteed</span>
          </div>

          <!-- Product Banner inside Review Form -->
          <div style="display: flex; align-items: center; gap: 8px; background: #fdf5f8; padding: 6px 10px; border-radius: 8px; margin-bottom: 8px;">
            ${nfBase64 ? `<img src="${nfBase64}" style="width: 24px; height: 24px;">` : ''}
            <div>
              <div style="font-size: 8.5pt; font-weight: bold;">Netflix 4K UHD พรีเมียม</div>
              <div style="font-size: 7.5pt; color: #047857;">สิทธิ์สั่งซื้อจริงผ่าน LINE: #LINE-2610-8F2 (Completed)</div>
            </div>
          </div>

          <!-- Review Inputs Preview -->
          <div style="font-size: 8pt; color: #475569; margin-bottom: 4px;">ชื่อผู้รีวิว: <strong style="color: #0f172a;">@น้องพิม (ลูกค้า LINE)</strong></div>
          <div style="margin-bottom: 6px;">
            <span style="font-size: 8pt; color: #475569;">คะแนนความพึงพอใจ: </span>
            <span class="stars">★★★★★</span> <strong style="font-size: 8pt; color: #0f172a;">5 ดาว</strong>
          </div>
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px; font-size: 8pt; color: #334155; margin-bottom: 6px;">
            "พ่อค้าส่งแอพไวมากกก ไม่ถึง 10 นาทีเข้าดูได้เลย ภาพ 4K คมชัด ไม่มีสะดุด แนะนำร้านนี้เลยค่ะ ❤️"
          </div>
          <div style="display: flex; gap: 6px; align-items: center; margin-bottom: 8px;">
            <span class="badge badge-slate" style="font-size: 7pt;">📷 แนบรูปภาพหน้าจอขณะใช้งาน (สำเร็จ)</span>
          </div>
          <div style="background: #ec4899; color: #fff; padding: 6px; text-align: center; border-radius: 6px; font-weight: bold; font-size: 8pt;">
            ส่งรีวิว (Submit Verified Review)
          </div>
        </div>

        <p style="font-size: 8.5pt; color: #047857; font-weight: 600;">
          🎉 เมื่อกดส่งรีวิวสำเร็จ Token จะถูกปิดใช้งานทันที (One-time use) ป้องกันการนำลิงก์เดิมมารีวิวซ้ำ
        </p>
      </div>
    </div>

    <!-- สเต็ปที่ 4: การแสดงผลรีวิวที่สำเร็จ -->
    <div class="step-box avoid-break">
      <div class="step-num">4</div>
      <div>
        <h3 style="font-size: 11pt; color: #0f172a; margin-bottom: 4px;">การแสดงผลรีวิวพร้อมตราประทับหน้าร้าน</h3>
        <p style="font-size: 9.5pt; color: #475569; margin-bottom: 8px;">
          รีวิวจะปรากฏขึ้นบนหน้ารายละเอียดสินค้าและหน้าแรกทันที โดยมีตราประทับยืนยัน และแอดมินสามารถตอบกลับได้:
        </p>

        <!-- Mockup การ์ดรีวิว -->
        <div class="card card-highlight" style="padding: 10px 14px; margin-bottom: 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <strong style="font-size: 9pt; color: #0f172a;">@น้องพิม (ลูกค้า LINE)</strong>
              <span class="badge badge-verified" style="font-size: 7.5pt;">✓ Verified Customer</span>
            </div>
            <span class="stars" style="font-size: 9pt;">★★★★★</span>
          </div>
          <div style="font-size: 7.5pt; color: #94a3b8; margin-bottom: 6px;">
            สั่งซื้อเมื่อ 09 ต.ค. 2026 • สินค้า: Netflix 4K UHD
          </div>
          <p style="font-size: 8.5pt; color: #334155; line-height: 1.4;">
            "พ่อค้าส่งแอพไวมากกก ไม่ถึง 10 นาทีเข้าดูได้เลย ภาพ 4K คมชัด ไม่มีสะดุด แนะนำร้านนี้เลยค่ะ ❤️"
          </p>

          <!-- Admin Reply inside Review Card -->
          <div style="margin-top: 8px; background: #fdf2f8; border-left: 3px solid #ec4899; padding: 6px 10px; border-radius: 0 8px 8px 0; font-size: 8pt;">
            <strong style="color: #be185d;">💬 BA STORE (เจ้าของร้าน):</strong>
            <span style="color: #475569;"> ขอบพระคุณสำหรับรีวิวมากๆ ค่า ยินดีดูแลและรับประกันตลอดการใช้งานนะคะ มีปัญหาทัก LINE ได้ตลอดเลยค่า ❤️</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ==================== หน้า 4: ความปลอดภัยเชิงเทคนิค & FAQ ==================== -->
  <div class="page-break"></div>
  <div class="container">
    <h2 class="section-title">
      <span class="section-number">4</span>
      <span>ความปลอดภัยและการยืนยันสิทธิ์เชิงเทคนิค (Security Architecture)</span>
    </h2>

    <div class="grid-2 avoid-break">
      <div class="card">
        <h3 style="font-size: 10pt; color: #ec4899; margin-bottom: 6px;">🔑 Cryptographically Random Token</h3>
        <p style="font-size: 8.5pt; color: #475569; line-height: 1.4;">
          Token ถูกสุ่มด้วยอัลกอริทึม <code>encode(gen_random_bytes(24), 'hex')</code> มีความยาว 48 ตัวอักษร เป็นไปไม่ได้ที่จะคาดเดาหรือโจมตีแบบ Brute-force
        </p>
      </div>
      <div class="card">
        <h3 style="font-size: 10pt; color: #047857; margin-bottom: 6px;">🔒 One-Time Use &amp; Expiry</h3>
        <p style="font-size: 8.5pt; color: #475569; line-height: 1.4;">
          Token แต่ละอันมีอายุการใช้งาน 7 วัน และเมื่อลูกค้ารีวิวสำเร็จจะถูกปรับสถานะเป็น <code>used = true</code> ทันที ไม่สามารถนำมาใช้ซ้ำได้
        </p>
      </div>
      <div class="card">
        <h3 style="font-size: 10pt; color: #0f172a; margin-bottom: 6px;">🛡️ Row Level Security (RLS)</h3>
        <p style="font-size: 8.5pt; color: #475569; line-height: 1.4;">
          ทุกตารางเปิดใช้งาน PostgreSQL RLS ป้องกันการแฮกข้อมูล ลูกค้าทั่วไปไม่สามารถเข้าถึงฐานข้อมูลของผู้อื่นได้
        </p>
      </div>
      <div class="card">
        <h3 style="font-size: 10pt; color: #d97706; margin-bottom: 6px;">⚙️ PostgreSQL RPC Enforcement</h3>
        <p style="font-size: 8.5pt; color: #475569; line-height: 1.4;">
          การรีวิวทำงานผ่านฟังก์ชัน <code>create_review_with_token</code> ในระดับ Database Server จึงไม่มีช่องโหว่ให้ Client ปลอมแปลงสถานะ Verified
        </p>
      </div>
    </div>

    <!-- ข้อแนะนำและคำถามที่พบบ่อย (FAQ) -->
    <h2 class="section-title">
      <span class="section-number">5</span>
      <span>คำถามที่พบบ่อย (Frequently Asked Questions)</span>
    </h2>

    <div class="avoid-break">
      <div style="margin-bottom: 12px;">
        <h4 style="font-size: 10pt; color: #ec4899; margin-bottom: 2px;">Q: ลูกค้าจำเป็นต้องสมัครสมาชิกเว็บไซต์ก่อนเขียนรีวิวหรือไม่?</h4>
        <p style="font-size: 9pt; color: #475569; line-height: 1.4;">
          <strong>A:</strong> ไม่จำเป็นครับ! หากแอดมินออก Token ให้จากแชท LINE ลูกค้าสามารถคลิกลิงก์และกรอกชื่อผู้รีวิวเพื่อส่งรีวิวได้ทันทีโดยไม่ต้องผ่านขั้นตอนสมัครสมาชิกหลายขั้นตอน แต่หากลูกค้าต้องการสมัครสมาชิกเพื่อสะสมประวัติ ก็สามารถทำได้เช่นกัน
        </p>
      </div>

      <div style="margin-bottom: 12px;">
        <h4 style="font-size: 10pt; color: #ec4899; margin-bottom: 2px;">Q: หากมีผู้ไม่ประสงค์ดีส่งข้อความหยาบคายในรีวิว แอดมินจัดการอย่างไรได้บ้าง?</h4>
        <p style="font-size: 9pt; color: #475569; line-height: 1.4;">
          <strong>A:</strong> แอดมินสามารถเข้าไปที่หน้า <code>/admin/reviews</code> แล้วกดปุ่ม <strong>"ซ่อนรีวิว (Hide)"</strong> เพื่อไม่ให้รีวิวดังกล่าวแสดงบนหน้าร้านได้ทันที และลูกค้าคนอื่นก็สามารถกดปุ่ม <strong>"รายงานรีวิว (Report)"</strong> ได้เช่นกัน
        </p>
      </div>

      <div style="margin-bottom: 12px;">
        <h4 style="font-size: 10pt; color: #ec4899; margin-bottom: 2px;">Q: สามารถออก Token ย้อนหลังให้กับลูกค้าเก่าได้หรือไม่?</h4>
        <p style="font-size: 9pt; color: #475569; line-height: 1.4;">
          <strong>A:</strong> ได้ครับ แอดมินสามารถเปิดหน้า <code>/admin/tokens</code> แล้วเลือกสินค้าที่ลูกค้าเคยซื้อ จากนั้นระบุชื่อลูกค้าและออก Token ส่งให้ลูกค้าในแชท LINE ได้ตลอดเวลา
        </p>
      </div>
    </div>

    <!-- Footer Summary Note -->
    <div style="margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 14px; display: flex; justify-content: space-between; align-items: center; font-size: 8.5pt; color: #94a3b8;">
      <div>
        <strong>BA STORE Official System Documentation</strong> • Version 2.0.0 (Production Ready)
      </div>
      <div>
        ติดต่อสอบถาม: LINE <strong>@bastore</strong>
      </div>
    </div>
  </div>

</body>
</html>
`;

fs.writeFileSync(path.join(DOCS_DIR, 'คู่มือการใช้งาน_BA_STORE_Verified_Review.html'), htmlContent, 'utf-8');
console.log('HTML documentation generated successfully.');

// Now use Microsoft Edge or Chrome headless to generate PDF
const htmlPath = path.join(DOCS_DIR, 'คู่มือการใช้งาน_BA_STORE_Verified_Review.html');
const pdfPath = path.join(DOCS_DIR, 'คู่มือการใช้งาน_BA_STORE_Verified_Review.pdf');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

let browserPath = '';
if (fs.existsSync(edgePath)) {
  browserPath = edgePath;
} else if (fs.existsSync(chromePath)) {
  browserPath = chromePath;
}

if (browserPath) {
  console.log(`Using browser at: ${browserPath}`);
  const command = `"${browserPath}" --headless --disable-gpu --print-to-pdf="${pdfPath}" --no-pdf-header-footer "${htmlPath}"`;
  console.log('Running print-to-pdf command...');
  try {
    execSync(command, { timeout: 30000 });
    console.log(`PDF successfully generated at: ${pdfPath}`);
  } catch (err) {
    console.error('Error generating PDF:', err.message);
  }
} else {
  console.error('No suitable browser found for PDF generation.');
}
