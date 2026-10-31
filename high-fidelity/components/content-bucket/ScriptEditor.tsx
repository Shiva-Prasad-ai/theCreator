import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Textarea, ErrorBanner } from '../ui/Input';
import { Button } from '../ui/Button';
import { TrustBadge } from '../ui/Badge';

/**
 * CreatorOS AI — High-Fidelity Mandatory Script Editor Blueprint
 * Bhavya's confirmed rule: Every post strictly requires a script.
 * Cannot advance to captions, approval, or publishing without a valid script.
 */

export interface ScriptEditorProps {
  initialScript?: string;
  slotTitle: string;
  slotId: number;
  onSaveScript: (script: string) => void;
  onAdvanceToCaptions: () => void;
  onBackToGrid: () => void;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  initialScript = '',
  slotTitle,
  slotId,
  onSaveScript,
  onAdvanceToCaptions,
  onBackToGrid
}) => {
  const [script, setScript] = useState<string>(initialScript);
  const [error, setError] = useState<string | null>(null);

  // Sync state if initialScript prop changes
  useEffect(() => {
    setScript(initialScript);
  }, [initialScript]);

  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;
  const charCount = script.length;
  // Average speaking pace ~130 words per minute
  const readingTimeSec = Math.round((wordCount / 130) * 60);

  const handleAdvance = () => {
    if (!script || !script.trim()) {
      setError('Script is mandatory. CreatorOS AI requires a script before AI captions or scheduling can proceed.');
      return;
    }
    setError(null);
    onSaveScript(script);
    onAdvanceToCaptions();
  };

  const handleScriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setScript(e.target.value);
    if (error && e.target.value.trim()) {
      setError(null);
    }
  };

  return (
    <Card variant="glass" className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header with Slot Info and Gate Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-accent">SLOT {slotId < 10 ? `0${slotId}` : slotId}</span>
            <h2 className="font-heading text-lg font-bold text-white">{slotTitle}</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Bhavya's Confirmed Gate: A valid script is required to train the AI voice engine and generate captions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TrustBadge type="sample">Sample Workflow</TrustBadge>
        </div>
      </div>

      {/* Mandatory Script Gate Banner */}
      {error && <ErrorBanner message={error} />}

      {/* Editor Area */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-heading">
            Post Script / Core Narrative *
          </label>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>{wordCount} Words</span>
            <span>•</span>
            <span>~{readingTimeSec}s Read Time</span>
            <span>•</span>
            <span>{charCount} Characters</span>
          </div>
        </div>

        <Textarea
          value={script}
          onChange={handleScriptChange}
          placeholder="Paste or write your full video script, spoken hook, bullet points, or core thoughts here... (Mandatory)"
          className="min-h-[220px] font-sans text-sm leading-relaxed"
          error={error ? 'Script cannot be empty' : undefined}
        />

        <p className="text-[11px] text-slate-400">
          💡 <span className="text-slate-300 font-semibold">Tip:</span> Your script directly informs Brain context memory. If this slot has matching patterns, captions will note "Served from memory".
        </p>
      </div>

      {/* Telemetry & Voice Context Preview */}
      <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div>
          <span className="text-slate-400 block mb-0.5">Tone Analysis</span>
          <span className="font-semibold text-accent">Technical / Informative</span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Brain Memory Match</span>
          <span className="font-semibold text-cyan-300">
            {slotId === 2 ? 'Cache Match: Next.js Agents' : 'New Knowledge Item'}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-0.5">Validation Gate</span>
          <span className={`font-semibold ${script.trim() ? 'text-emerald-400' : 'text-amber-400'}`}>
            {script.trim() ? 'Passed ✓' : 'Script Required'}
          </span>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border/80">
        <Button variant="ghost" onClick={onBackToGrid}>
          ← Back to Grid
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => onSaveScript(script)}
            disabled={!script.trim()}
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            onClick={handleAdvance}
          >
            Advance to Captions →
          </Button>
        </div>
      </div>
    </Card>
  );
};

