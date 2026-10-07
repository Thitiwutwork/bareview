# BA STORE — Design System Guidelines (DESIGN.md)

## 1. Brand Identity & Theme
- **Theme Concept:** Warm Pastel Pink, Friendly, Digital Premium Store, High-Trust Verified Reviews
- **Background Color:** `#FDF5F8` (Warm Soft Pink)
- **Container / Card Background:** `#FFFFFF` (Pure White) with subtle borders `#FCE7F3` (pink-100) or `#E2E8F0` (slate-200)

## 2. Color Palette
- **Primary Brand (Pink):**
  - Primary Pink: `#ec4899` (Tailwind `pink-600`)
  - Primary Dark / Hover: `#db2777` (Tailwind `pink-700`)
  - Primary Light: `#fdf2f8` (Tailwind `pink-50`)
  - Primary Accent / Border: `#fbcfe8` (Tailwind `pink-200`)
- **Trust & Verification (Emerald):**
  - Verified Customer Badge: `#059669` (Tailwind `emerald-600`)
  - Badge Background: `#ecfdf5` (Tailwind `emerald-50`)
  - Badge Border: `#a7f3d0` (Tailwind `emerald-200`)
- **Neutral & Typography (Slate):**
  - Text Primary: `#0f172a` (Tailwind `slate-900`) / `#1e293b` (Tailwind `slate-800`)
  - Text Secondary: `#475569` (Tailwind `slate-600`) / `#64748b` (Tailwind `slate-500`)
  - Text Muted: `#94a3b8` (Tailwind `slate-400`)
  - Surface Border: `#e2e8f0` (Tailwind `slate-200`)
- **Communication & Social (LINE):**
  - LINE Brand Green: `#06C755`, Hover: `#05b34c`

## 3. Typography
- **Heading Font Family (`.font-heading`):** `'Mitr', 'Prompt', sans-serif`
- **Body Font Family:** `'Prompt', -apple-system, BlinkMacSystemFont, sans-serif`
- **Typographic Scale:**
  - H1 / Hero: `text-2xl sm:text-3xl font-black`
  - H2 / Section Title: `text-lg sm:text-xl font-bold`
  - Body Text: `text-xs sm:text-sm text-slate-700`
  - Caption / Subtext: `text-[11px] sm:text-xs text-slate-400`

## 4. Components & Elevation
- **Border Radius:**
  - Cards & Modals: `rounded-3xl` (24px) or `rounded-2xl` (16px)
  - Buttons & Form Inputs: `rounded-xl` (12px)
  - Status Badges / Pills: `rounded-full` (9999px)
- **Form Controls:**
  - Standard Input: `border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 rounded-xl`
  - Minimum Touch Target: 44px x 44px on mobile devices
- **Focus Indicator (Accessibility):**
  - `:focus-visible { outline: 2px solid #ec4899; outline-offset: 2px; }`
