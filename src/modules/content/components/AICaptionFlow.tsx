/**
 * AICaptionFlow Component
 * 
 * Module Ownership: Bhavya (Content and Publishing)
 * Responsibility: Manages AI caption generation workflow, candidate review, memory badge, and selection.
 * Contract Alignment: CreatorOS_AI_Team_Kit.pdf, Section 6 (POST /v1/generate task='caption' & POST /v1/memory/feedback)
 */

"use client";

import React, { useState } from 'react';
import { Platform, ContentCaption } from '../types/content';
import {
  GeneratedCaptionOption,
  H3GenerationSource,
  mapH3CaptionsToUI
} from '../types/gateway';
import { IGatewayClient } from '../services/gatewayClient';

export interface AICaptionFlowProps {
  topic: string;
  script?: string;
  platform: Platform;
  creatorId: string;
  currentCaption?: ContentCaption;
  gatewayClient: IGatewayClient;
  onApplyCaption: (caption: ContentCaption) => void;
  disabled?: boolean;
}

const TONE_OPTIONS = [
  'Thought Leadership / Technical',
  'Concise & Contrarian',
  'Dynamic & Helpful',
  'Casual / Behind the Scenes',
  'Mentorship / Career'
];

export const AICaptionFlow: React.FC<AICaptionFlowProps> = ({
  topic,
  script,
  platform,
  creatorId,
  currentCaption,
  gatewayClient,
  onApplyCaption,
  disabled = false
}) => {
  const [selectedTone, setSelectedTone] = useState(TONE_OPTIONS[0]);
  const [contextPrompt, setContextPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState<GeneratedCaptionOption[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generationMeta, setGenerationMeta] = useState<{
    source: H3GenerationSource;
    label: string;
    model: string;
    requestId: string;
  } | null>(null);

  const handleGenerate = async () => {
    setErrorMessage(null);
    setIsGenerating(true);

    try {
      // In H3 contract, caption generation accepts script and platform
      const scriptContent = script || topic || 'Engineering Best Practices';

      const response = await gatewayClient.generateCaption(
        {
          script: scriptContent,
          topic,
          platform,
          tone: selectedTone,
          context: contextPrompt
        },
        creatorId
      );

      if (response && response.output && response.output.captions) {
        const mapped = mapH3CaptionsToUI(response, platform);
        setGeneratedOptions(mapped);
        setGenerationMeta({
          source: response.source,
          label: response.label || 'ai_suggested',
          model: response.model || 'gemini-flash',
          requestId: response.request_id
        });
      } else {
        setErrorMessage('Failed to generate captions: empty response from AI gateway.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unexpected error communicating with AI Gateway.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (opt: GeneratedCaptionOption) => {
    // Send feedback to gateway if request ID is present
    if (opt.requestId) {
      gatewayClient.sendFeedback({
        request_id: opt.requestId,
        action: 'accepted'
      }).catch((feedbackErr) => {
        // Non-blocking feedback warning
        console.warn('[AICaptionFlow] Feedback submission failed:', feedbackErr?.message || feedbackErr);
      });
    }

    onApplyCaption(opt.caption);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
          AI Caption Generator ({platform})
        </span>
        <span style={{ fontSize: '11px', color: '#64748B' }}>
          Target: {platform.toUpperCase()}
        </span>
      </div>

      {/* Tone & Context Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <label
            htmlFor="caption-tone-select"
            style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}
          >
            Voice Tone
          </label>
          <select
            id="caption-tone-select"
            value={selectedTone}
            onChange={(e) => setSelectedTone(e.target.value)}
            disabled={disabled || isGenerating}
            style={{
              width: '100%',
              fontSize: '12px',
              padding: '6px 8px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#0F172A'
            }}
          >
            {TONE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="caption-context-input"
            style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}
          >
            Specific Context / Angle (Optional)
          </label>
          <input
            id="caption-context-input"
            type="text"
            value={contextPrompt}
            onChange={(e) => setContextPrompt(e.target.value)}
            placeholder="e.g. emphasize latency vs cost tradeoffs"
            disabled={disabled || isGenerating}
            style={{
              width: '100%',
              fontSize: '12px',
              padding: '6px 8px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              color: '#0F172A'
            }}
          />
        </div>
      </div>

      {/* Generate Action Button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={disabled || isGenerating}
        style={{
          padding: '8px 16px',
          backgroundColor: isGenerating ? '#93C5FD' : '#2563EB',
          color: '#FFFFFF',
          fontSize: '13px',
          fontWeight: 600,
          borderRadius: '6px',
          border: 'none',
          cursor: disabled || isGenerating ? 'not-allowed' : 'pointer'
        }}
      >
        {isGenerating ? 'Querying AI Gateway...' : '✨ Generate Platform Captions'}
      </button>

      {/* Error Message */}
      {errorMessage && (
        <div
          role="alert"
          style={{
            padding: '8px 12px',
            backgroundColor: '#FEE2E2',
            color: '#991B1B',
            borderRadius: '6px',
            fontSize: '12px'
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Memory Badge & Candidate Caption Options */}
      {generatedOptions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
              Generated Variations ({generatedOptions.length})
            </span>

            {/* Memory Badge (Section 5 & 6 requirement) */}
            {generationMeta && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
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
          </div>

          {generatedOptions.map((opt) => (
            <div
              key={opt.id}
              style={{
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                padding: '12px',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {/* Reasoning / Quality Score */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748B' }}>
                <span>Match Score: {Math.round(opt.score * 100)}%</span>
                {opt.reasoning && <em>{opt.reasoning}</em>}
              </div>

              {/* Caption Content */}
              <p
                style={{
                  fontSize: '12px',
                  color: '#1E293B',
                  whiteSpace: 'pre-wrap',
                  margin: 0,
                  lineHeight: '1.5'
                }}
              >
                {opt.caption.text}
              </p>

              {/* Apply Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => handleSelectOption(opt)}
                  disabled={disabled}
                  style={{
                    padding: '4px 12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: disabled ? 'not-allowed' : 'pointer'
                  }}
                >
                  Apply This Caption
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
