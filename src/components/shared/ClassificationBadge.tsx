// ============================================================
// ClassificationBadge — ADO shared component
// Two modes:
//   1. Compact badge (inline, e.g. next to card title)
//   2. Banner (full-width strip, e.g. top of export preview)
// ============================================================

import clsx from 'clsx';

type Level = 'UNCLASSIFIED' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';

// Colours per classification level
const levelStyles: Record<Level, { badge: string; banner: string; text: string }> = {
  UNCLASSIFIED: {
    badge:  'bg-white/5 border-white/10 text-brand-text-dim',
    banner: 'bg-white/5 border-white/8',
    text:   'text-brand-text-dim',
  },
  RESTRICTED: {
    badge:  'bg-brand-primary-dim border-brand-primary/25 text-brand-primary',
    banner: 'bg-brand-primary-dim border-brand-primary/20',
    text:   'text-brand-primary',
  },
  CONFIDENTIAL: {
    badge:  'bg-ado-amber/10 border-ado-amber/25 text-ado-amber',
    banner: 'bg-ado-amber/10 border-ado-amber/20',
    text:   'text-ado-amber',
  },
  SECRET: {
    badge:  'bg-ado-red/10 border-ado-red/25 text-ado-red',
    banner: 'bg-ado-red/10 border-ado-red/20',
    text:   'text-ado-red',
  },
};

const levelNL: Record<Level, string> = {
  UNCLASSIFIED: 'ONGERUBRICEERD',
  RESTRICTED:   'BEPERKT',
  CONFIDENTIAL: 'VERTROUWELIJK',
  SECRET:       'GEHEIM',
};

// ── Compact badge ────────────────────────────────────────────
interface ClassificationBadgeProps {
  level:      Level;
  size?:      'xs' | 'sm';
  showNL?:    boolean;   // show Dutch label instead of English
  className?: string;
}

export function ClassificationBadge({
  level,
  size    = 'sm',
  showNL  = false,
  className,
}: ClassificationBadgeProps) {
  const styles = levelStyles[level];

  return (
    <span className={clsx(
      'inline-flex items-center font-mono font-semibold uppercase tracking-wide rounded border',
      size === 'xs' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]',
      styles.badge,
      className,
    )}>
      {showNL ? levelNL[level] : level}
    </span>
  );
}

// ── Full banner ──────────────────────────────────────────────
interface ClassificationBannerProps {
  level:      Level;
  className?: string;
}

export function ClassificationBanner({ level, className }: ClassificationBannerProps) {
  const styles = levelStyles[level];

  return (
    <div className={clsx(
      'w-full py-1 text-center font-mono text-[10px] font-bold uppercase tracking-[0.2em]',
      'border-b',
      styles.banner,
      styles.text,
      className,
    )}>
      {level} / {levelNL[level]}
    </div>
  );
}
