import React from 'react';
import {
  Shield,
  LayoutDashboard,
  Target as TargetIcon,
  PlayCircle,
  History,
  Bug,
  FileText,
  BarChart3,
  Settings as SettingsIcon,
  ChevronLeft,
  ChevronRight,
  Server,
  Zap,
} from 'lucide-react';
import { CURRENT_USER } from '../../data/mockData';

export type PageId =
  | 'dashboard'
  | 'targets'
  | 'new-scan'
  | 'scan-history'
  | 'scan-details'
  | 'vulnerabilities'
  | 'reports'
  | 'analytics'
  | 'settings';

interface SidebarProps {
  activePage: PageId;
  onNavigate: (page: PageId, targetOrScanId?: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isBackendConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isBackendConnected,
}) => {
  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard' as PageId, label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'ASSESSMENT',
      items: [
        { id: 'targets' as PageId, label: 'Targets', icon: TargetIcon },
        { id: 'new-scan' as PageId, label: 'New Scan', icon: PlayCircle, highlight: true },
        { id: 'scan-history' as PageId, label: 'Scan History', icon: History },
        { id: 'vulnerabilities' as PageId, label: 'Vulnerabilities', icon: Bug },
      ],
    },
    {
      title: 'REPORTING',
      items: [
        { id: 'reports' as PageId, label: 'Reports', icon: FileText },
        { id: 'analytics' as PageId, label: 'Analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings' as PageId, label: 'Settings', icon: SettingsIcon },
      ],
    },
  ];

  return (
    <aside
      className={`relative flex flex-col bg-sidebar border-r border-border transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-border">
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer overflow-hidden group"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border group-hover:border-accent-primary/60 transition-colors shrink-0">
            <Shield className="w-5 h-5 text-accent-primary" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
          </div>

          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                DexXScan
                <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded bg-accent-primary/10 text-accent-primary border border-accent-primary/30">
                  PRO
                </span>
              </span>
              <span className="text-[11px] text-text-secondary truncate">
                Website Security Assessment
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md text-text-secondary hover:text-text-main hover:bg-elevated transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navSections.map((sec) => (
          <div key={sec.title}>
            {!isCollapsed && (
              <h4 className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-text-muted font-mono uppercase">
                {sec.title}
              </h4>
            )}
            <nav className="space-y-1">
              {sec.items.map((item) => {
                const isActive = activePage === item.id;
                const Icon = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                      isActive
                        ? 'bg-elevated text-accent-primary border border-border shadow-sm font-semibold'
                        : 'text-text-secondary hover:text-text-main hover:bg-card/70'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-accent-primary'
                          : item.highlight
                          ? 'text-accent-primary group-hover:text-accent-primary'
                          : 'text-text-secondary group-hover:text-text-main'
                      }`}
                    />

                    {!isCollapsed && (
                      <span className="truncate flex-1 text-left">{item.label}</span>
                    )}

                    {!isCollapsed && item.highlight && !isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                    )}

                    {/* Active left indicator pill */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-accent-primary" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Backend Status indicator */}
      <div className="px-3 py-2 border-t border-border bg-sidebar/50">
        <div
          onClick={() => onNavigate('settings')}
          className={`cursor-pointer rounded-lg p-2 border transition-all text-xs flex items-center gap-2 ${
            isBackendConnected
              ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
              : 'bg-card border-border hover:border-slate-600 text-text-secondary'
          }`}
          title="Click to check FastAPI Backend status in Settings"
        >
          <Server className={`w-3.5 h-3.5 shrink-0 ${isBackendConnected ? 'text-accent-primary' : 'text-amber-400'}`} />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-text-muted">SCAN ENGINE</span>
                <span className={`w-1.5 h-1.5 rounded-full ${isBackendConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              </div>
              <p className="truncate text-[11px] font-medium text-text-main">
                {isBackendConnected ? 'FastAPI Connected' : 'Demo Mode (Local)'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-border bg-sidebar">
        <div className="flex items-center gap-3 p-1.5 rounded-lg bg-card/40 border border-border/60">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-primary/20 to-accent-secondary/20 border border-accent-primary/40 flex items-center justify-center font-mono font-bold text-xs text-accent-primary shrink-0">
            AR
          </div>

          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-main truncate">
                {CURRENT_USER.name}
              </p>
              <p className="text-[10px] text-text-muted truncate">
                Administrator
              </p>
              <div className="flex items-center justify-between mt-1 text-[10px] text-text-muted font-mono">
                <span>Personal Workspace</span>
                <span>v0.1.0</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
