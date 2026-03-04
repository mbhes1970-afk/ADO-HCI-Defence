// ============================================================
// SaluteReport — WP07 sub-component
// Tab 3: Claude parseert transcript naar 6 SALUTE velden
// ============================================================

import { useState, useEffect }   from 'react';
import { useLanguage }           from '../../config/i18n';
import { useAI }                 from '../../hooks/useAI';
import { Button }                from '../../components/ui/Button';
import { Badge }                 from '../../components/ui/Badge';
import { Card, Panel }           from '../../components/ui/Card';
import { ClassificationBanner }  from '../../components/shared/ClassificationBadge';
import clsx                      from 'clsx';

// ── SALUTE field definitions ─────────────────────────────────
const SALUTE_FIELDS = [
  {
    key: 'size',
    letter: 'S',
    nl: 'Grootte',
    en: 'Size',
    descNL: 'Aantal vijanden, voertuigen of elementen',
    descEN: 'Number of enemies, vehicles, or elements',
    icon: '👥',
    color: 'ado-red',
    placeholder: { nl: 'bijv. 6 infanteristen, 2 voertuigen', en: 'e.g. 6 infantry, 2 vehicles' },
  },
  {
    key: 'activity',
    letter: 'A',
    nl: 'Activiteit',
    en: 'Activity',
    descNL: 'Wat doet de vijand op dit moment',
    descEN: 'What the enemy is doing right now',
    icon: '⚡',
    color: 'ado-amber',
    placeholder: { nl: 'bijv. patrouilleert langs MSR', en: 'e.g. patrolling along MSR' },
  },
  {
    key: 'location',
    letter: 'L',
    nl: 'Locatie',
    en: 'Location',
    descNL: 'Gridcoördinaten of beschrijvende locatie',
    descEN: 'Grid coordinates or descriptive location',
    icon: '📍',
    color: 'ado-blue',
    placeholder: { nl: 'bijv. Grid 12345678, 200m N van kruispunt', en: 'e.g. Grid 12345678, 200m N of crossroads' },
  },
  {
    key: 'unit',
    letter: 'U',
    nl: 'Eenheid',
    en: 'Unit',
    descNL: 'Vijandige eenheid of identificatie',
    descEN: 'Enemy unit or identification',
    icon: '🪖',
    color: 'ado-green',
    placeholder: { nl: 'bijv. onbekende infanterie, mogelijk regulier', en: 'e.g. unknown infantry, possibly regular' },
  },
  {
    key: 'time',
    letter: 'T',
    nl: 'Tijd',
    en: 'Time',
    descNL: 'DTG van observatie',
    descEN: 'DTG of observation',
    icon: '🕐',
    color: 'brand-primary',
    placeholder: { nl: 'bijv. 310900ZJAN26', en: 'e.g. 310900ZJAN26' },
  },
  {
    key: 'equipment',
    letter: 'E',
    nl: 'Uitrusting',
    en: 'Equipment',
    descNL: 'Wapens, voertuigen, uitrusting gezien',
    descEN: 'Weapons, vehicles, equipment observed',
    icon: '🔫',
    color: 'brand-text',
    placeholder: { nl: 'bijv. AK-platform, pick-up trucks', en: 'e.g. AK-platform, pick-up trucks' },
  },
] as const;

type SaluteKey = 'size' | 'activity' | 'location' | 'unit' | 'time' | 'equipment';
type SaluteData = Record<SaluteKey, string>;

const SYSTEM_SALUTE = `You are a military intelligence analyst. Parse the field observation transcript and extract SALUTE report fields.

Return ONLY a valid JSON object with these exact keys (no markdown, no explanation):
{
  "size": "...",
  "activity": "...",
  "location": "...",
  "unit": "...",
  "time": "...",
  "equipment": "..."
}

If a field cannot be determined from the transcript, use "Niet vermeld" (Dutch) or "Not stated" (English).
Be concise and use military terminology. Preserve the language of the input.`;

