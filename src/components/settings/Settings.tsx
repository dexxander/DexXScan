import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Server,
  Shield,
  Save,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Terminal,
  Activity,
  Lock,
} from 'lucide-react';
import { SystemSettings } from '../../types';
import { Button } from '../common/Button';
import { DemoNotice } from '../common/DemoNotice';
import { useToast } from '../common/ToastContext';
import { checkBackendConnection, BackendHealthResponse } from '../../services/api';

interface SettingsProps {
  settings: SystemSettings;
  onSaveSettings: (settings: SystemSettings) => Promise<void>;
  isBackendConnected: boolean;
  onRefreshBackend: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  settings: initialSettings,
  onSaveSettings,
  isBackendConnected,
  onRefreshBackend,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'general' | 'scanning' | 'integrations' | 'security'>('integrations');
  const [formData, setFormData] = useState<SystemSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);
  const [backendHealthInfo, setBackendHealthInfo] = useState<BackendHealthResponse | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveSettings(formData);
      setIsSaving(false);
      toast({
        type: 'success',
        title: 'Settings Saved',
        message: 'System configurations updated successfully.',
      });
    } catch {
      setIsSaving(false);
      toast({ type: 'error', title: 'Failed to save settings' });
    }
  };

  const handleTestBackend = async () => {
    setIsCheckingBackend(true);
    try {
      const result = await checkBackendConnection();
      setBackendHealthInfo(result);
      setIsCheckingBackend(false);
      onRefreshBackend();

      if (result.connected) {
        toast({
          type: 'success',
          title: 'FastAPI Backend Connected',
          message: `Connected to ${result.url} (${result.latencyMs}ms)`,
        });
      } else {
        toast({
          type: 'warning',
          title: 'Backend Offline (Demo Mode)',
          message: result.message,
        });
      }
    } catch (err) {
      setIsCheckingBackend(false);
      toast({
        type: 'error',
        title: 'Connection Check Failed',
        message: 'Could not contact backend at specified host.',
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Banner */}
      <DemoNotice variant="card" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-main flex items-center gap-2">
            System & Engine Settings
            <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-accent-primary/10 text-accent-primary border border-accent-primary/30">
              v0.1.0
            </span>
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Configure scan execution parameters, external integration endpoints, and workspace preferences.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleSave}
          isLoading={isSaving}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save All Changes
        </Button>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-px font-mono text-xs">
        {[
          { id: 'integrations', label: 'INTEGRATIONS & ENGINE', icon: Server },
          { id: 'scanning', label: 'SCANNING POLICIES', icon: Sliders },
          { id: 'general', label: 'GENERAL WORKSPACE', icon: SettingsIcon },
          { id: 'security', label: 'SECURITY & AUDIT', icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-medium transition-all ${
                isActive
                  ? 'border-accent-primary text-accent-primary bg-card/60 rounded-t-lg'
                  : 'border-transparent text-text-muted hover:text-text-main hover:bg-card/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* FORM SECTIONS */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: INTEGRATIONS */}
        {activeTab === 'integrations' && (
          <div className="space-y-4">
            {/* FastAPI Engine Status */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-sidebar border border-border text-accent-primary">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-text-main">
                      Python FastAPI Scanning Backend
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Central REST API and asynchronous scanning orchestrator
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium border ${
                      isBackendConnected
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : 'bg-amber-950/60 text-amber-300 border-amber-800/80'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                    {isBackendConnected ? 'Connected (Online)' : 'Disconnected (Demo Mode)'}
                  </span>

                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    isLoading={isCheckingBackend}
                    onClick={handleTestBackend}
                    leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                  >
                    Test Connection
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-text-main mb-1.5">
                    FastAPI Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={formData.integrations.fastApiUrl}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        integrations: { ...formData.integrations, fastApiUrl: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-text-main font-mono text-xs outline-none focus:border-accent-primary"
                  />
                  <p className="text-[11px] text-text-muted mt-1">
                    Standard local development port is <code>http://127.0.0.1:8000</code>.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-text-main mb-1.5">
                    Current Connection Status
                  </label>
                  <div className="p-2.5 rounded-lg bg-sidebar border border-border text-[11px] font-mono text-text-secondary leading-normal">
                    {backendHealthInfo ? (
                      backendHealthInfo.message
                    ) : (
                      <>FastAPI is not detected on 127.0.0.1:8000. DexXScan is currently operating in frontend demonstration mode with simulated security telemetry.</>
                    )}
                  </div>
                </div>
              </div>

              {/* Instructions to run Python backend */}
              <div className="p-3.5 rounded-xl border border-border bg-sidebar/70 text-xs space-y-2">
                <span className="font-mono text-text-main font-bold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-accent-primary" /> How to launch the Python FastAPI backend:
                </span>
                <pre className="bg-black/80 text-emerald-400 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
                  git clone https://github.com/DexXScan/dexxscan-backend.git{"\n"}
                  cd dexxscan-backend &amp;&amp; pip install -r requirements.txt{"\n"}
                  uvicorn app.main:app --reload --port 8000
                </pre>
              </div>
            </div>

            {/* External Tool Integrations Grid: ZAP, Nmap, SSLyze */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* OWASP ZAP */}
              <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-text-main">OWASP ZAP</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      Unavailable
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mb-3">
                    Zed Attack Proxy for automated and passive web vulnerability scanning.
                  </p>
                  <label className="block text-[11px] text-text-muted font-mono mb-1">
                    Daemon Endpoint:
                  </label>
                  <input
                    type="text"
                    value={formData.integrations.owaspZapEndpoint}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        integrations: { ...formData.integrations, owaspZapEndpoint: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-sidebar border border-border rounded text-xs font-mono text-text-main outline-none mb-2"
                  />
                </div>
                <div className="pt-2 border-t border-border/60 text-[10px] text-text-muted font-mono">
                  Managed via FastAPI daemon bridge
                </div>
              </div>

              {/* Nmap */}
              <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-text-main">Nmap Scanner</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      Not Detected
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mb-3">
                    Authorized network exploration and port fingerprinting engine.
                  </p>
                  <label className="block text-[11px] text-text-muted font-mono mb-1">
                    Binary Path:
                  </label>
                  <input
                    type="text"
                    value={formData.integrations.nmapPath}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        integrations: { ...formData.integrations, nmapPath: e.target.value },
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-sidebar border border-border rounded text-xs font-mono text-text-main outline-none mb-2"
                  />
                </div>
                <div className="pt-2 border-t border-border/60 text-[10px] text-text-muted font-mono">
                  Requires local binary in PATH
                </div>
              </div>

              {/* SSLyze */}
              <div className="bg-card border border-border rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-text-main">SSLyze Engine</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      Module Ready
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mb-3">
                    Fast and comprehensive SSL/TLS cipher suite and certificate analyzer.
                  </p>
                  <div className="p-2.5 rounded bg-sidebar border border-border text-[11px] text-text-secondary font-mono">
                    pip install sslyze==5.2.0
                  </div>
                </div>
                <div className="pt-2 border-t border-border/60 text-[10px] text-text-muted font-mono mt-3">
                  Python 3.10+ native module
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCANNING POLICIES */}
        {activeTab === 'scanning' && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-text-main pb-2 border-b border-border">
              Scanning & Rate Limiting Policies
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-text-main mb-1.5">
                  Default Assessment Profile
                </label>
                <select
                  value={formData.scanning.defaultProfile}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scanning: { ...formData.scanning, defaultProfile: e.target.value as any },
                    })
                  }
                  className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-text-main font-mono outline-none"
                >
                  <option value="quick">Quick Scan</option>
                  <option value="standard">Standard Scan (Recommended)</option>
                  <option value="comprehensive">Comprehensive Scan</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1.5">
                  Scan Timeout (Minutes)
                </label>
                <input
                  type="number"
                  value={formData.scanning.scanTimeoutMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scanning: { ...formData.scanning, scanTimeoutMinutes: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-text-main font-mono outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1.5">
                  Maximum Concurrent Scans
                </label>
                <input
                  type="number"
                  value={formData.scanning.maxConcurrentScans}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scanning: { ...formData.scanning, maxConcurrentScans: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-text-main font-mono outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1.5">
                  Request Rate Limit (RPS)
                </label>
                <input
                  type="number"
                  value={formData.scanning.requestRateLimitRps}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scanning: { ...formData.scanning, requestRateLimitRps: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-text-main font-mono outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-text-main mb-1.5">
                Custom Scanner User-Agent String
              </label>
              <input
                type="text"
                value={formData.scanning.customUserAgent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    scanning: { ...formData.scanning, customUserAgent: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-text-main font-mono outline-none"
              />
            </div>
          </div>
        )}

        {/* TAB 3: GENERAL */}
        {activeTab === 'general' && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-text-main pb-2 border-b border-border">
              General Workspace Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-text-main mb-1.5">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={formData.general.workspaceName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      general: { ...formData.general, workspaceName: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-text-main outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1.5">
                  Administrator Email
                </label>
                <input
                  type="email"
                  value={formData.general.adminEmail}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      general: { ...formData.general, adminEmail: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-text-main font-mono outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.general.soundAlerts}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      general: { ...formData.general, soundAlerts: e.target.checked },
                    })
                  }
                  className="rounded border-border accent-accent-primary"
                />
                <span className="text-text-main">Enable sound alerts on critical findings</span>
              </label>
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY & AUDIT */}
        {activeTab === 'security' && (
          <div className="bg-card border border-border rounded-xl p-5 space-y-4 text-xs">
            <h3 className="text-sm font-semibold text-text-main pb-2 border-b border-border">
              Security & Audit Retention Policies
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-text-main mb-1.5">
                  Session Timeout (Minutes)
                </label>
                <input
                  type="number"
                  value={formData.security.sessionTimeoutMinutes}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      security: { ...formData.security, sessionTimeoutMinutes: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-text-main font-mono outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-main mb-1.5">
                  Telemetry Data Retention (Days)
                </label>
                <input
                  type="number"
                  value={formData.security.dataRetentionDays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      security: { ...formData.security, dataRetentionDays: Number(e.target.value) },
                    })
                  }
                  className="w-full px-3 py-2 bg-sidebar border border-border rounded-lg text-text-main font-mono outline-none"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-sidebar/50 space-y-2">
              <span className="font-semibold text-text-main block">Audit Log Activity</span>
              <p className="text-[11px] text-text-secondary">
                All target registrations, scan initiations, and remediation status adjustments are securely timestamped.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
