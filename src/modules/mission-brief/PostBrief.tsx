// ============================================================
// PostBrief — WP05 sub-component
// Tab 4: Samenvatting + export + opslaan C2
// ============================================================

import { useState }            from 'react';
import { useLanguage }         from '../../config/i18n';
import { useMissionStore }     from '../../store/missionStore';
import { useAI }               from '../../hooks/useAI';
import { Badge }               from '../../components/ui/Badge';
import { Button }              from '../../components/ui/Button';
import { Card, Panel }         from '../../components/ui/Card';
import { Modal }               from '../../components/ui/Modal';
import { ClassificationBanner } from '../../components/shared/ClassificationBadge';

// C2 systems
const C2_SYSTEMS = ['TITAAN (NLD C2)', 'ICC (NATO)', 'BICES', 'Custom API'];

const SYSTEM_POSTBRIEF = `You are a military staff officer. Generate a concise Post-Briefing Report based on the briefing transcript.
Structure: 1) Mission summary 2) Key decisions made 3) Action items with owners 4) Follow-up required.
Be concise and professional. Use military terminology. Respond in the same language as the input.`;

interface PostBriefProps {
  transcript: string;
  onNewBriefing: () => void;
}

export function PostBrief({ transcript, onNewBriefing }: PostBriefProps) {
  const { lang }          = useLanguage();
  const { activeMission } = useMissionStore();
  const { response, loading, call } = useAI();

  const [exportOpen,   setExportOpen]   = useState(false);
  const [c2Open,       setC2Open]       = useState(false);
  const [exportFormat, setExportFormat] = useState('NATO STANAG 2014 (PDF)');
  const [exportClass,  setExportClass]  = useState('RESTRICTED');
  const [c2System,     setC2System]     = useState(C2_SYSTEMS[0]);
  const [savedToC2,    setSavedToC2]    = useState(false);
  const [generated,    setGenerated]    = useState(false);

  async function generateReport() {
    const prompt = transcript
      ? (lang === 'nl'
          ? `Genereer een na-briefing rapport voor ${activeMission?.name.nl ?? 'de operatie'}.\n\nTranscript:\n${transcript}`
          : `Generate a post-briefing report for ${activeMission?.name.en ?? 'the operation'}.\n\nTranscript:\n${transcript}`)
      : (lang === 'nl'
          ? `Genereer een standaard na-briefing rapport voor ${activeMission?.name.nl ?? 'troepenbescherming'}.`
          : `Generate a standard post-briefing report for ${activeMission?.name.en ?? 'force protection'}.`);

    await call({
      system: SYSTEM_POSTBRIEF,
      messages: [{ role: 'user', content: prompt }],
      maxTokens: 800,
      temperature: 0.3,
    });
    setGenerated(true);
  }

  const reportText = response || (lang === 'nl'
    ? 'Klik op "Genereer Rapport" om de na-briefing samenvatting te maken.'
    : 'Click "Generate Report" to create the post-briefing summary.');

  return (
    <div className="space-y-5">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-brand-text-bright font-semibold text-sm">
            ✅ {lang === 'nl' ? 'Na-Briefing Rapport' : 'Post-Brief Report'}
            {generated && <Badge variant="complete" size="xs" className="ml-2">Complete</Badge>}
          </h3>
          <p className="text-brand-text-dim text-[10px] font-mono mt-0.5">
            {lang === 'nl' ? 'AI-gegenereerd uit briefingsessie' : 'AI-generated from live briefing session'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" iconLeft="📤" onClick={() => setExportOpen(true)}>
            {lang === 'nl' ? 'Export' : 'Export'}
          </Button>
          <Button variant="ghost" size="sm" iconLeft="💾" onClick={() => setC2Open(true)}>
            {lang === 'nl' ? 'Opslaan C2' : 'Save to C2'}
          </Button>
          <Button variant="primary" size="sm" iconLeft="🔄" onClick={onNewBriefing}>
            {lang === 'nl' ? 'Nieuwe Briefing' : 'New Briefing'}
          </Button>
        </div>
      </div>

      {/* ── Report card ── */}
      <Card padding="none">
        <ClassificationBanner level={exportClass as 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET' | 'UNCLASSIFIED'} />

        <div className="p-4">
          {/* Meta */}
          <div className="flex flex-wrap gap-x-6 gap-y-1 mb-4 pb-3 border-b border-brand-border">
            {[
              { label: lang === 'nl' ? 'Operatie' : 'Operation', value: activeMission?.name[lang] ?? '—' },
              { label: 'DTG',        value: activeMission?.dtg ?? '—' },
              { label: lang === 'nl' ? 'Commandant' : 'Commander', value: activeMission?.commander ?? '—' },
              { label: lang === 'nl' ? 'Status' : 'Status', value: lang === 'nl' ? 'AFGEROND' : 'COMPLETE' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[9px] font-mono text-brand-text-dim uppercase tracking-wider">{label}</p>
                <p className="text-xs font-mono text-brand-text-bright font-semibold">{value}</p>
              </div>
            ))}
          </div>

          {/* Body */}
          {loading ? (
            <div className="flex items-center gap-3 py-6">
              <span className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-mono text-brand-text-dim">
                {lang === 'nl' ? 'Rapport wordt gegenereerd...' : 'Generating report...'}
              </span>
            </div>
          ) : (
            <div className="min-h-[120px]">
              <p className="text-brand-text text-xs font-mono leading-relaxed whitespace-pre-wrap">
                {reportText}
              </p>
            </div>
          )}

          {/* Generate button */}
          {!generated && !loading && (
            <div className="mt-4 pt-3 border-t border-brand-border">
              <Button variant="primary" size="sm" iconLeft="⚡" onClick={generateReport}>
                {lang === 'nl' ? 'Genereer Rapport' : 'Generate Report'}
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* ── Sources used ── */}
      <Panel>
        <p className="text-[10px] font-mono text-brand-text-dim uppercase tracking-wider mb-2">
          {lang === 'nl' ? 'Bronnen deze sessie' : 'Sources this session'}
        </p>
        <div className="flex flex-wrap gap-2">
          {['Live Briefing Transcript', 'AI Analysis', 'OPORD Generator', 'Intel Feed'].map((src) => (
            <span key={src} className="px-2 py-0.5 rounded border border-brand-border text-[10px] font-mono text-brand-text-dim">
              {src}
            </span>
          ))}
        </div>
      </Panel>

      {/* ── Export Modal ── */}
      <Modal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        title="📤 Export"
        subtitle={lang === 'nl' ? 'Kies formaat en classificatie' : 'Choose format and classification'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setExportOpen(false)}>
              {lang === 'nl' ? 'Annuleer' : 'Cancel'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setExportOpen(false)}>
              {lang === 'nl' ? 'Exporteer Nu' : 'Export Now'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <ClassificationBanner level={exportClass as 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET' | 'UNCLASSIFIED'} />
          <div>
            <p className="text-[10px] font-mono text-brand-text-dim uppercase tracking-wider mb-2">
              {lang === 'nl' ? 'Formaat' : 'Format'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {['NATO STANAG 2014 (PDF)', 'OPORD (DOCX)', 'JSON (API)', 'Plain Text'].map((f) => (
                <button
                  key={f}
                  onClick={() => setExportFormat(f)}
                  className={`px-3 py-2 text-[11px] font-mono text-left rounded border transition-colors ${
                    exportFormat === f
                      ? 'border-brand-primary/50 text-brand-primary bg-brand-primary-dim'
                      : 'border-brand-border text-brand-text-dim hover:border-brand-border/80 hover:text-brand-text-bright'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-mono text-brand-text-dim uppercase tracking-wider mb-2">
              {lang === 'nl' ? 'Classificatie' : 'Classification'}
            </p>
            <div className="flex gap-2">
              {['RESTRICTED', 'CONFIDENTIAL', 'SECRET'].map((c) => (
                <button
                  key={c}
                  onClick={() => setExportClass(c)}
                  className={`px-2 py-1 text-[10px] font-mono rounded border transition-colors ${
                    exportClass === c
                      ? 'border-brand-primary/50 text-brand-primary bg-brand-primary-dim'
                      : 'border-brand-border text-brand-text-dim hover:text-brand-text-bright'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* ── C2 Modal ── */}
      <Modal
        open={c2Open}
        onClose={() => setC2Open(false)}
        title="💾 C2 System"
        subtitle={lang === 'nl' ? 'Selecteer doelsysteem' : 'Select target system'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setC2Open(false)}>
              {lang === 'nl' ? 'Annuleer' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => { setSavedToC2(true); setC2Open(false); }}
            >
              💾 {lang === 'nl' ? 'Opslaan' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {C2_SYSTEMS.map((sys) => (
            <button
              key={sys}
              onClick={() => setC2System(sys)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded border text-xs font-mono transition-colors ${
                c2System === sys
                  ? 'border-brand-primary/50 bg-brand-primary-dim text-brand-primary'
                  : 'border-brand-border text-brand-text-dim hover:text-brand-text-bright'
              }`}
            >
              <span>{sys}</span>
              {c2System === sys && <span className="text-ado-green">🔗 {lang === 'nl' ? 'Verbonden' : 'Connected'}</span>}
            </button>
          ))}
          <p className="text-[10px] font-mono text-brand-text-dim pt-1">
            {c2System === 'TITAAN (NLD C2)'
              ? 'TITAAN via beveiligde API Gateway. AES-256.'
              : lang === 'nl' ? 'Verbinding configureren in instellingen.' : 'Configure connection in settings.'}
          </p>
        </div>
      </Modal>

      {/* C2 save confirmation */}
      {savedToC2 && (
        <div className="bg-ado-green/10 border border-ado-green/25 rounded-lg px-4 py-3 flex items-center gap-2">
          <span className="text-ado-green">✓</span>
          <p className="text-ado-green text-xs font-mono">
            {lang === 'nl'
              ? `Rapport opgeslagen in ${c2System}`
              : `Report saved to ${c2System}`}
          </p>
        </div>
      )}
    </div>
  );
}
