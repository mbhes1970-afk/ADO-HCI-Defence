// ============================================================
// MistReport — WP07 sub-component
// Tab 4: MIST medisch rapport
//   M — Mechanism of injury
//   I — Injuries sustained
//   S — Signs & symptoms
//   T — Treatment given
// + Field AI Assistant chatbox
// + Indienen naar C2
// ============================================================

import { useState }             from 'react';
import { useLanguage }          from '../../config/i18n';
import { useAI }                from '../../hooks/useAI';
import { AIAssistant }          from '../../components/shared/AIAssistant';
import { Button }               from '../../components/ui/Button';
import { Badge }                from '../../components/ui/Badge';
import { Card, Panel }          from '../../components/ui/Card';
import { Modal }                from '../../components/ui/Modal';
import { ClassificationBanner } from '../../components/shared/ClassificationBadge';

// ── MIST field definitions ───────────────────────────────────
const MIST_FIELDS = [
  {
    key:    'mechanism',
    letter: 'M',
    nl:     'Mechanisme',
    en:     'Mechanism',
    descNL: 'Oorzaak van het letsel',
    descEN: 'Cause of injury',
    icon:   '💥',
    options: {
      nl: ['IED-explosie', 'GSW (schotverwonding)', 'Shrapnel', 'Val/trauma', 'Verkeersongeval', 'Andere oorzaak'],
      en: ['IED blast', 'GSW (gunshot wound)', 'Shrapnel', 'Fall/trauma', 'Vehicle accident', 'Other cause'],
    },
  },
  {
    key:    'injuries',
    letter: 'I',
    nl:     'Letsels',
    en:     'Injuries',
    descNL: 'Anatomische locatie en aard van het letsel',
    descEN: 'Anatomical location and nature of injury',
    icon:   '🩹',
    options: {
      nl: ['Hoofd/nek', 'Borstkas/torso', 'Buik', 'Linker arm', 'Rechter arm', 'Linker been', 'Rechter been', 'Brandwonden', 'Polytrauma'],
      en: ['Head/neck', 'Chest/torso', 'Abdomen', 'Left arm', 'Right arm', 'Left leg', 'Right leg', 'Burns', 'Polytrauma'],
    },
  },
  {
    key:    'signs',
    letter: 'S',
    nl:     'Symptomen',
    en:     'Signs',
    descNL: 'Vitale functies en observaties',
    descEN: 'Vital signs and observations',
    icon:   '🩺',
    options: {
      nl: ['Bewusteloos', 'Alert/Wakker', 'Massale bloeding', 'Ademhalingsproblemen', 'Bewustzijnsdaling', 'Pols aanwezig', 'Geen pols'],
      en: ['Unconscious', 'Alert/Awake', 'Massive bleeding', 'Respiratory distress', 'Altered consciousness', 'Pulse present', 'No pulse'],
    },
  },
  {
    key:    'treatment',
    letter: 'T',
    nl:     'Behandeling',
    en:     'Treatment',
    descNL: 'Eerste hulp en behandeling gegeven',
    descEN: 'First aid and treatment administered',
    icon:   '💊',
    options: {
      nl: ['Tourniquet aangelegd', 'Wondverband', 'Beademingsweg vrijgemaakt', 'Morfine toegediend', 'IV-lijn geplaatst', 'Geen behandeling mogelijk', 'CPR'],
      en: ['Tourniquet applied', 'Wound dressing', 'Airway cleared', 'Morphine administered', 'IV line placed', 'No treatment possible', 'CPR'],
    },
  },
] as const;

type MistKey = 'mechanism' | 'injuries' | 'signs' | 'treatment';
type MistData = Record<MistKey, string[]>;

const SYSTEM_MIST = `You are a NATO medical officer. Generate a formal MIST medical report based on the provided data.
Format it as a clear, professional medical summary suitable for MEDEVAC handoff.
Include: patient count, mechanism of injury, injury description, vital signs status, treatment administered, and MEDEVAC priority (P1 Urgent/P2 Priority/P3 Routine).
Be concise. Use standard medical military terminology.
Respond in the same language as the input.`;

interface MistReportProps {
  transcript:    string;
  onNewReport:   () => void;
}

