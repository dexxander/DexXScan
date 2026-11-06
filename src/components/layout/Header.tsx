import React, { useState } from 'react';
import {
  Bell,
  Search,
  Plus,
  ChevronRight,
  Shield,
  Activity,
  Server,
  User as UserIcon,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { PageId } from './Sidebar';
import { Button } from '../common/Button';
import { CURRENT_USER } from '../../data/mockData';

interface HeaderProps {
  activePage: PageId;
  onNavigate: (page: PageId, targetOrScanId?: string) => void;
  onOpenSearch: () => void;
  isBackendConnected: boolean;
  onRefreshBackend: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePage,
  onNavigate,
  onOpenSearch,
  isBackendConnected,
  onRefreshBackend,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const pageTitles: Record<PageId, { title: string; subtitle: string; category: string }> = {
    dashboard: {
      category: 'Overview',
      title: 'Security Overview',
      subtitle: 'Monitor website security assessments and vulnerability posture',
    },
    targets: {
      category: 'Assessment',
      title: 'Registered Targets',
      subtitle: 'Manage and verify authorized target assets for penetration testing',
    },
    'new-scan': {
      category: 'Assessment',
      title: 'New Security Assessment',
      subtitle: 'Configure scope, modules, and initiate authorized vulnerability scans',
    },
    'scan-history': {
      category: 'Assessment',
      title: 'Scan History',
      subtitle: 'Review historical penetration tests, track regressions, and compare audits',
    },
    'scan-details': {
      category: 'Assessment',
      title: 'Assessment Results',
      subtitle: 'In-depth scan telemetry, technical evidence, and security scoring',
    },
    vulnerabilities: {
      category: 'Assessment',
      title: 'Vulnerability Management',
      subtitle: 'Triage, inspect, and track remediation states for detected security findings',
    },
    reports: {
      category: 'Reporting',
      title: 'Security Reports',
      subtitle: 'Generate and review professional executive and technical audit reports',
    },
    analytics: {
      category: 'Reporting',
      title: 'Security Analytics',
      subtitle: 'Macro vulnerability trends, category distributions, and posture metrics',
    },
    settings: {
      category: 'System',
      title: 'System & Engine Settings',
      subtitle: 'Configure scan parameters, rate limits, and external tool integrations',
    },
  };

  const currentInfo = pageTitles[activePage] || {
    category: 'Assessment',
    title: 'Security Dashboard',
    subtitle: 'DexXScan Security Platform',
  };

  const notifications = [
    {
      id: 'notif-1',
      title: 'Critical Vulnerability Flagged',
      detail: 'SQL Injection detected in api.payments-gateway.internal',
      time: '15m ago',
      type: 'critical',
    },
    {
      id: 'notif-2',
      title: 'Assessment Completed',
      detail: 'Scan SCN-2026-0492 finished with 4 findings',
      time: '1h ago',
      type: 'info',
    },
    {
      id: 'notif-3',
      title: 'Target Verification Pending',
      detail: 'staging-auth.securecorp-demo.com requires DNS TXT verification',
      time: '3h ago',
      type: 'warning',
    },
  ];

  return (
    <header className="h-16 bg-sidebar/80 backdrop-blur-md border-b border-border px-6 flex items-center justify-between z-20 sticky top-0">
      {/* Left Title and Breadcrumbs */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <span>DexXScan</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-text-secondary">{currentInfo.category}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-accent-primary font-medium">{currentInfo.title}</span>
          </div>
          <h1 className="text-lg font-bold text-text-main leading-tight tracking-tight">
            {currentInfo.title}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Backend Status indicator */}
        <button
          onClick={onRefreshBackend}
          className={`hidden md:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
            isBackendConnected
              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40'
              : 'bg-amber-950/20 border-amber-800/50 text-amber-300 hover:bg-amber-900/30'
          }`}
          title="Click to check FastAPI backend connectivity"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span>FastAPI: {isBackendConnected ? 'Online (8000)' : 'Demo Mode'}</span>
        </button>

        {/* Global Search trigger */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/80 border border-border hover:border-slate-600 text-xs text-text-secondary hover:text-text-main transition-all group shadow-sm"
        >
          <Search className="w-3.5 h-3.5 text-text-muted group-hover:text-accent-primary transition-colors" />
          <span className="hidden sm:inline">Search targets, scans, CVEs...</span>
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-elevated border border-border text-text-muted font-mono">
            Ctrl K
          </kbd>
        </button>

        {/* Primary Action Button */}
        {activePage !== 'new-scan' && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => onNavigate('new-scan')}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Assessment
          </Button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 rounded-lg bg-card border border-border hover:border-slate-600 text-text-secondary hover:text-text-main transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-card" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-semibold text-text-main uppercase font-mono">
                  Security Alerts (3)
                </span>
                <span className="text-[10px] text-accent-primary cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="py-2 space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-lg bg-elevated/50 hover:bg-elevated border border-transparent hover:border-border transition-all cursor-pointer"
                    onClick={() => {
                      setShowNotifications(false);
                      onNavigate('vulnerabilities');
                    }}
                  >
                    <div className="flex items-center justify-between text-xs font-medium text-text-main">
                      <span className="truncate">{n.title}</span>
                      <span className="text-[10px] text-text-muted font-mono">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-text-secondary mt-1 truncate">{n.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-lg bg-card border border-border hover:border-slate-600 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-accent-primary/20 border border-accent-primary/40 text-accent-primary flex items-center justify-center text-xs font-bold font-mono">
              AR
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-2xl p-3 z-50">
              <div className="pb-3 border-b border-border">
                <p className="text-sm font-semibold text-text-main">{CURRENT_USER.name}</p>
                <p className="text-xs text-text-secondary truncate">{CURRENT_USER.email}</p>
                <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-elevated border border-border text-accent-primary">
                  {CURRENT_USER.role}
                </span>
              </div>
              <div className="py-2 space-y-1 text-xs">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigate('settings');
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-elevated text-text-secondary hover:text-text-main flex items-center justify-between"
                >
                  <span>Workspace Settings</span>
                  <ExternalLink className="w-3 h-3 text-text-muted" />
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigate('targets');
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-elevated text-text-secondary hover:text-text-main"
                >
                  Authorized Targets
                </button>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="text-[11px] text-amber-300 bg-amber-950/30 p-2 rounded border border-amber-900/40">
                  <ShieldAlert className="w-3 h-3 inline mr-1" />
                  Demonstration Mode Active
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
