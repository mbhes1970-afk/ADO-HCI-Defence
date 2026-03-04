// ============================================================
// IntelFusion — WP06 sub-component
// Tab 3: Meerdere bronnen selecteren + Claude correleert
// ============================================================

import { useState }             from 'react';
import { useLanguage }          from '../../config/i18n';
import { useIntelStore }        from '../../store/intelStore';
import { useAI }                from '../../hooks/useAI';
import { Badge }                from '../../components/ui/Badge';
import { Button }               from '../../components/ui/Button';
import { Panel }                from '../../components/ui/Card';
import { AIAssistant }          from '../../components/shared/AIAssistant';
import type { IntelSource }     from '../../config/types';
import clsx                     from 'clsx';

const SYSTEM_FUSION = `You are a NATO intelligence analyst. You are correlating multiple intelligence sources to produce a fused assessment.

For each correlation analysis:
1. Identify convergences (where sources agree/reinforce each other)
2. Identify contradictions or gaps
3. Assess the combined confidence level
4. State the most probable enemy course of action (EMCOA)
5. State the most dangerous course of action (MDCOA)
6. Provide a recommended commander's priority

Be concise, professional, and use NATO intelligence terminology.
Respond in the same language as the user message (Dutch or English).`;

const sourceTypeColor: Record<string, string> = {
  SIGINT: 'border-ado-blue/40 text-ado-blue bg-ado-blue/8',
  IMINT:  'border-ado-green/40 text-ado-green bg-ado-green/8',
  HUMINT: 'border-ado-amber/40 text-ado-amber bg-ado-amber/8',
  UAV:    'border-ado-red/40 text-ado-red bg-ado-red/8',
  OSINT:  'border-brand-text-dim/30 text-brand-text-dim bg-white/3',
  GEOINT: 'border-brand-primary/40 text-brand-primary bg-brand-primary-dim',
};

interface SelectableSourceChip {
  source: IntelSource;
  isSelected: boolean;
  onToggle: () => void;
  lang: 'nl' | 'en';
}

function SourceChip({ source, isSelected, onToggle, lang }: SelectableSourceChip) {
  return (
    <button
      onClick={onToggle}
      className={clsx(
        'flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all',
        isSelected
          ? 'border-brand-primary/50 bg-brand-primary-dim'
          : 'border-brand-border bg-brand-bg-elevated hover:border-brand-primary/25',
      )}
    >
      <span className={clsx(
        'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all',
        isSelected
          ? 'bg-brand-primary border-brand-primary text-brand-bg'
          : 'border-brand-border',
      )}>
        {isSelected && <span className="text-[9px] font-bold">✓</span>}
      </span>
      <span className="text-lg leading-none">{source.icon}</span>
      <div className="min-w-0">
        <span className={clsx('text-[10px] font-mono font-bold px-1 py-0.5 rounded border', sourceTypeColor[source.type])}>
          {source.type}
        </span>
        <p className="text-[10px] font-mono text-brand-text-dim mt-0.5 truncate">{source.subLabel}</p>
      </div>
      {source.isLive && <Badge variant="live" size="xs" dot pulse className="ml-auto flex-shrink-0">LIVE</Badge>}
    </button>
  );
}

interface IntelFusionProps {
  onNext: () => void;
}

