// ============================================================
// LiveBriefing — WP05 sub-component
// Tab 2: Spraakopname + live transcript + AI keypunten + entiteiten
// ============================================================

import { useState, useCallback }   from 'react';
import { useLanguage }             from '../../config/i18n';
import { useMissionStore }         from '../../store/missionStore';
import { useAI }                   from '../../hooks/useAI';
import { VoiceRecorder }           from '../../components/shared/VoiceRecorder';
import { Badge }                   from '../../components/ui/Badge';
import { Button }                  from '../../components/ui/Button';
import { Panel }                   from '../../components/ui/Card';
import clsx                        from 'clsx';

const SYSTEM_KEYPUNTEN = `You are a military intelligence AI. Extract key points from this spoken briefing.
Return ONLY a JSON object with this exact structure (no markdown, no explanation):
{
  "keyPoints": ["point1", "point2", ...],
  "entities": {
    "threats": ["threat1", ...],
    "locations": ["loc1", ...],
    "units": ["unit1", ...],
    "times": ["time1", ...],
    "actions": ["action1", ...]
  }
}
Be concise. Max 6 key points. Respond based on the language of the input text.`;

interface Entity {
  type: 'threat' | 'location' | 'unit' | 'time' | 'action';
  value: string;
}

const entityColor: Record<Entity['type'], string> = {
  threat:   'border-ado-red/30 text-ado-red bg-ado-red/5',
  location: 'border-ado-blue/30 text-ado-blue bg-ado-blue/5',
  unit:     'border-ado-green/30 text-ado-green bg-ado-green/5',
  time:     'border-brand-primary/30 text-brand-primary bg-brand-primary-dim',
  action:   'border-ado-amber/30 text-ado-amber bg-ado-amber/5',
};

const entityIcon: Record<Entity['type'], string> = {
  threat: '⚠️', location: '📍', unit: '🪖', time: '🕐', action: '▶️',
};

interface LiveBriefingProps {
  onNext:             (transcript: string) => void;
  onTranscriptChange: (t: string) => void;
}

