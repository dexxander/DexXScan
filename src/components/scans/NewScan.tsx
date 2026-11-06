import React, { useState } from 'react';
import {
  PlayCircle,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Server,
  Lock,
  Globe,
  Sliders,
  AlertTriangle,
  Check,
  Info,
  Terminal,
  Activity,
  Flame,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Target, ScanProfile, ScanModule, Scan } from '../../types';
import { Button } from '../common/Button';
import { VerificationBadge, RiskBadge } from '../common/Badge';
import { DemoNotice } from '../common/DemoNotice';
import { useToast } from '../common/ToastContext';
import { PageId } from '../layout/Sidebar';

interface NewScanProps {
  targets: Target[];
  preselectedTargetId?: string;
  onStartScan: (params: {
    targetId: string;
    profile: ScanProfile;
    modules: ScanModule[];
    notes?: string;
  }) => Promise<Scan>;
  onNavigate: (page: PageId, id?: string) => void;
}

export const NewScan: React.FC<NewScanProps> = ({
  targets,
  preselectedTargetId,
  onStartScan,
  onNavigate,
}) => {
  const { toast } = useToast();

  const verifiedTargets = targets.filter((t) => t.verificationStatus === 'verified');
  const defaultTargetId =
    preselectedTargetId || (verifiedTargets.length > 0 ? verifiedTargets[0].id : targets[0]?.id || '');

  const [selectedTargetId, setSelectedTargetId] = useState<string>(defaultTargetId);
  const [selectedProfile, setSelectedProfile] = useState<ScanProfile>('standard');
  const [selectedModules, setSelectedModules] = useState<ScanModule[]>([
    'http_headers',
    'ssl_tls',
    'cookie_security',
    'dns_security',
  ]);
  const [scanIntensity, setScanIntensity] = useState<'stealth' | 'balanced' | 'aggressive'>('balanced');
  const [maxDurationMinutes, setMaxDurationMinutes] = useState<number>(30);
  const [activeTestingAuthorized, setActiveTestingAuthorized] = useState<boolean>(false);
  const [responsibleTestingAgreed, setResponsibleTestingAgreed] = useState<boolean>(false);
  const [scanNotes, setScanNotes] = useState<string>('');
  const [isLaunching, setIsLaunching] = useState<boolean>(false);

  // Live simulation modal state
  const [activeSimulatingScan, setActiveSimulatingScan] = useState<Scan | null>(null);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [simProgress, setSimProgress] = useState<number>(0);

  const selectedTarget = targets.find((t) => t.id === selectedTargetId);

  // Profile presets
  const handleProfileChange = (profile: ScanProfile) => {
    setSelectedProfile(profile);
    if (profile === 'quick') {
      setSelectedModules(['http_headers', 'ssl_tls', 'cookie_security', 'dns_security']);
    } else if (profile === 'standard') {
      setSelectedModules(['http_headers', 'ssl_tls', 'cookie_security', 'dns_security', 'web_vulnerabilities']);
    } else if (profile === 'comprehensive') {
      setSelectedModules([
        'http_headers',
        'ssl_tls',
        'cookie_security',
        'dns_security',
        'network_exposure',
        'web_vulnerabilities',
      ]);
    }
  };

  const toggleModule = (mod: ScanModule) => {
    if (selectedProfile !== 'custom') {
      setSelectedProfile('custom');
    }
    if (selectedModules.includes(mod)) {
      if (selectedModules.length <= 1) {
        toast({ type: 'warning', title: 'At least one module must remain selected' });
        return;
      }
      setSelectedModules(selectedModules.filter((m) => m !== mod));
    } else {
      setSelectedModules([...selectedModules, mod]);
    }
  };

  const moduleDefinitions: {
    id: ScanModule;
    title: string;
    description: string;
    tool: string;
    badge: string;
    isActiveVector: boolean;
  }[] = [
    {
      id: 'http_headers',
      title: 'HTTP Security Headers',
      description: 'Audit HSTS, CSP, X-Frame-Options, Permissions-Policy, Referrer-Policy, CORS origins',
      tool: 'Header Inspector',
      badge: 'Passive',
      isActiveVector: false,
    },
    {
      id: 'ssl_tls',
      title: 'SSL/TLS Assessment',
      description: 'SSLyze protocol cipher suites, TLS 1.0/1.1 deprecation, cert chain expiry, ALPN',
      tool: 'SSLyze Core',
      badge: 'Passive',
      isActiveVector: false,
    },
    {
      id: 'cookie_security',
      title: 'Cookie Security',
      description: 'Audit session tokens for SameSite, Secure, HttpOnly, and __Host- / __Secure- prefixes',
      tool: 'Cookie Analyzer',
      badge: 'Passive',
      isActiveVector: false,
    },
    {
      id: 'dns_security',
      title: 'DNS Security & Mail Protection',
      description: 'CAA records, DNSSEC validation, SPF/DMARC email spoofing protection, AXFR transfers',
      tool: 'DNS Inspector',
      badge: 'Passive',
      isActiveVector: false,
    },
    {
      id: 'network_exposure',
      title: 'Network Exposure & Service Fingerprinting',
      description: 'Authorized TCP port discovery (80, 443, 8080, 8443) and daemon banner inspection',
      tool: 'Nmap Engine',
      badge: 'Active Probe',
      isActiveVector: true,
    },
    {
      id: 'web_vulnerabilities',
      title: 'Web Vulnerability Assessment',
      description: 'OWASP Top 10 passive checks: injection patterns, XSS reflection, error leakages, CSRF tokens',
      tool: 'OWASP ZAP',
      badge: 'Active Probe',
      isActiveVector: true,
    },
  ];

  const hasActiveModulesSelected = selectedModules.some(
    (m) => m === 'network_exposure' || m === 'web_vulnerabilities'
  );

  const handleLaunchAssessment = async () => {
    if (!selectedTarget) {
      toast({ type: 'error', title: 'Target Selection Required' });
      return;
    }
    if (selectedTarget.verificationStatus !== 'verified') {
      toast({
        type: 'error',
        title: 'Target Unverified',
        message: 'You must verify domain ownership before launching assessments.',
      });
      return;
    }
    if (!responsibleTestingAgreed) {
      toast({
        type: 'warning',
        title: 'Agreement Required',
        message: 'Please review and accept the responsible testing safety agreement.',
      });
      return;
    }
    if (hasActiveModulesSelected && !activeTestingAuthorized) {
      toast({
        type: 'warning',
        title: 'Active Testing Authorization Required',
        message: 'Active probing modules require explicit authorization confirmation.',
      });
      return;
    }

    setIsLaunching(true);

    try {
      const scan = await onStartScan({
        targetId: selectedTarget.id,
        profile: selectedProfile,
        modules: selectedModules,
        notes: scanNotes || undefined,
      });

      // Launch simulated execution telemetry
      setActiveSimulatingScan(scan);
      setSimulationLogs([
        `[${new Date().toLocaleTimeString()}] Initializing DexXScan assessment session ${scan.id}`,
        `[${new Date().toLocaleTimeString()}] Target: ${selectedTarget.domain} (Scope: ${selectedTarget.url})`,
        `[${new Date().toLocaleTimeString()}] Mode: Local Demonstration Simulated Runner (FastAPI disconnected)`,
        `[${new Date().toLocaleTimeString()}] Profiles active: ${selectedProfile.toUpperCase()} [${selectedModules.length} modules]`,
      ]);

      // Progress animation steps
      const steps = [
        { progress: 20, log: `Checking HTTP Security Headers & TLS cert chain...` },
        { progress: 45, log: `Auditing Cookie flags and DNS CAA/DNSSEC records...` },
        { progress: 75, log: `Running passive OWASP ZAP simulated heuristics...` },
        { progress: 95, log: `Collating vulnerability telemetry and calculating risk score...` },
        { progress: 100, log: `Assessment finalized. Generating score and findings dossier.` },
      ];

      steps.forEach((step, idx) => {
        setTimeout(() => {
          setSimProgress(step.progress);
          setSimulationLogs((prev) => [
            ...prev,
            `[${new Date().toLocaleTimeString()}] ${step.log}`,
          ]);

          if (idx === steps.length - 1) {
            setTimeout(() => {
              toast({
                type: 'success',
                title: 'Assessment Complete (Demo Mode)',
                message: `Audit completed for ${selectedTarget.domain} with simulated telemetry.`,
              });
              setIsLaunching(false);
              setActiveSimulatingScan(null);
              onNavigate('scan-details', scan.id);
            }, 1000);
          }
        }, (idx + 1) * 900);
      });
    } catch {
      setIsLaunching(false);
      toast({ type: 'error', title: 'Failed to launch assessment' });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Banner */}
      <DemoNotice variant="card" onOpenSettings={() => onNavigate('settings')} />

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-text-main flex items-center gap-2">
          New Security Assessment
          <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-accent-primary/10 text-accent-primary border border-accent-primary/30">
            Profile Configurator
          </span>
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Configure scoped vulnerability testing against verified web targets.
        </p>
      </div>

      {/* STEP 1: Select Target */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-accent-primary/20 text-accent-primary border border-accent-primary/40 flex items-center justify-center font-mono text-xs font-bold">
              1
            </span>
            <h3 className="text-sm font-semibold text-text-main">
              Select Authorized Target
            </h3>
          </div>
          <button
            onClick={() => onNavigate('targets')}
            className="text-xs text-accent-primary hover:underline font-mono"
          >
            + Register New Target
          </button>
        </div>

        {targets.length === 0 ? (
          <div className="p-4 rounded-lg bg-sidebar text-center text-xs text-text-muted">
            No targets registered yet.{' '}
            <button
              onClick={() => onNavigate('targets')}
              className="text-accent-primary underline ml-1"
            >
              Add a target
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {targets.map((t) => {
              const isSelected = t.id === selectedTargetId;
              const isVerified = t.verificationStatus === 'verified';

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    if (isVerified) {
                      setSelectedTargetId(t.id);
                    } else {
                      toast({
                        type: 'warning',
                        title: 'Ownership Verification Required',
                        message: `Target ${t.domain} is pending DNS verification.`,
                      });
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-accent-primary bg-emerald-950/20 shadow-glow-green'
                      : !isVerified
                      ? 'border-border/60 bg-sidebar/50 opacity-60 cursor-not-allowed'
                      : 'border-border bg-sidebar hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-xs text-text-main">
                          {t.domain}
                        </span>
                        <VerificationBadge status={t.verificationStatus} />
                      </div>
                      <p className="text-[11px] text-text-secondary mt-1 truncate max-w-xs">
                        {t.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <RiskBadge risk={t.riskLevel} />
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-accent-primary text-black flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-text-muted font-mono">
                    <span>Last Scan: {t.lastScanDate || 'None'}</span>
                    <span>{t.totalScans} Audits Completed</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* STEP 2: Select Assessment Profile */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border">
          <span className="w-6 h-6 rounded-full bg-accent-primary/20 text-accent-primary border border-accent-primary/40 flex items-center justify-center font-mono text-xs font-bold">
            2
          </span>
          <h3 className="text-sm font-semibold text-text-main">
            Select Assessment Profile
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Quick Scan */}
          <div
            onClick={() => handleProfileChange('quick')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedProfile === 'quick'
                ? 'border-accent-primary bg-emerald-950/20 shadow-glow-green'
                : 'border-border bg-sidebar hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono text-text-main uppercase">
                Quick Scan
              </span>
              <span className="text-[10px] font-mono text-accent-primary">~2 mins</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-normal mb-3">
              Lightweight inspection of essential perimeter hygiene: HTTP headers, TLS validity, cookie flags.
            </p>
            <ul className="text-[10px] text-text-muted space-y-1 font-mono">
              <li>• HTTP Security Headers</li>
              <li>• SSL/TLS Configuration</li>
              <li>• Cookie Security</li>
              <li>• Basic DNS Checks</li>
            </ul>
          </div>

          {/* Standard Scan */}
          <div
            onClick={() => handleProfileChange('standard')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedProfile === 'standard'
                ? 'border-accent-primary bg-emerald-950/20 shadow-glow-green'
                : 'border-border bg-sidebar hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold font-mono text-text-main uppercase">
                  Standard Scan
                </span>
                <span className="text-[9px] bg-accent-primary/20 text-accent-primary px-1 rounded">
                  RECOMMENDED
                </span>
              </div>
              <span className="text-[10px] font-mono text-accent-primary">~5 mins</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-normal mb-3">
              Balanced audit. All quick checks plus passive OWASP ZAP rules & scope crawler.
            </p>
            <ul className="text-[10px] text-text-muted space-y-1 font-mono">
              <li>• All Quick Scan checks</li>
              <li>• Passive OWASP ZAP rules</li>
              <li>• Authorized Scope Crawl</li>
              <li>• CSP & CORS Analysis</li>
            </ul>
          </div>

          {/* Comprehensive Scan */}
          <div
            onClick={() => handleProfileChange('comprehensive')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedProfile === 'comprehensive'
                ? 'border-accent-primary bg-emerald-950/20 shadow-glow-green'
                : 'border-border bg-sidebar hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono text-text-main uppercase">
                Comprehensive
              </span>
              <span className="text-[10px] font-mono text-amber-400">~15 mins</span>
            </div>
            <p className="text-[11px] text-text-secondary leading-normal mb-3">
              Deep evaluation with Nmap port exposure and active web injection probes.
            </p>
            <ul className="text-[10px] text-text-muted space-y-1 font-mono">
              <li>• All Standard Scan checks</li>
              <li>• Authorized Port & Service</li>
              <li>• SQLi / XSS injection checks</li>
              <li>• DNS Zone Transfer (AXFR)</li>
            </ul>
          </div>

          {/* Custom Scan */}
          <div
            onClick={() => handleProfileChange('custom')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedProfile === 'custom'
                ? 'border-accent-primary bg-emerald-950/20 shadow-glow-green'
                : 'border-border bg-sidebar hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono text-text-main uppercase">
                Custom Scan
              </span>
              <Sliders className="w-3.5 h-3.5 text-accent-primary" />
            </div>
            <p className="text-[11px] text-text-secondary leading-normal mb-3">
              Select specific security assessment modules manually in Step 3 below.
            </p>
            <ul className="text-[10px] text-text-muted space-y-1 font-mono">
              <li>• Custom module selection</li>
              <li>• Fine-grained rate limits</li>
              <li>• Tailored test scope</li>
            </ul>
          </div>
        </div>
      </div>

      {/* STEP 3: Assessment Modules */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-accent-primary/20 text-accent-primary border border-accent-primary/40 flex items-center justify-center font-mono text-xs font-bold">
              3
            </span>
            <h3 className="text-sm font-semibold text-text-main">
              Assessment Modules ({selectedModules.length} Active)
            </h3>
          </div>
          <span className="text-xs font-mono text-text-muted">
            Click any module card to toggle
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {moduleDefinitions.map((mod) => {
            const isSelected = selectedModules.includes(mod.id);

            return (
              <div
                key={mod.id}
                onClick={() => toggleModule(mod.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                  isSelected
                    ? 'border-accent-primary bg-emerald-950/20'
                    : 'border-border bg-sidebar/50 opacity-60 hover:opacity-100 hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-xs text-text-main">
                      {mod.title}
                    </span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded border-border accent-accent-primary mt-0.5"
                    />
                  </div>
                  <p className="text-[11px] text-text-secondary mt-1.5 leading-normal">
                    {mod.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-text-muted">{mod.tool}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded border ${
                      mod.isActiveVector
                        ? 'bg-amber-950/40 text-amber-300 border-amber-900/60'
                        : 'bg-elevated text-text-muted border-border'
                    }`}
                  >
                    {mod.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 4: Safety & Authorization Controls */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-border">
          <span className="w-6 h-6 rounded-full bg-accent-primary/20 text-accent-primary border border-accent-primary/40 flex items-center justify-center font-mono text-xs font-bold">
            4
          </span>
          <h3 className="text-sm font-semibold text-text-main">
            Safety Controls & Operational Restrictions
          </h3>
        </div>

        {/* Intensity and Max Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-text-main mb-1.5">
              Scan Intensity & Concurrency
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['stealth', 'balanced', 'aggressive'] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setScanIntensity(lvl)}
                  className={`py-2 px-2.5 rounded-lg border text-xs font-mono capitalize transition-all ${
                    scanIntensity === lvl
                      ? 'border-accent-primary bg-emerald-950/20 text-accent-primary'
                      : 'border-border bg-sidebar hover:border-slate-600 text-text-muted'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-text-muted mt-1 font-mono">
              {scanIntensity === 'stealth'
                ? 'Max 2 req/sec. Minimizes IDS alert triggers.'
                : scanIntensity === 'balanced'
                ? 'Max 10 req/sec. Standard non-intrusive rate.'
                : 'Max 25 req/sec. Requires explicit staging authorization.'}
            </p>
          </div>

          <div>
            <label className="block font-semibold text-text-main mb-1.5">
              Maximum Execution Timeout
            </label>
            <select
              value={maxDurationMinutes}
              onChange={(e) => setMaxDurationMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-text-main outline-none focus:border-accent-primary font-mono"
            >
              <option value={15}>15 Minutes (Strict)</option>
              <option value={30}>30 Minutes (Standard)</option>
              <option value={60}>60 Minutes (Deep crawl)</option>
              <option value={120}>120 Minutes (Extended)</option>
            </select>
          </div>
        </div>

        {/* Active Testing Warning Checkbox (Disabled by default requirement) */}
        {hasActiveModulesSelected && (
          <div className="p-3.5 rounded-xl border border-amber-900/60 bg-amber-950/20 text-xs space-y-2">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-300">
                  Active Testing Modules Selected (Network Exposure / Web Injection)
                </p>
                <p className="text-[11px] text-slate-300 leading-normal mt-0.5">
                  Active modules transmit diagnostic probes and crafted payloads. Per safety protocols, active testing is disabled by default and requires explicit verification that the target is a staging or authorized production environment.
                </p>
              </div>
            </div>

            <label className="flex items-start gap-2.5 pt-2 border-t border-amber-900/40 cursor-pointer">
              <input
                type="checkbox"
                checked={activeTestingAuthorized}
                onChange={(e) => setActiveTestingAuthorized(e.target.checked)}
                className="mt-0.5 rounded border-border accent-accent-primary"
              />
              <span className="text-text-main font-medium leading-relaxed">
                I explicitly authorize active network probes and OWASP ZAP testing patterns against this asset.
              </span>
            </label>
          </div>
        )}

        {/* Responsible Testing Agreement */}
        <div className="p-3.5 rounded-xl border border-border bg-sidebar/50 text-xs">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={responsibleTestingAgreed}
              onChange={(e) => setResponsibleTestingAgreed(e.target.checked)}
              className="mt-0.5 rounded border-border accent-accent-primary"
            />
            <span className="text-text-main font-medium leading-relaxed">
              I certify that this assessment complies with our organization's responsible disclosure and authorized penetration testing policy. I understand that testing logic is safe, bounded, and monitored.
            </span>
          </label>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold text-text-main mb-1.5">
            Audit Ticket / Session Notes (Optional)
          </label>
          <input
            type="text"
            value={scanNotes}
            onChange={(e) => setScanNotes(e.target.value)}
            placeholder="e.g. Sprint 44 Release Verification (JIRA-SEC-891)"
            className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-text-main text-xs placeholder:text-text-muted outline-none focus:border-accent-primary font-mono"
          />
        </div>
      </div>

      {/* Final Action Bar */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-text-muted flex items-center gap-2">
          <Terminal className="w-4 h-4 text-accent-primary" />
          <span>
            Target Scope:{' '}
            <strong className="text-text-main font-mono">
              {selectedTarget ? selectedTarget.domain : 'None'}
            </strong>{' '}
            | Mode: <span className="text-amber-400 font-mono">Demo Simulation</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => onNavigate('dashboard')}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            size="lg"
            isLoading={isLaunching}
            disabled={
              !selectedTarget ||
              selectedTarget.verificationStatus !== 'verified' ||
              !responsibleTestingAgreed ||
              (hasActiveModulesSelected && !activeTestingAuthorized)
            }
            onClick={handleLaunchAssessment}
            leftIcon={<PlayCircle className="w-5 h-5" />}
          >
            START SECURITY ASSESSMENT
          </Button>
        </div>
      </div>

      {/* Live Simulation Runner Modal */}
      {activeSimulatingScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-card border border-border rounded-xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-accent-primary animate-ping" />
                <h3 className="font-mono text-sm font-semibold text-text-main uppercase tracking-wider">
                  Assessment In Progress: {activeSimulatingScan.id}
                </h3>
              </div>
              <span className="font-mono text-xs text-accent-primary font-bold">
                {simProgress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-sidebar rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-accent-primary transition-all duration-500 ease-out"
                style={{ width: `${simProgress}%` }}
              />
            </div>

            {/* Live Terminal Output Console */}
            <div className="p-3 bg-black/70 rounded-lg border border-border font-mono text-[11px] text-emerald-400 h-44 overflow-y-auto space-y-1">
              {simulationLogs.map((log, i) => (
                <div key={i} className="leading-relaxed">
                  {log}
                </div>
              ))}
              <div className="flex items-center gap-1 text-slate-500 animate-pulse">
                <span>&gt; Processing modules...</span>
              </div>
            </div>

            <p className="text-[11px] text-text-muted text-center font-mono">
              [DEMONSTRATION SIMULATOR] Fast-forwarding scan telemetry for UI review.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
