// ============================================================
// WP02 Component Showcase
// Live preview of all UI components — delete after WP03
// Route: /components (tijdelijk, voor acceptatietest WP02)
// ============================================================

import { useState } from 'react';
import { Button }                                 from '../../components/ui/Button';
import { Badge, StatusBadge, ThreatBadge }        from '../../components/ui/Badge';
import { Card, CardHeader, StatCard, Panel }       from '../../components/ui/Card';
import { Modal, ConfirmDialog }                    from '../../components/ui/Modal';
import { ProgressBar, RingProgress }              from '../../components/ui/ProgressBar';
import { StatusIndicator }                         from '../../components/ui/StatusIndicator';
import { ClassificationBadge, ClassificationBanner } from '../../components/shared/ClassificationBadge';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-brand-text-bright font-semibold text-sm font-mono uppercase tracking-widest">
          {title}
        </h2>
        <div className="flex-1 h-px bg-brand-border" />
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        {children}
      </div>
    </div>
  );
}

export default function ComponentShowcase() {
  const [modalOpen, setModalOpen]   = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [progress, setProgress]     = useState(72);

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-2">
      {/* Header */}
      <div className="mb-8">
        <p className="text-brand-text-dim text-xs font-mono mb-1">WP02 — Acceptatietest</p>
        <h1 className="text-brand-text-bright text-2xl font-bold">UI Component Library</h1>
        <p className="text-brand-text-dim text-sm mt-1">
          AI Defence Operations · Alle componenten visueel gevalideerd
        </p>
      </div>

      {/* Classification banners */}
      <Section title="Classification Banners">
        <div className="w-full space-y-2">
          <ClassificationBanner level="UNCLASSIFIED" />
          <ClassificationBanner level="RESTRICTED" />
          <ClassificationBanner level="CONFIDENTIAL" />
          <ClassificationBanner level="SECRET" />
        </div>
      </Section>

      {/* Buttons */}
      <Section title="Buttons — Variants">
        <Button variant="primary">Primary</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="intel">Intel</Button>
        <Button variant="primary" loading>Loading...</Button>
        <Button variant="primary" disabled>Disabled</Button>
      </Section>

      <Section title="Buttons — Sizes">
        <Button variant="primary" size="sm">Small</Button>
        <Button variant="primary" size="md">Medium</Button>
        <Button variant="primary" size="lg">Large</Button>
      </Section>

      <Section title="Buttons — With Icons">
        <Button variant="primary"  iconLeft="🛡️">Start Briefing</Button>
        <Button variant="ghost"    iconLeft="📡">Intel Analyse</Button>
        <Button variant="secondary" iconRight="→">Volgende</Button>
        <Button variant="danger"   iconLeft="⚠️">Beëindigen</Button>
      </Section>

      {/* Badges */}
      <Section title="Badges — Variants">
        <Badge variant="operational" dot pulse>OPERATIONEEL</Badge>
        <Badge variant="pending"     dot>WACHTEND</Badge>
        <Badge variant="critical"    dot pulse>KRITIEK</Badge>
        <Badge variant="intel"       dot>INTEL</Badge>
        <Badge variant="ai"          dot pulse>AI Gegenereerd</Badge>
        <Badge variant="live"        dot pulse>LIVE</Badge>
        <Badge variant="scheduled">GEPLAND</Badge>
        <Badge variant="complete"    dot>AFGEROND</Badge>
      </Section>

      <Section title="Badges — Classification">
        <ClassificationBadge level="UNCLASSIFIED" />
        <ClassificationBadge level="RESTRICTED" />
        <ClassificationBadge level="CONFIDENTIAL" />
        <ClassificationBadge level="SECRET" />
      </Section>

      <Section title="Badges — Status Shorthand">
        <StatusBadge status="OPERATIONAL" />
        <StatusBadge status="PENDING" />
        <StatusBadge status="SCHEDULED" />
        <StatusBadge status="COMPLETE" />
        <StatusBadge status="CANCELLED" />
      </Section>

      <Section title="Badges — Threat Level">
        <ThreatBadge level="LOW" />
        <ThreatBadge level="MODERATE" />
        <ThreatBadge level="SUBSTANTIAL" />
        <ThreatBadge level="SEVERE" />
        <ThreatBadge level="CRITICAL" />
      </Section>

      {/* Status Indicators */}
      <Section title="Status Indicators">
        <StatusIndicator status="OPERATIONAL" />
        <StatusIndicator status="PENDING" />
        <StatusIndicator status="SCHEDULED" />
        <StatusIndicator status="COMPLETE" />
        <StatusIndicator status="LIVE" />
        <StatusIndicator status="OFFLINE" />
        <StatusIndicator status="OPERATIONAL" size="md" />
        <StatusIndicator status="OPERATIONAL" showLabel={false} />
      </Section>

      {/* Cards */}
      <Section title="Cards">
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader title="Base Card" subtitle="Geen hover effect" icon="📋" />
            <p className="text-brand-text-dim text-xs">Standaard kaart zonder interactie.</p>
          </Card>
          <Card accent>
            <CardHeader
              title="Accent Card"
              subtitle="Gold-lijn bij hover"
              icon="🎯"
              badge={<Badge variant="restricted" size="xs">BEPERKT</Badge>}
            />
            <p className="text-brand-text-dim text-xs">Hover om de gouden bovenlijn te zien.</p>
          </Card>
          <Card interactive onClick={() => alert('Kaart geklikt!')}>
            <CardHeader title="Interactive Card" subtitle="Lift + glow" icon="🛡️" />
            <p className="text-brand-text-dim text-xs">Klik of hover — beweegt omhoog.</p>
          </Card>
        </div>
      </Section>

      {/* Stat Cards */}
      <Section title="Stat Cards">
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Actieve Missies"  value="7"     delta="↑ 2"    deltaPositive={true}  icon="🎯" />
          <StatCard label="AI Rapporten"     value="156"   delta="↑ 23%"  deltaPositive={true}  icon="🤖" />
          <StatCard label="Intel Bronnen"    value="12"    delta="↑ 4"    deltaPositive={true}  icon="📡" />
          <StatCard label="Tijd Bespaard"    value="6.4h"  sublabel="Per dag"                   icon="⏱️" />
        </div>
      </Section>

      {/* Progress */}
      <Section title="Progress Bars">
        <div className="w-full max-w-md space-y-3">
          <ProgressBar value={progress} color="primary" label="Missie voortgang"  showValue size="md" />
          <ProgressBar value={87}       color="green"   label="Beslissnelheid"    showValue />
          <ProgressBar value={92}       color="blue"    label="Situatiebewustzijn" showValue />
          <ProgressBar value={78}       color="amber"   label="Communicatie"      showValue />
          <ProgressBar value={35}       color="red"     label="Kritieke drempel"  showValue size="xs" />
        </div>
        <div className="flex gap-4 mt-2">
          <Button variant="ghost" size="sm" onClick={() => setProgress(p => Math.max(0,  p - 10))}>− 10%</Button>
          <Button variant="ghost" size="sm" onClick={() => setProgress(p => Math.min(100, p + 10))}>+ 10%</Button>
        </div>
      </Section>

      <Section title="Ring Progress">
        <RingProgress value={87} color="green"   size={56} label="87%" />
        <RingProgress value={92} color="blue"    size={56} label="92%" />
        <RingProgress value={78} color="amber"   size={56} label="78%" />
        <RingProgress value={35} color="red"     size={56} label="35%" />
        <RingProgress value={progress} color="primary" size={64} />
      </Section>

      {/* Modal */}
      <Section title="Modals">
        <Button variant="primary" onClick={() => setModalOpen(true)}>Open Modal</Button>
        <Button variant="danger"  onClick={() => setConfirmOpen(true)}>Confirm Dialog</Button>
      </Section>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="📤 Export Document"
        subtitle="NATO STANAG 2014 format"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>Annuleer</Button>
            <Button variant="primary"   size="sm" onClick={() => setModalOpen(false)}>Exporteer Nu</Button>
          </>
        }
      >
        <div className="space-y-4">
          <ClassificationBanner level="RESTRICTED" />
          <div className="space-y-2 mt-3">
            <p className="text-brand-text-dim text-xs font-mono">Format</p>
            <div className="grid grid-cols-2 gap-2">
              {['NATO STANAG 2014 (PDF)', 'OPORD (DOCX)', 'JSON (API)', 'Plain Text'].map(f => (
                <button key={f} className="px-3 py-2 text-xs font-mono text-left
                  bg-brand-bg-elevated border border-brand-border rounded
                  hover:border-brand-primary/30 hover:text-brand-primary transition-colors">
                  {f}
                </button>
              ))}
            </div>
          </div>
          <Panel className="mt-3">
            <p className="text-brand-text-dim text-xs font-mono">
              Distributie: Command Staff · Classificatie: RESTRICTED
            </p>
          </Panel>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => console.log('Confirmed!')}
        title="Sessie beëindigen"
        message="Weet je zeker dat je de huidige briefingsessie wilt beëindigen? Niet-opgeslagen data gaat verloren."
        confirmText="Beëindigen"
        danger
      />
    </div>
  );
}

// NOTE: WP04 components (VoiceRecorder, AIAssistant) are tested
// directly in WP05 (Mission Brief) and WP07 (Field Report).
// They require a live browser environment with Speech API + Netlify proxy.