const colorMap: Record<string, string> = {
  'ado-red':    'border-ado-red/30 bg-ado-red/5 text-ado-red',
  'ado-amber':  'border-ado-amber/30 bg-ado-amber/5 text-ado-amber',
  'ado-blue':   'border-ado-blue/30 bg-ado-blue/5 text-ado-blue',
  'ado-green':  'border-ado-green/30 bg-ado-green/5 text-ado-green',
  'brand-primary': 'border-brand-primary/30 bg-brand-primary-dim text-brand-primary',
  'brand-text': 'border-brand-border bg-brand-bg-elevated text-brand-text-bright',
};

interface SaluteReportProps {
  transcript: string;
  onNext:     () => void;
}

export function SaluteReport({ transcript, onNext }: SaluteReportProps) {
  const { lang }          = useLanguage();
  const { loading, call } = useAI();

  const emptyData: SaluteData = { size: '', activity: '', location: '', unit: '', time: '', equipment: '' };
  const [saluteData, setSaluteData] = useState<SaluteData>(emptyData);
  const [parsed,     setParsed]     = useState(false);
  const [editingKey, setEditingKey] = useState<SaluteKey | null>(null);
  const [editValue,  setEditValue]  = useState('');

  // Auto-parse on mount if transcript available
  useEffect(() => {
    if (transcript && !parsed) parseSalute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function parseSalute() {
    if (!transcript.trim()) return;

    const prompt = lang === 'nl'
      ? `Parseer dit veldrapport naar SALUTE-velden:\n\n${transcript}`
      : `Parse this field report into SALUTE fields:\n\n${transcript}`;

    const raw = await call({
      system:      SYSTEM_SALUTE,
      messages:    [{ role: 'user', content: prompt }],
      maxTokens:   400,
      temperature: 0.1,
    });

    try {
      const clean  = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean) as SaluteData;
      setSaluteData(parsed);
      setParsed(true);
    } catch {
      setSaluteData({ ...emptyData, size: raw });
      setParsed(true);
    }
  }

  function startEdit(key: SaluteKey) {
    setEditingKey(key);
    setEditValue(saluteData[key]);
  }

  function saveEdit() {
    if (!editingKey) return;
    setSaluteData(prev => ({ ...prev, [editingKey]: editValue }));
    setEditingKey(null);
  }

  const filledCount = Object.values(saluteData).filter(v => v && v !== 'Niet vermeld' && v !== 'Not stated').length;

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-brand-text-bright font-semibold text-sm">
            📋 {lang === 'nl' ? 'SALUTE Rapport — AI Parsing' : 'SALUTE Report — AI Parsing'}
          </h3>
          <p className="text-brand-text-dim text-[10px] font-mono mt-0.5">
            {lang === 'nl' ? 'Claude extraheert velden uit uw veldrapport' : 'Claude extracts fields from your field report'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {parsed && (
            <Badge variant={filledCount >= 5 ? 'operational' : 'pending'} size="xs" dot>
              {filledCount}/6 {lang === 'nl' ? 'velden' : 'fields'}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            loading={loading}
            iconLeft="🔄"
            onClick={parseSalute}
            disabled={!transcript.trim()}
          >
            {lang === 'nl' ? 'Herparse' : 'Re-parse'}
          </Button>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <Panel>
          <div className="flex items-center gap-3 py-3">
            <span className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-brand-text-dim">
              {lang === 'nl' ? 'Claude parseert SALUTE-velden...' : 'Claude parsing SALUTE fields...'}
            </p>
          </div>
        </Panel>
      )}

      {/* ── SALUTE card ── */}
      {!loading && (
        <Card padding="none">
          <ClassificationBanner level="RESTRICTED" />

          {/* Document header */}
          <div className="px-4 py-2.5 border-b border-brand-border bg-brand-bg-elevated flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-brand-text-dim uppercase tracking-wider">SALUTE RAPPORT</span>
              {parsed && <Badge variant="ai" size="xs" dot>AI Parsed</Badge>}
            </div>
            <span className="text-[10px] font-mono text-brand-text-dim">
              DTG: {new Date().getUTCDate().toString().padStart(2,'0')}{new Date().getUTCHours().toString().padStart(2,'0')}{new Date().getUTCMinutes().toString().padStart(2,'0')}ZJAN26
            </span>
          </div>

          {/* 6 fields */}
          <div className="divide-y divide-brand-border/60">
            {SALUTE_FIELDS.map((field) => {
              const value    = saluteData[field.key as SaluteKey];
              const hasValue = value && value !== 'Niet vermeld' && value !== 'Not stated';
              const isEditing = editingKey === field.key;

              return (
                <div key={field.key} className="flex items-start gap-4 px-4 py-3 group">

                  {/* Letter badge */}
                  <div className={clsx(
                    'w-8 h-8 rounded flex items-center justify-center flex-shrink-0 mt-0.5',
                    'border text-sm font-bold font-mono',
                    colorMap[field.color],
                  )}>
                    {field.letter}
                  </div>

                  {/* Field content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[10px] font-mono text-brand-text-dim uppercase tracking-wider">
                        {lang === 'nl' ? field.nl : field.en}
                      </p>
                      <span className="text-xs">{field.icon}</span>
                      <p className="text-[9px] font-mono text-brand-text-dim/60 hidden sm:block">
                        {lang === 'nl' ? field.descNL : field.descEN}
                      </p>
                    </div>

                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && saveEdit()}
                          className="flex-1 bg-brand-bg-elevated border border-brand-primary/40 rounded px-2 py-1 text-xs font-mono text-brand-text-bright focus:outline-none"
                          autoFocus
                        />
                        <button onClick={saveEdit} className="text-ado-green text-xs font-mono hover:text-ado-green/80">✓</button>
                        <button onClick={() => setEditingKey(null)} className="text-brand-text-dim text-xs font-mono hover:text-ado-red">✕</button>
                      </div>
                    ) : (
                      <p className={clsx(
                        'text-xs font-mono mt-0.5',
                        hasValue ? 'text-brand-text-bright' : 'text-brand-text-dim italic',
                      )}>
                        {value || (lang === 'nl' ? field.placeholder.nl : field.placeholder.en)}
                      </p>
                    )}
                  </div>

                  {/* Edit button (appears on hover) */}
                  {!isEditing && (
                    <button
                      onClick={() => startEdit(field.key as SaluteKey)}
                      className="text-[10px] font-mono text-brand-text-dim/0 group-hover:text-brand-text-dim hover:text-brand-primary transition-colors flex-shrink-0 mt-1"
                    >
                      ✏️
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* ── No transcript warning ── */}
      {!transcript && !loading && (
        <div className="bg-ado-amber/10 border border-ado-amber/25 rounded-lg px-4 py-3">
          <p className="text-ado-amber text-xs font-mono">
            ⚠️ {lang === 'nl'
              ? 'Geen transcript beschikbaar. Ga terug naar Tab 1 om een opname te maken.'
              : 'No transcript available. Go back to Tab 1 to record.'}
          </p>
        </div>
      )}

      {/* ── Next ── */}
      <div className="flex justify-between items-center pt-1">
        <p className="text-brand-text-dim text-[11px] font-mono">
          {parsed
            ? `${filledCount}/6 ${lang === 'nl' ? 'SALUTE-velden ingevuld' : 'SALUTE fields populated'}`
            : ''}
        </p>
        <Button
          variant="primary"
          size="md"
          iconRight="→"
          disabled={!parsed}
          onClick={onNext}
        >
          {lang === 'nl' ? 'MIST Rapport →' : 'MIST Report →'}
        </Button>
      </div>
    </div>
  );
}
