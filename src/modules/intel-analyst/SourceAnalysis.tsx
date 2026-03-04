// ============================================================
// SourceAnalysis — WP06 sub-component
// Tab 1 + 2: 6 bronkaarten + detailweergave bij selectie
// ============================================================

import { useLanguage }         from '../../config/i18n';
import { useIntelStore }       from '../../store/intelStore';
import { Badge }               from '../../components/ui/Badge';
import { Button }              from '../../components/ui/Button';
import { Card }                from '../../components/ui/Card';
import type { IntelSource }    from '../../config/types';
import clsx                    from 'clsx';

// ── Reliability code labels & colours ───────────────────────
const reliabilityMeta: Record<string, { label: { nl: string; en: string }; color: string }> = {
  A1: { label: { nl: 'Betrouwbaar / Bevestigd',     en: 'Reliable / Confirmed'       }, color: 'text-ado-green'   },
  A2: { label: { nl: 'Betrouwbaar / Waarschijnlijk', en: 'Reliable / Probably True'   }, color: 'text-ado-green'   },
  B1: { label: { nl: 'Gewoonlijk / Bevestigd',       en: 'Usually Reliable / Confirmed' }, color: 'text-ado-blue'  },
  B2: { label: { nl: 'Gewoonlijk / Waarschijnlijk',  en: 'Usually Reliable / Probable'  }, color: 'text-ado-blue'  },
  C3: { label: { nl: 'Redelijk / Mogelijk',          en: 'Fairly Reliable / Possibly True' }, color: 'text-ado-amber' },
  D4: { label: { nl: 'Niet beoordeeld / Twijfelachtig', en: 'Not Assessed / Doubtful'  }, color: 'text-brand-text-dim' },
};

const sourceTypeColor: Record<string, string> = {
  SIGINT: 'border-ado-blue/30   bg-ado-blue/5   text-ado-blue',
  IMINT:  'border-ado-green/30  bg-ado-green/5  text-ado-green',
  HUMINT: 'border-ado-amber/30  bg-ado-amber/5  text-ado-amber',
  UAV:    'border-ado-red/30    bg-ado-red/5    text-ado-red',
  OSINT:  'border-brand-text-dim/20 bg-white/3  text-brand-text-dim',
  GEOINT: 'border-brand-primary/30 bg-brand-primary-dim text-brand-primary',
};

