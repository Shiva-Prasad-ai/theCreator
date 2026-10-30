# CreatorOS AI — Heading Component Specification

The Heading component enforces consistent hierarchy, futuristic geometric character, and responsive scale throughout CreatorOS AI. Powered by **Space Grotesk**, it establishes an authoritative yet refined SaaS aesthetic with options for cosmic gradient text and ambient glow.

---

## 1. Typography Hierarchy & Tokens

| Level / Variant | Desktop Size | Mobile Size | Line Height | Letter Spacing | Font Weight | Default HTML Tag | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`display`** | `60px` (`3.75rem`) | `36px` (`2.25rem`) | `1.1` | `-0.035em` | `Bold (700)` | `h1` | Hero landing banners, high-impact keynote stats |
| **`h1`** | `40px` (`2.5rem`) | `30px` (`1.875rem`) | `1.15` | `-0.025em` | `Bold (700)` | `h1` | Primary view & dashboard page titles |
| **`h2`** | `32px` (`2.0rem`) | `24px` (`1.5rem`) | `1.2` | `-0.02em` | `Semibold (600)` | `h2` | Major section headers, card group titles |
| **`h3`** | `24px` (`1.5rem`) | `20px` (`1.25rem`) | `1.25` | `-0.015em` | `Semibold (600)` | `h3` | Modal headers, feature block titles |
| **`h4`** | `20px` (`1.25rem`) | `18px` (`1.125rem`) | `1.3` | `-0.01em` | `Semibold (600)` | `h4` | Widget headers, sidebar module titles |
| **`h5`** | `18px` (`1.125rem`) | `16px` (`1.0rem`) | `1.35` | `-0.005em` | `Semibold (600)` | `h5` | Metric labels, parameter group titles |
| **`h6`** | `16px` (`1.0rem`) | `14px` (`0.875rem`) | `1.4` | `0` | `Medium (500)` | `h6` | Eyebrow badges, micro section headers |

---

## 2. Text Color Treatments

- **`default`**: Crisp white `#F8FAFC` (`text-foreground`).
- **`gradient`**: Cosmic gradient from violet `#7C3AED` to cyan `#22D3EE` using background clip.
  ```css
  background: linear-gradient(135deg, #A78BFA 0%, #22D3EE 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  ```
- **`glow`**: Gradient fill accompanied by a soft cyan-violet drop-shadow aura:
  ```css
  filter: drop-shadow(0 0 16px rgba(34, 211, 238, 0.35));
  ```
- **`muted`**: Secondary headline color `#AAB5CD` (`text-muted-foreground`).

---

## 3. Responsive Fluid Behavior

Headings automatically adapt across breakpoints using Tailwind responsive utility classes:

```html
<!-- Display Heading Example -->
<h1 class="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
  Autonomous AI Engine for Next-Gen Creators
</h1>
```

---

## 4. Drop-in Next.js / React Component Implementation

Shiva can copy this directly into `components/ui/heading.tsx`:

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headingVariants = cva("font-heading font-bold text-foreground tracking-tight transition-colors", {
  variants: {
    size: {
      display: "text-4xl sm:text-5xl lg:text-6xl tracking-[-0.035em] leading-[1.1]",
      h1: "text-3xl sm:text-4xl lg:text-[40px] tracking-[-0.025em] leading-[1.15]",
      h2: "text-2xl sm:text-3xl lg:text-[32px] tracking-[-0.02em] leading-[1.2]",
      h3: "text-xl sm:text-2xl lg:text-[24px] tracking-[-0.015em] leading-[1.25]",
      h4: "text-lg sm:text-xl lg:text-[20px] tracking-[-0.01em] leading-[1.3]",
      h5: "text-base sm:text-lg lg:text-[18px] tracking-[-0.005em] leading-[1.35]",
      h6: "text-sm sm:text-base lg:text-[16px] tracking-normal leading-[1.4]",
    },
    intent: {
      default: "text-[#F8FAFC]",
      gradient: "bg-gradient-to-r from-[#A78BFA] via-[#7C3AED] to-[#22D3EE] bg-clip-text text-transparent",
      glow: "bg-gradient-to-r from-[#C4B5FD] to-[#22D3EE] bg-clip-text text-transparent [filter:drop-shadow(0_0_16px_rgba(34,211,238,0.4))]",
      muted: "text-[#AAB5CD] font-medium",
    },
  },
  defaultVariants: {
    size: "h1",
    intent: "default",
  },
});

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span" | "p";

export interface HeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof headingVariants> {
  as?: HeadingTag;
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, size, intent, as, children, ...props }, ref) => {
    // Determine semantic tag based on size if not explicitly provided
    const Component = as || (size === "display" ? "h1" : (size as HeadingTag) || "h1");

    return (
      <Component
        ref={ref}
        className={cn(headingVariants({ size, intent, className }))}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Heading.displayName = "Heading";

export { Heading, headingVariants };
```

