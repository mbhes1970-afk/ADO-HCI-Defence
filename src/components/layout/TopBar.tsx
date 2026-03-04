// ============================================================
// TopBar — ADO
// Header bar: prototype banner, operational status, lang toggle,
// settings button, user badge
// ============================================================

import { useState }           from 'react';
import { useLanguage, t }     from '../../config/i18n';
import { useSessionStore }    from '../../store/sessionStore';
import { SettingsPanel }      from '../shared/SettingsPanel';
import clsx                   from 'clsx';

export function TopBar() {
  const { lang, setLang }   = useLanguage();
  const { userInitials }    = useSessionStore();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <header className="
        sticky top-0 z-30 h-12 flex items-center justify-between
        px-6 bg-brand-bg/90 backdrop-blur-md border-b border-brand-border
      ">
        {/* ── Left: prototype notice ── */}
        <div className="flex items-center gap-3">
          <span className="
            text-[10px] font-mono px-2 py-0.5 rounded
            bg-brand-primary-dim text-brand-primary border border-brand-primary/20
          ">
            🛡️ {t('topbar.prototype', lang)}
          </span>
          <span className="hidden md:block text-xs text-brand-text-dim font-mono">
            {t('topbar.platform', lang)}
          </span>
        </div>

        {/* ── Right: status + lang + settings + user ── */}
        <div className="flex items-center gap-3">
          {/* Operational status indicator */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-ado-green animate-pulse-slow" />
            <span className="text-[11px] font-mono text-ado-green font-semibold">
              {t('topbar.status', lang)}
            </span>
          </div>

          {/* Language toggle */}
          <div className="flex gap-1">
            {(['nl', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={clsx(
                  'px-2.5 py-1 text-[11px] font-bold font-mono rounded transition-all',
                  lang === l
                    ? 'bg-brand-primary text-brand-bg'
                    : 'bg-brand-bg-elevated text-brand-text-dim border border-brand-border hover:text-brand-text-bright',
                )}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Settings button */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="
              w-7 h-7 rounded flex items-center justify-center
              text-brand-text-dim hover:text-brand-text-bright
              hover:bg-brand-bg-elevated border border-transparent
              hover:border-brand-border transition-all
            "
            title={lang === 'nl' ? 'Instellingen' : 'Settings'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>

          {/* User badge — opens settings on click */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="
              w-7 h-7 rounded-full flex items-center justify-center
              bg-brand-primary text-brand-bg text-xs font-bold font-mono
              hover:bg-brand-primary-light transition-colors
            "
            title={lang === 'nl' ? 'Profiel & Instellingen' : 'Profile & Settings'}
          >
            {userInitials}
          </button>
        </div>
      </header>

      {/* Settings panel */}
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