export function IntelFusion({ onNext }: IntelFusionProps) {
  const { lang }                               = useLanguage();
  const { sources, correlationResult, setCorrelationResult } = useIntelStore();
  const { loading, call }                      = useAI();
  const [selectedIds, setSelectedIds]          = useState<Set<string>>(new Set(['sigint-001', 'imint-001', 'uav-001']));

  function toggleSource(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const selectedSources = sources.filter(s => selectedIds.has(s.id));

  async function runCorrelation() {
    if (selectedSources.length < 2) return;

    const sourceDescriptions = selectedSources.map(s =>
      `[${s.type} — ${s.subLabel} — Reliability ${s.reliabilityCode}]\n${s.summary[lang]}`
    ).join('\n\n');

    const prompt = lang === 'nl'
      ? `Correleer de volgende ${selectedSources.length} intel bronnen en produceer een fused assessment:\n\n${sourceDescriptions}`
      : `Correlate the following ${selectedSources.length} intelligence sources and produce a fused assessment:\n\n${sourceDescriptions}`;

    const result = await call({
      system: SYSTEM_FUSION,
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 1000,
      temperature: 0.2,
    });

    setCorrelationResult(result);
  }

  const fusionActions = [
    {
      label: 'EMCOA',
      message: lang === 'nl'
        ? 'Wat is de meest waarschijnlijke vijandelijke handelwijze op basis van de gecorreleerde intel?'
        : 'What is the most probable enemy course of action based on the correlated intel?',
    },
    {
      label: 'MDCOA',
      message: lang === 'nl'
        ? 'Wat is de meest gevaarlijke vijandelijke handelwijze?'
        : 'What is the most dangerous enemy course of action?',
    },
    {
      label: lang === 'nl' ? 'Hiaten' : 'Gaps',
      message: lang === 'nl'
        ? 'Welke intelligence hiaten bestaan er op basis van de beschikbare bronnen?'
        : 'What intelligence gaps exist based on the available sources?',
    },
    {
      label: lang === 'nl' ? 'Aanbeveling' : 'Recommendation',
      message: lang === 'nl'
        ? 'Geef een aanbeveling voor de commandant op basis van deze correlatie.'
        : 'Provide a commander recommendation based on this correlation.',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-brand-text-bright font-semibold text-sm">
            🔗 {lang === 'nl' ? 'Intel Fusie — Broncorrelatie' : 'Intel Fusion — Source Correlation'}
          </h3>
          <p className="text-brand-text-dim text-[10px] font-mono mt-0.5">
            {lang === 'nl' ? 'Selecteer bronnen → Claude correleert automatisch' : 'Select sources → Claude correlates automatically'}
          </p>
        </div>
        <Badge variant={selectedIds.size >= 2 ? 'operational' : 'pending'} size="xs" dot>
          {selectedIds.size} {lang === 'nl' ? 'geselecteerd' : 'selected'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Source selection — 2 cols */}
        <div className="lg:col-span-2 space-y-2">
          <p className="text-[10px] font-mono text-brand-text-dim uppercase tracking-wider">
            {lang === 'nl' ? 'Bronnen selecteren' : 'Select sources'}
          </p>
          {sources.map(s => (
            <SourceChip
              key={s.id}
              source={s}
              isSelected={selectedIds.has(s.id)}
              onToggle={() => toggleSource(s.id)}
              lang={lang}
            />
          ))}
          <Button
            variant="primary"
            size="sm"
            fullWidth
            loading={loading}
            disabled={selectedIds.size < 2}
            onClick={runCorrelation}
            iconLeft="⚡"
            className="mt-3"
          >
            {selectedIds.size < 2
              ? (lang === 'nl' ? 'Min. 2 bronnen nodig' : 'Min. 2 sources needed')
              : (lang === 'nl' ? `Correleer ${selectedIds.size} Bronnen` : `Correlate ${selectedIds.size} Sources`)}
          </Button>
        </div>

        {/* Correlation result — 3 cols */}
        <div className="lg:col-span-3 space-y-4">

          {/* Result panel */}
          <div className="bg-brand-bg-card border border-brand-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-brand-border bg-brand-bg-elevated">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-brand-text-dim uppercase tracking-wider">
                  🧠 {lang === 'nl' ? 'Fused Assessment' : 'Fused Assessment'}
                </span>
                {correlationResult && <Badge variant="ai" size="xs" dot>AI</Badge>}
              </div>
              {correlationResult && (
                <Button variant="ghost" size="sm" onClick={onNext}>
                  {lang === 'nl' ? 'Naar INTSUM →' : 'To INTSUM →'}
                </Button>
              )}
            </div>

            <div className="p-4 min-h-[180px]">
              {loading && (
                <div className="flex items-center gap-3 py-4">
                  <span className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                  <div>
                    <p className="text-xs font-mono text-brand-text-dim">
                      {lang === 'nl' ? 'Claude correleert bronnen...' : 'Claude is correlating sources...'}
                    </p>
                    <p className="text-[10px] font-mono text-brand-text-dim/60 mt-0.5">
                      {selectedSources.map(s => s.type).join(' + ')}
                    </p>
                  </div>
                </div>
              )}

              {correlationResult && !loading && (
                <p className="text-brand-text text-xs font-mono leading-relaxed whitespace-pre-wrap">
                  {correlationResult}
                </p>
              )}

              {!correlationResult && !loading && (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <p className="text-3xl mb-2 opacity-20">🔗</p>
                  <p className="text-brand-text-dim text-xs font-mono">
                    {selectedIds.size >= 2
                      ? (lang === 'nl' ? 'Klik "Correleer Bronnen" om te beginnen' : 'Click "Correlate Sources" to begin')
                      : (lang === 'nl' ? 'Selecteer minimaal 2 bronnen links' : 'Select at least 2 sources on the left')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Convergence chips — shown after correlation */}
          {correlationResult && (
            <Panel>
              <p className="text-[10px] font-mono text-brand-text-dim uppercase tracking-wider mb-2">
                {lang === 'nl' ? 'Gecorreleerde bronnen' : 'Correlated sources'}
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedSources.map(s => (
                  <span key={s.id} className={clsx(
                    'inline-flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] font-mono',
                    sourceTypeColor[s.type],
                  )}>
                    <span>{s.icon}</span>
                    {s.type} · {s.reliabilityCode}
                  </span>
                ))}
              </div>
            </Panel>
          )}

          {/* AI assistant */}
          <AIAssistant
            systemPrompt={SYSTEM_FUSION}
            quickActions={fusionActions}
            contextData={correlationResult ? `Current correlation result:\n${correlationResult}` : undefined}
            placeholder={{
              nl: 'Stel een vraag over de correlatie...',
              en: 'Ask a question about the correlation...',
            }}
            className="h-[260px]"
          />
        </div>
      </div>
    </div>
  );
}
