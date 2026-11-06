import React, { useState, useMemo } from 'react';
import {
  Target as TargetIcon,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  PlayCircle,
  ShieldAlert,
  Copy,
  ExternalLink,
  FileCode,
  Globe,
  Info,
  History,
} from 'lucide-react';
import { Target, VerificationStatus, RiskLevel } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { VerificationBadge, RiskBadge } from '../common/Badge';
import { useToast } from '../common/ToastContext';
import { PageId } from '../layout/Sidebar';
import { DemoNotice } from '../common/DemoNotice';

interface TargetListProps {
  targets: Target[];
  onAddTarget: (data: { domain: string; description: string; isAuthorized: boolean; verificationMethod: 'dns_txt' | 'http_file' }) => Promise<void>;
  onDeleteTarget: (id: string) => Promise<void>;
  onVerifyTarget: (id: string) => Promise<void>;
  onNavigate: (page: PageId, id?: string) => void;
}

export const TargetList: React.FC<TargetListProps> = ({
  targets,
  onAddTarget,
  onDeleteTarget,
  onVerifyTarget,
  onNavigate,
}) => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | VerificationStatus>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVerifyTarget, setSelectedVerifyTarget] = useState<Target | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // New Target Form State
  const [newUrl, setNewUrl] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newMethod, setNewMethod] = useState<'dns_txt' | 'http_file'>('dns_txt');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtering
  const filteredTargets = useMemo(() => {
    return targets.filter((t) => {
      const matchesSearch =
        t.domain.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || t.verificationStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [targets, search, statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) {
      toast({ type: 'warning', title: 'URL is required' });
      return;
    }
    if (!isAuthorized) {
      toast({
        type: 'error',
        title: 'Authorization Required',
        message: 'You must confirm legal authorization to assess this target.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddTarget({
        domain: newUrl,
        description: newDesc,
        isAuthorized,
        verificationMethod: newMethod,
      });
      toast({
        type: 'success',
        title: 'Target Registered',
        message: `${newUrl} registered. Complete ownership verification before initiating scans.`,
      });
      setIsAddModalOpen(false);
      setNewUrl('');
      setNewDesc('');
      setIsAuthorized(false);
    } catch (err) {
      toast({ type: 'error', title: 'Failed to create target' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunVerificationCheck = async (target: Target) => {
    setIsVerifying(true);
    // Simulate DNS / HTTP challenge resolution check
    setTimeout(async () => {
      try {
        await onVerifyTarget(target.id);
        setIsVerifying(false);
        setSelectedVerifyTarget(null);
        toast({
          type: 'success',
          title: 'Target Verified Successfully',
          message: `${target.domain} ownership confirmed via ${target.verificationMethod?.toUpperCase() || 'DNS TXT'}. Scans are now authorized.`,
        });
      } catch {
        setIsVerifying(false);
        toast({ type: 'error', title: 'Verification Check Failed' });
      }
    }, 1500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ type: 'info', title: `${label} copied to clipboard` });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <DemoNotice variant="card" onOpenSettings={() => onNavigate('settings')} />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-main">
            Registered Targets
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Manage authorized domains and DNS ownership verification tokens for assessment scope.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Target
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter targets by domain, tag, or description..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-sidebar rounded-lg border border-border text-text-main placeholder:text-text-muted outline-none focus:border-accent-primary transition-colors"
          />
        </div>

        {/* Verification Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-sidebar p-1 rounded-lg border border-border">
          {(['all', 'verified', 'pending', 'unverified'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md text-xs font-mono font-medium capitalize transition-all ${
                statusFilter === st
                  ? 'bg-elevated text-accent-primary border border-border shadow-sm'
                  : 'text-text-muted hover:text-text-main'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Targets Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sidebar/90 text-text-muted uppercase font-mono tracking-wider text-[11px] border-b border-border">
              <tr>
                <th className="py-3 px-4">Domain / Asset</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4">Last Assessment</th>
                <th className="py-3 px-4 text-center">Total Scans</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTargets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    <TargetIcon className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="font-medium text-sm text-text-secondary">No matching targets found</p>
                    <p className="text-xs text-text-muted mt-1">Register a new authorized web target to begin.</p>
                  </td>
                </tr>
              ) : (
                filteredTargets.map((t) => (
                  <tr key={t.id} className="hover:bg-elevated/40 transition-colors">
                    {/* Domain & Description */}
                    <td className="py-4 px-4 font-medium text-text-main">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-lg bg-sidebar border border-border text-accent-secondary mt-0.5">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-text-main hover:text-accent-primary cursor-pointer transition-colors font-semibold">
                              {t.domain}
                            </span>
                            <span className="text-[10px] text-text-muted font-mono">{t.createdAt}</span>
                          </div>
                          <p className="text-[11px] text-text-secondary mt-0.5 max-w-sm truncate">
                            {t.description}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            {t.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-elevated border border-border text-text-muted"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Verification Status */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <VerificationBadge status={t.verificationStatus} />
                        {t.verificationStatus !== 'verified' && (
                          <button
                            onClick={() => setSelectedVerifyTarget(t)}
                            className="block text-[11px] text-accent-secondary hover:underline font-mono"
                          >
                            Verify Ownership →
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Last Scan */}
                    <td className="py-4 px-4 font-mono text-text-muted">
                      {t.lastScanDate ? (
                        <span>{t.lastScanDate}</span>
                      ) : (
                        <span className="text-slate-600 italic">Never Scanned</span>
                      )}
                    </td>

                    {/* Total Scans */}
                    <td className="py-4 px-4 text-center font-mono font-semibold text-text-main">
                      {t.totalScans}
                    </td>

                    {/* Risk Level */}
                    <td className="py-4 px-4">
                      <RiskBadge risk={t.riskLevel} />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => onNavigate('new-scan', t.id)}
                          disabled={t.verificationStatus !== 'verified'}
                          title={
                            t.verificationStatus === 'verified'
                              ? 'Initiate assessment on this target'
                              : 'Ownership verification required before scanning'
                          }
                          leftIcon={<PlayCircle className="w-3.5 h-3.5" />}
                        >
                          Scan
                        </Button>

                        <button
                          onClick={() => setSelectedVerifyTarget(t)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-text-main hover:bg-elevated border border-border"
                          title="View Verification Record"
                        >
                          <FileCode className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Remove target ${t.domain} and archive associated audit history?`)) {
                              onDeleteTarget(t.id);
                              toast({ type: 'info', title: `Target ${t.domain} removed` });
                            }
                          }}
                          className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-950/30 border border-border transition-colors"
                          title="Remove Target"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add Target Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Authorized Target"
        subtitle="Specify the fully qualified domain name or URL you are authorized to assess."
        maxWidth="lg"
        icon={<TargetIcon className="w-5 h-5 text-accent-primary" />}
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          {/* Warning Banner */}
          <div className="p-3.5 rounded-xl border border-red-900/60 bg-red-950/30 text-red-200">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-300">Strict Legal Authorization Warning</p>
                <p className="text-[11px] text-red-200/80 mt-1 leading-normal">
                  Penetration testing without documented, explicit authorization from the target system owner is illegal under computer misuse laws (e.g. CFAA, UK Computer Misuse Act). Only register domains you own or have written permission to test.
                </p>
              </div>
            </div>
          </div>

          {/* Website URL / Domain */}
          <div>
            <label className="block text-xs font-semibold text-text-main mb-1.5">
              Website Domain or URL <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="e.g. app.mycompany.com or https://staging.mysite.io"
              required
              className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-text-main placeholder:text-text-muted focus:border-accent-primary outline-none font-mono"
            />
            <p className="text-[11px] text-text-muted mt-1">
              Do not include wildcard patterns or path routes (scope is bound to the domain FQDN).
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-text-main mb-1.5">
              Target Scope & Description
            </label>
            <textarea
              rows={2}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="e.g. Customer billing portal staging environment hosted on AWS us-east-1"
              className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-text-main placeholder:text-text-muted focus:border-accent-primary outline-none"
            />
          </div>

          {/* Preferred Verification Method */}
          <div>
            <label className="block text-xs font-semibold text-text-main mb-1.5">
              Ownership Verification Protocol
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-lg border cursor-pointer flex flex-col gap-1 transition-all ${
                  newMethod === 'dns_txt'
                    ? 'border-accent-primary bg-emerald-950/20 text-white'
                    : 'border-border bg-sidebar hover:border-slate-600 text-text-secondary'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">DNS TXT Record</span>
                  <input
                    type="radio"
                    name="method"
                    checked={newMethod === 'dns_txt'}
                    onChange={() => setNewMethod('dns_txt')}
                    className="accent-accent-primary"
                  />
                </div>
                <span className="text-[10px] text-text-muted">
                  Add challenge TXT record to domain DNS zone
                </span>
              </label>

              <label
                className={`p-3 rounded-lg border cursor-pointer flex flex-col gap-1 transition-all ${
                  newMethod === 'http_file'
                    ? 'border-accent-primary bg-emerald-950/20 text-white'
                    : 'border-border bg-sidebar hover:border-slate-600 text-text-secondary'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs">HTTP Well-Known File</span>
                  <input
                    type="radio"
                    name="method"
                    checked={newMethod === 'http_file'}
                    onChange={() => setNewMethod('http_file')}
                    className="accent-accent-primary"
                  />
                </div>
                <span className="text-[10px] text-text-muted">
                  Serve challenge string under /.well-known/ path
                </span>
              </label>
            </div>
          </div>

          {/* Authorization Checkbox */}
          <div className="p-3 rounded-lg border border-border bg-sidebar/50">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isAuthorized}
                onChange={(e) => setIsAuthorized(e.target.checked)}
                className="mt-0.5 rounded border-border accent-accent-primary"
              />
              <span className="text-xs text-text-main font-medium leading-relaxed">
                I hereby affirm under penalty of civil and criminal liability that I am the authorized owner or have acquired explicit, written permission from the system owner to conduct cybersecurity assessments on this target.
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              disabled={!newUrl || !isAuthorized}
            >
              Register & Generate Verification
            </Button>
          </div>
        </form>
      </Modal>

      {/* Target Ownership Verification Dialog */}
      {selectedVerifyTarget && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedVerifyTarget(null)}
          title={`Ownership Verification: ${selectedVerifyTarget.domain}`}
          subtitle="Prove ownership to unlock active and passive vulnerability assessment engines."
          maxWidth="lg"
          icon={<CheckCircle2 className="w-5 h-5 text-accent-primary" />}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-900/50 text-blue-200">
              <p className="font-semibold">Verification Instructions</p>
              <p className="text-[11px] text-blue-200/80 mt-1">
                To prevent unauthorized network scanning against external organizations, DexXScan verifies DNS TXT or HTTP web server challenge files before allowing scan initiation.
              </p>
            </div>

            {/* Method A: DNS TXT */}
            <div className="p-3.5 rounded-xl border border-border bg-sidebar space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-text-main text-xs uppercase">
                  Option 1: DNS TXT Verification (Recommended)
                </span>
                <span className="text-[10px] font-mono text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded border border-accent-primary/30">
                  TTL 300
                </span>
              </div>
              <p className="text-[11px] text-text-secondary">
                Create a DNS TXT record at your DNS provider with the following parameters:
              </p>

              <div className="space-y-2 font-mono text-[11px] bg-card p-2.5 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Record Host/Name:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-accent-primary select-all">
                      {selectedVerifyTarget.verificationRecordName || `_dexxscan-challenge.${selectedVerifyTarget.domain}`}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          selectedVerifyTarget.verificationRecordName || `_dexxscan-challenge.${selectedVerifyTarget.domain}`,
                          'DNS Record Name'
                        )
                      }
                      className="text-text-muted hover:text-white"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Record Value:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-text-main select-all truncate max-w-xs">
                      {selectedVerifyTarget.verificationToken}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(selectedVerifyTarget.verificationToken, 'Verification Token')
                      }
                      className="text-text-muted hover:text-white"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Method B: HTTP Well-known File */}
            <div className="p-3.5 rounded-xl border border-border bg-sidebar space-y-2">
              <span className="font-mono font-semibold text-text-main text-xs uppercase">
                Option 2: HTTP Challenge File
              </span>
              <p className="text-[11px] text-text-secondary">
                Upload a plain text file accessible via GET request at:
              </p>
              <div className="font-mono text-[11px] bg-card p-2.5 rounded-lg border border-border flex items-center justify-between">
                <span className="text-text-secondary truncate">
                  https://{selectedVerifyTarget.domain}/.well-known/dexxscan-challenge.txt
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `https://${selectedVerifyTarget.domain}/.well-known/dexxscan-challenge.txt`,
                      'Challenge URL'
                    )
                  }
                  className="text-text-muted hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>DNS propagation may take 1-5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setSelectedVerifyTarget(null)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  isLoading={isVerifying}
                  onClick={() => handleRunVerificationCheck(selectedVerifyTarget)}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  {isVerifying ? 'Validating DNS...' : 'Verify Challenge Now'}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
