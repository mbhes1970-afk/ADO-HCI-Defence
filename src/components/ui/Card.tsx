// ============================================================
// Card — ADO UI Component Library
// Variants: base | accent | interactive | stat | panel
// ============================================================

import React from 'react';
import clsx from 'clsx';

// ── Base Card ───────────────────────────────────────────────
interface CardProps {
  children:    React.ReactNode;
  className?:  string;
  accent?:     boolean;   // gold top-border on hover
  interactive?: boolean;  // lift + cursor pointer on hover
  onClick?:    () => void;
  padding?:    'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-6',
};

export function Card({
  children,
  className,
  accent       = false,
  interactive  = false,
  onClick,
  padding      = 'md',
}: CardProps) {
  const Tag = onClick || interactive ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={clsx(
        'bg-brand-bg-card border border-brand-border rounded-lg',
        'transition-all duration-300 relative overflow-hidden text-left w-full',
        // Accent: gold line slides in from top on hover
        accent && [
          'before:absolute before:inset-x-0 before:top-0 before:h-[2px]',
          'before:bg-brand-primary before:origin-left before:scale-x-0',
          'before:transition-transform before:duration-300',
          'hover:before:scale-x-100',
          'hover:border-brand-primary/20',
        ],
        // Interactive: lift + glow
        interactive && [
          'cursor-pointer',
          'hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
          'hover:border-brand-primary/25',
        ],
        // Just hover border highlight (non-interactive)
        !interactive && !accent && 'hover:border-white/10',
        paddingStyles[padding],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

// ── Card Header ──────────────────────────────────────────────
interface CardHeaderProps {
  title:     string;
  subtitle?: string;
  icon?:     React.ReactNode;
  badge?:    React.ReactNode;
  action?:   React.ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, icon, badge, action, className }: CardHeaderProps) {
  return (
    <div className={clsx('flex items-start justify-between gap-3 mb-4', className)}>
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && (
          <span className="text-brand-primary text-base leading-none flex-shrink-0">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-brand-text-bright font-semibold text-sm truncate">
              {title}
            </h3>
            {badge}
          </div>
          {subtitle && (
            <p className="text-brand-text-dim text-[11px] font-mono mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

// ── Stat Card ───────────────────────────────────────────────
interface StatCardProps {
  label:      string;
  value:      string | number;
  delta?:     string;        // e.g. "↑ 23%" or "↑ 2"
  deltaPositive?: boolean;   // green if true, red if false, neutral if undefined
  sublabel?:  string;
  icon?:      string;
  className?: string;
}

export function StatCard({
  label,
  value,
  delta,
  deltaPositive,
  sublabel,
  icon,
  className,
}: StatCardProps) {
  return (
    <Card accent className={className}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-brand-text-dim text-[11px] font-mono uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="text-brand-text-bright text-2xl font-bold font-mono leading-none">
            {value}
          </p>
          {sublabel && (
            <p className="text-brand-text-dim text-[10px] font-mono mt-1">{sublabel}</p>
          )}
          {delta && (
            <p className={clsx(
              'text-[10px] font-mono mt-1.5 font-semibold',
              deltaPositive === true  && 'text-ado-green',
              deltaPositive === false && 'text-ado-red',
              deltaPositive === undefined && 'text-brand-text-dim',
            )}>
              {delta}
            </p>
          )}
        </div>
        {icon && (
          <span className="text-2xl opacity-40 flex-shrink-0">{icon}</span>
        )}
      </div>
    </Card>
  );
}

// ── Panel (full-width section card) ─────────────────────────
interface PanelProps {
  children:   React.ReactNode;
  className?: string;
  noPad?:     boolean;
}

export function Panel({ children, className, noPad = false }: PanelProps) {
  return (
    <div className={clsx(
      'bg-brand-bg-card border border-brand-border rounded-lg',
      !noPad && 'p-5',
      className,
    )}>
      {children}
    </div>
  );
}
