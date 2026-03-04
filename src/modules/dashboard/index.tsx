// ============================================================
// Dashboard — WP03
// Operationeel overzicht: stat-tegels, missietabel, activiteitsfeed
// ============================================================

import { useState, useEffect } from 'react';
import { useNavigate }          from 'react-router-dom';
import { useLanguage, t }       from '../../config/i18n';
import { useMissionStore }      from '../../store/missionStore';
import { useSessionStore }      from '../../store/sessionStore';
import { StatCard }             from '../../components/ui/Card';
import { StatusBadge, ThreatBadge, Badge } from '../../components/ui/Badge';
import { StatusIndicator }      from '../../components/ui/StatusIndicator';
import { Button }               from '../../components/ui/Button';
import type { Mission }         from '../../config/types';
import clsx                     from 'clsx';

// ── Activity feed data ───────────────────────────────────────
const activityItems = [
  { id: 1, icon: '🤖', textNL: 'INTSUM gegenereerd voor Op Noordelijk Schild', textEN: 'INTSUM generated for Op Northern Shield', timeNL: '10 min geleden', timeEN: '10 min ago', type: 'ai' },
  { id: 2, icon: '🛩️', textNL: 'UAV alarm — Sector B-7', textEN: 'UAV incursion alert — Sector B-7', timeNL: '25 min geleden', timeEN: '25 min ago', type: 'alert' },
  { id: 3, icon: '🎙️', textNL: 'SALUTE-rapport verwerkt uit spraak', textEN: 'SALUTE report processed from voice', timeNL: '1 uur geleden', timeEN: '1 hour ago', type: 'report' },
  { id: 4, icon: '🎮', textNL: 'Trainingsscenario afgerond — 92%', textEN: 'Training scenario completed — 92%', timeNL: '2 uur geleden', timeEN: '2 hours ago', type: 'training' },
  { id: 5, icon: '📡', textNL: 'SIGINT feed bijgewerkt — Bron A2', textEN: 'SIGINT feed updated — Source A2', timeNL: '3 uur geleden', timeEN: '3 hours ago', type: 'intel' },
];

const activityDot: Record<string, string> = {
  ai: 'bg-brand-primary', alert: 'bg-ado-red', report: 'bg-ado-blue', training: 'bg-ado-green', intel: 'bg-ado-blue',
};

// ── Live clock ───────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const hh = time.getHours().toString().padStart(2, '0');
  const mm = time.getMinutes().toString().padStart(2, '0');
  const ss = time.getSeconds().toString().padStart(2, '0');
  return (
    <span className="font-mono text-brand-text-dim text-xs tabular-nums">
      {hh}<span className="opacity-40 animate-blink">:</span>{mm}<span className="opacity-40 animate-blink">:</span>{ss}Z
    </span>
  );
}

// ── Mission row ──────────────────────────────────────────────
function MissionRow({ mission, lang, onSelect, isActive }: {
  mission: Mission; lang: 'nl' | 'en'; onSelect: (m: Mission) => void; isActive: boolean;
}) {
  return (
    <tr
      onClick={() => onSelect(mission)}
      className={clsx(
        'border-b border-brand-border/60 cursor-pointer transition-all duration-150 hover:bg-white/[0.03]',
        isActive && 'bg-brand-primary-dim',
      )}
    >
      <td className="py-3 px-4 w-14">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-brand-bg-elevated border border-brand-border font-mono text-xs font-bold text-brand-primary">
          {mission.code}
        </span>
      </td>
      <td className="py-3 px-2">
        <p className="text-brand-text-bright text-xs font-semibold truncate max-w-[200px]">{mission.name[lang]}</p>
        <p className="text-brand-text-dim text-[10px] font-mono mt-0.5 truncate max-w-[200px]">{mission.type[lang]}</p>
      </td>
      <td className="py-3 px-2 hidden md:table-cell">
        <span className="font-mono text-xs text-brand-text-bright">{mission.time}</span>
      </td>
      <td className="py-3 px-2 hidden lg:table-cell">
        <ThreatBadge level={mission.threatLevel} size="xs" />
      </td>
      <td className="py-3 px-4 text-right">
        <StatusBadge status={mission.status} size="xs" />
      </td>
    </tr>
  );
}

