# CreatorOS AI — Button Component Specification

The Button component is the primary interactive element across the CreatorOS platform. Designed with a futuristic SaaS aesthetic, it features crisp micro-interactions, violet and cyan luminescence, accessible contrast, and full compatibility with **shadcn/ui** and **Tailwind CSS**.

---

## 1. Visual Anatomy & Variants

| Variant | Visual Description | Tailwind Token Classes | Usage Intent |
| :--- | :--- | :--- | :--- |
| **`default` (Violet Primary)** | Solid electric violet background (`#7C3AED`) with white text and smooth shadow glow on hover. | `bg-primary text-primary-foreground hover:bg-violet-500 hover:shadow-glow-violet active:scale-[0.98]` | Main call-to-action (e.g., "Generate Asset", "Publish Workflow"). |
| **`accent` (Cyan Glow)** | Cyan button (`#22D3EE`) with deep navy text and intense cyan edge glow. | `bg-accent text-accent-foreground hover:bg-cyan-300 hover:shadow-glow-cyan active:scale-[0.98]` | AI-centric triggers, premium tier highlights, real-time sync actions. |
| **`secondary` (Surface Elevated)** | Dark surface background (`#1D2640`) with crisp white text and subtle border. | `bg-secondary text-secondary-foreground border border-border hover:bg-surface-elevated hover:border-slate-500` | Secondary page actions, filter controls, dialog dismissals. |
| **`outline`** | Transparent background with subtle cosmic border (`#263453`) and violet hover tint. | `border border-border bg-transparent text-foreground hover:bg-primary/10 hover:border-primary/50` | Complementary actions alongside primary buttons. |
| **`ghost`** | Completely transparent background; illuminates on hover. | `bg-transparent text-muted-foreground hover:bg-surface-subtle hover:text-foreground` | Toolbar icons, table row actions, breadcrumb items. |
| **`destructive`** | Rich crimson background (`#EF4444`) with white text and ruby hover highlight. | `bg-destructive text-destructive-foreground hover:bg-red-600 focus-visible:ring-red-400` | Destructive operations (Delete project, revoke API token). |
| **`gradient` (Cosmic Dual)** | Violet-to-cyan gradient with high-voltage neon presence. | `bg-brand-gradient text-white hover:opacity-95 hover:shadow-glow-combined active:scale-[0.98]` | Hero CTA ("Launch CreatorOS AI", "Upgrade to Pro"). |

---

## 2. Sizes & Spacing Scale (4px System)

| Size | Height | Padding (X / Y) | Font Size & Weight | Icon Size | Border Radius |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`sm`** | `32px` (`h-8`) | `12px` / `6px` (`px-3 py-1.5`) | `14px` (`text-sm`), medium | `14px` (`w-3.5 h-3.5`) | `6px` (`rounded-sm`) |
| **`default` (md)** | `40px` (`h-10`) | `16px` / `8px` (`px-4 py-2`) | `14px` (`text-sm`), semibold | `16px` (`w-4 h-4`) | `8px` (`rounded-md`) |
| **`lg`** | `48px` (`h-12`) | `24px` / `12px` (`px-6 py-3`) | `16px` (`text-base`), semibold | `18px` (`w-4.5 h-4.5`) | `8px` (`rounded-md`) |
| **`icon`** | `40px` x `40px` | `8px` (`p-2`) | N/A | `20px` (`w-5 h-5`) | `8px` (`rounded-md`) |
| **`icon-sm`** | `32px` x `32px` | `6px` (`p-1.5`) | N/A | `16px` (`w-4 h-4`) | `6px` (`rounded-sm`) |

---

## 3. Interactive States

1. **Default**: Crisp contrast, crisp border definition, and smooth text anti-aliasing.
2. **Hover**: 150ms cubic-bezier transition, slight brightness increase (+5%), localized glow shadow.
3. **Active (Pressed)**: `transform: scale(0.98)` with deepened background tint.
4. **Focus-Visible**: High-contrast 2px violet ring (`ring-2 ring-primary ring-offset-2 ring-offset-[#0B1020]`), fully accessible via keyboard Tab.
5. **Disabled**: `opacity: 0.5`, `pointer-events: none`, cursor `not-allowed`.
6. **Loading**: Disables pointer events, hides primary icon, and displays an animated dual-spin SVG indicator while retaining exact button width.

---

## 4. Drop-in Next.js / React Component Implementation

Shiva can copy this directly into `components/ui/button.tsx`:

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1020] disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[#8B5CF6] hover:shadow-[0_0_20px_-3px_rgba(124,58,237,0.5)] active:scale-[0.98]",
        accent:
          "bg-accent text-accent-foreground font-semibold hover:bg-[#67E8F9] hover:shadow-[0_0_20px_-3px_rgba(34,211,238,0.5)] active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground border border-border hover:bg-[#263453] hover:text-white active:scale-[0.98]",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-primary/10 hover:border-primary/60 hover:text-white",
        ghost:
          "text-muted-foreground hover:bg-[#151C30] hover:text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-red-600 hover:shadow-[0_0_20px_-3px_rgba(239,68,68,0.5)] active:scale-[0.98]",
        gradient:
          "bg-gradient-to-r from-[#7C3AED] to-[#22D3EE] text-white font-semibold hover:opacity-95 hover:shadow-[0_0_25px_-4px_rgba(124,58,237,0.6)] active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-sm px-3 text-xs",
        lg: "h-12 rounded-md px-6 text-base font-semibold",
        icon: "h-10 w-10 p-2",
        "icon-sm": "h-8 w-8 p-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

