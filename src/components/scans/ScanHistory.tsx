import React, { useState, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  PlayCircle,
  Eye,
  GitCompare,
  RotateCcw,
  FileText,
  Calendar,
  Clock,
  ArrowRight,
  Shield,
  Target as TargetIcon,
  X,
} from 'lucide-react';
import { Scan, ScanStatus, ScanProfile } from '../../types';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { DemoNotice } from '../common/DemoNotice';
import { useToast } from '../common/ToastContext';
import { PageId } from '../layout/Sidebar';

interface ScanHistoryProps {
  scans: Scan[];
  onNavigate: (page: PageId, id?: string) => void;
  onReRunScan: (scan: Scan) => void;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({
  scans,
  onNavigate,
  onReRunScan,
}) => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ScanStatus>('all');
  const [profileFilter, setProfileFilter] = useState<'all' | ScanProfile>('all');

  // Compare Assessments Modal state
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareScanAId, setCompareScanAId] = useState<string>(scans[0]?.id || '');
  const [compareScanBId, setCompareScanBId] = useState<string>(scans[1]?.id || scans[0]?.id || '');

  const filteredScans = useMemo(() => {
    return scans.filter((s) => {
      const matchesSearch =
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.targetDomain.toLowerCase().includes(search.toLowerCase()) ||
        (s.notes && s.notes.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesProfile = profileFilter === 'all' || s.profile === profileFilter;

      return matchesSearch && matchesStatus && matchesProfile;
    });
  }, [scans, search, statusFilter, profileFilter]);

  const scanA = scans.find((s) => s.id === compareScanAId);
  const scanB = scans.find((s) => s.id === compareScanBId);

  const handleOpenCompare = (scanId?: string) => {
    if (scanId) {
      setCompareScanAId(scanId);
      const other = scans.find((s) => s.id !== scanId);
      if (other) setCompareScanBId(other.id);
    }
    setIsCompareOpen(true);
  };

  return (
    <div className="space-y-6">
      <DemoNotice variant="card" onOpenSettings={() => onNavigate('settings')} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-main flex items-center gap-2">
            Scan History
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-accent-primary/10 text-accent-primary border border-accent-primary/30">
              {scans.length} Total Audits
            </span>
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Audit logs and assessment telemetry across historical penetration testing runs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenCompare()}
            disabled={scans.length < 2}
            leftIcon={<GitCompare className="w-4 h-4 text-accent-secondary" />}
          >
            Compare Audits
          </Button>

          <Button
            variant="primary"
            onClick={() => onNavigate('new-scan')}
            leftIcon={<PlayCircle className="w-4 h-4" />}
          >
            New Assessment
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-card p-3 rounded-xl border border-border">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Scan ID, domain, or notes..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-sidebar rounded-lg border border-border text-text-main placeholder:text-text-muted outline-none focus:border-accent-primary"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-1.5 text-xs bg-sidebar rounded-lg border border-border text-text-main outline-none focus:border-accent-primary font-mono capitalize"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="running">Running</option>
            <option value="queued">Queued</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Profile Filter */}
        <div>
          <select
            value={profileFilter}
            onChange={(e) => setProfileFilter(e.target.value as any)}
            className="w-full px-3 py-1.5 text-xs bg-sidebar rounded-lg border border-border text-text-main outline-none focus:border-accent-primary font-mono capitalize"
          >
            <option value="all">All Profiles</option>
            <option value="quick">Quick Scan</option>
            <option value="standard">Standard Scan</option>
            <option value="comprehensive">Comprehensive</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      {/* Scans Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sidebar/90 text-text-muted uppercase font-mono tracking-wider text-[11px] border-b border-border">
              <tr>
                <th className="py-3 px-4">Scan ID</th>
                <th className="py-3 px-4">Target Domain</th>
                <th className="py-3 px-4">Assessment Profile</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Findings Breakdown</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredScans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-text-muted">
                    <History className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="font-medium text-sm text-text-secondary">No assessment runs recorded</p>
                    <p className="text-xs text-text-muted mt-1">Execute a new scan to begin telemetry logging.</p>
                  </td>
                </tr>
              ) : (
                filteredScans.map((s) => (
                  <tr key={s.id} className="hover:bg-elevated/40 transition-colors">
                    {/* Scan ID */}
                    <td className="py-3.5 px-4 font-mono font-semibold text-accent-primary">
                      {s.id}
                    </td>

                    {/* Target */}
                    <td className="py-3.5 px-4 font-medium text-text-main">
                      <div className="flex items-center gap-2">
                        <TargetIcon className="w-3.5 h-3.5 text-accent-secondary shrink-0" />
                        <span className="font-mono">{s.targetDomain}</span>
                      </div>
                    </td>

                    {/* Profile */}
                    <td className="py-3.5 px-4 capitalize font-mono text-text-secondary">
                      {s.profile}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-text-muted">
                      {s.startedAt}
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 font-mono text-text-muted">
                      {s.duration}
                    </td>

                    {/* Findings Breakdown */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        {s.findingsCount.critical > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800" title="Critical Findings">
                            {s.findingsCount.critical}C
                          </span>
                        )}
                        {s.findingsCount.high > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800" title="High Findings">
                            {s.findingsCount.high}H
                          </span>
                        )}
                        {s.findingsCount.medium > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-800" title="Medium Findings">
                            {s.findingsCount.medium}M
                          </span>
                        )}
                        {s.findingsCount.low > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800" title="Low Findings">
                            {s.findingsCount.low}L
                          </span>
                        )}
                        {s.findingsCount.total === 0 && (
                          <span className="text-emerald-400 font-sans">0 Findings</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={s.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onNavigate('scan-details', s.id)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Details
                        </Button>

                        <button
                          onClick={() => handleOpenCompare(s.id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-accent-secondary hover:bg-elevated border border-border"
                          title="Compare with another audit"
                        >
                          <GitCompare className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            onReRunScan(s);
                            toast({
                              type: 'info',
                              title: 'Re-running Assessment',
                              message: `Initiating ${s.profile} scan on ${s.targetDomain}`,
                            });
                          }}
                          className="p-1.5 rounded-lg text-text-muted hover:text-accent-primary hover:bg-elevated border border-border"
                          title="Re-run assessment"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compare Assessments Modal */}
      {isCompareOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCompareOpen(false)}
          title="Compare Assessment Audits"
          subtitle="Analyze security regression or remediation progress between two scan points."
          maxWidth="2xl"
          icon={<GitCompare className="w-5 h-5 text-accent-secondary" />}
        >
          <div className="space-y-4 text-xs">
            {/* Scan pickers */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-text-main mb-1.5">
                  Baseline Audit (A)
                </label>
                <select
                  value={compareScanAId}
                  onChange={(e) => setCompareScanAId(e.target.value)}
                  className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-text-main font-mono text-xs outline-none"
                >
                  {scans.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id} — {s.targetDomain} ({s.startedAt})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1.5">
                  Comparison Audit (B)
                </label>
                <select
                  value={compareScanBId}
                  onChange={(e) => setCompareScanBId(e.target.value)}
                  className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-text-main font-mono text-xs outline-none"
                >
                  {scans.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id} — {s.targetDomain} ({s.startedAt})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Table */}
            {scanA && scanB && (
              <div className="p-4 rounded-xl border border-border bg-sidebar/60 space-y-3">
                <table className="w-full text-left font-mono">
                  <thead>
                    <tr className="border-b border-border text-[11px] text-text-muted">
                      <th className="pb-2">Metric</th>
                      <th className="pb-2 text-center text-blue-300">Baseline ({scanA.id})</th>
                      <th className="pb-2 text-center text-emerald-300">Comparison ({scanB.id})</th>
                      <th className="pb-2 text-right">Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 text-xs">
                    <tr>
                      <td className="py-2 text-text-secondary">Security Score</td>
                      <td className="py-2 text-center font-bold">{scanA.securityScore}/100</td>
                      <td className="py-2 text-center font-bold">{scanB.securityScore}/100</td>
                      <td className="py-2 text-right">
                        {scanB.securityScore >= scanA.securityScore ? (
                          <span className="text-emerald-400">+{scanB.securityScore - scanA.securityScore}</span>
                        ) : (
                          <span className="text-red-400">-{scanA.securityScore - scanB.securityScore}</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-text-secondary">Critical Findings</td>
                      <td className="py-2 text-center">{scanA.findingsCount.critical}</td>
                      <td className="py-2 text-center">{scanB.findingsCount.critical}</td>
                      <td className="py-2 text-right">
                        {scanB.findingsCount.critical - scanA.findingsCount.critical <= 0 ? (
                          <span className="text-emerald-400">
                            {scanB.findingsCount.critical - scanA.findingsCount.critical}
                          </span>
                        ) : (
                          <span className="text-red-400">
                            +{scanB.findingsCount.critical - scanA.findingsCount.critical}
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-text-secondary">Total Open Findings</td>
                      <td className="py-2 text-center">{scanA.findingsCount.total}</td>
                      <td className="py-2 text-center">{scanB.findingsCount.total}</td>
                      <td className="py-2 text-right">
                        {scanB.findingsCount.total - scanA.findingsCount.total <= 0 ? (
                          <span className="text-emerald-400">
                            {scanB.findingsCount.total - scanA.findingsCount.total}
                          </span>
                        ) : (
                          <span className="text-amber-400">
                            +{scanB.findingsCount.total - scanA.findingsCount.total}
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-text-secondary">Execution Duration</td>
                      <td className="py-2 text-center">{scanA.duration}</td>
                      <td className="py-2 text-center">{scanB.duration}</td>
                      <td className="py-2 text-right text-text-muted">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-border">
              <Button variant="ghost" onClick={() => setIsCompareOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
