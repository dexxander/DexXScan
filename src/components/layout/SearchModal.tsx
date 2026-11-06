import React, { useState, useEffect, useMemo } from 'react';
import { Search, Target as TargetIcon, PlayCircle, Bug, ArrowRight, X } from 'lucide-react';
import { PageId } from './Sidebar';
import { Target, Scan, Finding } from '../../types';
import { SeverityBadge, StatusBadge } from '../common/Badge';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageId, id?: string) => void;
  targets: Target[];
  scans: Scan[];
  findings: Finding[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  targets,
  scans,
  findings,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredTargets = useMemo(() => {
    if (!query) return targets.slice(0, 3);
    const q = query.toLowerCase();
    return targets.filter(
      (t) => t.domain.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    );
  }, [query, targets]);

  const filteredScans = useMemo(() => {
    if (!query) return scans.slice(0, 3);
    const q = query.toLowerCase();
    return scans.filter(
      (s) => s.id.toLowerCase().includes(q) || s.targetDomain.toLowerCase().includes(q)
    );
  }, [query, scans]);

  const filteredFindings = useMemo(() => {
    if (!query) return findings.slice(0, 4);
    const q = query.toLowerCase();
    return findings.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.targetDomain.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        (f.cweId && f.cweId.toLowerCase().includes(q))
    );
  }, [query, findings]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-sidebar/80">
          <Search className="w-5 h-5 text-accent-primary shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search targets, scans, vulnerabilities, CVE/CWE..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-text-main placeholder:text-text-muted outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-text-muted hover:text-text-main">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] bg-elevated px-2 py-0.5 rounded border border-border text-text-muted font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="p-3 max-h-[60vh] overflow-y-auto space-y-4">
          {/* Targets */}
          {filteredTargets.length > 0 && (
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted px-2 mb-1.5 flex items-center gap-1.5">
                <TargetIcon className="w-3 h-3 text-accent-secondary" /> Targets
              </p>
              <div className="space-y-1">
                {filteredTargets.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      onClose();
                      onNavigate('targets');
                    }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-elevated cursor-pointer group text-xs"
                  >
                    <div>
                      <span className="font-semibold text-text-main group-hover:text-accent-primary transition-colors">
                        {t.domain}
                      </span>
                      <p className="text-[11px] text-text-muted truncate max-w-md">{t.description}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted group-hover:text-accent-primary transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vulnerabilities */}
          {filteredFindings.length > 0 && (
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted px-2 mb-1.5 flex items-center gap-1.5">
                <Bug className="w-3 h-3 text-red-400" /> Vulnerabilities
              </p>
              <div className="space-y-1">
                {filteredFindings.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => {
                      onClose();
                      onNavigate('vulnerabilities', f.id);
                    }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-elevated cursor-pointer group text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-main truncate group-hover:text-red-300">
                          {f.name}
                        </span>
                        {f.cweId && (
                          <span className="font-mono text-[10px] text-text-muted">
                            {f.cweId}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-text-muted truncate">{f.targetDomain}</p>
                    </div>
                    <SeverityBadge severity={f.severity} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Scans */}
          {filteredScans.length > 0 && (
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted px-2 mb-1.5 flex items-center gap-1.5">
                <PlayCircle className="w-3 h-3 text-accent-primary" /> Assessments
              </p>
              <div className="space-y-1">
                {filteredScans.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      onClose();
                      onNavigate('scan-details', s.id);
                    }}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-elevated cursor-pointer group text-xs"
                  >
                    <div>
                      <span className="font-mono text-accent-primary">{s.id}</span>
                      <span className="text-text-secondary ml-2 font-medium">{s.targetDomain}</span>
                      <span className="text-[10px] text-text-muted ml-2">({s.profile})</span>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
