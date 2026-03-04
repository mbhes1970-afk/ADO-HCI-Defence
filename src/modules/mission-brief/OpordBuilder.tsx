// ============================================================
// OpordBuilder — WP05 sub-component
// Tab 3: Claude genereert 5-paragraaf OPORD uit briefing-transcript
// ============================================================

import { useState, useEffect }      from 'react';
import { useLanguage }              from '../../config/i18n';
import { useMissionStore }          from '../../store/missionStore';
import { useAI }                    from '../../hooks/useAI';
import { AIAssistant }              from '../../components/shared/AIAssistant';
import { Badge }                    from '../../components/ui/Badge';
import { Button }                   from '../../components/ui/Button';
import { Card, Panel }              from '../../components/ui/Card';
import { ClassificationBanner }     from '../../components/shared/ClassificationBadge';
import clsx                         from 'clsx';

// ── OPORD 5-para structure ───────────────────────────────────
const OPORD_PARAS = [
  { num: '1', key: 'situation',   nl: 'SITUATIE',    en: 'SITUATION'   },
  { num: '2', key: 'mission',     nl: 'MISSIE',      en: 'MISSION'     },
  { num: '3', key: 'execution',   nl: 'UITVOERING',  en: 'EXECUTION'   },
  { num: '4', key: 'sustainment', nl: 'ONDERSTEUNING', en: 'SUSTAINMENT' },
  { num: '5', key: 'command',     nl: 'COMMANDO',    en: 'COMMAND'     },
];

const SYSTEM_OPORD = `You are a NATO military staff officer. Generate a formal 5-paragraph Operations Order (OPORD) following NATO STANAG 2014 format.

Structure your response as a JSON object with these exact keys:
{
  "situation": "paragraph 1 text...",
  "mission": "paragraph 2 text (who, what, when, where, why)...",
  "execution": "paragraph 3 text (commander's intent, tasks, coordinating instructions)...",
  "sustainment": "paragraph 4 text (logistics, medical, maintenance)...",
  "command": "paragraph 5 text (command relationships, signals, reports)..."
}

Be concise but complete. Use military terminology. No markdown, return only valid JSON.
Respond in the same language as the briefing transcript.`;

interface OpordBuilderProps {
  transcript: string;
  onNext:     () => void;
}

type OpordData = Record<string, string>;

