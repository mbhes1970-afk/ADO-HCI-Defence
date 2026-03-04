// ============================================================
// Badge — ADO UI Component Library
// Variants: status | classification | priority | source | custom
// Used for: OPERATIONAL, RESTRICTED, CRITICAL, SIGINT, etc.
// ============================================================

import React from 'react';
import clsx from 'clsx';

type BadgeVariant =
  | 'operational'   // green — OPERATIONAL
  | 'pending'       // amber — PENDING / SUBSTANTIAL
  | 'critical'      // red   — CRITICAL / BREACH
  | 'intel'         // blue  — intel sources
  | 'restricted'    // gold  — RESTRICTED
  | 'confidential'  // amber — CONFIDENTIAL
  | 'secret'        // red   — SECRET
  | 'unclassified'  // dim   — UNCLASSIFIED
  | 'scheduled'     // dim   — SCHEDULED
  | 'complete'      // green — COMPLETE
  | 'ai'            // gold pulse — AI Generated
  | 'live'          // red pulse  — LIVE
  | 'neutral';      // default dim

type BadgeSize = 'xs' | 'sm' | 'md';

interface BadgeProps {
  variant?: BadgeVariant;
  size?:    BadgeSize;
  dot?:     boolean;    // show status dot before text
  pulse?:   boolean;    // animate the dot
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  operational:  'bg-ado-green/10  text-ado-green  border-ado-green/25',
  pending:      'bg-ado-amber/10  text-ado-amber  border-ado-amber/25',
  critical:     'bg-ado-red/10    text-ado-red    border-ado-red/25',
  intel:        'bg-ado-blue/10   text-ado-blue   border-ado-blue/25',
  restricted:   'bg-brand-primary-dim text-brand-primary border-brand-primary/25',
  confidential: 'bg-ado-amber/10  text-ado-amber  border-ado-amber/30',
  secret:       'bg-ado-red/10    text-ado-red    border-ado-red/30',
  unclassified: 'bg-white/5       text-brand-text-dim border-white/8',
  scheduled:    'bg-white/5       text-brand-text-dim border-white/8',
  complete:     'bg-ado-green/10  text-ado-green  border-ado-green/20',
  ai:           'bg-brand-primary-dim text-brand-primary-light border-brand-primary/20',
  live:         'bg-ado-red/10    text-ado-red    border-ado-red/25',
  neutral:      'bg-white/5       text-brand-text     border-white/8',
};

const dotColors: Record<BadgeVariant, string> = {
  operational:  'bg-ado-green',
  pending:      'bg-ado-amber',
  critical:     'bg-ado-red',
  intel:        'bg-ado-blue',
  restricted:   'bg-brand-primary',
  confidential: 'bg-ado-amber',
  secret:       'bg-ado-red',
  unclassified: 'bg-brand-text-dim',
  scheduled:    'bg-brand-text-dim',
  complete:     'bg-ado-green',
  ai:           'bg-brand-primary',
  live:         'bg-ado-red',
  neutral:      'bg-brand-text-dim',
};

const sizeStyles: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-[9px] gap-1',
  sm: 'px-2 py-0.5 text-[10px] gap-1.5',
  md: 'px-2.5 py-1 text-xs gap-2',
};

export function Badge({
  variant   = 'neutral',
  size      = 'sm',
  dot       = false,
  pulse     = false,
  children,
  className,
}: BadgeProps) {
  const shouldPulse = pulse || variant === 'live' || variant === 'ai';

  return (
    <span
      className={clsx(
        'inline-flex items-center font-mono font-semibold',
        'rounded border uppercase tracking-wide',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {dot && (
        <span
          className={clsx(
            'rounded-full flex-shrink-0',
            size === 'xs' ? 'w-1 h-1' : 'w-1.5 h-1.5',
            dotColors[variant],
            shouldPulse && 'animate-pulse',
          )}
        />
      )}
      {children}
    </span>
  );
}

// ── Shorthand: Classification badge ─────────────────────────
interface ClassificationBadgeProps {
  level: 'UNCLASSIFIED' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  size?: BadgeSize;
}

const classificationVariant: Record<ClassificationBadgeProps['level'], BadgeVariant> = {
  UNCLASSIFIED: 'unclassified',
  RESTRICTED:   'restricted',
  CONFIDENTIAL: 'confidential',
  SECRET:       'secret',
};

export function ClassificationBadge({ level, size = 'sm' }: ClassificationBadgeProps) {
  return (
    <Badge variant={classificationVariant[level]} size={size}>
      {level}
    </Badge>
  );
}

// ── Shorthand: Status badge ──────────────────────────────────
interface StatusBadgeProps {
  status: 'OPERATIONAL' | 'PENDING' | 'SCHEDULED' | 'COMPLETE' | 'CANCELLED';
  size?:  BadgeSize;
}

const statusVariant: Record<StatusBadgeProps['status'], BadgeVariant> = {
  OPERATIONAL: 'operational',
  PENDING:     'pending',
  SCHEDULED:   'scheduled',
  COMPLETE:    'complete',
  CANCELLED:   'critical',
};

const statusLabel: Record<StatusBadgeProps['status'], { nl: string; en: string }> = {
  OPERATIONAL: { nl: 'OPERATIONEEL', en: 'OPERATIONAL' },
  PENDING:     { nl: 'WACHTEND',     en: 'PENDING' },
  SCHEDULED:   { nl: 'GEPLAND',      en: 'SCHEDULED' },
  COMPLETE:    { nl: 'AFGEROND',     en: 'COMPLETE' },
  CANCELLED:   { nl: 'GEANNULEERD',  en: 'CANCELLED' },
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  return (
    <Badge variant={statusVariant[status]} size={size} dot>
      {statusLabel[status].nl}
    </Badge>
  );
}

// ── Shorthand: Threat level badge ───────────────────────────
interface ThreatBadgeProps {
  level: 'LOW' | 'MODERATE' | 'SUBSTANTIAL' | 'SEVERE' | 'CRITICAL';
  size?: BadgeSize;
}

const threatVariant: Record<ThreatBadgeProps['level'], BadgeVariant> = {
  LOW:         'neutral',
  MODERATE:    'intel',
  SUBSTANTIAL: 'pending',
  SEVERE:      'critical',
  CRITICAL:    'critical',
};

const threatLabel: Record<ThreatBadgeProps['level'], string> = {
  LOW:         'LAAG',
  MODERATE:    'MATIG',
  SUBSTANTIAL: 'AANZIENLIJK',
  SEVERE:      'ERNSTIG',
  CRITICAL:    'KRITIEK',
};

export function ThreatBadge({ level, size = 'sm' }: ThreatBadgeProps) {
  return (
    <Badge variant={threatVariant[level]} size={size}>
      {threatLabel[level]}
    </Badge>
  );
}
