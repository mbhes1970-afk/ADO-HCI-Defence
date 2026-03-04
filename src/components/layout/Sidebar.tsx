// ============================================================
// Sidebar — ADO
// Main navigation. Add a new module: add ONE entry to navItems.
// ============================================================

import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../themes/ThemeProvider';
import { useLanguage, t } from '../../config/i18n';
import clsx from 'clsx';

const navItems = [
  { id: 'dashboard',      icon: '📊', labelKey: 'nav.dashboard'    as const, path: '/' },
  { id: 'mission-brief',  icon: '📋', labelKey: 'nav.missionBrief' as const, path: '/mission-brief' },
  { id: 'intel-analyst',  icon: '🔍', labelKey: 'nav.intel'        as const, path: '/intel' },
  { id: 'field-report',   icon: '🎙️', labelKey: 'nav.fieldReport'  as const, path: '/field-report' },
  { id: 'training-sim',   icon: '🎮', labelKey: 'nav.training'     as const, path: '/training' },
];

export function Sidebar() {
  const { lang } = useLanguage();
  const theme    = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="
      fixed left-0 top-0 h-screen w-56 z-40 flex flex-col
      bg-brand-bg-card border-r border-brand-border
    ">
      {/* ── Logo ── */}
      <div className="px-4 py-5 border-b border-brand-border">
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold text-brand-primary">ADO</span>
          <span className="text-[10px] font-mono text-brand-text-dim leading-tight">
            AI Defence<br />Operations
          </span>
        </div>
        <p className="text-[10px] text-brand-text-dim mt-1 font-mono">
          {theme.tagline}
        </p>
      </div>

      {/* ── Nav items ── */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all',
                'text-sm font-medium',
                isActive
                  ? 'bg-brand-primary-dim text-brand-primary-light border-r-2 border-brand-primary'
                  : 'text-brand-text-dim hover:text-brand-text-bright hover:bg-brand-bg-elevated',
              )}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="leading-tight">{t(item.labelKey, lang)}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Bottom: HCI brand ── */}
      <div className="px-4 py-3 border-t border-brand-border">
        <p className="text-[10px] text-brand-text-dim font-mono">
          HES Consultancy Int.
        </p>
        <a
          href={theme.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-brand-text-dim hover:text-brand-primary transition-colors font-mono"
        >
          hes-consultancy-international.com
        </a>
      </div>
    </aside>
  );
}
