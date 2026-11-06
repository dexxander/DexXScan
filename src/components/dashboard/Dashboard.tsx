import React, { useState } from 'react';
import {
  Target as TargetIcon,
  PlayCircle,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Clock,
  CheckCircle,
  AlertOctagon,
  Eye,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Target, Scan, Finding } from '../../types';
import { PageId } from '../layout/Sidebar';
import { Button } from '../common/Button';
import { SeverityBadge, StatusBadge, VerificationBadge, RiskBadge } from '../common/Badge';
import { DemoNotice } from '../common/DemoNotice';

interface DashboardProps {
  targets: Target[];
  scans: Scan[];
  findings: Finding[];
  onNavigate: (page: PageId, id?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  targets,
  scans,
  findings,
  onNavigate,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Summary Metrics
  const totalTargets = targets.length;
  const totalScans = scans.length;
  const criticalFindings = findings.filter((f) => f.severity === 'critical' && f.status === 'open').length;
  const openFindings = findings.filter((f) => f.status === 'open' || f.status === 'in_progress').length;

  // Severity counts for Donut Chart
  const severityCounts = {
    critical: findings.filter((f) => f.severity === 'critical').length,
    high: findings.filter((f) => f.severity === 'high').length,
    medium: findings.filter((f) => f.severity === 'medium').length,
    low: findings.filter((f) => f.severity === 'low').length,
    informational: findings.filter((f) => f.severity === 'informational').length,
  };

  const donutData = [
    { name: 'Critical', value: severityCounts.critical, color: '#EF4444' },
    { name: 'High', value: severityCounts.high, color: '#F97316' },
    { name: 'Medium', value: severityCounts.medium, color: '#EAB308' },
    { name: 'Low', value: severityCounts.low, color: '#3B82F6' },
    { name: 'Informational', value: severityCounts.informational, color: '#64748B' },
  ].filter((d) => d.value > 0);

  // Activity chart time ranges data
  const activityDataMap = {
    '7d': [
      { date: 'Oct 29', scans: 2, findingsDetected: 1 },
      { date: 'Oct 30', scans: 1, findingsDetected: 0 },
      { date: 'Oct 31', scans: 3, findingsDetected: 2 },
      { date: 'Nov 01', scans: 2, findingsDetected: 1 },
      { date: 'Nov 02', scans: 4, findingsDetected: 3 },
      { date: 'Nov 03', scans: 3, findingsDetected: 2 },
      { date: 'Nov 04', scans: 5, findingsDetected: 4 },
    ],
    '30d': [
      { date: 'Wk 1', scans: 6, findingsDetected: 4 },
      { date: 'Wk 2', scans: 9, findingsDetected: 7 },
      { date: 'Wk 3', scans: 14, findingsDetected: 10 },
      { date: 'Wk 4', scans: 18, findingsDetected: 12 },
    ],
    '90d': [
      { date: 'Sep', scans: 24, findingsDetected: 18 },
      { date: 'Oct', scans: 38, findingsDetected: 29 },
      { date: 'Nov', scans: 22, findingsDetected: 16 },
    ],
  };

  const activityData = activityDataMap[timeRange];

  // Critical & High priority findings list
  const priorityFindings = findings
    .filter((f) => f.severity === 'critical' || f.severity === 'high')
    .slice(0, 4);

  // Recent 5 scans
  const recentScans = scans.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Demonstration Data Banner */}
      <DemoNotice variant="card" onOpenSettings={() => onNavigate('settings')} />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-text-main">
              Security Overview
            </h2>
            <DemoNotice variant="inline" />
          </div>
          <p className="text-sm text-text-secondary mt-0.5">
            Monitor your website security assessments and vulnerabilities across verified domains.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => onNavigate('new-scan')}
          leftIcon={<PlayCircle className="w-4 h-4" />}
        >
          + New Assessment
        </Button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Targets */}
        <div className="bg-card border border-border rounded-xl p-5 hover:border-border-hover transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-text-muted uppercase tracking-wider">
              Total Targets
            </span>
            <div className="p-2.5 rounded-lg bg-blue-950/40 text-accent-secondary border border-blue-900/40">
              <TargetIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-text-main">
              {totalTargets}
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +2 this month
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            {targets.filter((t) => t.verificationStatus === 'verified').length} verified, {targets.filter((t) => t.verificationStatus === 'pending').length} pending validation
          </p>
        </div>

        {/* Card 2: Total Scans */}
        <div className="bg-card border border-border rounded-xl p-5 hover:border-border-hover transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-text-muted uppercase tracking-wider">
              Total Scans
            </span>
            <div className="p-2.5 rounded-lg bg-emerald-950/40 text-accent-primary border border-emerald-900/40">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-text-main">
              {totalScans}
            </span>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +4 this week
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Simulated audits across 6 security modules
          </p>
        </div>

        {/* Card 3: Critical Vulnerabilities */}
        <div className="bg-card border border-border rounded-xl p-5 hover:border-red-900/60 transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-red-400 uppercase tracking-wider">
              Critical Findings
            </span>
            <div className="p-2.5 rounded-lg bg-red-950/40 text-red-400 border border-red-900/40">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-red-400">
              {criticalFindings}
            </span>
            <span className="text-xs text-red-300 font-medium px-1.5 py-0.5 rounded bg-red-950/70 border border-red-900">
              Immediate Action
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Requires priority triage & remediation
          </p>
        </div>

        {/* Card 4: Open Findings */}
        <div className="bg-card border border-border rounded-xl p-5 hover:border-border-hover transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-text-muted uppercase tracking-wider">
              Open Findings
            </span>
            <div className="p-2.5 rounded-lg bg-yellow-950/40 text-yellow-400 border border-yellow-900/40">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-text-main">
              {openFindings}
            </span>
            <span className="text-xs text-text-muted font-medium">
              / {findings.length} total logged
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            {findings.filter((f) => f.status === 'fixed').length} confirmed resolved
          </p>
        </div>
      </div>

      {/* Main Charts Grid: A. Activity & B. Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* A. Security Assessment Activity (Line Chart, 2 cols) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-2">
            <div>
              <h3 className="text-sm font-semibold text-text-main">
                Security Assessment Activity
              </h3>
              <p className="text-xs text-text-secondary">
                Scan volume and discovered finding frequency over time
              </p>
            </div>

            {/* Time range selector */}
            <div className="flex items-center p-0.5 rounded-lg bg-elevated border border-border">
              {(['7d', '30d', '90d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                    timeRange === r
                      ? 'bg-card text-accent-primary shadow-sm border border-border'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {r.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#252D3B' }}
                />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#252D3B' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121722',
                    border: '1px solid #252D3B',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#F1F5F9',
                  }}
                  itemStyle={{ color: '#F1F5F9' }}
                />
                <Line
                  type="monotone"
                  dataKey="scans"
                  name="Scans Run"
                  stroke="#22C55E"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#22C55E' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="findingsDetected"
                  name="Findings Logged"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* B. Vulnerability Distribution (Donut Chart, 1 col) */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-border">
              <h3 className="text-sm font-semibold text-text-main">
                Vulnerability Distribution
              </h3>
              <p className="text-xs text-text-secondary">
                Breakdown by severity classification
              </p>
            </div>

            <div className="h-52 w-full mt-2 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#121722" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#121722',
                      border: '1px solid #252D3B',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold font-mono text-white">
                  {findings.length}
                </span>
                <span className="text-[10px] uppercase font-mono text-text-muted">
                  TOTAL
                </span>
              </div>
            </div>
          </div>

          {/* Severity legends */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center justify-between p-1.5 rounded bg-elevated/40">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-text-secondary text-[11px]">{d.name}</span>
                </div>
                <span className="font-mono font-semibold text-text-main">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* C. Recent Scans Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-text-main">Recent Assessments</h3>
            <p className="text-xs text-text-secondary">
              Latest security scan jobs executed on registered targets
            </p>
          </div>
          <button
            onClick={() => onNavigate('scan-history')}
            className="text-xs text-accent-primary hover:text-emerald-300 font-medium flex items-center gap-1"
          >
            View All Scans <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sidebar/80 text-text-muted uppercase font-mono tracking-wider text-[11px] border-b border-border">
              <tr>
                <th className="py-3 px-4">Target Domain</th>
                <th className="py-3 px-4">Scan Type</th>
                <th className="py-3 px-4">Started At</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Findings Summary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {recentScans.map((s) => (
                <tr key={s.id} className="hover:bg-elevated/40 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-text-main">
                    <div className="flex items-center gap-2">
                      <TargetIcon className="w-3.5 h-3.5 text-accent-secondary shrink-0" />
                      <span className="font-mono text-sm">{s.targetDomain}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 capitalize font-mono text-text-secondary">
                    {s.profile}
                  </td>
                  <td className="py-3.5 px-4 text-text-muted font-mono">{s.startedAt}</td>
                  <td className="py-3.5 px-4 text-text-muted font-mono">{s.duration}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      {s.findingsCount.critical > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                          {s.findingsCount.critical}C
                        </span>
                      )}
                      {s.findingsCount.high > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800">
                          {s.findingsCount.high}H
                        </span>
                      )}
                      {s.findingsCount.medium > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-800">
                          {s.findingsCount.medium}M
                        </span>
                      )}
                      {s.findingsCount.low > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                          {s.findingsCount.low}L
                        </span>
                      )}
                      {s.findingsCount.total === 0 && (
                        <span className="text-emerald-400">Clean (0)</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onNavigate('scan-details', s.id)}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* D. Critical Findings & E. Registered Targets 2-Col layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* D. Critical Findings */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-semibold text-text-main">
                  Critical & High Priority Findings
                </h3>
              </div>
              <button
                onClick={() => onNavigate('vulnerabilities')}
                className="text-xs text-accent-primary hover:underline font-mono"
              >
                Triage All
              </button>
            </div>

            <div className="divide-y divide-border/60 mt-2">
              {priorityFindings.map((f) => (
                <div
                  key={f.id}
                  onClick={() => onNavigate('vulnerabilities', f.id)}
                  className="py-3 flex items-start justify-between gap-3 hover:bg-elevated/30 p-2 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={f.severity} />
                      {f.cweId && (
                        <span className="text-[10px] font-mono text-text-muted">
                          {f.cweId}
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-text-muted">
                        CVSS {f.cvssScore}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-text-main mt-1 truncate">
                      {f.name}
                    </p>
                    <p className="text-[11px] text-text-secondary truncate mt-0.5">
                      {f.targetDomain}
                    </p>
                  </div>
                  <Eye className="w-4 h-4 text-text-muted hover:text-text-main shrink-0 mt-1" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* E. Registered Targets Snapshot */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <TargetIcon className="w-4 h-4 text-accent-secondary" />
                <h3 className="text-sm font-semibold text-text-main">
                  Registered Target Assets
                </h3>
              </div>
              <button
                onClick={() => onNavigate('targets')}
                className="text-xs text-accent-primary hover:underline font-mono"
              >
                Manage Targets
              </button>
            </div>

            <div className="divide-y divide-border/60 mt-2">
              {targets.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-elevated/30 p-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-text-main font-mono truncate">
                        {t.domain}
                      </span>
                      <VerificationBadge status={t.verificationStatus} />
                    </div>
                    <p className="text-[11px] text-text-muted mt-0.5 truncate max-w-xs">
                      {t.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <RiskBadge risk={t.riskLevel} />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onNavigate('new-scan', t.id)}
                      disabled={t.verificationStatus !== 'verified'}
                    >
                      Audit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
