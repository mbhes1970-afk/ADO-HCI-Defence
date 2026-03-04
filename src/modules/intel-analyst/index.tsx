// ============================================================
// Intel Analyst — WP06
// Hoofd-module: 4-tab navigatie
//   Tab 1: Bronnen       — 6 source cards + detail
//   Tab 2: Analyse       — geselecteerde bron detail (alias tab 1 detail)
//   Tab 3: Correlatie    — multi-select + Claude fusie
//   Tab 4: INTSUM        — Intelligence Summary generatie
// ============================================================

import { useState }             from 'react';
import { useLanguage, t }       from '../../config/i18n';
import { useIntelStore }        from '../../store/intelStore';
import { Badge }                from '../../components/ui/Badge';
import { ClassificationBanner } from '../../components/shared/ClassificationBadge';
import { SourceAnalysis }       from './SourceAnalysis';
import { IntelFusion }          from './IntelFusion';
import { IntSum }               from './IntSum';
import clsx                     from 'clsx';

type TabId = 'sources' | 'analysis' | 'correlation' | 'intsum';

const TABS: { id: TabId; icon: string; labelKey: 'intel.tab.sources' | 'intel.tab.analysis' | 'intel.tab.correlation' | 'intel.tab.intsum' }[] = [
  { id: 'sources',     icon: '📡', labelKey: 'intel.tab.sources'     },
  { id: 'analysis',    icon: '🔍', labelKey: 'intel.tab.analysis'    },
  { id: 'correlation', icon: '🔗', labelKey: 'intel.tab.correlation' },
  { id: 'intsum',      icon: '📊', labelKey: 'intel.tab.intsum'      },
];

function TabBar({ activeTab, completedTabs, onSelect, lang }: {
  activeTab: TabId; completedTabs: Set<TabId>; onSelect: (id: TabId) => void; lang: 'nl' | 'en';
}) {
  return (
    <div className="flex border-b border-brand-border bg-brand-bg-card">
      {TABS.map((tab, idx) => {
        const isActive    = tab.id === activeTab;
        const isCompleted = completedTabs.has(tab.id);

        return (
          <button
            key={tab.id}
            onClick={() => onSelect(tab.id)}
            className={clsx(
              'relative flex items-center gap-2 px-4 py-3 text-xs font-mono font-medium',
              'border-r border-brand-border last:border-r-0 transition-all flex-1 justify-center',
              isActive    ? 'text-brand-primary bg-brand-primary-dim'
              : isCompleted ? 'text-brand-text hover:text-brand-text-bright hover:bg-white/[0.03]'
                            : 'text-brand-text-dim hover:text-brand-text hover:bg-white/[0.02]',
            )}
          >
            {isActive && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-primary" />}
            <span className={clsx(
              'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0',
              isActive      ? 'bg-brand-primary text-brand-bg'
              : isCompleted ? 'bg-ado-green/20 text-ado-green border border-ado-green/30'
                            : 'bg-brand-bg-elevated text-brand-text-dim border border-brand-border',
            )}>
              {isCompleted && !isActive ? '✓' : idx + 1}
            </span>
            <span className="hidden sm:inline truncate">{t(tab.labelKey, lang)}</span>
            <span className="sm:hidden">{tab.icon}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function IntelAnalystModule() {
  const { lang }               = useLanguage();
  const { sources, correlationResult } = useIntelStore();
  const [activeTab,     setActiveTab]     = useState<TabId>('sources');
  const [completedTabs, setCompletedTabs] = useState<Set<TabId>>(new Set());

  function complete(tab: TabId) {
    setCompletedTabs(prev => new Set([...prev, tab]));
  }

  function goTo(tab: TabId) {
    setActiveTab(tab);
  }

  function handleSkipToCorrelation() {
    complete('sources');
    complete('analysis');
    goTo('correlation');
  }

  function handleCorrelationNext() {
    complete('correlation');
    goTo('intsum');
  }

  function handleNewAnalysis() {
    setActiveTab('sources');
    setCompletedTabs(new Set());
  }

  return (
    <div className="animate-fade-in max-w-5xl space-y-0">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <h1 className="text-brand-text-bright text-xl font-bold">
            🔍 {lang === 'nl' ? 'Intel Analist' : 'Intel Analyst'}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-brand-text-dim text-xs font-mono">
              {lang === 'nl' ? 'Multi-bron fusie · AI correlatie · INTSUM generatie' : 'Multi-source fusion · AI correlation · INTSUM generation'}
            </p>
            <span className="text-brand-text-dim/40 font-mono text-xs">·</span>
            <Badge variant="operational" size="xs" dot pulse>
              {sources.length} {lang === 'nl' ? 'bronnen actief' : 'sources active'}
            </Badge>
            {correlationResult && (
              <Badge variant="ai" size="xs" dot>
                {lang === 'nl' ? 'Correlatie klaar' : 'Correlation ready'}
              </Badge>
            )}
          </div>
        </div>

        {/* Progress pill */}
        <div className="flex items-center gap-1.5 bg-brand-bg-card border border-brand-border rounded-full px-3 py-1.5">
          {TABS.map(tab => (
            <span key={tab.id} className={clsx(
              'w-2 h-2 rounded-full transition-all',
              completedTabs.has(tab.id) ? 'bg-ado-green'
              : activeTab === tab.id    ? 'bg-brand-primary'
                                        : 'bg-brand-border',
            )} />
          ))}
          <span className="text-[10px] font-mono text-brand-text-dim ml-1">
            {completedTabs.size}/4
          </span>
        </div>
      </div>

      {/* ── Module shell ── */}
      <div className="bg-brand-bg-card border border-brand-border rounded-xl overflow-hidden">
        <ClassificationBanner level="RESTRICTED" />

        <TabBar
          activeTab={activeTab}
          completedTabs={completedTabs}
          onSelect={(tab) => { goTo(tab); }}
          lang={lang}
        />

        <div className="p-5">
          {(activeTab === 'sources' || activeTab === 'analysis') && (
            <SourceAnalysis onSkipToCorrelation={handleSkipToCorrelation} />
          )}
          {activeTab === 'correlation' && (
            <IntelFusion onNext={handleCorrelationNext} />
          )}
          {activeTab === 'intsum' && (
            <IntSum onNewAnalysis={handleNewAnalysis} />
          )}
        </div>
      </div>
    </div>
  );
}
