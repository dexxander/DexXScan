import React, { useState, useEffect, useCallback } from 'react';
import {
  Sidebar,
  PageId,
} from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { SearchModal } from './components/layout/SearchModal';
import { ToastProvider, useToast } from './components/common/ToastContext';
import { Dashboard } from './components/dashboard/Dashboard';
import { TargetList } from './components/targets/TargetList';
import { NewScan } from './components/scans/NewScan';
import { ScanHistory } from './components/scans/ScanHistory';
import { ScanDetails } from './components/scans/ScanDetails';
import { VulnerabilityList } from './components/vulnerabilities/VulnerabilityList';
import { ReportList } from './components/reports/ReportList';
import { Analytics } from './components/analytics/Analytics';
import { Settings } from './components/settings/Settings';
import {
  targetService,
  scanService,
  findingService,
  reportService,
  settingsService,
  checkBackendConnection,
} from './services/api';
import {
  Target,
  Scan,
  Finding,
  SecurityReport,
  SystemSettings,
  ScanProfile,
  ScanModule,
  FindingStatus,
} from './types';
import { INITIAL_SETTINGS } from './data/mockData';

const MainApp: React.FC = () => {
  const { toast } = useToast();

  // Navigation State
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [selectedScanId, setSelectedScanId] = useState<string | undefined>(undefined);
  const [selectedFindingId, setSelectedFindingId] = useState<string | undefined>(undefined);
  const [preselectedTargetId, setPreselectedTargetId] = useState<string | undefined>(undefined);

  // Layout State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Data State
  const [targets, setTargets] = useState<Target[]>([]);
  const [scans, setScans] = useState<Scan[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [reports, setReports] = useState<SecurityReport[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Load
  const loadInitialData = useCallback(async () => {
    try {
      const [tgtData, scnData, fndData, repData, settsData] = await Promise.all([
        targetService.getTargets(),
        scanService.getScans(),
        findingService.getFindings(),
        reportService.getReports(),
        settingsService.getSettings(),
      ]);

      setTargets(tgtData);
      setScans(scnData);
      setFindings(fndData);
      setReports(repData);
      setSettings(settsData);

      // Check backend ping
      const backendStatus = await checkBackendConnection();
      setIsBackendConnected(backendStatus.connected);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Periodic or manual backend check
  const handleRefreshBackend = async () => {
    const backendStatus = await checkBackendConnection();
    setIsBackendConnected(backendStatus.connected);
    if (backendStatus.connected) {
      toast({
        type: 'success',
        title: 'FastAPI Backend Online',
        message: `Endpoint active: ${backendStatus.url}`,
      });
    } else {
      toast({
        type: 'info',
        title: 'FastAPI Backend Disconnected',
        message: 'Currently operating in frontend demonstration mode with simulated data.',
      });
    }
  };

  // Navigation router
  const handleNavigate = (page: PageId, id?: string) => {
    if (page === 'scan-details') {
      setSelectedScanId(id || scans[0]?.id);
    } else if (page === 'vulnerabilities') {
      setSelectedFindingId(id);
    } else if (page === 'new-scan') {
      setPreselectedTargetId(id);
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Actions
  const handleAddTarget = async (data: {
    domain: string;
    description: string;
    isAuthorized: boolean;
    verificationMethod: 'dns_txt' | 'http_file';
  }) => {
    const newTarget = await targetService.createTarget(data);
    setTargets((prev) => [newTarget, ...prev]);
  };

  const handleDeleteTarget = async (id: string) => {
    await targetService.deleteTarget(id);
    setTargets((prev) => prev.filter((t) => t.id !== id));
  };

  const handleVerifyTarget = async (id: string) => {
    const updated = await targetService.verifyTarget(id);
    setTargets((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const handleStartScan = async (params: {
    targetId: string;
    profile: ScanProfile;
    modules: ScanModule[];
    notes?: string;
  }): Promise<Scan> => {
    const newScan = await scanService.createScan(params);
    setScans((prev) => [newScan, ...prev]);
    // Also update target's last scan
    const updatedTargets = await targetService.getTargets();
    setTargets(updatedTargets);
    return newScan;
  };

  const handleReRunScan = async (scan: Scan) => {
    try {
      const newScan = await handleStartScan({
        targetId: scan.targetId,
        profile: scan.profile,
        modules: scan.modules,
        notes: `Re-run of ${scan.id}`,
      });
      setSelectedScanId(newScan.id);
      setActivePage('scan-details');
    } catch {
      toast({ type: 'error', title: 'Could not re-run assessment' });
    }
  };

  const handleUpdateFindingStatus = async (id: string, status: FindingStatus) => {
    const updated = await findingService.updateFindingStatus(id, status);
    setFindings((prev) => prev.map((f) => (f.id === id ? updated : f)));
  };

  const handleGenerateReport = async (scanId: string) => {
    const newReport = await reportService.generateReport(scanId);
    setReports((prev) => [newReport, ...prev]);
  };

  const handleDeleteReport = async (id: string) => {
    await reportService.deleteReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSaveSettings = async (newSettings: SystemSettings) => {
    const updated = await settingsService.updateSettings(newSettings);
    setSettings(updated);
  };

  // Selected scan for details
  const activeScanDetails = scans.find((s) => s.id === selectedScanId) || scans[0];

  return (
    <div className="flex min-h-screen bg-background text-text-main font-sans antialiased">
      {/* Persistent Collapsible Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isBackendConnected={isBackendConnected}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Header */}
        <Header
          activePage={activePage}
          onNavigate={handleNavigate}
          onOpenSearch={() => setIsSearchOpen(true)}
          isBackendConnected={isBackendConnected}
          onRefreshBackend={handleRefreshBackend}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
              <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono text-text-muted">Loading DexXScan Security Platform...</p>
            </div>
          ) : (
            <>
              {activePage === 'dashboard' && (
                <Dashboard
                  targets={targets}
                  scans={scans}
                  findings={findings}
                  onNavigate={handleNavigate}
                />
              )}

              {activePage === 'targets' && (
                <TargetList
                  targets={targets}
                  onAddTarget={handleAddTarget}
                  onDeleteTarget={handleDeleteTarget}
                  onVerifyTarget={handleVerifyTarget}
                  onNavigate={handleNavigate}
                />
              )}

              {activePage === 'new-scan' && (
                <NewScan
                  targets={targets}
                  preselectedTargetId={preselectedTargetId}
                  onStartScan={handleStartScan}
                  onNavigate={handleNavigate}
                />
              )}

              {activePage === 'scan-history' && (
                <ScanHistory
                  scans={scans}
                  onNavigate={handleNavigate}
                  onReRunScan={handleReRunScan}
                />
              )}

              {activePage === 'scan-details' && (
                <ScanDetails
                  scan={activeScanDetails}
                  findings={findings}
                  onNavigate={handleNavigate}
                  onGenerateReport={handleGenerateReport}
                  onReRunScan={handleReRunScan}
                />
              )}

              {activePage === 'vulnerabilities' && (
                <VulnerabilityList
                  findings={findings}
                  initialFindingId={selectedFindingId}
                  onUpdateStatus={handleUpdateFindingStatus}
                  onNavigate={handleNavigate}
                />
              )}

              {activePage === 'reports' && (
                <ReportList
                  reports={reports}
                  scans={scans}
                  findings={findings}
                  onGenerateReport={handleGenerateReport}
                  onDeleteReport={handleDeleteReport}
                  onNavigate={handleNavigate}
                />
              )}

              {activePage === 'analytics' && (
                <Analytics
                  targets={targets}
                  scans={scans}
                  findings={findings}
                  onNavigate={handleNavigate}
                />
              )}

              {activePage === 'settings' && (
                <Settings
                  settings={settings}
                  onSaveSettings={handleSaveSettings}
                  isBackendConnected={isBackendConnected}
                  onRefreshBackend={handleRefreshBackend}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Global Search / Command Palette Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={handleNavigate}
        targets={targets}
        scans={scans}
        findings={findings}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
