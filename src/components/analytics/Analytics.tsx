import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Shield,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Target as TargetIcon,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
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
import { DemoNotice } from '../common/DemoNotice';
import { PageId } from '../layout/Sidebar';

interface AnalyticsProps {
  targets: Target[];
  scans: Scan[];
  findings: Finding[];
  onNavigate: (page: PageId, id?: string) => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({
  targets,
  scans,
  findings,
  onNavigate,
}) => {
  const [range, setRange] = useState<'30d' | '90d' | '1y'>('90d');

  // Trend data over months
  const trendData = [
    { period: 'Jul', critical: 1, high: 2, medium: 4, low: 3 },
    { period: 'Aug', critical: 2, high: 3, medium: 5, low: 4 },
    { period: 'Sep', critical: 1, high: 2, medium: 6, low: 5 },
    { period: 'Oct', critical: 2, high: 4, medium: 7, low: 6 },
    { period: 'Nov', critical: 1, high: 2, medium: 3, low: 3 },
  ];

  // Category frequency
  const categoryData = [
    { name: 'HTTP Headers', count: findings.filter((f) => f.category === 'http_headers').length },
    { name: 'SSL / TLS', count: findings.filter((f) => f.category === 'ssl_tls').length },
    { name: 'Web App', count: findings.filter((f) => f.category === 'web_application').length },
    { name: 'Cookies', count: findings.filter((f) => f.category === 'cookies').length },
    { name: 'DNS Records', count: findings.filter((f) => f.category === 'dns').length },
    { name: 'Network Port', count: findings.filter((f) => f.category === 'network').length },
  ];

  // Target security posture comparison
  const targetScores = targets.map((t) => {
    // Find latest scan score or compute based on risk
    const targetScans = scans.filter((s) => s.targetId === t.id);
    const score = targetScans.length > 0 ? targetScans[0].securityScore : t.riskLevel === 'low' ? 91 : t.riskLevel === 'medium' ? 82 : t.riskLevel === 'high' ? 68 : 50;
    return {
      domain: t.domain.split('.')[0] + '...',
      fullName: t.domain,
      score,
      risk: t.riskLevel,
    };
  });

  // Remediation status breakdown
  const statusCounts = {
    open: findings.filter((f) => f.status === 'open').length,
    in_progress: findings.filter((f) => f.status === 'in_progress').length,
    fixed: findings.filter((f) => f.status === 'fixed').length,
    accepted: findings.filter((f) => f.status === 'accepted_risk').length,
  };

  const statusPieData = [
    { name: 'Open (Unresolved)', value: statusCounts.open, color: '#EF4444' },
    { name: 'In Progress (Patching)', value: statusCounts.in_progress, color: '#F59E0B' },
    { name: 'Fixed (Verified)', value: statusCounts.fixed, color: '#22C55E' },
    { name: 'Accepted Risk', value: statusCounts.accepted, color: '#64748B' },
  ].filter((p) => p.value > 0);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <DemoNotice variant="card" onOpenSettings={() => onNavigate('settings')} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-main flex items-center gap-2">
            Security Analytics
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-accent-primary/10 text-accent-primary border border-accent-primary/30">
              Posture Intelligence
            </span>
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Holistic vulnerability telemetry, remediation velocity, and asset security benchmarks.
          </p>
        </div>

        {/* Time filters */}
        <div className="flex items-center p-1 rounded-lg bg-card border border-border">
          {(['30d', '90d', '1y'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-all ${
                range === r
                  ? 'bg-elevated text-accent-primary border border-border shadow-sm'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              Last {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <span className="text-[11px] font-mono uppercase text-text-muted">Mean Time To Triage (MTTT)</span>
          <div className="text-2xl font-bold font-mono text-text-main mt-1.5">3.4 hrs</div>
          <p className="text-[11px] text-emerald-400 mt-1">↓ 18% improvement vs last quarter</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <span className="text-[11px] font-mono uppercase text-text-muted">Remediation Rate</span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1.5">
            {Math.round((statusCounts.fixed / (findings.length || 1)) * 100)}%
          </div>
          <p className="text-[11px] text-text-secondary mt-1">
            {statusCounts.fixed} of {findings.length} findings resolved
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <span className="text-[11px] font-mono uppercase text-text-muted">Average Security Score</span>
          <div className="text-2xl font-bold font-mono text-blue-400 mt-1.5">78 / 100</div>
          <p className="text-[11px] text-text-secondary mt-1">Moderate enterprise posture</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <span className="text-[11px] font-mono uppercase text-text-muted">High/Critical Exposure</span>
          <div className="text-2xl font-bold font-mono text-red-400 mt-1.5">
            {findings.filter((f) => (f.severity === 'critical' || f.severity === 'high') && f.status === 'open').length}
          </div>
          <p className="text-[11px] text-red-300 mt-1">Active items requiring remediation</p>
        </div>
      </div>

      {/* Row 1: Vulnerability Trends Area Chart & Remediation Progress Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vulnerability Trends */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="pb-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text-main">
              Vulnerability Influx & Severity Trends
            </h3>
            <p className="text-xs text-text-secondary">
              Discovered findings categorized over time periods
            </p>
          </div>

          <div className="h-64 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="period" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121722',
                    border: '1px solid #252D3B',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="critical" name="Critical" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                <Area type="monotone" dataKey="high" name="High" stackId="1" stroke="#F97316" fill="#F97316" fillOpacity={0.6} />
                <Area type="monotone" dataKey="medium" name="Medium" stackId="1" stroke="#EAB308" fill="#EAB308" fillOpacity={0.6} />
                <Area type="monotone" dataKey="low" name="Low" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Remediation Progress */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-border">
              <h3 className="text-sm font-semibold text-text-main">
                Remediation Progress
              </h3>
              <p className="text-xs text-text-secondary">
                Tracking lifecycle status of logged findings
              </p>
            </div>

            <div className="h-48 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
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
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-border text-xs">
            {statusPieData.map((s) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-text-secondary text-[11px]">{s.name}</span>
                </div>
                <span className="font-mono font-bold text-text-main">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Most Frequent Categories & Target Posture Benchmark */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Frequent Categories */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="pb-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text-main">
              Most Frequently Detected Weakness Categories
            </h3>
            <p className="text-xs text-text-secondary">
              Prevalence of misconfigurations across scanned targets
            </p>
          </div>

          <div className="h-56 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} width={90} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121722',
                    border: '1px solid #252D3B',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Findings Count" fill="#3B82F6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Target Security Comparison */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="pb-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text-main">
              Target Posture Comparison (Score / 100)
            </h3>
            <p className="text-xs text-text-secondary">
              Comparative security benchmarks across registered environments
            </p>
          </div>

          <div className="h-56 mt-4 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={targetScores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="domain" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121722',
                    border: '1px solid #252D3B',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any, name: any, item: any) => [
                    `${value}/100`,
                    item.payload.fullName,
                  ]}
                />
                <Bar dataKey="score" name="Security Score" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
