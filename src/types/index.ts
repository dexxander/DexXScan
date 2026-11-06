// Types for DexXScan Website Security Assessment Platform

export type VerificationStatus = 'verified' | 'pending' | 'unverified';
export type VerificationMethod = 'dns_txt' | 'http_file';
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'unassessed';

export interface Target {
  id: string;
  domain: string;
  url: string;
  description: string;
  verificationStatus: VerificationStatus;
  verificationMethod?: VerificationMethod;
  verificationToken: string;
  verificationRecordName?: string;
  lastScanDate: string | null;
  totalScans: number;
  riskLevel: RiskLevel;
  createdAt: string;
  tags: string[];
  isAuthorized: boolean;
}

export type ScanProfile = 'quick' | 'standard' | 'comprehensive' | 'custom';

export type ScanModule = 
  | 'http_headers'
  | 'ssl_tls'
  | 'cookie_security'
  | 'dns_security'
  | 'network_exposure'
  | 'web_vulnerabilities';

export type ScanStatus = 
  | 'pending'
  | 'validating'
  | 'queued'
  | 'running'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface ModuleExecutionStatus {
  id: ScanModule;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  findingsCount: number;
  duration?: string;
  completedAt?: string;
}

export interface ScanFindingsSummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  total: number;
}

export interface Scan {
  id: string;
  targetId: string;
  targetDomain: string;
  targetUrl: string;
  profile: ScanProfile;
  modules: ScanModule[];
  startedAt: string;
  completedAt: string | null;
  duration: string;
  status: ScanStatus;
  securityScore: number;
  findingsCount: ScanFindingsSummary;
  progress: number;
  currentModule?: string;
  isDemo: boolean;
  moduleStatuses: ModuleExecutionStatus[];
  notes?: string;
}

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'informational';
export type Confidence = 'certain' | 'firm' | 'tentative';
export type FindingStatus = 'open' | 'in_progress' | 'fixed' | 'accepted_risk';
export type FindingCategory = 
  | 'ssl_tls'
  | 'http_headers'
  | 'cookies'
  | 'dns'
  | 'network'
  | 'web_application';

export interface Finding {
  id: string;
  scanId: string;
  targetId: string;
  targetDomain: string;
  name: string;
  category: FindingCategory;
  severity: Severity;
  confidence: Confidence;
  status: FindingStatus;
  firstDetected: string;
  lastDetected: string;
  description: string;
  technicalEvidence: string;
  potentialImpact: string;
  recommendedRemediation: string;
  cweId?: string;
  cvssScore?: number;
  references: string[];
  isConfirmed: boolean;
  affectedUrl?: string;
  httpMethod?: string;
  parameter?: string;
}

export interface SecurityReport {
  id: string;
  scanId: string;
  targetId: string;
  targetDomain: string;
  name: string;
  generatedDate: string;
  securityScore: number;
  findingsSummary: ScanFindingsSummary;
  fileSize: string;
  executiveSummary: string;
  scopeDescription: string;
  testingLimitations: string;
  assessmentProfile: ScanProfile;
}

export interface IntegrationStatus {
  name: string;
  type: 'owasp_zap' | 'nmap' | 'sslyze' | 'fastapi';
  status: 'connected' | 'disconnected' | 'unavailable' | 'error';
  endpoint?: string;
  version?: string;
  description: string;
  lastChecked: string;
}

export interface SystemSettings {
  general: {
    workspaceName: string;
    adminName: string;
    adminEmail: string;
    theme: 'dark' | 'system';
    soundAlerts: boolean;
    autoRefreshSeconds: number;
  };
  scanning: {
    defaultProfile: ScanProfile;
    scanTimeoutMinutes: number;
    maxConcurrentScans: number;
    requestRateLimitRps: number;
    safeModeDefault: boolean;
    customUserAgent: string;
  };
  integrations: {
    fastApiUrl: string;
    owaspZapEndpoint: string;
    owaspZapApiKey: string;
    nmapPath: string;
    sslyzeEnabled: boolean;
  };
  security: {
    sessionTimeoutMinutes: number;
    require2FA: boolean;
    auditLogging: boolean;
    dataRetentionDays: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  workspace: string;
}