// ── Source card ──────────────────────────────────────────────
function SourceCard({ source, lang, isSelected, onSelect }: {
  source: IntelSource; lang: 'nl' | 'en'; isSelected: boolean; onSelect: () => void;
}) {
  const rel = reliabilityMeta[source.reliabilityCode];

  return (
    <button
      onClick={onSelect}
      className={clsx(
        'w-full text-left p-3 rounded-lg border transition-all duration-200',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary/60',
        isSelected
          ? 'border-brand-primary/50 bg-brand-primary-dim shadow-[0_0_20px_rgba(200,165,90,0.08)]'
          : 'border-brand-border bg-brand-bg-card hover:border-brand-primary/25 hover:bg-white/[0.02]',
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{source.icon}</span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={clsx(
                'text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border',
                sourceTypeColor[source.type],
              )}>
                {source.type}
              </span>
              {source.isLive && (
                <Badge variant="live" size="xs" dot pulse>LIVE</Badge>
              )}
            </div>
            <p className="text-[10px] font-mono text-brand-text-dim mt-0.5">{source.subLabel}</p>
          </div>
        </div>

        {/* Reliability code */}
        <div className="text-right flex-shrink-0">
          <span className={clsx('text-xs font-mono font-bold', rel.color)}>
            {source.reliabilityCode}
          </span>
          <p className="text-[9px] font-mono text-brand-text-dim mt-0.5">{source.updatedAt}</p>
        </div>
      </div>

      {/* Summary */}
      <p className="text-[11px] font-mono text-brand-text leading-snug line-clamp-2">
        {source.summary[lang]}
      </p>

      {/* Selected indicator */}
      {isSelected && (
        <div className="mt-2 pt-2 border-t border-brand-primary/20 flex items-center gap-1">
          <span className="text-brand-primary text-[10px] font-mono">▶ {lang === 'nl' ? 'Geselecteerd voor analyse' : 'Selected for analysis'}</span>
        </div>
      )}
    </button>
  );
}

// ── Detail panel ─────────────────────────────────────────────
function SourceDetail({ source, lang, onSkipToCorrelation }: {
  source: IntelSource; lang: 'nl' | 'en'; onSkipToCorrelation: () => void;
}) {
  const rel = reliabilityMeta[source.reliabilityCode];

  return (
    <div className="bg-brand-bg-card border border-brand-primary/30 rounded-lg overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-brand-border bg-brand-bg-elevated">
        <span className="text-xl">{source.icon}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={clsx('text-xs font-mono font-bold px-2 py-0.5 rounded border', sourceTypeColor[source.type])}>
              {source.type}
            </span>
            <span className="text-brand-text-bright text-xs font-semibold">{source.subLabel}</span>
            {source.isLive && <Badge variant="live" size="xs" dot pulse>LIVE</Badge>}
          </div>
          <p className="text-[10px] font-mono text-brand-text-dim mt-0.5">
            {lang === 'nl' ? 'Bijgewerkt' : 'Updated'}: {source.updatedAt}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Full summary */}
        <div>
          <p className="text-[10px] font-mono text-brand-text-dim uppercase tracking-wider mb-1">
            {lang === 'nl' ? 'Rapport' : 'Report'}
          </p>
          <p className="text-brand-text text-xs font-mono leading-relaxed">
            {source.summary[lang]}
          </p>
        </div>

        {/* Reliability assessment */}
        <div className="bg-brand-bg-elevated rounded-lg p-3 border border-brand-border">
          <p className="text-[10px] font-mono text-brand-text-dim uppercase tracking-wider mb-2">
            {lang === 'nl' ? 'Betrouwbaarheidsbeoordeling' : 'Reliability Assessment'}
          </p>
          <div className="flex items-center justify-between">
            <div>
              <span className={clsx('text-lg font-mono font-bold', rel.color)}>
                {source.reliabilityCode}
              </span>
              <p className={clsx('text-[11px] font-mono mt-0.5', rel.color)}>
                {rel.label[lang]}
              </p>
            </div>
            {/* NATO reliability scale visual */}
            <div className="flex gap-1 items-end">
              {['A1','A2','B1','B2','C3','D4'].map((code) => (
                <div key={code} className="flex flex-col items-center gap-0.5">
                  <div className={clsx(
                    'w-3 rounded-sm transition-all',
                    code === source.reliabilityCode
                      ? `${rel.color.replace('text-','bg-')} h-5`
                      : 'bg-brand-border h-2',
                  )} />
                  <span className="text-[8px] font-mono text-brand-text-dim">{code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metadata chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Source ID', value: source.id.toUpperCase() },
            { label: lang === 'nl' ? 'Type' : 'Type', value: source.type },
            { label: 'Sector',    value: source.subLabel },
          ].map(({ label, value }) => (
            <div key={label} className="px-2.5 py-1.5 rounded border border-brand-border bg-brand-bg-elevated">
              <p className="text-[9px] font-mono text-brand-text-dim uppercase tracking-wider">{label}</p>
              <p className="text-[11px] font-mono text-brand-text-bright font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <Button variant="primary" size="sm" fullWidth onClick={onSkipToCorrelation}>
          {lang === 'nl' ? 'Gebruik in Correlatie →' : 'Use in Correlation →'}
        </Button>
      </div>
    </div>
  );
}

// ── Main SourceAnalysis ──────────────────────────────────────
interface SourceAnalysisProps {
  onSkipToCorrelation: () => void;
}

export function SourceAnalysis({ onSkipToCorrelation }: SourceAnalysisProps) {
  const { lang }                    = useLanguage();
  const { sources, selectedSourceId, selectSource } = useIntelStore();
  const selectedSource = sources.find(s => s.id === selectedSourceId) ?? null;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-brand-text-bright font-semibold text-sm mb-0.5">
          📡 {lang === 'nl' ? 'Intel Bronnen — Overzicht' : 'Intel Sources — Overview'}
        </h3>
        <p className="text-brand-text-dim text-[10px] font-mono">
          {lang === 'nl' ? 'Selecteer een bron voor detailanalyse' : 'Select a source for detailed analysis'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: 6 source cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
          {sources.map((source) => (
            <SourceCard
              key={source.id}
              source={source}
              lang={lang}
              isSelected={selectedSourceId === source.id}
              onSelect={() => selectSource(source.id === selectedSourceId ? null : source.id)}
            />
          ))}
        </div>

        {/* Right: detail panel or placeholder */}
        <div>
          {selectedSource ? (
            <SourceDetail
              source={selectedSource}
              lang={lang}
              onSkipToCorrelation={onSkipToCorrelation}
            />
          ) : (
            <Card className="h-full min-h-[200px] flex items-center justify-center">
              <div className="text-center py-8">
                <p className="text-4xl mb-3 opacity-30">🔍</p>
                <p className="text-brand-text-dim text-xs font-mono">
                  {lang === 'nl' ? 'Selecteer een bron links om details te zien' : 'Select a source on the left to view details'}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
