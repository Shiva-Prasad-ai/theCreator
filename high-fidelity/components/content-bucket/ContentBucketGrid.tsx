import React from 'react';
import { Card } from '../ui/Card';
import { StatusPill, TrustBadge } from '../ui/Badge';
import { Button } from '../ui/Button';

/**
 * CreatorOS AI — High-Fidelity Content Bucket Grid Blueprint
 * Bhavya's confirmed workflow: 12-slot visual grid, partial bucket support,
 * visual capacity meter, script status flags, and truthful badges.
 */

export interface BucketSlot {
  id: number;
  title: string;
  type: 'video' | 'reel' | 'idea' | 'empty';
  status: 'scheduled' | 'ready' | 'approved' | 'posted' | 'failed' | 'needs-script' | 'empty';
  hasScript: boolean;
  scriptSnippet?: string;
  duration?: string;
  platform?: string;
  captionSource?: 'memory' | 'generated' | 'manual';
}

export interface ContentBucketGridProps {
  slots: BucketSlot[];
  activeSlotId?: number;
  onSelectSlot: (slot: BucketSlot) => void;
  onAddContent?: () => void;
}

export const ContentBucketGrid: React.FC<ContentBucketGridProps> = ({
  slots,
  activeSlotId,
  onSelectSlot,
  onAddContent
}) => {
  const filledCount = slots.filter(s => s.status !== 'empty').length;
  const totalSlots = 12;
  const percentFilled = Math.round((filledCount / totalSlots) * 100);

  return (
    <div className="w-full space-y-6">
      {/* Bucket Capacity & Header Meter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-lg bg-card border border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-heading text-xl font-bold text-white">Content Bucket Capacity</h2>
            <TrustBadge type="sample">Sample Workspace</TrustBadge>
          </div>
          <p className="text-xs text-muted-foreground">
            Bhavya's Confirmed Cadence: Up to 12 slots. Partial bucket ({filledCount}/12) is valid for scheduling.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-mono text-sm font-bold text-accent">
              {filledCount} / {totalSlots} SLOTS
            </div>
            <div className="text-[10px] text-muted-foreground uppercase font-mono">
              {percentFilled}% Utilized
            </div>
          </div>

          <div className="w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-accent transition-all duration-300"
              style={{ width: `${percentFilled}%` }}
            />
          </div>

          {onAddContent && (
            <Button size="sm" variant="accent" onClick={onAddContent}>
              + Add Content
            </Button>
          )}
        </div>
      </div>

      {/* 12-Slot Visual Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {slots.map(slot => {
          const isSelected = activeSlotId === slot.id;
          const isEmpty = slot.status === 'empty';

          return (
            <div
              key={slot.id}
              onClick={() => onSelectSlot(slot)}
              className={`relative rounded-lg p-4 border transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[160px] ${
                isSelected
                  ? 'bg-slate-900 border-accent shadow-lg shadow-cyan-950/30 ring-1 ring-accent'
                  : isEmpty
                  ? 'bg-slate-950/40 border-dashed border-slate-800 hover:border-slate-700'
                  : 'bg-card border-border hover:border-violet-500/50 hover:bg-slate-900/60'
              }`}
            >
              {/* Slot Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-slate-500">
                  SLOT {slot.id < 10 ? `0${slot.id}` : slot.id}
                </span>
                <StatusPill status={slot.status} />
              </div>

              {/* Slot Body */}
              <div className="my-auto py-2">
                {isEmpty ? (
                  <div className="text-center py-3">
                    <span className="text-xl opacity-40 block mb-1">➕</span>
                    <span className="text-xs text-slate-500 font-medium">Click to Assign Content</span>
                  </div>
                ) : (
                  <>
                    <h4 className="text-sm font-semibold text-white line-clamp-2 mb-1">
                      {slot.title}
                    </h4>
                    {slot.hasScript ? (
                      <p className="text-xs text-slate-400 line-clamp-2 italic font-serif">
                        "{slot.scriptSnippet || 'Script attached'}"
                      </p>
                    ) : (
                      <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
                        ⚠️ Script Required to Advance
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Slot Footer & Trust Metadata */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>{slot.type.toUpperCase()}</span>
                {slot.captionSource === 'memory' ? (
                  <TrustBadge type="memory">Served from memory</TrustBadge>
                ) : slot.status === 'needs-script' ? (
                  <span className="text-amber-400 font-mono text-[10px]">NO SCRIPT</span>
                ) : (
                  <span className="text-slate-500 font-mono text-[10px]">
                    {slot.duration || '0:45'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

