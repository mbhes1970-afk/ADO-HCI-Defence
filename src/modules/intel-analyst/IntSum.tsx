// ============================================================
// IntSum — WP06 sub-component
// Tab 4: Claude genereert Intelligence Summary (INTSUM)
// ============================================================

import { useState, useEffect }  from 'react';
import { useLanguage }          from '../../config/i18n';
import { useIntelStore }        from '../../store/intelStore';
import { useMissionStore }      from '../../store/missionStore';
import { useAI }                from '../../hooks/useAI';
import { Badge }                from '../../components/ui/Badge';
import { Button }               from '../../components/ui/Button';
import { Card, Panel }          from '../../components/ui/Card';
import { Modal }                from '../../components/ui/Modal';
import { ClassificationBanner } from '../../components/shared/ClassificationBadge';
import clsx                     from 'clsx';

const SYSTEM_INTSUM = `You are a NATO intelligence officer generating a formal Intelligence Summary (INTSUM).
Follow NATO INTSUM format strictly:
1. CLASSIFICATION
2. PERIOD OF REPORT (DTG to DTG)
3. AREA OF INTEREST
4. ENEMY SITUATION (ground, air, other)
5. INTELLIGENCE HIGHLIGHTS (numbered, most significant first)
6. THREAT ASSESSMENT (LOW / MODERATE / SUBSTANTIAL / SEVERE / CRITICAL)
7. COMMANDER'S CRITICAL INFORMATION REQUIREMENTS (CCIRs)
8. INTELLIGENCE GAPS
9. FORECAST (next 24-48h)

Be precise, professional, and concise. No padding. Use NATO terminology.
Respond in the same language as the user message.`;

interface IntSumProps {
  onNewAnalysis: () => void;
}

