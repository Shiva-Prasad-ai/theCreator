# CreatorOS AI — Design System Deliverables (H2)

> **Team Role:** Jeevan (UI/UX Designer)  
> **Target Event:** CodeMeet 2026  
> **Application:** CreatorOS AI — Premium AI-Powered Creator Business Platform  
> **Branch:** `jeevan`  

This directory contains the independent H2 design system deliverables. It provides a cohesive, futuristic SaaS visual foundation tailored for dark-mode depth, high-velocity creator workflows, and effortless drop-in integration into Shiva's upcoming Next.js application.

---

## 📁 Directory Structure

```text
design-system/
├── assets/
│   ├── logo.svg              # Primary CreatorOS AI horizontal logo lockup
│   ├── logo-mark.svg         # Standalone aperture & neural spark SVG mark
│   └── logo-dark.svg         # Card-encapsulated dark theme badge
├── tokens/
│   ├── colors.json           # Brand, semantic, and status color definitions (HEX, HSL, RGB)
│   ├── typography.json       # Space Grotesk (headings) & Inter (body) scale definitions
│   ├── spacing.json          # Strict 4px modular spacing scale and container constraints
│   ├── radius.json           # Border radius scale (0px to 9999px) and atmospheric shadows
│   └── tokens.js             # Consolidated JavaScript module exporting all tokens
├── styles/
│   ├── tailwind-preset.js    # Ready-to-use Tailwind CSS theme configuration preset
│   └── shadcn-theme.css      # Drop-in shadcn/ui compatible theme CSS variables (:root & .dark)
├── components/
│   ├── button.md             # Button specification, variants, sizes, states, and React/TSX snippet
│   └── heading.md            # Heading hierarchy, Space Grotesk styles, gradient text, and React/TSX snippet
├── preview/
│   ├── index.html            # Standalone visual preview showcase of all design deliverables
│   └── preview.css           # Styling for the static showcase utilizing design tokens
└── README.md                 # Design system documentation and integration manual
```

---

## 🎨 1. Brand Palette & Semantic Tokens

| Token | Hex | HSL (shadcn) | Semantic Role |
| :--- | :--- | :--- | :--- |
| **`background`** | `#0B1020` | `224 49% 8%` | Deep cosmic dark navy canvas base |
| **`surface` (card)** | `#151C30` | `224 39% 14%` | Primary container, cards, modals |
| **`surface-subtle`** | `#111728` | `224 40% 11%` | Recessed panels, input backdrops |
| **`surface-elevated`**| `#1D2640` | `224 37% 18%` | Dropdown menus, popovers, secondary buttons |
| **`border`** | `#263453` | `222 37% 24%` | Boundary dividers and input borders |
| **`primary`** | `#7C3AED` | `262 83% 58%` | Signature electric violet for primary actions & focus |
| **`primary-foreground`**| `#FFFFFF` | `0 0% 100%` | High-contrast text on primary violet buttons |
| **`accent`** | `#22D3EE` | `189 94% 54%` | Bioluminescent cyan for AI telemetry & status glows |
| **`accent-foreground`** | `#083344` | `197 79% 15%` | Text on cyan accent badges |
| **`text-primary`** | `#F8FAFC` | `210 40% 98%` | Crisp white headings and high-priority text |
| **`text-muted`** | `#AAB5CD` | `222 28% 73%` | Muted slate for secondary metadata and subtitles |

---

## 🔤 2. Typography Scale

- **Heading Font:** `Space Grotesk` (Weights: 500, 600, 700)
- **Body Font:** `Inter` (Weights: 400, 500, 600, 700)
- **Code / AI Monospace:** `JetBrains Mono` (Weights: 400, 500)

| Level | Font Size | Line Height | Letter Spacing | Weight |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `60px` (`3.75rem`) | `1.1` | `-0.035em` | 700 (Bold) |
| **H1** | `40px` (`2.5rem`) | `1.15` | `-0.025em` | 700 (Bold) |
| **H2** | `32px` (`2.0rem`) | `1.2` | `-0.02em` | 600 (Semibold) |
| **H3** | `24px` (`1.5rem`) | `1.25` | `-0.015em` | 600 (Semibold) |
| **H4** | `20px` (`1.25rem`) | `1.3` | `-0.01em` | 600 (Semibold) |
| **H5** | `18px` (`1.125rem`) | `1.35` | `-0.005em` | 600 (Semibold) |
| **H6** | `16px` (`1.0rem`) | `1.4` | `0` | 600 (Semibold) |
| **Body XL** | `20px` (`1.25rem`) | `1.6` | `-0.01em` | 400 (Regular) |
| **Body Base**| `16px` (`1.0rem`) | `1.5` | `0` | 400 (Regular) |
| **Body SM** | `14px` (`0.875rem`)| `1.45`| `+0.005em` | 400 (Regular) |

---

## 📏 3. Spacing & Border Radius System

- **Base Unit:** Strict `4px` modular grid.
- **Scale:** `0` (0px), `1` (4px), `2` (8px), `3` (12px), `4` (16px), `5` (20px), `6` (24px), `8` (32px), `10` (40px), `12` (48px), `16` (64px), `20` (80px), `24` (96px).
- **Border Radii:**
  - `sm`: `6px` (Small controls)
  - `md`: `8px` (Standard buttons, inputs)
  - `lg`: `12px` (Cards, modular panels)
  - `xl`: `16px` (Dialogs, hero containers)
  - `full`: `9999px` (Pills, avatars, badges)

---

## ⚡ 4. Integration Guide for Shiva's Next.js Setup

When Shiva initializes the Next.js application, integration takes less than 2 minutes:

### Step 1: Tailwind Configuration (v3 vs v4)

Depending on which Tailwind version Shiva initializes with Next.js:

#### Option A: Tailwind CSS v3 (JavaScript Configuration)
In `tailwind.config.ts` (or `.js`), add the preset:
```ts
import type { Config } from "tailwindcss";

const config: Config = {
  presets: [require("./design-system/styles/tailwind-preset.js")],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};
export default config;
```

#### Option B: Tailwind CSS v4 (CSS-First Engine)
In `app/globals.css`:
```css
@import "tailwindcss";

/* Import design system tokens & shadcn variables */
@import "../../design-system/styles/shadcn-theme.css";

/* Or link the preset via @config */
@config "../../design-system/styles/tailwind-preset.js";
```

### Step 2: Global Theme Styles (shadcn/ui)
Copy the CSS variables from `design-system/styles/shadcn-theme.css` into `app/globals.css`.

### Step 3: Typography Import
In `app/layout.tsx`:
```tsx
import { Space_Grotesk, Inter } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});
```

### Step 4: Components
Copy the pre-configured component code from `design-system/components/button.md` and `design-system/components/heading.md` into `components/ui/`.

---

## 👁️ How to Preview Locally

No Node.js build step or local server is required. You can preview immediately in any browser:

### Option A: Direct Browser Open (Double Click / File Explorer)
Navigate to `design-system/preview/index.html` and double-click to open in Chrome, Edge, or Firefox.

### Option B: Terminal / PowerShell
```powershell
Start-Process "c:\Users\Acer\Desktop\creatoros-team\design-system\preview\index.html"
```

### Option C: VS Code Live Server / Static Server
If using VS Code, right-click `design-system/preview/index.html` and select **"Open with Live Server"**.