export function LiveBriefing({ onNext, onTranscriptChange }: LiveBriefingProps) {
  const { lang }          = useLanguage();
  const { activeMission } = useMissionStore();
  const { loading: aiLoading, call: callAI } = useAI();

  const [transcript,  setTranscript]  = useState('');
  const [keyPoints,   setKeyPoints]   = useState<string[]>([]);
  const [entities,    setEntities]    = useState<Entity[]>([]);
  const [extracted,   setExtracted]   = useState(false);

  // Keep parent in sync
  const handleTranscriptChange = useCallback((t: string) => {
    setTranscript(t);
    onTranscriptChange(t);
  }, [onTranscriptChange]);

  async function extractKeyPoints() {
    if (!transcript.trim()) return;

    const raw = await callAI({
      system: SYSTEM_KEYPUNTEN,
      messages: [{ role: 'user', content: transcript }],
      maxTokens: 800,
      temperature: 0.1,
    });

    try {
      const clean = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      setKeyPoints(parsed.keyPoints ?? []);

      // Flatten entities
      const flat: Entity[] = [];
      for (const [type, vals] of Object.entries(parsed.entities ?? {})) {
        for (const v of (vals as string[])) {
          flat.push({ type: type as Entity['type'], value: v });
        }
      }
      setEntities(flat);
      setExtracted(true);
    } catch {
      // Fallback: show raw response as single key point
      setKeyPoints([raw]);
      setExtracted(true);
    }
  }

  return (
    <div className="space-y-5">

      {/* ── Header strip ── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-brand-text-bright font-semibold text-sm">
            🎙️ {lang === 'nl' ? 'Live Briefing — Opname' : 'Live Briefing — Recording'}
          </h3>
          <p className="text-brand-text-dim text-[10px] font-mono mt-0.5">
            {activeMission?.name[lang]} · OPORD
          </p>
        </div>
        <Badge variant="live" size="xs" dot pulse>
          {lang === 'nl' ? 'LIVE' : 'LIVE'}
        </Badge>
      </div>

      {/* ── Voice recorder ── */}
      <Panel>
        <VoiceRecorder
          onTranscriptChange={handleTranscriptChange}
          onStop={extractKeyPoints}
          label={{
            nl: 'Start Briefing Opname',
            en: 'Start Briefing Recording',
          }}
        />
      </Panel>

      {/* ── Two-column: transcript + AI keypunten ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Live transcript */}
        <div className="bg-brand-bg-card border border-brand-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-brand-border bg-brand-bg-elevated">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-brand-text-dim uppercase tracking-wider">
                📝 {lang === 'nl' ? 'Live Transcriptie' : 'Live Transcript'}
              </span>
              <Badge variant="live" size="xs">Real-time</Badge>
            </div>
          </div>
          <div className="p-3 min-h-[140px] max-h-[220px] overflow-y-auto">
            {transcript ? (
              <p className="text-brand-text text-[11px] font-mono leading-relaxed whitespace-pre-wrap">
                {transcript}
              </p>
            ) : (
              <p className="text-brand-text-dim text-[11px] font-mono italic">
                {lang === 'nl'
                  ? 'Luistert naar spraak...'
                  : 'Listening for speech...'}
              </p>
            )}
          </div>
        </div>

        {/* AI key points */}
        <div className="bg-brand-bg-card border border-brand-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-brand-border bg-brand-bg-elevated">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-brand-text-dim uppercase tracking-wider">
                🧠 {lang === 'nl' ? 'AI Kernpunten' : 'AI Key Points'}
              </span>
              <Badge variant="ai" size="xs" dot>⚡ {lang === 'nl' ? 'Auto' : 'Auto'}</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              loading={aiLoading}
              onClick={extractKeyPoints}
              disabled={!transcript.trim()}
            >
              {lang === 'nl' ? 'Extraheer' : 'Extract'}
            </Button>
          </div>
          <div className="p-3 min-h-[140px] max-h-[220px] overflow-y-auto space-y-2">
            {aiLoading && (
              <div className="flex items-center gap-2 text-brand-text-dim">
                <span className="w-3 h-3 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-[11px] font-mono">
                  {lang === 'nl' ? 'AI analyseert...' : 'AI analysing...'}
                </span>
              </div>
            )}
            {keyPoints.length > 0 && !aiLoading && keyPoints.map((point, i) => (
              <div key={i} className="flex gap-2 items-start">
                <span className="text-brand-primary font-mono text-[10px] mt-0.5 flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-brand-text text-[11px] font-mono leading-snug">{point}</p>
              </div>
            ))}
            {!keyPoints.length && !aiLoading && (
              <p className="text-brand-text-dim text-[11px] font-mono italic">
                {lang === 'nl'
                  ? 'Kernpunten verschijnen hier na verwerking.'
                  : 'Key points will appear here after processing.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Entities ── */}
      <div className="bg-brand-bg-card border border-brand-border rounded-lg overflow-hidden">
        <div className="px-3 py-2 border-b border-brand-border bg-brand-bg-elevated">
          <span className="text-xs font-mono text-brand-text-dim uppercase tracking-wider">
            🏷️ {lang === 'nl' ? 'Entiteiten Gedetecteerd' : 'Entities Detected'}
          </span>
        </div>
        <div className="p-3 min-h-[52px]">
          {entities.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {entities.map((e, i) => (
                <span
                  key={i}
                  className={clsx(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-mono',
                    entityColor[e.type],
                  )}
                >
                  <span>{entityIcon[e.type]}</span>
                  {e.value}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-brand-text-dim text-[11px] font-mono italic">
              {lang === 'nl'
                ? 'Entiteiten worden geëxtraheerd uit spraak...'
                : 'Entities will be extracted from speech...'}
            </p>
          )}
        </div>
      </div>

      {/* ── Next ── */}
      <div className="flex justify-between items-center pt-2">
        <p className="text-brand-text-dim text-[11px] font-mono">
          {transcript
            ? `${transcript.split(' ').length} ${lang === 'nl' ? 'woorden opgenomen' : 'words recorded'}`
            : ''}
        </p>
        <Button
          variant="primary"
          size="md"
          iconRight="→"
          disabled={!extracted && !transcript.trim()}
          onClick={() => onNext(transcript)}
        >
          {lang === 'nl' ? 'OPORD Bouwen →' : 'Build OPORD →'}
        </Button>
      </div>
    </div>
  );
}
