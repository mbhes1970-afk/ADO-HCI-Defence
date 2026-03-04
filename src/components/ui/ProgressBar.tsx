// ============================================================
// ProgressBar — ADO UI Component Library
// Linear + circular (ring) variants
// Used in: CompetencyTracker, loading states
// ============================================================

import clsx from 'clsx';

type ProgressColor = 'primary' | 'green' | 'amber' | 'red' | 'blue';

const trackColors: Record<ProgressColor, string> = {
  primary: 'bg-brand-primary',
  green:   'bg-ado-green',
  amber:   'bg-ado-amber',
  red:     'bg-ado-red',
  blue:    'bg-ado-blue',
};

// ── Linear ProgressBar ───────────────────────────────────────
interface ProgressBarProps {
  value:      number;   // 0–100
  color?:     ProgressColor;
  size?:      'xs' | 'sm' | 'md';
  label?:     string;
  showValue?: boolean;
  className?: string;
  animated?:  boolean;
}

const barHeights = { xs: 'h-0.5', sm: 'h-1', md: 'h-2' };

export function ProgressBar({
  value,
  color     = 'primary',
  size      = 'sm',
  label,
  showValue = false,
  className,
  animated  = true,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={clsx('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1">
          {label    && <span className="text-[11px] font-mono text-brand-text-dim">{label}</span>}
          {showValue && <span className="text-[11px] font-mono text-brand-text-bright font-semibold">{clamped}%</span>}
        </div>
      )}
      <div className={clsx('w-full bg-white/5 rounded-full overflow-hidden', barHeights[size])}>
        <div
          className={clsx(
            'h-full rounded-full',
            trackColors[color],
            animated && 'transition-all duration-700 ease-out',
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

// ── Circular Ring ────────────────────────────────────────────
interface RingProgressProps {
  value:      number;   // 0–100
  size?:      number;   // svg size px (default 48)
  stroke?:    number;   // stroke width (default 4)
  color?:     ProgressColor;
  label?:     string;   // center text override (default: value%)
  className?: string;
}

const ringColors: Record<ProgressColor, string> = {
  primary: 'stroke-brand-primary',
  green:   'stroke-ado-green',
  amber:   'stroke-ado-amber',
  red:     'stroke-ado-red',
  blue:    'stroke-ado-blue',
};

export function RingProgress({
  value,
  size   = 48,
  stroke = 4,
  color  = 'green',
  label,
  className,
}: RingProgressProps) {
  const clamped    = Math.min(100, Math.max(0, value));
  const r          = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset     = circumference * (1 - clamped / 100);

  return (
    <div className={clsx('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          className="stroke-white/5"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none"
          className={clsx(ringColors[color], 'transition-all duration-700 ease-out')}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {/* Center label */}
      <span className="absolute text-[10px] font-mono font-bold text-brand-text-bright">
        {label ?? `${clamped}%`}
      </span>
    </div>
  );
}
