// ============================================================
// PreBrief — WP05 sub-component
// Tab 1: Missie-info kaarten + AI situatiebeoordeling
// ============================================================

import { useState }            from 'react';
import { useLanguage, t }      from '../../config/i18n';
import { useMissionStore }     from '../../store/missionStore';
import { useAI }               from '../../hooks/useAI';
import { Card, CardHeader, Panel } from '../../components/ui/Card';
import { Badge, ThreatBadge }  from '../../components/ui/Badge';
import { Button }              from '../../components/ui/Button';
import { ClassificationBadge } from '../../components/shared/ClassificationBadge';
import { AIAssistant }         from '../../components/shared/AIAssistant';
import clsx                    from 'clsx';

// Quick-reference links
const refLinks = [
  { label: 'NATO STANAG 2014', icon: '📄' },
  { label: 'OPORD Template',   icon: '📋' },
  { label: 'ROE Card',         icon: '⚖️' },
  { label: 'Force Protection', icon: '🛡️' },
  { label: 'MEDEVAC 9-liner',  icon: '🏥' },
];

const SYSTEM_PRE_BRIEF = `You are a NATO military AI assistant specialised in mission pre-briefing and situational awareness. 
You provide concise, professional assessments in the style of a NATO STANAG 2014 operations order.
Use military terminology. Be direct, factual, and structured. 
When generating situation assessments, follow the format: Enemy situation → Friendly situation → Terrain & weather → Threat assessment → Recommendations.
Respond in the same language as the user's message (Dutch or English).`;

interface PreBriefProps {
  onNext: () => void;
}

