import React from 'react';

/**
 * CreatorOS AI — High-Fidelity Card Components Blueprint
 * Reference implementation for Shiva's Next.js integration.
 * Built with Tailwind CSS + dark SaaS glassmorphic styling.
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'interactive' | 'accent';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className = '',
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-card border border-border shadow-sm',
    elevated: 'bg-slate-900/90 border border-border/80 shadow-lg shadow-black/40',
    glass: 'bg-slate-900/60 backdrop-blur-md border border-white/10 shadow-xl',
    interactive:
      'bg-card border border-border hover:border-violet-500/60 hover:shadow-md hover:shadow-violet-950/40 transition-all cursor-pointer',
    accent:
      'bg-gradient-to-br from-violet-950/40 to-slate-900 border border-violet-500/30 shadow-md shadow-violet-950/20'
  };

  return (
    <div
      className={`rounded-lg p-6 text-foreground transition-all duration-150 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`flex flex-col space-y-1.5 pb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <h3 className={`font-heading text-lg font-bold tracking-tight text-white ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <p className={`text-xs text-muted-foreground leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => <div className={`pt-2 ${className}`} {...props}>{children}</div>;

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`flex items-center pt-4 border-t border-border/40 ${className}`} {...props}>
    {children}
  </div>
);

/**
 * SelectCard — Selectable card for Persona, Goals, and Niche selectors.
 */
export interface SelectCardProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  title: string;
  description: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

export const SelectCard: React.FC<SelectCardProps> = ({
  selected = false,
  title,
  description,
  icon,
  badge,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`relative p-5 rounded-lg border cursor-pointer transition-all duration-150 select-none ${
        selected
          ? 'bg-violet-950/30 border-accent shadow-md shadow-cyan-950/40 ring-1 ring-accent'
          : 'bg-card border-border hover:border-slate-700 hover:bg-slate-800/40'
      } ${className}`}
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
      {...props}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className={`p-2 rounded-md ${
                selected ? 'bg-accent/20 text-accent' : 'bg-white/5 text-muted-foreground'
              }`}
            >
              {icon}
            </div>
          )}
          <h4 className="font-heading font-semibold text-sm text-white">{title}</h4>
        </div>
        {badge}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed pl-1">{description}</p>
      {selected && (
        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-accent animate-pulse" />
      )}
    </div>
  );
};

