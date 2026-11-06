import React, { useState } from 'react';
import {
  Shield,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Download,
  GitCompare,
  ArrowLeft,
  RotateCcw,
  ExternalLink,
  Target as TargetIcon,
  Server,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Scan, Finding, FindingCategory } from '../../types';
import { Button } from '../common/Button';
import { StatusBadge, SeverityBadge, FindingStatusBadge } from '../common/Badge';
import { ScoreGauge } from '../common/ScoreGauge';
import { DemoNotice } from '../common/DemoNotice';
import { PageId } from '../layout/Sidebar';
import { useToast } from '../common/ToastContext';

interface ScanDetailsProps {
  scan: Scan;
  findings: Finding[];
  onNavigate: (page: PageId, id?: string) => void;
  onGenerateReport: (scanId: string) => Promise<void>;
  onReRunScan: (scan: Scan) => void;
}

export const ScanDetails: React.FC<ScanDetailsProps> = ({
  scan,
  findings,
  onNavigate,
  onGenerateReport,
  onReRunScan,
}) => {
  const { toast } = useToast();
  const [activeCategoryTab, setActiveCategoryTab] = useState<'all' | FindingCategory>('all');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Filter findings for this scan
  const scanFindings = findings.filter((f) => f.scanId === scan.id || f.targetId === scan.targetId);

  const filteredCategoryFindings = activeCategoryTab === 'all'
    ? scanFindings
    : scanFindings.filter((f) => f.category === activeCategoryTab);

  const categoryCounts: Record<FindingCategory, number> = {
    ssl_tls: scanFindings.filter((f) => f.category === 'ssl_tls').length,
    http_headers: scanFindings.filter((f) => f.category === 'http_headers').length,
    cookies: scanFindings.filter((f) => f.category === 'cookies').length,
    dns: scanFindings.filter((f) => f.category === 'dns').length,
    network: scanFindings.filter((f) => f.category === 'network').length,
    web_application: scanFindings.filter((f) => f.category === 'web_application').length,
  };

  const handleDownloadReport = async () => {
    setIsGeneratingPdf(true);
    try {
      await onGenerateReport(scan.id);
      setIsGeneratingPdf(false);
      toast({
        type: 'success',
        title: 'Report Dossier Ready',
        message: `Security report generated for ${scan.targetDomain}. Opening Reports view.`,
      });
      onNavigate('reports');
    } catch {
      setIsGeneratingPdf(false);
      toast({ type: 'error', title: 'Failed to generate report' });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <DemoNotice variant="card" onOpenSettings={() => onNavigate('settings')} />

      {/* Top Navigation Back Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('scan-history')}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-main transition-colors font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Scan History
        </button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onReRunScan(scan)}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Re-run Assessment
          </Button>

          <Button
            size="sm"
            variant="primary"
            isLoading={isGeneratingPdf}
            onClick={handleDownloadReport}
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Download Report Dossier
          </Button>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-subtle">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-bold text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded border border-accent-primary/30">
                {scan.id}
              </span>
              <StatusBadge status={scan.status} />
              <DemoNotice variant="inline" />
            </div>
            <h2 className="text-xl font-extrabold text-text-main mt-2 font-mono flex items-center gap-2">
              <TargetIcon className="w-5 h-5 text-accent-secondary shrink-0" />
              {scan.targetDomain}
            </h2>
            <p className="text-xs text-text-secondary mt-1">{scan.notes || 'Full perimeter assessment'}</p>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs text-text-muted border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0 md:pl-6">
            <div>
              <span className="text-[10px] text-text-muted uppercase block">Profile</span>
              <span className="text-text-main capitalize font-semibold">{scan.profile}</span>
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase block">Started At</span>
              <span className="text-text-main">{scan.startedAt}</span>
            </div>
            <div>
              <span className="text-[10px] text-text-muted uppercase block">Duration</span>
              <span className="text-text-main">{scan.duration}</span>
            </div>
          </div>
        </div>

        {/* A. Security Score & B. Vulnerability Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5">
          {/* A. Score Gauge */}
          <div className="bg-sidebar/80 border border-border rounded-xl p-5 flex flex-col items-center justify-center">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-text-muted mb-2">
              Composite Security Score
            </span>
            <ScoreGauge score={scan.securityScore || 72} size={170} />
          </div>

          {/* B. Vulnerability Summary metric cards (2 cols) */}
          <div className="lg:col-span-2 flex flex-col justify-between space-y-3">
            <div>
              <h3 className="text-xs font-mono font-semibold text-text-muted uppercase tracking-wider mb-2">
                Discovered Findings Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {/* Critical */}
                <div className="bg-red-950/30 border border-red-900/60 rounded-xl p-3 text-center">
                  <span className="text-[10px] uppercase font-mono font-bold text-red-400">
                    Critical
                  </span>
                  <div className="text-2xl font-extrabold font-mono text-red-400 mt-1">
                    {scan.findingsCount.critical}
                  </div>
                  <span className="text-[10px] text-red-300/70">Severity 9.0+</span>
                </div>

                {/* High */}
                <div className="bg-orange-950/30 border border-orange-900/60 rounded-xl p-3 text-center">
                  <span className="text-[10px] uppercase font-mono font-bold text-orange-400">
                    High
                  </span>
                  <div className="text-2xl font-extrabold font-mono text-orange-400 mt-1">
                    {scan.findingsCount.high}
                  </div>
                  <span className="text-[10px] text-orange-300/70">Severity 7.0-8.9</span>
                </div>

                {/* Medium */}
                <div className="bg-yellow-950/30 border border-yellow-900/60 rounded-xl p-3 text-center">
                  <span className="text-[10px] uppercase font-mono font-bold text-yellow-400">
                    Medium
                  </span>
                  <div className="text-2xl font-extrabold font-mono text-yellow-400 mt-1">
                    {scan.findingsCount.medium}
                  </div>
                  <span className="text-[10px] text-yellow-300/70">Severity 4.0-6.9</span>
                </div>

                {/* Low */}
                <div className="bg-blue-950/30 border border-blue-900/60 rounded-xl p-3 text-center">
                  <span className="text-[10px] uppercase font-mono font-bold text-blue-400">
                    Low
                  </span>
                  <div className="text-2xl font-extrabold font-mono text-blue-400 mt-1">
                    {scan.findingsCount.low}
                  </div>
                  <span className="text-[10px] text-blue-300/70">Severity 0.1-3.9</span>
                </div>

                {/* Informational */}
                <div className="bg-slate-900 border border-border rounded-xl p-3 text-center">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                    Info
                  </span>
                  <div className="text-2xl font-extrabold font-mono text-slate-300 mt-1">
                    {scan.findingsCount.info}
                  </div>
                  <span className="text-[10px] text-text-muted">Observation</span>
                </div>
              </div>
            </div>

            {/* Quick triage callout */}
            <div className="p-3 rounded-lg bg-card border border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-text-secondary">
                  Found <strong className="text-text-main font-mono">{scan.findingsCount.total}</strong> total findings requiring validation.
                </span>
              </div>
              <button
                onClick={() => onNavigate('vulnerabilities')}
                className="text-accent-primary hover:underline font-mono text-xs flex items-center gap-1"
              >
                Open Finding Tracker <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* C. Scan Execution Progress & Module Timelines */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent-primary" />
            <h3 className="text-sm font-semibold text-text-main">
              Scan Execution Timeline & Module Telemetry
            </h3>
          </div>
          <span className="text-[11px] font-mono text-text-muted">
            All modules executed in non-destructive sandbox
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {scan.moduleStatuses.map((m) => (
            <div
              key={m.id}
              className="p-3 rounded-xl border border-border bg-sidebar/50 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-main">{m.name}</span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-900/50">
                    <CheckCircle2 className="w-2.5 h-2.5" /> {m.status}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary mt-1 leading-normal">
                  {m.description}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between text-[10px] font-mono text-text-muted">
                <span>Duration: {m.duration || '30s'}</span>
                <span className={m.findingsCount > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                  {m.findingsCount} findings logged
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* D. Assessment Results Grouped By Category */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border gap-2">
          <div>
            <h3 className="text-sm font-semibold text-text-main">
              Detailed Assessment Results
            </h3>
            <p className="text-xs text-text-secondary">
              Confirmed vulnerabilities, configuration findings, and informational observations
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: `All (${scanFindings.length})` },
              { id: 'web_application', label: `Web App (${categoryCounts.web_application})` },
              { id: 'ssl_tls', label: `SSL/TLS (${categoryCounts.ssl_tls})` },
              { id: 'http_headers', label: `Headers (${categoryCounts.http_headers})` },
              { id: 'cookies', label: `Cookies (${categoryCounts.cookies})` },
              { id: 'dns', label: `DNS (${categoryCounts.dns})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategoryTab(tab.id as any)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium whitespace-nowrap transition-all ${
                  activeCategoryTab === tab.id
                    ? 'bg-elevated text-accent-primary border border-border shadow-sm'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Findings List in Scan */}
        {filteredCategoryFindings.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-medium text-text-main">No findings recorded in this category</p>
            <p className="text-text-muted mt-0.5">Target passed baseline evaluation parameters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCategoryFindings.map((finding) => (
              <div
                key={finding.id}
                onClick={() => onNavigate('vulnerabilities', finding.id)}
                className="p-4 rounded-xl border border-border bg-sidebar hover:border-slate-500 cursor-pointer transition-all space-y-2 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-accent-primary">
                      {finding.id}
                    </span>
                    <SeverityBadge severity={finding.severity} />
                    <FindingStatusBadge status={finding.status} />
                    {finding.cweId && (
                      <span className="font-mono text-[10px] text-text-muted bg-elevated px-1.5 py-0.2 rounded border border-border">
                        {finding.cweId}
                      </span>
                    )}
                    {finding.cvssScore && (
                      <span className="font-mono text-[10px] text-text-muted">
                        CVSS {finding.cvssScore}
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] font-mono text-accent-primary group-hover:underline flex items-center gap-1">
                    Inspect Technical Evidence <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-text-main group-hover:text-emerald-300 transition-colors">
                    {finding.name}
                  </h4>
                  <p className="text-xs text-text-secondary mt-1 leading-normal line-clamp-2">
                    {finding.description}
                  </p>
                </div>

                {finding.affectedUrl && (
                  <div className="pt-2 border-t border-border/60 flex items-center gap-2 text-[11px] font-mono text-text-muted truncate">
                    <span className="text-slate-400 font-semibold">Scope URL:</span>
                    <span className="text-text-secondary truncate">{finding.affectedUrl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