export function PreBrief({ onNext }: PreBriefProps) {
  const { lang }          = useLanguage();
  const { activeMission } = useMissionStore();
  const { response: aiAssessment, loading: aiLoading, call: callAI } = useAI();
  const [assessed, setAssessed] = useState(false);

  async function generateAssessment() {
    if (!activeMission) return;
    await callAI({
      system: SYSTEM_PRE_BRIEF,
      messages: [{
        role: 'user',
        content: lang === 'nl'
          ? `Genereer een AI situatiebeoordeling voor ${activeMission.name.nl}. DTG: ${activeMission.dtg}. Commandant: ${activeMission.commander}. Dreigingsniveau: ${activeMission.threatLevel}. Operatiegebied: ${activeMission.areaOfOperation ?? 'Onbekend'}.`
          : `Generate an AI situation assessment for ${activeMission.name.en}. DTG: ${activeMission.dtg}. Commander: ${activeMission.commander}. Threat level: ${activeMission.threatLevel}. AO: ${activeMission.areaOfOperation ?? 'Unknown'}.`,
      }],
      maxTokens: 600,
      temperature: 0.3,
    });
    setAssessed(true);
  }

  if (!activeMission) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-brand-text-dim text-sm font-mono">
          {lang === 'nl' ? 'Geen actieve missie geselecteerd.' : 'No active mission selected.'}
        </p>
      </div>
    );
  }

  const quickActions = [
    { label: lang === 'nl' ? 'Dreigingen' : 'Threats',  message: lang === 'nl' ? 'Wat zijn de specifieke dreigingen in het operatiegebied?' : 'What are the specific threats in the AO?' },
    { label: 'OPORD',       message: lang === 'nl' ? 'Geef een samenvatting van het OPORD formaat voor deze missie.' : 'Provide an OPORD summary format for this mission.' },
    { label: 'SITREP',      message: lang === 'nl' ? 'Genereer een SITREP template voor deze operatie.' : 'Generate a SITREP template for this operation.' },
    { label: 'MEDEVAC',     message: lang === 'nl' ? 'Wat zijn de MEDEVAC procedures voor dit operatiegebied?' : 'What are the MEDEVAC procedures for this AO?' },
    { label: 'ROE',         message: lang === 'nl' ? 'Vat de standaard ROE samen voor troepenbeschermingsoperaties.' : 'Summarise standard ROE for force protection operations.' },
  ];

  return (
    <div className="space-y-5">

      {/* ── Mission summary card ── */}
      <Card padding="none">
        {/* Classification banner */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-brand-border bg-brand-bg-elevated rounded-t-lg">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-brand-text-dim uppercase tracking-widest">
              {t('brief.missionSummary', lang)}
            </span>
            <ClassificationBadge level="RESTRICTED" size="xs" />
          </div>
          <Badge variant="operational" size="xs" dot pulse>
            {activeMission.status === 'OPERATIONAL'
              ? (lang === 'nl' ? 'OPERATIONEEL' : 'OPERATIONAL')
              : activeMission.status}
          </Badge>
        </div>

        {/* Grid of mission fields */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-brand-border">
          {[
            { label: t('brief.operation', lang),    value: activeMission.name[lang].toUpperCase() },
            { label: t('brief.type', lang),          value: activeMission.type[lang] },
            { label: t('brief.dtg', lang),           value: activeMission.dtg, mono: true },
            { label: t('brief.commander', lang),     value: activeMission.commander, mono: true },
            { label: t('brief.threatLevel', lang),   value: null, threat: activeMission.threatLevel },
            { label: 'AON',                          value: activeMission.areaOfOperation ?? '—', mono: true },
          ].map((field) => (
            <div key={field.label} className="bg-brand-bg-card px-4 py-3">
              <p className="text-[9px] font-mono text-brand-text-dim uppercase tracking-widest mb-1">
                {field.label}
              </p>
              {field.threat ? (
                <ThreatBadge level={field.threat} size="sm" />
              ) : (
                <p className={clsx(
                  'text-brand-text-bright text-xs font-semibold',
                  field.mono && 'font-mono',
                )}>
                  {field.value}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* ── AI Situation Assessment ── */}
      <Card padding="none">
        <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <span className="text-sm">🤖</span>
            <h3 className="text-brand-text-bright text-sm font-semibold">
              {t('brief.aiAssessment', lang)}
            </h3>
            <Badge variant="ai" size="xs" dot pulse>AI Generated</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            loading={aiLoading}
            onClick={generateAssessment}
            iconLeft={assessed ? '🔄' : '⚡'}
          >
            {assessed
              ? (lang === 'nl' ? 'Vernieuw' : 'Refresh')
              : (lang === 'nl' ? 'Genereer beoordeling' : 'Generate assessment')}
          </Button>
        </div>

        <div className="p-4 min-h-[100px]">
          {aiLoading && (
            <div className="flex items-center gap-2 text-brand-text-dim">
              <span className="w-3 h-3 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono">
                {lang === 'nl' ? 'AI analyseert situatie...' : 'AI analysing situation...'}
              </span>
            </div>
          )}
          {aiAssessment && !aiLoading && (
            <p className="text-brand-text text-xs font-mono leading-relaxed whitespace-pre-wrap">
              {aiAssessment}
            </p>
          )}
          {!aiAssessment && !aiLoading && (
            <p className="text-brand-text-dim text-xs font-mono italic">
              {lang === 'nl'
                ? 'Klik op "Genereer beoordeling" voor een AI-analyse van de huidige situatie.'
                : 'Click "Generate assessment" for an AI analysis of the current situation.'}
            </p>
          )}
        </div>
      </Card>

      {/* ── Reference links ── */}
      <div className="flex flex-wrap gap-2">
        {refLinks.map((ref) => (
          <button key={ref.label} className="
            flex items-center gap-1.5 px-3 py-1.5 rounded border
            border-brand-border bg-brand-bg-elevated
            text-[11px] font-mono text-brand-text-dim
            hover:border-brand-primary/30 hover:text-brand-primary transition-colors
          ">
            <span>{ref.icon}</span>
            <span>{ref.label}</span>
          </button>
        ))}
      </div>

      {/* ── AI Mission Assistant ── */}
      <AIAssistant
        systemPrompt={SYSTEM_PRE_BRIEF}
        quickActions={quickActions}
        contextData={`Mission: ${activeMission.name[lang]}, DTG: ${activeMission.dtg}, Commander: ${activeMission.commander}, Threat: ${activeMission.threatLevel}, AO: ${activeMission.areaOfOperation}`}
        initialMsg={{
          nl: `Gereed voor briefing van ${activeMission.name.nl}. Stel een vraag of gebruik een snelkoppeling.`,
          en: `Ready for ${activeMission.name.en} briefing. Ask a question or use a quick action.`,
        }}
        className="h-[340px]"
      />

      {/* ── Next button ── */}
      <div className="flex justify-end pt-2">
        <Button variant="primary" size="md" iconRight="→" onClick={onNext}>
          {t('brief.startBriefing', lang)}
        </Button>
      </div>
    </div>
  );
}
