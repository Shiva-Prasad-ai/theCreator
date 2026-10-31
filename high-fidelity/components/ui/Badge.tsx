import React from 'react';

/**
 * CreatorOS AI — High-Fidelity Badge & Status Pill Component Blueprint
 * Reference implementation for Shiva's Next.js integration.
 * Built for Tailwind CSS + shadcn/ui theme compatibility.
 */

export interface TrustBadgeProps {
  type: 'sample' | 'ai-suggested' | 'memory' | 'verified';
  children: React.ReactNode;
  className?: string;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ type, children, className = '' }) => {
  const typeClasses = {
    sample: 'bg-slate-800/60 text-slate-300 border-slate-700/60',
    'ai-suggested': 'bg-violet-900/30 text-violet-200 border-violet-700/50',
    memory: 'bg-cyan-950/40 text-cyan-300 border-cyan-500/50 shadow-sm shadow-cyan-500/20',
    verified: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/50'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${typeClasses[type]} ${className}`}
    >
      {children}
    </span>
  );
};

export interface StatusPillProps {
  status: 'scheduled' | 'ready' | 'approved' | 'posted' | 'failed' | 'needs-script' | 'empty';
  label?: string;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, label, className = '' }) => {
  const statusStyles = {
    scheduled: {
      bg: 'bg-violet-950/40 text-violet-300 border-violet-700/40',
      dot: 'bg-violet-500',
      defaultLabel: 'Scheduled'
    },
    ready: {
      bg: 'bg-cyan-950/40 text-cyan-300 border-cyan-500/40',
      dot: 'bg-cyan-400',
      defaultLabel: 'Ready'
    },
    approved: {
      bg: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40',
      dot: 'bg-emerald-400',
      defaultLabel: 'Approved ✓'
    },
    posted: {
      bg: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40',
      dot: 'bg-emerald-400',
      defaultLabel: 'Posted (Sample)'
    },
    failed: {
      bg: 'bg-rose-950/40 text-rose-300 border-rose-500/40',
      dot: 'bg-rose-500',
      defaultLabel: 'Failed (Sample)'
    },
    'needs-script': {
      bg: 'bg-amber-950/40 text-amber-300 border-amber-500/40',
      dot: 'bg-amber-400',
      defaultLabel: 'Needs Script ⚠️'
    },
    empty: {
      bg: 'bg-white/5 text-slate-400 border-dashed border-white/20',
      dot: 'bg-slate-500',
      defaultLabel: 'Empty Slot'
    }
  };

  const current = statusStyles[status] || statusStyles.ready;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono text-xs font-semibold px-2.5 py-0.5 rounded-full border ${current.bg} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />
      <span>{label || current.defaultLabel}</span>
    </span>
  );
};