export function IntSum({ onNewAnalysis }: IntSumProps) {
  const { lang }                                  = useLanguage();
  const { sources, correlationResult, intsum, setIntsum } = useIntelStore();
  const { activeMission }                         = useMissionStore();
  const { loading, call }                         = useAI();
  const [exportOpen,   setExportOpen]             = useState(false);
  const [generated,    setGenerated]              = useState(!!intsum);

  // Auto-generate on mount if correlation exists and no INTSUM yet
  useEffect(() => {
    if (correlationResult && !intsum) {
      generateIntSum();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateIntSum() {
    const allSources = sources.map(s =>
      `[${s.type} — ${s.reliabilityCode}] ${s.summary[lang]}`
    ).join('\n');

    const missionCtx = activeMission
      ? `Mission: ${activeMission.name[lang]}, DTG: ${activeMission.dtg}, Threat: ${activeMission.threatLevel}`
      : '';

    const prompt = lang === 'nl'
      ? `Genereer een INTSUM voor ${activeMission?.name.nl ?? 'de operatie'}.\n\n${missionCtx ? `MISSIE: ${missionCtx}\n\n` : ''}CORRELATIE RESULTAAT:\n${correlationResult || 'Niet beschikbaar'}\n\nALLE BRONNEN:\n${allSources}`
      : `Generate an INTSUM for ${activeMission?.name.en ?? 'the operation'}.\n\n${missionCtx ? `MISSION: ${missionCtx}\n\n` : ''}CORRELATION RESULT:\n${correlationResult || 'Not available'}\n\nALL SOURCES:\n${allSources}`;

    const result = await call({
      system: SYSTEM_INTSUM,
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 1200,
      temperature: 0.2,
    });

    setIntsum(result);
    setGenerated(true);
  }

  // ── DTG generator ─────────────────────────────────────────
  const now = new Date();
  const dtgNow = `${now.getUTCDate().toString().padStart(2,'0')}${now.getUTCHours().toString().padStart(2,'0')}${now.getUTCMinutes().toString().padStart(2,'0')}ZJAN26`;

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-brand-text-bright font-semibold text-sm">
            📊 {lang === 'nl' ? 'Intelligence Summary (INTSUM)' : 'Intelligence Summary (INTSUM)'}
          </h3>
          <p className="text-brand-text-dim text-[10px] font-mono mt-0.5">
            {lang === 'nl' ? 'AI-gegenereerd · NATO formaat' : 'AI-generated · NATO format'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {generated && <Badge variant="ai" size="xs" dot>AI Generated</Badge>}
          <Button variant="ghost" size="sm" loading={loading} onClick={generateIntSum} iconLeft="🔄">
            {generated ? (lang === 'nl' ? 'Hergeneer' : 'Regenerate') : (lang === 'nl' ? 'Genereer INTSUM' : 'Generate INTSUM')}
          </Button>
          {generated && (
            <Button variant="secondary" size="sm" iconLeft="📤" onClick={() => setExportOpen(true)}>
              {lang === 'nl' ? 'Export' : 'Export'}
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={onNewAnalysis}>
            {lang === 'nl' ? 'Nieuwe Analyse' : 'New Analysis'}
          </Button>
        </div>
      </div>

      {/* ── INTSUM document ── */}
      <Card padding="none">
        <ClassificationBanner level="RESTRICTED" />

        {/* Document meta bar */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 px-4 py-2.5 border-b border-brand-border bg-brand-bg-elevated">
          {[
            { label: lang === 'nl' ? 'Document' : 'Document',    value: 'INTSUM' },
            { label: 'DTG',                                        value: dtgNow },
            { label: lang === 'nl' ? 'Operatie' : 'Operation',   value: activeMission?.name[lang] ?? '—' },
            { label: lang === 'nl' ? 'Bronnen' : 'Sources',      value: `${sources.length}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono text-brand-text-dim uppercase">{label}:</span>
              <span className="text-[10px] font-mono text-brand-text-bright font-semibold">{value}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 min-h-[280px]">
          {loading && (
            <div className="flex items-center gap-3 py-8">
              <span className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
              <div>
                <p className="text-sm font-mono text-brand-text-dim">
                  {lang === 'nl' ? 'Claude genereert INTSUM...' : 'Claude is generating INTSUM...'}
                </p>
                <p className="text-[10px] font-mono text-brand-text-dim/60 mt-1">
                  {lang === 'nl'
                    ? `${sources.length} bronnen · Correlatie verwerkt`
                    : `${sources.length} sources · Correlation processed`}
                </p>
              </div>
            </div>
          )}

          {intsum && !loading && (
            <p className="text-brand-text text-xs font-mono leading-relaxed whitespace-pre-wrap">
              {intsum}
            </p>
          )}

          {!intsum && !loading && (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <p className="text-4xl mb-3 opacity-20">📊</p>
              <p className="text-brand-text-dim text-sm font-semibold mb-1">
                {lang === 'nl' ? 'INTSUM nog niet gegenereerd' : 'INTSUM not yet generated'}
              </p>
              <p className="text-brand-text-dim text-xs font-mono mb-4">
                {correlationResult
                  ? (lang === 'nl' ? 'Correlatie beschikbaar — klaar om te genereren' : 'Correlation available — ready to generate')
                  : (lang === 'nl' ? 'Voer eerst een correlatie uit in Tab 3' : 'Run a correlation first in Tab 3')}
              </p>
              <Button variant="primary" size="sm" iconLeft="⚡" onClick={generateIntSum}>
                {lang === 'nl' ? 'Genereer Nu' : 'Generate Now'}
              </Button>
            </div>
          )}
        </div>

        {/* Footer: source badges */}
        {generated && (
          <div className="px-4 py-3 border-t border-brand-border flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono text-brand-text-dim">
              {lang === 'nl' ? 'Gebaseerd op:' : 'Based on:'}
            </span>
            {sources.map(s => (
              <span key={s.id} className="text-[10px] font-mono text-brand-text-dim px-1.5 py-0.5 rounded border border-brand-border">
                {s.icon} {s.type}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* ── Source reliability summary ── */}
      {generated && (
        <Panel>
          <p className="text-[10px] font-mono text-brand-text-dim uppercase tracking-wider mb-3">
            {lang === 'nl' ? 'Brononzekerheid' : 'Source Uncertainty'}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {sources.map(s => {
              const reliabColors: Record<string, string> = {
                A: 'text-ado-green', B: 'text-ado-blue', C: 'text-ado-amber', D: 'text-brand-text-dim',
              };
              const letter = s.reliabilityCode[0];
              return (
                <div key={s.id} className="flex items-center gap-2 bg-brand-bg-elevated rounded p-2 border border-brand-border">
                  <span className="text-sm">{s.icon}</span>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono text-brand-text-bright font-semibold">{s.type}</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={clsx('text-[10px] font-mono font-bold', reliabColors[letter] ?? 'text-brand-text-dim')}>
                        {s.reliabilityCode}
                      </span>
                      {s.isLive && <Badge variant="live" size="xs" dot pulse>LIVE</Badge>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      {/* ── Export Modal ── */}
      <Modal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="📤 Export INTSUM"
        subtitle="NATO STANAG 2014"
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setExportOpen(false)}>
              {lang === 'nl' ? 'Annuleer' : 'Cancel'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setExportOpen(false)}>
              {lang === 'nl' ? 'Exporteer' : 'Export'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <ClassificationBanner level="RESTRICTED" />
          {['PDF (STANAG)', 'DOCX', 'JSON', 'Plain Text'].map(f => (
            <button key={f} className="w-full px-3 py-2 text-xs font-mono text-left rounded border border-brand-border text-brand-text-dim hover:border-brand-primary/30 hover:text-brand-primary transition-colors">
              {f}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