// ── AON sector status ────────────────────────────────────────
const aonSectors = [
  { label: 'NORTH',  status: 'ACTIVE',   color: 'text-ado-red'   },
  { label: 'EAST',   status: 'CLEAR',    color: 'text-ado-green' },
  { label: 'SOUTH',  status: 'MONITOR',  color: 'text-ado-amber' },
  { label: 'WEST',   status: 'CLEAR',    color: 'text-ado-green' },
  { label: 'AIR',    status: 'ELEVATED', color: 'text-ado-amber' },
  { label: 'CYBER',  status: 'CLEAR',    color: 'text-ado-green' },
];

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
export default function Dashboard() {
  const { lang }    = useLanguage();
  const { missions, stats, activeMission, setActiveMission } = useMissionStore();
  const { userName } = useSessionStore();
  const navigate    = useNavigate();

  const dateFormatted = new Date().toLocaleDateString(
    lang === 'nl' ? 'nl-NL' : 'en-GB',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );

  return (
    <div className="animate-fade-in space-y-6 max-w-7xl">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <StatusIndicator status="OPERATIONAL" size="xs" />
            <span className="text-brand-text-dim text-[10px] font-mono">{dateFormatted}</span>
            <span className="text-brand-text-dim/40 font-mono text-[10px]">·</span>
            <LiveClock />
          </div>
          <h1 className="text-brand-text-bright text-xl font-bold">{t('dash.title', lang)}</h1>
          <p className="text-brand-text-dim text-xs font-mono mt-0.5">
            {lang === 'nl' ? `Welkom, ${userName}` : `Welcome, ${userName}`}
          </p>
        </div>
        <Button variant="primary" size="sm" iconLeft="📋" onClick={() => navigate('/mission-brief')}>
          {lang === 'nl' ? 'Nieuwe Briefing' : 'New Briefing'}
        </Button>
      </div>

      {/* ── Stat cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t('dash.activeMissions', lang)} value={stats.activeMissions} delta="↑ 2" deltaPositive icon="🎯" />
        <StatCard label={t('dash.aiReports', lang)}     value={stats.aiReports}      delta={`↑ ${stats.aiReportsTrend}`} deltaPositive icon="🤖" />
        <StatCard label={t('dash.intelSources', lang)}  value={stats.intelSources}   delta={`↑ ${stats.intelSourcesDelta}`} deltaPositive icon="📡" />
        <StatCard label={t('dash.timeSaved', lang)}     value={stats.timeSaved}      sublabel={t('dash.perDay', lang)} icon="⏱️" />
      </div>

      {/* ── Missions + Activity ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Missions table — 2/3 */}
        <div className="lg:col-span-2 bg-brand-bg-card border border-brand-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <span className="text-base">📋</span>
              <h2 className="text-brand-text-bright text-sm font-semibold">{t('dash.todaysMissions', lang)}</h2>
              <Badge variant="operational" size="xs" dot pulse>{missions.length}</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/mission-brief')}>
              {lang === 'nl' ? 'Open Briefing →' : 'Open Briefing →'}
            </Button>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-brand-border/40">
                {['ID', lang === 'nl' ? 'Missie' : 'Mission', lang === 'nl' ? 'Tijd' : 'Time', lang === 'nl' ? 'Dreiging' : 'Threat', 'Status'].map((h, i) => (
                  <th key={h} className={clsx(
                    'py-2 px-2 text-left text-[10px] font-mono text-brand-text-dim uppercase tracking-wider',
                    i === 0 && 'px-4 w-14',
                    i === 2 && 'hidden md:table-cell',
                    i === 3 && 'hidden lg:table-cell',
                    i === 4 && 'px-4 text-right',
                  )}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {missions.map((m) => (
                <MissionRow key={m.id} mission={m} lang={lang} onSelect={setActiveMission} isActive={activeMission?.id === m.id} />
              ))}
            </tbody>
          </table>

          {/* Active mission strip */}
          {activeMission && (
            <div className="border-t border-brand-primary/20 bg-brand-primary-dim px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-brand-primary uppercase tracking-wider mb-0.5">
                  {lang === 'nl' ? '▶ Actieve selectie' : '▶ Active selection'}
                </p>
                <p className="text-brand-text-bright text-xs font-semibold truncate">{activeMission.name[lang]}</p>
                <p className="text-brand-text-dim text-[10px] font-mono">
                  DTG: {activeMission.dtg} · {activeMission.commander}
                  {activeMission.areaOfOperation && ` · ${activeMission.areaOfOperation}`}
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => navigate('/mission-brief')}>
                {lang === 'nl' ? 'Open →' : 'Open →'}
              </Button>
            </div>
          )}
        </div>

        {/* Activity feed — 1/3 */}
        <div className="bg-brand-bg-card border border-brand-border rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-brand-border">
            <span className="text-base">⚡</span>
            <h2 className="text-brand-text-bright text-sm font-semibold">{t('dash.recentActivity', lang)}</h2>
          </div>
          <div className="divide-y divide-brand-border/40">
            {activityItems.map((item) => (
              <div key={item.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                <div className="relative flex-shrink-0 mt-0.5">
                  <span className="text-sm">{item.icon}</span>
                  <span className={clsx('absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-brand-bg-card', activityDot[item.type])} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-brand-text text-[11px] leading-snug">{lang === 'nl' ? item.textNL : item.textEN}</p>
                  <p className="text-brand-text-dim text-[10px] font-mono mt-0.5">{lang === 'nl' ? item.timeNL : item.timeEN}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-brand-border">
            <button className="text-[11px] font-mono text-brand-primary hover:text-brand-primary-light transition-colors">
              {lang === 'nl' ? 'Alle activiteit bekijken →' : 'View all activity →'}
            </button>
          </div>
        </div>
      </div>

      {/* ── AON Status Bar ───────────────────────────────── */}
      <div className="bg-brand-bg-card border border-brand-border rounded-lg px-5 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <span className="text-[10px] font-mono text-brand-text-dim uppercase tracking-widest">
          {lang === 'nl' ? 'Operatiegebied' : 'Area of Operations'}
        </span>
        {aonSectors.map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-brand-text-dim">{s.label}</span>
            <span className={clsx('text-[10px] font-mono font-bold', s.color)}>{s.status}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-ado-green animate-pulse" />
          <span className="text-[10px] font-mono text-ado-green">
            {lang === 'nl' ? 'FEEDS ACTIEF' : 'FEEDS ACTIVE'}
          </span>
        </div>
      </div>

    </div>
  );
}
