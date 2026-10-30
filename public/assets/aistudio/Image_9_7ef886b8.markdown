---
name: Sembako Retail Engine
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#424844'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#727974'
  outline-variant: '#c2c8c2'
  surface-tint: '#4a6457'
  primary: '#00130a'
  on-primary: '#ffffff'
  primary-container: '#0f291e'
  on-primary-container: '#769283'
  inverse-primary: '#b0cdbd'
  secondary: '#006c4a'
  on-secondary: '#ffffff'
  secondary-container: '#82f5c1'
  on-secondary-container: '#00714e'
  tertiary: '#00130a'
  on-tertiary: '#ffffff'
  tertiary-container: '#002b1b'
  on-tertiary-container: '#009f6e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce9d8'
  primary-fixed-dim: '#b0cdbd'
  on-primary-fixed: '#062016'
  on-primary-fixed-variant: '#324c3f'
  secondary-fixed: '#85f8c4'
  secondary-fixed-dim: '#68dba9'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  currency-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  currency-display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
  mono-num:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

The design system establishes a high-efficiency, dependable, and contemporary commerce environment specifically engineered for Indonesian fast-moving retail and grocery operations (*sembako*). The brand identity balances the grounded trustworthiness of established commerce with the agility of high-throughput software.

### Brand Personality & Emotional Impact
- **Frictionless Velocity:** Cashiers and store owners operate under rapid counter conditions. Visual cues are bold, clear, and unambiguous, minimizing checkout hesitation and eliminating scanning friction.
- **Fiscal Authority & Prosperity:** Utilizing deep forest emerald and navy undertones paired with crisp monetary greens evokes sustainable business growth, accurate bookkeeping, and inventory integrity.
- **Accessible Professionalism:** Balances modern enterprise-grade cleanliness with intuitive affordances that accommodate varying technical skill levels across frontline staff.

### Design Movement
The interface follows **Modern Functionalism** with high-density utility principles:
- High typographic contrast for scanning speeds and receipt verifications.
- Structural modularity with distinct touch and keyboard zones.
- Flat surface hierarchies with soft tonal containment, eliminating decorative clutter while maintaining crisp readability under harsh fluorescent counter lighting.

## Colors

The palette uses a deliberate hierarchy suited for heavy daily screen exposure, transactional verification, and rapid visual status recognition.

### Palette Architecture
- **Primary (`#0F291E` - Deep Forest Slate):** Represents stability, anchor elements, navigation rails, primary action commands, and high-emphasis headers.
- **Secondary (`#059669` - Trade Emerald):** Primary interactive focus, active tab indicators, confirmational actions, and critical positive inventory states.
- **Tertiary (`#10B981` - Growth Mint):** Accent highlights, positive cash-flow metrics, paid badges, and live scanner indicators.
- **Neutral (`#1E293B` - Deep Slate):** Primary reading color for inventory naming, customer receipts, and numeric figures.

### Functional & Surface Tokens
- **Canvas Base:** `#F8FAFC` provides an eye-resting, glare-resistant background.
- **Surface Layer:** `#FFFFFF` dedicated to product tiles, transaction tables, and calculator inputs.
- **Border / Outline:** `#E2E8F0` for structure-defining dividers; `#CBD5E1` for active input bounding.
- **State Badges:**
  - *Stok Habis / Overdue Debt:* Background `#FEF2F2`, Text `#DC2626`, Border `#FCA5A5`.
  - *Stok Menipis / Pending:* Background `#FFFBEB`, Text `#D97706`, Border `#FDE68A`.
  - *Stok Aman / Lunas:* Background `#ECFDF5`, Text `#059669`, Border `#A7F3D0`.
  - *Grosir / Tiered Pricing:* Background `#F0FDF4`, Text `#0F291E`, Border `#BBF7D0`.

## Typography

The type scale combines **Plus Jakarta Sans** for structural headers, brand touchpoints, and grand totals, with **Inter** for dense transactional tables, barcode entries, and receipt lines.

### Monetary & Numerical Rules
- All currency values must use Indonesian Rupiah conventions: `Rp 150.000` (period thousands separator, no decimal suffix for non-fractional amounts).
- Currency totals (`currency-display`) must utilize `font-variant-numeric: tabular-nums` to ensure exact column alignment during active tallying and cart updates.
- Barcode numbers, SKU codes, and invoice serial IDs must strictly utilize `mono-num` with increased letter tracking for rapid visual verification against physical stickers.

## Layout & Spacing

The layout is built around a split-workstation grid suited for dual touch-and-keyboard input, optimized for continuous POS operations.

### Grid & Viewport Adapters
- **Desktop / Terminal POS (≥1024px):** Split layout.
  - Left column (60-65% width): Catalog grid, product search, filter pills, and stock management.
  - Right column (35-40% width, fixed dock): Active transaction receipt, quick cash buttons, change calculation, and checkout trigger.