export function OpordBuilder({ transcript, onNext }: OpordBuilderProps) {
  const { lang }          = useLanguage();
  const { activeMission } = useMissionStore();
  const { loading, call } = useAI();

  const [opord,       setOpord]       = useState<OpordData | null>(null);
  const [activeParaN, setActiveParaN] = useState('1');
  const [generated,   setGenerated]   = useState(false);

  // Auto-generate on mount if transcript available
  useEffect(() => {
    if (transcript && !generated) {
      generateOpord();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateOpord() {
    const context = activeMission
      ? `Mission: ${activeMission.name[lang]}, DTG: ${activeMission.dtg}, Commander: ${activeMission.commander}, Threat: ${activeMission.threatLevel}`
      : '';

    const prompt = transcript
      ? `${context ? `CONTEXT: ${context}\n\n` : ''}BRIEFING TRANSCRIPT:\n${transcript}`
      : context
        ? `Generate a standard OPORD for: ${context}`
        : lang === 'nl'
          ? 'Genereer een standaard OPORD voor een troepenbeschermingsoperatie.'
          : 'Generate a standard OPORD for a force protection operation.';

    const raw = await call({
      system: SYSTEM_OPORD,
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 2000,
      temperature: 0.2,
    });

    try {
      const clean  = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setOpord(parsed);
      setGenerated(true);
    } catch {
      // Fallback: put full text in situation
      setOpord({ situation: raw, mission: '', execution: '', sustainment: '', command: '' });
      setGenerated(true);
    }
  }

  const activePara = OPORD_PARAS.find(p => p.num === activeParaN)!;
  const activeText = opord?.[activePara.key] ?? '';

  const opordAssistantActions = [
    { label: lang === 'nl' ? 'Verduidelijk Para 3' : 'Clarify Para 3', message: lang === 'nl' ? 'Verduidelijk de uitvoering paragraaf met meer detail over coördinatie.' : 'Clarify the execution paragraph with more coordination detail.' },
    { label: 'ROE',     message: lang === 'nl' ? 'Voeg standaard ROE toe aan de uitvoering paragraaf.' : 'Add standard ROE to the execution paragraph.' },
    { label: 'MEDEVAC', message: lang === 'nl' ? 'Voeg MEDEVAC procedures toe aan ondersteuning.' : 'Add MEDEVAC procedures to sustainment.' },
    { label: lang === 'nl' ? 'Samenvatting' : 'Summary', message: lang === 'nl' ? 'Geef een beknopte samenvatting van het OPORD.' : 'Give a concise summary of the OPORD.' },
  ];

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-brand-text-bright font-semibold text-sm">
            📋 {lang === 'nl' ? 'OPORD Bouwer — AI Ondersteund' : 'OPORD Builder — AI Assisted'}
          </h3>
          <p className="text-brand-text-dim text-[10px] font-mono mt-0.5">
            {lang === 'nl' ? '5-Paragrafen Bevel gegenereerd uit briefing' : '5-Paragraph Order generated from briefing'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="ai" size="xs" dot>AI Generated</Badge>
          <Button variant="ghost" size="sm" loading={loading} onClick={generateOpord} iconLeft="🔄">
            {lang === 'nl' ? 'Hergeneer' : 'Regenerate'}
          </Button>
          <Button variant="secondary" size="sm" iconLeft="📤">
            {lang === 'nl' ? 'Export' : 'Export'}
          </Button>
        </div>
      </div>

      {loading && (
        <Panel>
          <div className="flex items-center gap-3 py-4">
            <span className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-brand-text-dim">
              {lang === 'nl' ? 'Claude genereert uw OPORD...' : 'Claude is generating your OPORD...'}
            </span>
          </div>
        </Panel>
      )}

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ── Para navigation ── */}
          <div className="space-y-1">
            {OPORD_PARAS.map((para) => (
              <button
                key={para.num}
                onClick={() => setActiveParaN(para.num)}
                className={clsx(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all',
                  activeParaN === para.num
                    ? 'bg-brand-primary-dim border border-brand-primary/30 text-brand-primary'
                    : 'border border-transparent text-brand-text-dim hover:text-brand-text-bright hover:bg-brand-bg-elevated',
                )}
              >
                <span className={clsx(
                  'w-6 h-6 rounded flex items-center justify-center text-xs font-bold font-mono flex-shrink-0',
                  activeParaN === para.num ? 'bg-brand-primary text-brand-bg' : 'bg-brand-bg-elevated text-brand-text-dim',
                )}>
                  {para.num}
                </span>
                <span className="text-xs font-mono font-semibold uppercase tracking-wide">
                  {lang === 'nl' ? para.nl : para.en}
                </span>
                {opord?.[para.key] && (
                  <span className="ml-auto text-ado-green text-[10px]">✓</span>
                )}
              </button>
            ))}
          </div>

          {/* ── Active para content ── */}
          <div className="lg:col-span-2">
            <Card padding="none">
              <ClassificationBanner level="RESTRICTED" />
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded bg-brand-primary text-brand-bg text-xs font-bold font-mono flex items-center justify-center">
                    {activePara.num}
                  </span>
                  <h4 className="text-brand-text-bright font-mono font-bold text-sm uppercase tracking-wider">
                    {lang === 'nl' ? activePara.nl : activePara.en}
                  </h4>
                </div>

                {activeText ? (
                  <div className="min-h-[120px]">
                    <p className="text-brand-text text-xs font-mono leading-relaxed whitespace-pre-wrap">
                      {activeText}
                    </p>
                  </div>
                ) : (
                  <div className="min-h-[120px] flex items-center justify-center">
                    <p className="text-brand-text-dim text-xs font-mono italic">
                      {generated
                        ? (lang === 'nl' ? 'Geen inhoud gegenereerd voor dit paragraaf.' : 'No content generated for this paragraph.')
                        : (lang === 'nl' ? 'Genereer het OPORD om inhoud te zien.' : 'Generate the OPORD to see content.')}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ── OPORD Assistant ── */}
      <AIAssistant
        systemPrompt={`${SYSTEM_OPORD}\nYou are now helping refine an existing OPORD. The current OPORD content is: ${JSON.stringify(opord ?? {})}`}
        quickActions={opordAssistantActions}
        contextData={transcript ? `Original briefing transcript: ${transcript}` : undefined}
        placeholder={{
          nl: 'Vraag om aanpassingen aan het OPORD...',
          en: 'Ask for adjustments to the OPORD...',
        }}
        className="h-[280px]"
      />

      {/* ── Next ── */}
      <div className="flex justify-between items-center pt-2">
        <p className="text-brand-text-dim text-[11px] font-mono">
          {generated
            ? `${OPORD_PARAS.filter(p => opord?.[p.key]).length}/5 ${lang === 'nl' ? 'paragrafen compleet' : 'paragraphs complete'}`
            : ''}
        </p>
        <Button
          variant="primary"
          size="md"
          iconRight="→"
          disabled={!generated}
          onClick={onNext}
        >
          {lang === 'nl' ? 'Na-Briefing →' : 'Post-Brief →'}
        </Button>
      </div>
    </div>
  );
}
