import {
  Target,
  Scan,
  Finding,
  SecurityReport,
  SystemSettings,
  User,
  ScanProfile,
  ScanModule,
  FindingStatus,
  VerificationStatus,
} from '../types';
import {
  INITIAL_TARGETS,
  INITIAL_SCANS,
  INITIAL_FINDINGS,
  INITIAL_REPORTS,
  INITIAL_SETTINGS,
  CURRENT_USER,
} from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// Local storage keys for state persistence
const STORAGE_KEYS = {
  TARGETS: 'dexxscan_targets',
  SCANS: 'dexxscan_scans',
  FINDINGS: 'dexxscan_findings',
  REPORTS: 'dexxscan_reports',
  SETTINGS: 'dexxscan_settings',
  USER: 'dexxscan_user',
};

// Helper to initialize local storage data
function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setStoredData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to write to localStorage:', err);
  }
}

export interface BackendHealthResponse {
  connected: boolean;
  url: string;
  latencyMs?: number;
  version?: string;
  zapStatus?: string;
  nmapStatus?: string;
  sslyzeStatus?: string;
  message: string;
}

// Check real FastAPI backend connection
export async function checkBackendConnection(): Promise<BackendHealthResponse> {
  const startTime = performance.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${API_BASE_URL}/api/v1/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const elapsed = Math.round(performance.now() - startTime);

    if (res.ok) {
      const data = await res.json();
      return {
        connected: true,
        url: API_BASE_URL,
        latencyMs: elapsed,
        version: data.version || '1.0.0',
        message: 'Connected to FastAPI security scanning engine',
      };
    } else {
      return {
        connected: false,
        url: API_BASE_URL,
        message: `Backend responded with HTTP status ${res.status}`,
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Connection refused';
    return {
      connected: false,
      url: API_BASE_URL,
      message: `FastAPI backend unavailable at ${API_BASE_URL} (${errorMsg}). Demo Mode active.`,
    };
  }
}

// ---------------- AUTH SERVICE ----------------
export const authService = {
  async getCurrentUser(): Promise<User> {
    return getStoredData(STORAGE_KEYS.USER, CURRENT_USER);
  },
  async login(email: string): Promise<User> {
    const user: User = { ...CURRENT_USER, email };
    setStoredData(STORAGE_KEYS.USER, user);
    return user;
  },
  async logout(): Promise<void> {
    // Session reset
  },
};

// ---------------- TARGETS SERVICE ----------------
export const targetService = {
  async getTargets(): Promise<Target[]> {
    return getStoredData(STORAGE_KEYS.TARGETS, INITIAL_TARGETS);
  },

  async getTargetById(id: string): Promise<Target | undefined> {
    const targets = await this.getTargets();
    return targets.find((t) => t.id === id);
  },

  async createTarget(data: {
    domain: string;
    description: string;
    isAuthorized: boolean;
    verificationMethod?: 'dns_txt' | 'http_file';
  }): Promise<Target> {
    const targets = await this.getTargets();
    
    // Clean domain
    const cleanDomain = data.domain.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    const cleanUrl = `https://${cleanDomain}`;
    const token = 'dexxscan-verify=' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const newTarget: Target = {
      id: `tgt-${Date.now().toString(36)}`,
      domain: cleanDomain,
      url: cleanUrl,
      description: data.description || 'Target registered for security audit',
      verificationStatus: 'pending',
      verificationMethod: data.verificationMethod || 'dns_txt',
      verificationToken: token,
      verificationRecordName: `_dexxscan-challenge.${cleanDomain}`,
      lastScanDate: null,
      totalScans: 0,
      riskLevel: 'unassessed',
      createdAt: new Date().toISOString().split('T')[0],
      tags: ['Custom-Target'],
      isAuthorized: data.isAuthorized,
    };

    const updated = [newTarget, ...targets];
    setStoredData(STORAGE_KEYS.TARGETS, updated);
    return newTarget;
  },

  async verifyTarget(id: string, simulatedSuccess = true): Promise<Target> {
    const targets = await this.getTargets();
    const idx = targets.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Target not found');

    const updatedTarget: Target = {
      ...targets[idx],
      verificationStatus: simulatedSuccess ? 'verified' : 'unverified',
      isAuthorized: simulatedSuccess ? true : targets[idx].isAuthorized,
    };

    targets[idx] = updatedTarget;
    setStoredData(STORAGE_KEYS.TARGETS, targets);
    return updatedTarget;
  },

  async deleteTarget(id: string): Promise<void> {
    const targets = await this.getTargets();
    const filtered = targets.filter((t) => t.id !== id);
    setStoredData(STORAGE_KEYS.TARGETS, filtered);
  },

  async updateTarget(id: string, updates: Partial<Target>): Promise<Target> {
    const targets = await this.getTargets();
    const idx = targets.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Target not found');
    targets[idx] = { ...targets[idx], ...updates };
    setStoredData(STORAGE_KEYS.TARGETS, targets);
    return targets[idx];
  },
};

// ---------------- SCANS SERVICE ----------------
export const scanService = {
  async getScans(): Promise<Scan[]> {
    return getStoredData(STORAGE_KEYS.SCANS, INITIAL_SCANS);
  },

  async getScanDetails(id: string): Promise<Scan | undefined> {
    const scans = await this.getScans();
    return scans.find((s) => s.id === id);
  },

  async createScan(params: {
    targetId: string;
    profile: ScanProfile;
    modules: ScanModule[];
    notes?: string;
  }): Promise<Scan> {
    const targets = await targetService.getTargets();
    const target = targets.find((t) => t.id === params.targetId);
    if (!target) throw new Error('Selected target does not exist');

    const scans = await this.getScans();
    const now = new Date();
    const scanId = `SCN-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const moduleDefs: Record<ScanModule, { name: string; desc: string }> = {
      http_headers: { name: 'HTTP Security Headers', desc: 'CSP, HSTS, X-Frame-Options, Permissions-Policy' },
      ssl_tls: { name: 'SSL/TLS Assessment', desc: 'Certificate chain, cipher suites, TLS 1.3 protocol validation' },
      cookie_security: { name: 'Cookie Security', desc: 'SameSite, Secure, HttpOnly, and prefix directives' },
      dns_security: { name: 'DNS Security', desc: 'DNSSEC, CAA records, SPF/DMARC mail protection & zone checks' },
      network_exposure: { name: 'Network Exposure', desc: 'Authorized port fingerprinting & service banner identification' },
      web_vulnerabilities: { name: 'Web Vulnerabilities', desc: 'Passive OWASP ZAP rules, reflection checks, injection patterns' },
    };

    const newScan: Scan = {
      id: scanId,
      targetId: target.id,
      targetDomain: target.domain,
      targetUrl: target.url,
      profile: params.profile,
      modules: params.modules,
      startedAt: now.toISOString().replace('T', ' ').substring(0, 19),
      completedAt: null,
      duration: '0s',
      status: 'queued',
      securityScore: 0,
      findingsCount: { critical: 0, high: 0, medium: 0, low: 0, info: 0, total: 0 },
      progress: 0,
      isDemo: true,
      notes: params.notes || `Security assessment using ${params.profile} profile`,
      moduleStatuses: params.modules.map((m) => ({
        id: m,
        name: moduleDefs[m].name,
        description: moduleDefs[m].desc,
        status: 'pending',
        findingsCount: 0,
      })),
    };

    const updated = [newScan, ...scans];
    setStoredData(STORAGE_KEYS.SCANS, updated);

    // Update target stats
    await targetService.updateTarget(target.id, {
      totalScans: target.totalScans + 1,
      lastScanDate: newScan.startedAt,
    });

    return newScan;
  },

  async updateScan(id: string, updates: Partial<Scan>): Promise<Scan> {
    const scans = await this.getScans();
    const idx = scans.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Scan not found');
    scans[idx] = { ...scans[idx], ...updates };
    setStoredData(STORAGE_KEYS.SCANS, scans);
    return scans[idx];
  },

  async stopScan(id: string): Promise<Scan> {
    return this.updateScan(id, {
      status: 'cancelled',
      completedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    });
  },
};

// ---------------- FINDINGS SERVICE ----------------
export const findingService = {
  async getFindings(): Promise<Finding[]> {
    return getStoredData(STORAGE_KEYS.FINDINGS, INITIAL_FINDINGS);
  },

  async getFindingDetails(id: string): Promise<Finding | undefined> {
    const findings = await this.getFindings();
    return findings.find((f) => f.id === id);
  },

  async updateFindingStatus(id: string, status: FindingStatus): Promise<Finding> {
    const findings = await this.getFindings();
    const idx = findings.findIndex((f) => f.id === id);
    if (idx === -1) throw new Error('Finding not found');
    findings[idx] = { ...findings[idx], status };
    setStoredData(STORAGE_KEYS.FINDINGS, findings);
    return findings[idx];
  },

  async addFinding(finding: Finding): Promise<void> {
    const findings = await this.getFindings();
    setStoredData(STORAGE_KEYS.FINDINGS, [finding, ...findings]);
  },
};

// ---------------- REPORTS SERVICE ----------------
export const reportService = {
  async getReports(): Promise<SecurityReport[]> {
    return getStoredData(STORAGE_KEYS.REPORTS, INITIAL_REPORTS);
  },

  async getReportDetails(id: string): Promise<SecurityReport | undefined> {
    const reports = await this.getReports();
    return reports.find((r) => r.id === id);
  },

  async generateReport(scanId: string): Promise<SecurityReport> {
    const scan = await scanService.getScanDetails(scanId);
    if (!scan) throw new Error('Scan not found');

    const reports = await this.getReports();
    const newReport: SecurityReport = {
      id: `REP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      scanId: scan.id,
      targetId: scan.targetId,
      targetDomain: scan.targetDomain,
      name: `Security Assessment Report: ${scan.targetDomain}`,
      generatedDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      securityScore: scan.securityScore || 78,
      findingsSummary: { ...scan.findingsCount },
      fileSize: '1.9 MB',
      assessmentProfile: scan.profile,
      executiveSummary: `This executive security report outlines the findings and risk analysis for ${scan.targetDomain} under the ${scan.profile.toUpperCase()} profile. The target scored ${scan.securityScore}/100. Prioritize critical and high findings to mitigate attack surfaces.`,
      scopeDescription: `Evaluated domain ${scan.targetDomain} with modules: ${scan.modules.join(', ')}.`,
      testingLimitations: `Non-intrusive security audit. Does not replace manual business-logic penetration testing or binary code reviews.`,
    };

    setStoredData(STORAGE_KEYS.REPORTS, [newReport, ...reports]);
    return newReport;
  },

  async deleteReport(id: string): Promise<void> {
    const reports = await this.getReports();
    const filtered = reports.filter((r) => r.id !== id);
    setStoredData(STORAGE_KEYS.REPORTS, filtered);
  },
};

// ---------------- SETTINGS SERVICE ----------------
export const settingsService = {
  async getSettings(): Promise<SystemSettings> {
    return getStoredData(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },

  async updateSettings(settings: SystemSettings): Promise<SystemSettings> {
    setStoredData(STORAGE_KEYS.SETTINGS, settings);
    return settings;
  },
};