- **Tablet / Countertop Touch (768px - 1023px):** 12-column adaptive layout. Catalog expands; transaction cart collapses into an expandable right-hand drawer or bottom summary sheet.
- **Mobile POS / Stock-take (<768px):** Single-column stacked layout with a pinned bottom checkout bar displaying total amount and instant "Bayar" action.

### Touch Target Standard
- Cashier POS components must enforce a minimum interactive target size of `44px` on desktop and `48px` on mobile/tablet screens to prevent mistaps during rush-hour queues.

## Elevation & Depth

Visual hierarchy is maintained through crisp surface separation and clean outlines rather than heavy drop shadows, preventing visual weight buildup in data-heavy screens.

### Elevation Levels
- **Level 0 (Flat Canvas - `#F8FAFC`):** Application base background and read-only auxiliary containers.
- **Level 1 (Card & Content Surface - `#FFFFFF`):** High-level operational modules (product cards, data tables, metrics). Defined by a solid outline (`1px solid #E2E8F0`) with no blur shadow.
- **Level 2 (Active Panels & Sticky Header):** Transaction summary docks and floating search bars. Uses a soft directional tint: `0 4px 12px -2px rgba(15, 41, 30, 0.06), 0 2px 4px -2px rgba(15, 41, 30, 0.04)`.
- **Level 3 (Modals, Payment Drawers, Keypads):** Quick-cash popups, wholesale quantity adjusters, and customer pay-debt dialogs: `0 20px 25px -5px rgba(15, 41, 30, 0.12), 0 8px 10px -6px rgba(15, 41, 30, 0.08)`.

## Shapes

The interface balances sharp industrial organization with soft corners to keep interactions friendly and modern.

### Corner Radius System
- **Core Elements (`rounded` - `0.5rem` / `8px`):** Product thumbnail containers, input textboxes, action buttons, table cell selections, and transaction item rows.
- **Containers & Cards (`rounded-lg` - `1rem` / `16px`):** Stat overview cards, transaction receipts, drawer headers, and calculator pads.
- **Badges & Quick Cash Pills (`full` - `9999px`):** Category filters, stock alert status chips, and nominal denomination buttons (e.g., `+ Rp 50.000`, `+ Pas`).

## Components

### Buttons
- **Primary Checkout ("Bayar / Selesai"):** Background `#0F291E`, text `#FFFFFF`, hover `#183D2D`. Spans full width of the cart dock with bold `currency-display` subtext.
- **Secondary Action ("Simpan Nota / Cetak"):** Background `#ECFDF5`, border `1px solid #A7F3D0`, text `#059669`.
- **Destructive ("Batal / Hapus Item"):** Ghost style with text `#DC2626`, transitioning to `#FEF2F2` background on hover.
- **Quick Denomination Pills:** High-contrast buttons for fast cash tenders (`Rp 10.000`, `Rp 20.000`, `Rp 50.000`, `Rp 100.000`, `Uang Pas`). Background `#F1F5F9`, text `#0F291E`, active background `#059669` with text `#FFFFFF`.

### Product Grid Cards
- Dimensions: Compact square aspect ratio. Includes item image or stylized two-letter icon, stock pill indicator in upper corner, item name (2 lines max), and price in bold `Plus Jakarta Sans`.
- Out-of-stock items feature an inactive opacity (`0.5`) with an unclickable diagonal watermark "Habis".

### Badges & Status Chips
- Height: `24px`, font size `label-sm`, padding `2px 8px`.
- Status types:
  - **Lunas (Paid):** Emerald background, crisp checkmark prefix.
  - **Kasbon / Hutang (Debt):** Rose background, alert prefix, showing customer name tag.
  - **Grosir (Wholesale Active):** Amber/Gold micro-badge on cart item rows indicating tiered pricing applied.

### Input Fields & Search Bars
- Product & barcode search inputs must remain anchored at the top: height `48px`, with a clear barcode scanner icon suffix (`F2` shortcut key cue).
- Keyboard shortcuts clearly printed on inputs (e.g., `/` for search, `F8` for checkout, `Esc` to clear).

### Cart & Receipt List Items
- Structured as dense rows with quantity steppers (`-`, `qty`, `+`), wholesale indicator, item subtotal, and quick delete icon.
- Tapping item quantity opens a high-touch numpad for sack/bulk weight conversions (`kg`, `sak`, `dus`, `liter`).

### Metric Overview Cards (Dashboard)
- Background `#FFFFFF`, border `1px solid #E2E8F0`, padding `1.25rem`.
- Contains: Mini icon in `#ECFDF5` container, metric label in `body-sm`, large metric in `Plus Jakarta Sans 24px`, and contextual growth comparison (e.g., `+12.4% vs kemarin`) in `#059669`.