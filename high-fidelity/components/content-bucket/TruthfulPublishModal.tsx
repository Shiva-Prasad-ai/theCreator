import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusPill, TrustBadge } from '../ui/Badge';
import { ErrorBanner } from '../ui/Input';

/**
 * CreatorOS AI — High-Fidelity Truthful Publishing & Scheduling Modal Blueprint
 * Strictly enforces:
 * 1. Human Approval Gate: Cannot schedule/publish without explicit checkbox confirmation.
 * 2. Truthful Platform Scope: LinkedIn (P1), IG Reels (public URL required), YouTube (Private, pending audit), TikTok (Draft only), X excluded.
 * 3. Dual-Outcome Simulated Retry: Retrying spinner, sample success/failure toggles, attempt history log.
 * 4. Never displays "Live" for mock/unverified publishing.
 */

export interface PublishAttempt {
  timestamp: string;
  platform: string;
  status: 'simulated_success' | 'simulated_failure' | 'retrying';
  message: string;
}

export interface TruthfulPublishModalProps {
  slotId: number;
  slotTitle: string;
  hasScript: boolean;
  onClose: () => void;
  onPublishComplete?: (success: boolean) => void;
}

export const TruthfulPublishModal: React.FC<TruthfulPublishModalProps> = ({
  slotId,
  slotTitle,
  hasScript,
  onClose,
  onPublishComplete
}) => {
  const [humanApproved, setHumanApproved] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'history'>('schedule');

  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<string, boolean>>({
    linkedin: true,
    instagram: false,
    youtube: false,
    tiktok: false
  });

  const [attempts, setAttempts] = useState<PublishAttempt[]>([
    {
      timestamp: '23:14:02',
      platform: 'YouTube',
      status: 'simulated_failure',
      message: 'Sample audit failure: Video metadata requires reviewer clearance. Tagged: [Private, pending audit].'
    }
  ]);

  const togglePlatform = (key: string) => {
    setSelectedPlatforms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSimulateRetry = (outcome: 'success' | 'failure') => {
    if (!humanApproved) return;

    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      const newAttempt: PublishAttempt = {
        timestamp: new Date().toLocaleTimeString(),
        platform: 'All Selected Platforms',
        status: outcome === 'success' ? 'simulated_success' : 'simulated_failure',
        message:
          outcome === 'success'
            ? 'Sample simulated publish successful across chosen channels. (Demonstration only — no network dispatch)'
            : 'Sample simulated failure: Network socket timeout mock. Error preserved in history.'
      };
      setAttempts(prev => [newAttempt, ...prev]);
      if (onPublishComplete) onPublishComplete(outcome === 'success');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card variant="glass" className="w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-5 border-border">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-accent">SLOT {slotId < 10 ? `0${slotId}` : slotId}</span>
              <h2 className="font-heading text-lg font-bold text-white">Truthful Publishing & Dispatch</h2>
            </div>
            <p className="text-xs text-muted-foreground">{slotTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md text-lg leading-none"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Script Requirement Warning if missing */}
        {!hasScript && (
          <ErrorBanner message="CRITICAL GATE: This slot lacks a mandatory script. You cannot schedule or dispatch this post without adding a script." />
        )}

        {/* Scope and Exclusions Callout */}
        <div className="p-3 rounded bg-slate-900/80 border border-slate-800 text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
            <span>Platform Integration Scope</span>
            <span className="font-mono text-[10px] text-amber-400">Provisional Assumptions</span>
          </div>
          <p className="text-slate-400">
            • <strong className="text-white">LinkedIn (P1):</strong> Direct API posting simulator.
          </p>
          <p className="text-slate-400">
            • <strong className="text-white">Instagram Reels:</strong> Requires public video URL (CDN assumption pending).
          </p>
          <p className="text-slate-400">
            • <strong className="text-white">YouTube:</strong> Marked "Private, pending audit" until safety checks pass.
          </p>
          <p className="text-slate-400">
            • <strong className="text-white">TikTok:</strong> Mock exports as draft only.
          </p>
          <p className="text-rose-400 font-semibold">
            • <strong className="text-rose-300">X (Twitter):</strong> Strictly excluded from current scope.
          </p>
        </div>

        {/* Platform Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-heading">
            Target Channels
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label className="flex items-center gap-2.5 p-2.5 rounded bg-slate-900/60 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedPlatforms.linkedin}
                onChange={() => togglePlatform('linkedin')}
                className="accent-accent"
              />
              <span className="text-white font-medium">LinkedIn (P1 Direct)</span>
            </label>
            <label className="flex items-center gap-2.5 p-2.5 rounded bg-slate-900/60 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedPlatforms.instagram}
                onChange={() => togglePlatform('instagram')}
                className="accent-accent"
              />
              <span className="text-white font-medium">Instagram Reels</span>
            </label>
            <label className="flex items-center gap-2.5 p-2.5 rounded bg-slate-900/60 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedPlatforms.youtube}
                onChange={() => togglePlatform('youtube')}
                className="accent-accent"
              />
              <span className="text-white font-medium">YouTube (Private, Audit)</span>
            </label>
            <label className="flex items-center gap-2.5 p-2.5 rounded bg-slate-900/60 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedPlatforms.tiktok}
                onChange={() => togglePlatform('tiktok')}
                className="accent-accent"
              />
              <span className="text-white font-medium">TikTok (Draft Only)</span>
            </label>
          </div>
        </div>

        {/* Mandatory Human Approval Gate */}
        <div className="p-4 rounded-lg bg-violet-950/20 border border-violet-500/40 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-accent text-sm">🔒</span>
            <h4 className="text-xs font-bold uppercase tracking-wider text-violet-200">
              Mandatory Human Approval Gate
            </h4>
          </div>
          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={humanApproved}
              onChange={e => setHumanApproved(e.target.checked)}
              disabled={!hasScript}
              className="mt-0.5 accent-accent"
            />
            <span>
              I have reviewed this content and explicitly approve scheduling / simulated dispatch.
              <span className="block text-[11px] text-slate-400 mt-0.5">
                (Unchecked = all scheduling and simulated publishing actions are locked.)
              </span>
            </span>
          </label>
        </div>

        {/* Retry & Outcome Simulator */}
        <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 font-heading">Simulation Sandbox</span>
            <TrustBadge type="sample">Sample Dispatch</TrustBadge>
          </div>
          <p className="text-[11px] text-slate-400">
            Test retry behaviors safely without real network calls. Test both successful sample dispatch and failure handling.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              variant="primary"
              disabled={!humanApproved || !hasScript || isRetrying}
              isLoading={isRetrying}
              onClick={() => handleSimulateRetry('success')}
            >
              Simulate Success Outcome
            </Button>
            <Button
              size="sm"
              variant="danger"
              disabled={!humanApproved || !hasScript || isRetrying}
              isLoading={isRetrying}
              onClick={() => handleSimulateRetry('failure')}
            >
              Simulate Failure Outcome
            </Button>
          </div>
        </div>

        {/* Attempt & Error History Log */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-heading block">
            Dispatch History & Previous Error Preservation
          </span>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {attempts.map((att, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-slate-900/80 border border-slate-800 text-xs flex items-start justify-between gap-3 font-mono"
              >
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-slate-500">{att.timestamp}</span>
                    <span className="text-slate-300 font-semibold">{att.platform}</span>
                    <StatusPill
                      status={att.status === 'simulated_success' ? 'posted' : 'failed'}
                      label={att.status === 'simulated_success' ? 'Sample Success' : 'Sample Failed'}
                    />
                  </div>
                  <p className="text-slate-400 text-[11px] font-sans">{att.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/80">
          <Button variant="ghost" onClick={onClose}>
            Cancel / Close
          </Button>
          <span className="text-[11px] font-mono text-slate-500">
            CreatorOS AI Truthful Engine v1.0
          </span>
        </div>
      </Card>
    </div>
  );
};

