/**
 * ScriptEditor Component
 * 
 * Module Ownership: Bhavya (Content and Publishing)
 * Responsibility: Provides structured scriptwriting inputs (Hook, Body, CTA) and speech duration estimates.
 * Contract Alignment: CreatorOS_AI_Team_Kit.pdf, Section 6 (POST /v1/generate task='script')
 */

"use client";

import React from 'react';
import { ContentScript } from '../types/content';
import { H3GenerationSource } from '../types/gateway';

export interface ScriptEditorProps {
  script: ContentScript;
  onChange: (updated: ContentScript) => void;
  onGenerateFromTopic?: () => void;
  isGenerating?: boolean;
  generationMeta?: {
    source: H3GenerationSource;
    label: string;
    model: string;
  } | null;
  disabled?: boolean;
}

export const ScriptEditor: React.FC<ScriptEditorProps> = ({
  script,
  onChange,
  onGenerateFromTopic,
  isGenerating = false,
  generationMeta,
  disabled = false
}) => {
  // Approximate speech duration: ~130 words per minute (~2.16 words per second)
  const totalWords = [script.hook, script.body, script.callToAction || script.cta]
    .filter(Boolean)
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const estimatedSeconds = Math.round((totalWords / 130) * 60);

  const handleFieldChange = (field: keyof ContentScript, value: string) => {
    onChange({
      ...script,
      [field]: value,
      estimatedDurationSeconds: estimatedSeconds
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header with Duration Indicator & AI Trigger */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
            Video / Post Script
          </span>
          <span style={{ fontSize: '11px', color: '#64748B', marginLeft: '8px' }}>
            ~{totalWords} words • Approx {estimatedSeconds}s speaking time
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Memory Badge for Script Generation */}
          {generationMeta && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                backgroundColor: generationMeta.source === 'memory' ? '#FEF3C7' : '#EFF6FF',
                color: generationMeta.source === 'memory' ? '#92400E' : '#1E40AF',
                border: `1px solid ${generationMeta.source === 'memory' ? '#FCD34D' : '#BFDBFE'}`
              }}
            >
              {generationMeta.source === 'memory' ? '🧠 Creator Memory Hit' : '✨ Fresh AI'}
              <span style={{ fontWeight: 400, opacity: 0.85 }}>({generationMeta.label})</span>
            </span>
          )}

          {onGenerateFromTopic && (
            <button
              type="button"
              onClick={onGenerateFromTopic}
              disabled={disabled || isGenerating}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '6px',
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                border: '1px solid #BFDBFE',
                cursor: disabled || isGenerating ? 'not-allowed' : 'pointer',
                fontWeight: 500
              }}
            >
              {isGenerating ? 'Generating Outline...' : '✨ AI Script Assist'}
            </button>
          )}
        </div>
      </div>

      {/* 1. Hook */}
      <div>
        <label
          htmlFor="script-hook"
          style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}
        >
          Hook (First 3-5 seconds)
        </label>
        <textarea
          id="script-hook"
          rows={2}
          value={script.hook}
          onChange={(e) => handleFieldChange('hook', e.target.value)}
          placeholder="Grab attention immediately with a contrarian statement or sharp question..."
          disabled={disabled}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '13px',
            borderRadius: '6px',
            border: '1px solid #CBD5E1',
            color: '#0F172A',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* 2. Body */}
      <div>
        <label
          htmlFor="script-body"
          style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}
        >
          Body / Main Talking Points
        </label>
        <textarea
          id="script-body"
          rows={4}
          value={script.body}
          onChange={(e) => handleFieldChange('body', e.target.value)}
          placeholder="Breakdown the core insight, architectural tradeoff, or workflow steps..."
          disabled={disabled}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '13px',
            borderRadius: '6px',
            border: '1px solid #CBD5E1',
            color: '#0F172A',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
      </div>

      {/* 3. Call to Action */}
      <div>
        <label
          htmlFor="script-cta"
          style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}
        >
          Call to Action (CTA)
        </label>
        <input
          id="script-cta"
          type="text"
          value={script.callToAction || script.cta || ''}
          onChange={(e) => handleFieldChange('callToAction', e.target.value)}
          placeholder="e.g. Save this for your next architecture review / Which approach does your team use?"
          disabled={disabled}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '13px',
            borderRadius: '6px',
            border: '1px solid #CBD5E1',
            color: '#0F172A',
            fontFamily: 'inherit'
          }}
        />
      </div>
    </div>
  );
};
