// ============================================================
// StatusIndicator — ADO UI Component Library
// Compact dot + label for operational status display.
// Used in: Dashboard mission table, TopBar, module headers
// ============================================================

import clsx from 'clsx';

type StatusValue = 'OPERATIONAL' | 'PENDING' | 'SCHEDULED' | 'COMPLETE' | 'CANCELLED' | 'LIVE' | 'OFFLINE';

interface StatusIndicatorProps {
  status:     StatusValue;
  showLabel?: boolean;
  size?:      'xs' | 'sm' | 'md';
  className?: string;
}

const dotStyles: Record<StatusValue, string> = {
  OPERATIONAL: 'bg-ado-green',
  PENDING:     'bg-ado-amber',
  SCHEDULED:   'bg-brand-text-dim',
  COMPLETE:    'bg-ado-blue',
  CANCELLED:   'bg-ado-red',
  LIVE:        'bg-ado-red',
  OFFLINE:     'bg-brand-text-dim',
};

const labelStyles: Record<StatusValue, string> = {
  OPERATIONAL: 'text-ado-green',
  PENDING:     'text-ado-amber',
  SCHEDULED:   'text-brand-text-dim',
  COMPLETE:    'text-ado-blue',
  CANCELLED:   'text-ado-red',
  LIVE:        'text-ado-red',
  OFFLINE:     'text-brand-text-dim',
};

const labels: Record<StatusValue, { nl: string; en: string }> = {
  OPERATIONAL: { nl: 'OPERATIONEEL', en: 'OPERATIONAL' },
  PENDING:     { nl: 'WACHTEND',     en: 'PENDING' },
  SCHEDULED:   { nl: 'GEPLAND',      en: 'SCHEDULED' },
  COMPLETE:    { nl: 'AFGEROND',     en: 'COMPLETE' },
  CANCELLED:   { nl: 'GEANNULEERD',  en: 'CANCELLED' },
  LIVE:        { nl: 'LIVE',         en: 'LIVE' },
  OFFLINE:     { nl: 'OFFLINE',      en: 'OFFLINE' },
};

const shouldPulse = (s: StatusValue) => s === 'OPERATIONAL' || s === 'LIVE';

const dotSizes = { xs: 'w-1 h-1', sm: 'w-1.5 h-1.5', md: 'w-2 h-2' };
const textSizes = { xs: 'text-[9px]', sm: 'text-[10px]', md: 'text-xs' };

export function StatusIndicator({
  status,
  showLabel = true,
  size      = 'sm',
  className,
}: StatusIndicatorProps) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5', className)}>
      <span
        className={clsx(
          'rounded-full flex-shrink-0',
          dotSizes[size],
          dotStyles[status],
          shouldPulse(status) && 'animate-pulse',
        )}
      />
      {showLabel && (
        <span
          className={clsx(
            'font-mono font-semibold uppercase tracking-wide',
            textSizes[size],
            labelStyles[status],
          )}
        >
          {labels[status].nl}
        </span>
      )}
    </span>
  );
}
