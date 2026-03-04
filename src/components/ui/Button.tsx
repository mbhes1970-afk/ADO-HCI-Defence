// ============================================================
// Button — ADO UI Component Library
// Variants: primary | ghost | secondary | danger | intel
// Sizes: sm | md | lg
// Supports: loading state, icon left/right, disabled
// ============================================================

import React from 'react';
import clsx from 'clsx';

type Variant = 'primary' | 'ghost' | 'secondary' | 'danger' | 'intel';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   Variant;
  size?:      Size;
  loading?:   boolean;
  iconLeft?:  React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:   `
    bg-brand-primary text-brand-bg font-semibold
    hover:bg-brand-primary-light
    active:scale-[0.98]
    shadow-[0_0_20px_rgba(200,165,90,0.15)]
    hover:shadow-[0_0_30px_rgba(200,165,90,0.25)]
  `,
  ghost:     `
    bg-transparent border border-brand-primary/30 text-brand-primary
    hover:bg-brand-primary-dim hover:border-brand-primary/60
    active:scale-[0.98]
  `,
  secondary: `
    bg-brand-bg-elevated border border-brand-border text-brand-text-bright
    hover:border-white/12 hover:bg-white/5
    active:scale-[0.98]
  `,
  danger:    `
    bg-ado-red/10 border border-ado-red/30 text-ado-red
    hover:bg-ado-red/20 hover:border-ado-red/60
    active:scale-[0.98]
  `,
  intel:     `
    bg-ado-blue/10 border border-ado-blue/30 text-ado-blue
    hover:bg-ado-blue/20 hover:border-ado-blue/60
    active:scale-[0.98]
  `,
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[11px] gap-1.5',
  md: 'px-4 py-2 text-xs gap-2',
  lg: 'px-5 py-2.5 text-sm gap-2.5',
};

export function Button({
  variant   = 'secondary',
  size      = 'md',
  loading   = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  children,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        // Base
        'inline-flex items-center justify-center font-mono font-medium',
        'rounded transition-all duration-150 whitespace-nowrap',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary/60',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none',
        // Variant + size
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="opacity-70">Laden...</span>
        </>
      ) : (
        <>
          {iconLeft  && <span className="leading-none">{iconLeft}</span>}
          {children}
          {iconRight && <span className="leading-none">{iconRight}</span>}
        </>
      )}
    </button>
  );
}
