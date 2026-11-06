import React from 'react';
import { Severity, ScanStatus, VerificationStatus, FindingStatus, RiskLevel } from '../../types';

interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'dot';
}

export const SeverityBadge: React.FC<{ severity: Severity; className?: string }> = ({ severity, className = '' }) => {
  const styles: Record<Severity, string> = {
    critical: 'bg-red-950/70 text-red-300 border-red-800/80',
    high: 'bg-orange-950/70 text-orange-300 border-orange-800/80',
    medium: 'bg-yellow-950/70 text-yellow-300 border-yellow-800/80',
    low: 'bg-blue-950/70 text-blue-300 border-blue-800/80',
    informational: 'bg-slate-800/70 text-slate-300 border-slate-700/80',
  };

  const dots: Record<Severity, string> = {
    critical: 'bg-red-400',
    high: 'bg-orange-400',
    medium: 'bg-yellow-400',
    low: 'bg-blue-400',
    informational: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider ${styles[severity]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[severity]}`} />
      {severity}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: ScanStatus; className?: string }> = ({ status, className = '' }) => {
  const configs: Record<ScanStatus, { bg: string; text: string; border: string; pulse?: boolean }> = {
    completed: { bg: 'bg-emerald-950/60', text: 'text-emerald-400', border: 'border-emerald-800/60' },
    running: { bg: 'bg-blue-950/70', text: 'text-blue-400', border: 'border-blue-700/80', pulse: true },
    queued: { bg: 'bg-amber-950/60', text: 'text-amber-300', border: 'border-amber-800/60' },
    validating: { bg: 'bg-indigo-950/60', text: 'text-indigo-300', border: 'border-indigo-800/60', pulse: true },
    processing: { bg: 'bg-cyan-950/60', text: 'text-cyan-300', border: 'border-cyan-800/60', pulse: true },
    pending: { bg: 'bg-slate-900', text: 'text-slate-400', border: 'border-slate-800' },
    failed: { bg: 'bg-rose-950/70', text: 'text-rose-400', border: 'border-rose-800/80' },
    cancelled: { bg: 'bg-gray-900', text: 'text-gray-400', border: 'border-gray-800' },
  };

  const c = configs[status] || configs.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${c.bg} ${c.text} ${c.border} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'completed'
            ? 'bg-emerald-400'
            : status === 'running'
            ? 'bg-blue-400 animate-ping'
            : status === 'failed'
            ? 'bg-rose-400'
            : 'bg-slate-400'
        }`}
      />
      {status}
    </span>
  );
};

export const VerificationBadge: React.FC<{ status: VerificationStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  if (status === 'verified') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/50 text-emerald-400 border border-emerald-800/60 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Verified
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-950/50 text-amber-300 border border-amber-800/60 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Pending Verification
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-900 text-slate-400 border border-slate-800 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
      Unverified
    </span>
  );
};

export const FindingStatusBadge: React.FC<{ status: FindingStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const styles: Record<FindingStatus, { label: string; cls: string }> = {
    open: { label: 'Open', cls: 'bg-red-950/40 text-red-300 border-red-800/50' },
    in_progress: { label: 'In Progress', cls: 'bg-amber-950/40 text-amber-300 border-amber-800/50' },
    fixed: { label: 'Fixed', cls: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50' },
    accepted_risk: { label: 'Accepted Risk', cls: 'bg-slate-800/60 text-slate-300 border-slate-700/60' },
  };

  const item = styles[status] || styles.open;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${item.cls} ${className}`}
    >
      {item.label}
    </span>
  );
};

export const RiskBadge: React.FC<{ risk: RiskLevel; className?: string }> = ({ risk, className = '' }) => {
  const styles: Record<RiskLevel, { text: string; bg: string; border: string }> = {
    critical: { text: 'text-red-400', bg: 'bg-red-950/50', border: 'border-red-900/60' },
    high: { text: 'text-orange-400', bg: 'bg-orange-950/50', border: 'border-orange-900/60' },
    medium: { text: 'text-yellow-400', bg: 'bg-yellow-950/50', border: 'border-yellow-900/60' },
    low: { text: 'text-blue-400', bg: 'bg-blue-950/50', border: 'border-blue-900/60' },
    unassessed: { text: 'text-slate-400', bg: 'bg-slate-900/60', border: 'border-slate-800' },
  };

  const s = styles[risk] || styles.unassessed;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${s.bg} ${s.text} ${s.border} ${className}`}
    >
      {risk}
    </span>
  );
};