export function MistReport({ transcript, onNewReport }: MistReportProps) {
  const { lang }          = useLanguage();
  const { loading, call } = useAI();

  const [mistData,    setMistData]    = useState<MistData>({ mechanism: [], injuries: [], signs: [], treatment: [] });
  const [casualties,  setCasualties]  = useState(1);
  const [mistReport,  setMistReport]  = useState('');
  const [generated,   setGenerated]   = useState(false);
  const [submitOpen,  setSubmitOpen]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);

  function toggleOption(field: MistKey, option: string) {
    setMistData(prev => {
      const current = prev[field];
      return {
        ...prev,
        [field]: current.includes(option)
          ? current.filter(o => o !== option)
          : [...current, option],
      };
    });
  }

  async function generateMist() {
    const dataStr = MIST_FIELDS.map(f => {
      const values = mistData[f.key as MistKey];
      return `${f.letter} (${lang === 'nl' ? f.nl : f.en}): ${values.length ? values.join(', ') : (lang === 'nl' ? 'Niet ingevuld' : 'Not specified')}`;
    }).join('\n');

    const prompt = lang === 'nl'
      ? `Genereer MIST rapport voor ${casualties} slachtoffer(s):\n\n${dataStr}\n\nContext: ${transcript || 'Geen aanvullende context.'}`
      : `Generate MIST report for ${casualties} casualty(ies):\n\n${dataStr}\n\nContext: ${transcript || 'No additional context.'}`;

    const result = await call({
      system:      SYSTEM_MIST,
      messages:    [{ role: 'user', content: prompt }],
      maxTokens:   600,
      temperature: 0.2,
    });

    setMistReport(result);
    setGenerated(true);
  }

  const fieldAssistantActions = [
    { label: 'MEDEVAC 9-liner', message: lang === 'nl' ? 'Genereer een MEDEVAC 9-liner op basis van dit MIST rapport.' : 'Generate a MEDEVAC 9-liner based on this MIST report.' },
    { label: lang === 'nl' ? 'Prioriteit' : 'Priority',   message: lang === 'nl' ? 'Wat is de MEDEVAC prioriteit voor dit slachtoffer (P1/P2/P3)?' : 'What is the MEDEVAC priority for this casualty (P1/P2/P3)?' },
    { label: lang === 'nl' ? 'Behandeling' : 'Treatment', message: lang === 'nl' ? 'Welke aanvullende behandeling is geïndiceerd?' : 'What additional treatment is indicated?' },
    { label: 'TCCC',           message: lang === 'nl' ? 'Wat zijn de TCCC-richtlijnen voor dit type letsel?' : 'What are the TCCC guidelines for this injury type?' },
  ];

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-brand-text-bright font-semibold text-sm">
            🏥 {lang === 'nl' ? 'MIST Medisch Rapport' : 'MIST Medical Report'}
          </h3>
          <p className="text-brand-text-dim text-[10px] font-mono mt-0.5">
            {lang === 'nl' ? 'Selecteer opties per categorie · Claude genereert het MIST' : 'Select options per category · Claude generates the MIST'}
          </p>
        </div>
        {generated && <Badge variant="ai" size="xs" dot>AI Generated</Badge>}
      </div>

      {/* ── Casualty count ── */}
      <Panel>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono text-brand-text-dim uppercase tracking-wider mb-1">
              {lang === 'nl' ? 'Aantal slachtoffers (CAS)' : 'Number of casualties (CAS)'}
            </p>
            <div className="flex items-center gap-3">
              <button onClick={() => setCasualties(c => Math.max(1, c - 1))} className="w-7 h-7 rounded border border-brand-border bg-brand-bg-elevated text-brand-text-bright hover:border-brand-primary/40 transition-colors font-mono text-sm">−</button>
              <span className="text-brand-text-bright font-mono text-lg font-bold w-6 text-center">{casualties}</span>
              <button onClick={() => setCasualties(c => Math.min(99, c + 1))} className="w-7 h-7 rounded border border-brand-border bg-brand-bg-elevated text-brand-text-bright hover:border-brand-primary/40 transition-colors font-mono text-sm">+</button>
              <span className="text-brand-text-dim text-xs font-mono">
                {lang === 'nl' ? 'slachtoffer(s)' : 'casualty(ies)'}
              </span>
            </div>
          </div>
          {/* MEDEVAC priority indicator */}
          <div className="text-right">
            <p className="text-[9px] font-mono text-brand-text-dim uppercase tracking-wider">MEDEVAC</p>
            <p className={`text-sm font-mono font-bold mt-0.5 ${casualties >= 5 ? 'text-ado-red' : casualties >= 2 ? 'text-ado-amber' : 'text-ado-green'}`}>
              {casualties >= 5 ? 'P1 URGENT' : casualties >= 2 ? 'P2 PRIORITY' : 'P3 ROUTINE'}
            </p>
          </div>
        </div>
      </Panel>

      {/* ── MIST input grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MIST_FIELDS.map(field => {
          const selected = mistData[field.key as MistKey];
          const opts = field.options[lang];

          return (
            <div key={field.key} className="bg-brand-bg-card border border-brand-border rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-brand-border bg-brand-bg-elevated">
                <span className="w-6 h-6 rounded bg-brand-bg flex items-center justify-center text-xs font-bold font-mono text-brand-primary border border-brand-primary/30">
                  {field.letter}
                </span>
                <span className="text-xs font-mono font-semibold text-brand-text-bright">
                  {lang === 'nl' ? field.nl : field.en}
                </span>
                <span className="text-sm">{field.icon}</span>
                {selected.length > 0 && (
                  <Badge variant="operational" size="xs" className="ml-auto">{selected.length}</Badge>
                )}
              </div>
              <div className="p-2.5 flex flex-wrap gap-1.5">
                {opts.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => toggleOption(field.key as MistKey, opt)}
                    className={`px-2 py-1 text-[10px] font-mono rounded border transition-all ${
                      selected.includes(opt)
                        ? 'border-brand-primary/50 bg-brand-primary-dim text-brand-primary'
                        : 'border-brand-border text-brand-text-dim hover:border-brand-primary/25 hover:text-brand-text-bright'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Generate button ── */}
      <div className="flex justify-between items-center">
        <p className="text-brand-text-dim text-[11px] font-mono">
          {Object.values(mistData).flat().length} {lang === 'nl' ? 'opties geselecteerd' : 'options selected'}
        </p>
        <Button
          variant="primary"
          size="sm"
          loading={loading}
          iconLeft="⚡"
          onClick={generateMist}
        >
          {generated
            ? (lang === 'nl' ? 'Hergeneer MIST' : 'Regenerate MIST')
            : (lang === 'nl' ? 'Genereer MIST Rapport' : 'Generate MIST Report')}
        </Button>
      </div>

      {/* ── Generated MIST report ── */}
      {mistReport && (
        <Card padding="none">
          <ClassificationBanner level="RESTRICTED" />
          <div className="px-3 py-2 border-b border-brand-border bg-brand-bg-elevated flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-brand-text-dim uppercase tracking-wider">🏥 MIST RAPPORT</span>
              <Badge variant="ai" size="xs" dot>AI Generated</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" iconLeft="📤">Export</Button>
              <Button variant="primary" size="sm" iconLeft="📡" onClick={() => setSubmitOpen(true)}>
                {lang === 'nl' ? 'MEDEVAC →' : 'MEDEVAC →'}
              </Button>
            </div>
          </div>
          <div className="p-4">
            <p className="text-brand-text text-xs font-mono leading-relaxed whitespace-pre-wrap">
              {mistReport}
            </p>
          </div>
        </Card>
      )}

      {/* ── Field AI Assistant ── */}
      <AIAssistant
        systemPrompt={`${SYSTEM_MIST}\nYou are assisting with medical triage and MIST reporting in a field environment. Be concise and practical.`}
        quickActions={fieldAssistantActions}
        contextData={mistReport ? `Current MIST report:\n${mistReport}` : (transcript || undefined)}
        placeholder={{
          nl: 'Stel een vraag over medische behandeling...',
          en: 'Ask a question about medical treatment...',
        }}
        className="h-[280px]"
      />

      {/* ── Submit MEDEVAC Modal ── */}
      <Modal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        title="📡 MEDEVAC Verzoek"
        subtitle={lang === 'nl' ? 'Stuur naar medische coördinatie' : 'Send to medical coordination'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setSubmitOpen(false)}>
              {lang === 'nl' ? 'Annuleer' : 'Cancel'}
            </Button>
            <Button
              variant="danger"
              size="sm"
              iconLeft="🚨"
              onClick={() => { setSubmitted(true); setSubmitOpen(false); }}
            >
              {lang === 'nl' ? 'MEDEVAC Activeren' : 'Activate MEDEVAC'}
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs font-mono">
          <div className="bg-ado-red/10 border border-ado-red/25 rounded p-3">
            <p className="text-ado-red font-semibold mb-1">
              {casualties} {lang === 'nl' ? 'slachtoffer(s)' : 'casualty(ies)'} ·{' '}
              {casualties >= 5 ? 'P1 URGENT' : casualties >= 2 ? 'P2 PRIORITY' : 'P3 ROUTINE'}
            </p>
            <p className="text-brand-text-dim text-[10px]">
              {lang === 'nl' ? 'Bevestig MEDEVAC-verzoek via beveiligd kanaal' : 'Confirm MEDEVAC request via secure channel'}
            </p>
          </div>
          {['CHARLIE-MED (Bataljon)', 'BRAVO-MED (Brigade)', 'ALPHA-MED (Divisie)'].map(dest => (
            <button key={dest} className="w-full px-3 py-2 text-left rounded border border-brand-border text-brand-text-dim hover:border-ado-red/30 hover:text-ado-red transition-colors">
              {dest}
            </button>
          ))}
        </div>
      </Modal>

      {/* ── MEDEVAC submitted ── */}
      {submitted && (
        <div className="bg-ado-red/10 border border-ado-red/25 rounded-lg px-4 py-3 flex items-center gap-2 animate-fade-in">
          <span className="text-ado-red animate-pulse">🚨</span>
          <p className="text-ado-red text-xs font-mono font-semibold">
            {lang === 'nl'
              ? `MEDEVAC GEACTIVEERD · ${casualties} CAS · ${casualties >= 5 ? 'P1 URGENT' : casualties >= 2 ? 'P2 PRIORITY' : 'P3 ROUTINE'}`
              : `MEDEVAC ACTIVATED · ${casualties} CAS · ${casualties >= 5 ? 'P1 URGENT' : casualties >= 2 ? 'P2 PRIORITY' : 'P3 ROUTINE'}`}
          </p>
        </div>
      )}

      {/* ── New report ── */}
      <div className="flex justify-end pt-1">
        <Button variant="secondary" size="sm" iconLeft="🔄" onClick={onNewReport}>
          {lang === 'nl' ? 'Nieuw Rapport' : 'New Report'}
        </Button>
      </div>
    </div>
  );
}
