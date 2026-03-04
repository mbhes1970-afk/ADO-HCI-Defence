// ============================================================
// SettingsPanel — ADO shared component
// Slide-in panel: gebruikersprofiel, taal, classificatie,
// sessie-info, proxy status check
// ============================================================

import { useState }            from 'react';
import { useLanguage }         from '../../config/i18n';
import { useSessionStore }     from '../../store/sessionStore';
import { Badge }               from '../ui/Badge';
import { Button }              from '../ui/Button';
import clsx                    from 'clsx';

interface SettingsPanelProps {
  open:    boolean;
  onClose: () => void;
}

const CLASSIFICATION_OPTIONS = ['UNCLASSIFIED', 'RESTRICTED', 'CONFIDENTIAL', 'SECRET'] as const;

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { lang, setLang } = useLanguage();
  const { userName, userRank, userInitials } = useSessionStore();

  const [defaultClass, setDefaultClass] = useState<typeof CLASSIFICATION_OPTIONS[number]>('RESTRICTED');
  const [proxyStatus,  setProxyStatus]  = useState<'unknown' | 'ok' | 'error'>('unknown');
  const [checking,     setChecking]     = useState(false);

  async function checkProxy() {
    setChecking(true);
    try {
      const res = await fetch('/.netlify/functions/ado-proxy', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'ping' }),
      });
      setProxyStatus(res.ok ? 'ok' : 'error');
    } catch {
      setProxyStatus('error');
    } finally {
      setChecking(false);
    }
  }

  const classColor = {
    UNCLASSIFIED: 'text-brand-text-dim',
    RESTRICTED:   'text-brand-primary',
    CONFIDENTIAL: 'text-ado-amber',
    SECRET:       'text-ado-red',
  };

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div className={clsx(
        'fixed top-0 right-0 h-screen w-80 z-50 flex flex-col',
        'bg-brand-bg-card border-l border-brand-border',
        'transition-transform duration-300',
        open ? 'translate-x-0' : 'translate-x-full',
      )}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-brand-border">
          <div>
            <h2 className="text-brand-text-bright font-semibold text-sm">
              ⚙️ {lang === 'nl' ? 'Instellingen' : 'Settings'}
            </h2>
            <p className="text-brand-text-dim text-[10px] font-mono mt-0.5">
              AI Defence Operations v1.0
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-brand-text-dim hover:text-brand-text-bright transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">

          {/* ── User profile ── */}
          <section>
            <p className="text-[9px] font-mono text-brand-text-dim uppercase tracking-widest mb-2">
              {lang === 'nl' ? 'Gebruiker' : 'User'}
            </p>
            <div className="bg-brand-bg-elevated border border-brand-border rounded-lg p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-primary-dim border border-brand-primary/30 flex items-center justify-center">
                <span className="font-mono text-sm font-bold text-brand-primary">{userInitials}</span>
              </div>
              <div>
                <p className="text-brand-text-bright text-xs font-semibold">{userName}</p>
                <p className="text-brand-text-dim text-[10px] font-mono">{userRank} · NLD Landmacht</p>
              </div>
            </div>
          </section>

          {/* ── Language ── */}
          <section>
            <p className="text-[9px] font-mono text-brand-text-dim uppercase tracking-widest mb-2">
              {lang === 'nl' ? 'Taal / Language' : 'Language / Taal'}
            </p>
            <div className="flex gap-2">
              {(['nl', 'en'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={clsx(
                    'flex-1 py-2 rounded border text-xs font-mono font-semibold uppercase transition-all',
                    lang === l
                      ? 'border-brand-primary/50 bg-brand-primary-dim text-brand-primary'
                      : 'border-brand-border text-brand-text-dim hover:text-brand-text-bright hover:border-brand-border/80',
                  )}
                >
                  {l === 'nl' ? '🇳🇱 NL' : '🇬🇧 EN'}
                </button>
              ))}
            </div>
          </section>

          {/* ── Default classification ── */}
          <section>
            <p className="text-[9px] font-mono text-brand-text-dim uppercase tracking-widest mb-2">
              {lang === 'nl' ? 'Standaard Classificatie' : 'Default Classification'}
            </p>
            <div className="space-y-1.5">
              {CLASSIFICATION_OPTIONS.map(level => (
                <button
                  key={level}
                  onClick={() => setDefaultClass(level)}
                  className={clsx(
                    'w-full flex items-center justify-between px-3 py-2 rounded border text-xs font-mono transition-all',
                    defaultClass === level
                      ? 'border-brand-primary/40 bg-brand-primary-dim'
                      : 'border-brand-border hover:border-brand-border/80',
                  )}
                >
                  <span className={classColor[level]}>{level}</span>
                  {defaultClass === level && <span className="text-ado-green text-[10px]">✓</span>}
                </button>
              ))}
            </div>
          </section>

          {/* ── Proxy / API status ── */}
          <section>
            <p className="text-[9px] font-mono text-brand-text-dim uppercase tracking-widest mb-2">
              {lang === 'nl' ? 'Systeem Status' : 'System Status'}
            </p>
            <div className="bg-brand-bg-elevated border border-brand-border rounded-lg p-3 space-y-2.5">
              {[
                {
                  label: lang === 'nl' ? 'ADO Proxy (Netlify)' : 'ADO Proxy (Netlify)',
                  status: proxyStatus === 'ok' ? 'ok' : proxyStatus === 'error' ? 'error' : 'pending',
                },
                { label: 'Claude API', status: 'pending' as const },
                { label: 'Zustand Store', status: 'ok' as const },
                { label: 'Speech API', status: typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) ? 'ok' as const : 'error' as const },
              ].map(({ label, status }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-brand-text-dim">{label}</span>
                  <Badge
                    variant={status === 'ok' ? 'operational' : status === 'error' ? 'critical' : 'pending'}
                    size="xs"
                    dot
                  >
                    {status === 'ok' ? 'OK' : status === 'error' ? 'ERROR' : '—'}
                  </Badge>
                </div>
              ))}

              <Button
                variant="ghost"
                size="sm"
                fullWidth
                loading={checking}
                onClick={checkProxy}
                className="mt-2"
              >
                {lang === 'nl' ? 'Test Proxy Verbinding' : 'Test Proxy Connection'}
              </Button>
            </div>
          </section>

          {/* ── Environment ── */}
          <section>
            <p className="text-[9px] font-mono text-brand-text-dim uppercase tracking-widest mb-2">
              {lang === 'nl' ? 'Omgeving' : 'Environment'}
            </p>
            <div className="bg-brand-bg-elevated border border-brand-border rounded-lg p-3 space-y-1.5">
              {[
                { key: 'Platform',    value: 'AI Defence Operations' },
                { key: 'Versie',      value: 'v1.0.0-prototype' },
                { key: 'Proxy',       value: '/.netlify/functions/ado-proxy' },
                { key: 'Model',       value: 'claude-sonnet-4-5' },
                { key: 'Build',       value: new Date().toLocaleDateString('nl-NL') },
              ].map(({ key, value }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-brand-text-dim">{key}</span>
                  <span className="text-[10px] font-mono text-brand-text-bright">{value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Contact ── */}
          <section>
            <p className="text-[9px] font-mono text-brand-text-dim uppercase tracking-widest mb-2">
              {lang === 'nl' ? 'Support' : 'Support'}
            </p>
            <div className="bg-brand-bg-elevated border border-brand-border rounded-lg p-3">
              <p className="text-[11px] font-mono text-brand-primary">HES Consultancy International</p>
              <p className="text-[10px] font-mono text-brand-text-dim mt-0.5">mbhes@hes-consultancy-international.com</p>
              <p className="text-[10px] font-mono text-brand-text-dim">hes-consultancy-international.com</p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-brand-border">
          <Button variant="secondary" size="sm" fullWidth onClick={onClose}>
            {lang === 'nl' ? 'Sluiten' : 'Close'}
          </Button>
        </div>
      </div>
    </>
  );
}
