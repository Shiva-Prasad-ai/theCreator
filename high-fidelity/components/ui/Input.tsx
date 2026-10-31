import React from 'react';

/**
 * CreatorOS AI — High-Fidelity Input & Form Component Blueprint
 * Reference implementation for Shiva's Next.js integration.
 * Built with Tailwind CSS + accessible focus states & error rings.
 */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  id,
  className = '',
  disabled,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-heading"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          disabled={disabled}
          className={`w-full bg-slate-900/90 border text-white text-sm rounded-md transition-all duration-150 py-2.5 ${
            leftIcon ? 'pl-10' : 'pl-3.5'
          } ${rightIcon ? 'pr-10' : 'pr-3.5'} ${
            error
              ? 'border-rose-500 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
              : 'border-slate-800 hover:border-slate-700 focus:border-accent focus:ring-2 focus:ring-cyan-500/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-950' : ''} ${className}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-desc` : undefined}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-slate-400 pointer-events-none flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-rose-400 font-medium flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${inputId}-desc`} className="text-xs text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
};

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  characterCount?: number;
  maxCharacters?: number;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  helperText,
  error,
  characterCount,
  maxCharacters,
  id,
  className = '',
  disabled,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-heading"
          >
            {label}
          </label>
        )}
        {maxCharacters !== undefined && characterCount !== undefined && (
          <span
            className={`font-mono text-[11px] ${
              characterCount > maxCharacters ? 'text-rose-400 font-bold' : 'text-slate-400'
            }`}
          >
            {characterCount} / {maxCharacters}
          </span>
        )}
      </div>
      <textarea
        id={textareaId}
        disabled={disabled}
        className={`w-full bg-slate-900/90 border text-white text-sm rounded-md p-3.5 transition-all duration-150 resize-y min-h-[120px] ${
          error
            ? 'border-rose-500 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
            : 'border-slate-800 hover:border-slate-700 focus:border-accent focus:ring-2 focus:ring-cyan-500/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-950' : ''} ${className}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-desc` : undefined}
        {...props}
      />
      {error && (
        <p id={`${textareaId}-error`} className="text-xs text-rose-400 font-medium flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${textareaId}-desc`} className="text-xs text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
};

export interface ErrorBannerProps {
  message: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div
      role="alert"
      className={`p-3.5 rounded-md bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-rose-400 text-base">⚠️</span>
        <span className="font-medium">{message}</span>
      </div>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="text-accent underline font-semibold hover:text-white shrink-0"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

