import React from 'react';
import { ShieldAlert, Terminal, Info, ExternalLink } from 'lucide-react';
import { API_BASE_URL } from '../../services/api';

interface DemoNoticeProps {
  variant?: 'banner' | 'card' | 'inline';
  className?: string;
  onOpenSettings?: () => void;
}

export const DemoNotice: React.FC<DemoNoticeProps> = ({
  variant = 'banner',
  className = '',
  onOpenSettings,
}) => {
  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-950/40 text-amber-300 border border-amber-800/60 ${className}`}>
        <ShieldAlert className="w-3 h-3 text-amber-400" />
        DEMO DATA
      </span>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`p-4 rounded-xl border border-amber-800/40 bg-amber-950/20 text-text-secondary text-xs leading-relaxed ${className}`}>
        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-amber-300 uppercase tracking-wider text-[11px]">
                Demonstration Mode Active
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-900/40 text-amber-300 font-mono">
                LOCAL PROTOTYPE
              </span>
            </div>
            <p className="text-slate-300 mb-2">
              No real network probes or automated exploitation tools are executed from your browser. Displayed security scores, vulnerabilities, and findings are simulated demonstration models.
            </p>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="text-text-muted flex items-center gap-1">
                <Terminal className="w-3 h-3 text-slate-400" />
                FastAPI Target Engine: <span className="text-slate-300 font-mono">{API_BASE_URL}</span>
              </span>
              {onOpenSettings && (
                <button
                  onClick={onOpenSettings}
                  className="text-accent-secondary hover:text-blue-300 underline font-medium inline-flex items-center gap-1"
                >
                  Configure Integrations <ExternalLink className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-amber-950/30 border-b border-amber-900/40 px-4 py-2 flex items-center justify-between text-xs text-amber-200/90 ${className}`}>
      <div className="flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="font-semibold text-amber-300 tracking-wide font-mono text-[11px]">
          [DEMO MODE]
        </span>
        <span className="text-slate-300">
          Browser frontend active. Real OWASP ZAP & Nmap scanning engine will run on FastAPI backend. All scan data is simulated demonstration data.
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] font-mono text-slate-400 bg-black/40 px-2 py-0.5 rounded border border-border">
          API: Disconnected
        </span>
      </div>
    </div>
  );
};
