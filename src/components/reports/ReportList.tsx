import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Printer,
  Shield,
  Calendar,
  Clock,
  Target as TargetIcon,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Layers,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { SecurityReport, Scan, Finding } from '../../types';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { ScoreGauge } from '../common/ScoreGauge';
import { DemoNotice } from '../common/DemoNotice';
import { useToast } from '../common/ToastContext';
import { PageId } from '../layout/Sidebar';

interface ReportListProps {
  reports: SecurityReport[];
  scans: Scan[];
  findings: Finding[];
  onGenerateReport: (scanId: string) => Promise<void>;
  onDeleteReport: (id: string) => Promise<void>;
  onNavigate: (page: PageId, id?: string) => void;
}

export const ReportList: React.FC<ReportListProps> = ({
  reports,
  scans,
  findings,
  onGenerateReport,
  onDeleteReport,
  onNavigate,
}) => {
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<SecurityReport | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedScanId, setSelectedScanId] = useState<string>(scans[0]?.id || '');
  const [isGenerating, setIsGenerating] = useState(false);

  // Relevant scan and findings for currently previewed report
  const activeScan = scans.find((s) => s.id === selectedReport?.scanId);
  const activeFindings = findings.filter(
    (f) => f.scanId === selectedReport?.scanId || f.targetId === selectedReport?.targetId
  );

  const handleCreate = async () => {
    if (!selectedScanId) return;
    setIsGenerating(true);
    try {
      await onGenerateReport(selectedScanId);
      setIsGenerating(false);
      setIsGenerateModalOpen(false);
      toast({
        type: 'success',
        title: 'Report Dossier Generated',
        message: 'Security assessment document compiled.',
      });
    } catch {
      setIsGenerating(false);
      toast({ type: 'error', title: 'Failed to generate report' });
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <DemoNotice variant="card" onOpenSettings={() => onNavigate('settings')} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-main flex items-center gap-2">
            Security Reports
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-accent-primary/10 text-accent-primary border border-accent-primary/30">
              {reports.length} Dossiers
            </span>
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Audit deliverables, executive briefings, and technical vulnerability dossiers for compliance & dev teams.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsGenerateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Generate Report
        </Button>
      </div>

      {/* Reports Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-sidebar/90 text-text-muted uppercase font-mono tracking-wider text-[11px] border-b border-border">
              <tr>
                <th className="py-3 px-4">Report Name</th>
                <th className="py-3 px-4">Target Domain</th>
                <th className="py-3 px-4">Scan Session</th>
                <th className="py-3 px-4">Generated Date</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4">Findings Breakdown</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    <FileText className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="font-medium text-sm text-text-secondary">No security reports generated yet</p>
                    <p className="text-xs text-text-muted mt-1">Select a completed scan to generate an executive dossier.</p>
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id} className="hover:bg-elevated/40 transition-colors">
                    {/* Name */}
                    <td className="py-4 px-4 font-medium text-text-main">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-sidebar border border-border text-accent-primary shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span
                            onClick={() => setSelectedReport(r)}
                            className="font-semibold text-text-main hover:text-accent-primary cursor-pointer transition-colors block"
                          >
                            {r.name}
                          </span>
                          <span className="text-[10px] text-text-muted font-mono">
                            {r.id} • {r.fileSize} • PDF format
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Target */}
                    <td className="py-4 px-4 font-mono text-text-secondary font-medium">
                      {r.targetDomain}
                    </td>

                    {/* Scan ID */}
                    <td className="py-4 px-4 font-mono text-accent-secondary">
                      {r.scanId}
                    </td>

                    {/* Generated Date */}
                    <td className="py-4 px-4 font-mono text-text-muted">
                      {r.generatedDate}
                    </td>

                    {/* Score */}
                    <td className="py-4 px-4 text-center">
                      <span className="font-mono font-bold text-sm text-text-main px-2 py-0.5 rounded bg-elevated border border-border">
                        {r.securityScore}/100
                      </span>
                    </td>

                    {/* Findings */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        {r.findingsSummary.critical > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                            {r.findingsSummary.critical}C
                          </span>
                        )}
                        {r.findingsSummary.high > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800">
                            {r.findingsSummary.high}H
                          </span>
                        )}
                        {r.findingsSummary.medium > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-800">
                            {r.findingsSummary.medium}M
                          </span>
                        )}
                        {r.findingsSummary.low > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                            {r.findingsSummary.low}L
                          </span>
                        )}
                        {r.findingsSummary.total === 0 && (
                          <span className="text-emerald-400">Clean</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedReport(r)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          View Report
                        </Button>

                        <button
                          onClick={() => {
                            setSelectedReport(r);
                            setTimeout(() => window.print(), 400);
                          }}
                          className="p-1.5 rounded-lg text-text-muted hover:text-accent-primary hover:bg-elevated border border-border"
                          title="Print / Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete report ${r.name}?`)) {
                              onDeleteReport(r.id);
                              toast({ type: 'info', title: 'Report deleted' });
                            }
                          }}
                          className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-950/30 border border-border"
                          title="Delete Report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Generate Report Modal */}
      {isGenerateModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsGenerateModalOpen(false)}
          title="Compile Security Dossier"
          subtitle="Generate an executive & technical penetration testing report from a completed audit session."
          maxWidth="md"
          icon={<FileText className="w-5 h-5 text-accent-primary" />}
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-text-main mb-1.5">
                Select Assessment Scan
              </label>
              <select
                value={selectedScanId}
                onChange={(e) => setSelectedScanId(e.target.value)}
                className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-text-main font-mono text-xs outline-none focus:border-accent-primary"
              >
                {scans.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.id} — {s.targetDomain} ({s.startedAt}) [{s.findingsCount.total} findings]
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-lg bg-sidebar border border-border space-y-1.5 text-text-secondary">
              <p className="font-semibold text-text-main">Included Report Modules:</p>
              <ul className="space-y-1 text-[11px] font-mono text-text-muted">
                <li>✓ Executive Risk Posture & Score Breakdown</li>
                <li>✓ Target Scope, DNS & Port Verification</li>
                <li>✓ OWASP Top 10 Technical Evidence Dossier</li>
                <li>✓ Prioritized Patching Remediation Roadmap</li>
                <li>✓ Compliance Limitations & Disclaimer</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button variant="ghost" onClick={() => setIsGenerateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                isLoading={isGenerating}
                onClick={handleCreate}
                leftIcon={<FileText className="w-4 h-4" />}
              >
                Generate Document
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Executive Clean White PDF Report Preview Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md print:p-0 print:bg-white print:fixed print:inset-0">
          <div className="relative w-full max-w-4xl bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden my-6 print:m-0 print:rounded-none print:shadow-none">
            {/* Top Toolbar (Hidden during print) */}
            <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-slate-900 text-white border-b border-slate-800 print:hidden">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-xs font-bold text-white">
                  DexXScan Executive Report Preview
                </span>
                <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 bg-slate-800 rounded">
                  CONFIDENTIAL
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handlePrintPdf}
                  leftIcon={<Printer className="w-4 h-4" />}
                >
                  Print / Export to PDF
                </Button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Document Body: Clean White Professional Theme (10-Section Structure) */}
            <div className="p-8 sm:p-12 space-y-10 font-sans max-h-[85vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-8">
              {/* SECTION 1: COVER PAGE / HEADER */}
              <div className="border-b-4 border-slate-900 pb-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-emerald-400 font-bold font-mono text-sm">
                      DS
                    </div>
                    <div>
                      <span className="font-extrabold text-xl tracking-tight text-slate-900">
                        DexXScan
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 block">
                        Security Assessment Platform
                      </span>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs text-slate-500">
                    <p className="font-bold text-red-600 tracking-wider uppercase text-[11px]">
                      CONFIDENTIAL // RESTRICTED
                    </p>
                    <p>Report Ref: {selectedReport.id}</p>
                    <p>Date: {selectedReport.generatedDate}</p>
                  </div>
                </div>

                <div className="pt-6">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                    Website Security Assessment & Technical Vulnerability Dossier
                  </h1>
                  <p className="text-sm text-slate-600 mt-2 font-mono">
                    Evaluation Target: <span className="font-bold text-slate-900">{selectedReport.targetDomain}</span>
                  </p>
                </div>
              </div>

              {/* SECTION 2: EXECUTIVE SUMMARY */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-slate-900 uppercase font-mono tracking-wider border-b border-slate-200 pb-1">
                  1. Executive Summary
                </h2>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedReport.executiveSummary}
                </p>
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] block">Overall Security Score</span>
                    <span className="text-2xl font-black text-slate-900">{selectedReport.securityScore} / 100</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] block">Assessment Profile</span>
                    <span className="text-sm font-bold text-slate-800 uppercase">{selectedReport.assessmentProfile}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px] block">Lead Assessor</span>
                    <span className="text-sm font-bold text-slate-800">Alex Rivera (CISSP)</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: TARGET INFORMATION & SCOPE */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-slate-900 uppercase font-mono tracking-wider border-b border-slate-200 pb-1">
                  2. Target Assets & Assessment Scope
                </h2>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono">
                    <span className="text-slate-500 text-[10px] uppercase block">Target FQDN</span>
                    <span className="font-bold text-slate-900">{selectedReport.targetDomain}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono">
                    <span className="text-slate-500 text-[10px] uppercase block">Scan Session</span>
                    <span className="font-bold text-slate-900">{selectedReport.scanId}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedReport.scopeDescription}
                </p>
              </div>

              {/* SECTION 4: VULNERABILITY DISTRIBUTION */}
              <div className="space-y-3">
                <h2 className="text-base font-bold text-slate-900 uppercase font-mono tracking-wider border-b border-slate-200 pb-1">
                  3. Vulnerability Distribution Matrix
                </h2>
                <table className="w-full text-left text-xs font-mono border border-slate-200">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px]">
                    <tr>
                      <th className="p-2 border-b">Severity</th>
                      <th className="p-2 border-b">Detections</th>
                      <th className="p-2 border-b">CVSS Range</th>
                      <th className="p-2 border-b">Remediation SLA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2 font-bold text-red-600">Critical</td>
                      <td className="p-2 font-bold">{selectedReport.findingsSummary.critical}</td>
                      <td className="p-2">9.0 - 10.0</td>
                      <td className="p-2 text-red-600">24-48 Hours</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-orange-600">High</td>
                      <td className="p-2 font-bold">{selectedReport.findingsSummary.high}</td>
                      <td className="p-2">7.0 - 8.9</td>
                      <td className="p-2">7 Days</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-yellow-600">Medium</td>
                      <td className="p-2 font-bold">{selectedReport.findingsSummary.medium}</td>
                      <td className="p-2">4.0 - 6.9</td>
                      <td className="p-2">30 Days</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-blue-600">Low</td>
                      <td className="p-2 font-bold">{selectedReport.findingsSummary.low}</td>
                      <td className="p-2">0.1 - 3.9</td>
                      <td className="p-2">Next Sprint / Backlog</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* SECTION 5: DETAILED FINDINGS & TECHNICAL EVIDENCE */}
              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-900 uppercase font-mono tracking-wider border-b border-slate-200 pb-1">
                  4. Discovered Vulnerabilities & Proof of Concept
                </h2>

                {activeFindings.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No vulnerability findings logged for this assessment.</p>
                ) : (
                  activeFindings.map((f, idx) => (
                    <div key={f.id} className="border border-slate-200 rounded-lg p-4 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-slate-900 text-white rounded">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-sm text-slate-900">{f.name}</span>
                        </div>
                        <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {f.severity} (CVSS {f.cvssScore || 'N/A'})
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        {f.description}
                      </p>

                      <div className="bg-slate-900 text-emerald-400 p-3 rounded font-mono text-[11px] overflow-x-auto leading-relaxed">
                        <div className="text-slate-400 text-[10px] pb-1 uppercase font-bold tracking-wider">
                          [Technical Evidence]
                        </div>
                        {f.technicalEvidence}
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded text-xs text-emerald-900 leading-normal">
                        <strong>Remediation Recommendation: </strong> {f.recommendedRemediation}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* SECTION 6: TESTING LIMITATIONS & DISCLAIMER */}
              <div className="border-t border-slate-200 pt-4 space-y-2 text-[11px] text-slate-500 leading-relaxed">
                <h3 className="font-bold font-mono text-slate-700 uppercase">
                  5. Testing Limitations & Legal Disclaimer
                </h3>
                <p>{selectedReport.testingLimitations}</p>
                <p className="text-[10px]">
                  DexXScan Platform Assessment Report. Generated for authorized stakeholders only.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
