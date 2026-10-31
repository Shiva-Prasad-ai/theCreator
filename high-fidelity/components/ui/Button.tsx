import React from 'react';

/**
 * CreatorOS AI — High-Fidelity Button Component Blueprint
 * Reference implementation for Shiva's Next.js integration.
 * Built for Tailwind CSS + shadcn/ui theme compatibility.
 */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  children,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-heading font-semibold transition-all duration-150 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:translate-y-px select-none whitespace-nowrap';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-sm',
    md: 'text-sm px-4 py-2 gap-2 rounded-md',
    lg: 'text-base px-6 py-3 gap-2.5 rounded-lg'
  };

  const variantClasses = {
    primary:
      'bg-primary text-primary-foreground hover:bg-violet-700 shadow-md shadow-violet-900/30 border border-white/10',
    secondary:
      'bg-card text-foreground hover:bg-slate-800 border border-border hover:border-accent hover:text-white',
    accent:
      'bg-accent text-slate-900 hover:bg-cyan-400 font-bold shadow-md shadow-cyan-500/20 border border-white/20',
    ghost:
      'bg-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground',
    danger:
      'bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20'
  };

  const disabledClasses = (disabled || isLoading)
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : 'cursor-pointer';

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Loading...</span>
        </span>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

