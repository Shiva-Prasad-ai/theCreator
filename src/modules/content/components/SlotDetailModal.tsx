/**
 * SlotDetailModal Component
 * 
 * Module Ownership: Bhavya (Content and Publishing)
 * Responsibility: Comprehensive editor modal for an individual content bucket slot.
 * Workflow: Content idea -> Script generation -> Script editing -> Caption generation -> Hashtags -> Music -> Media -> Approval
 * Contract Alignment: CreatorOS_AI_Team_Kit.pdf, Section 6
 */

"use client";

import React, { useState } from 'react';
import { BucketSlot, ContentPost, ApprovalStatus, MusicTrackSuggestion } from '../types/content';
import { H3GenerationSource } from '../types/gateway';
import { ScriptEditor } from './ScriptEditor';
import { MediaUploader } from './MediaUploader';
import { AICaptionFlow } from './AICaptionFlow';
import { TagMusicChips } from './TagMusicChips';
import { ApprovalBar } from './ApprovalBar';
import { IGatewayClient } from '../services/gatewayClient';
import { IStorageService } from '../services/storageService';

export interface SlotDetailModalProps {
  slot?: BucketSlot;
  isOpen: boolean;
  creatorId: string;
  gatewayClient: IGatewayClient;
  storageService?: IStorageService;
  onClose: () => void;
  onSaveSlot: (updatedSlot: BucketSlot) => void;
  onViewFailureDiagnostics?: (slot: BucketSlot) => void;
}

type ModalTab = 'script' | 'caption' | 'media' | 'tags_music';

export const SlotDetailModal: React.FC<SlotDetailModalProps> = ({
  slot,
  isOpen,
  creatorId,
  gatewayClient,
  storageService,
  onClose,
  onSaveSlot,
  onViewFailureDiagnostics
}) => {
  if (!isOpen || !slot) return null;

  // Initialize draft post if slot is currently empty
  const [localPost, setLocalPost] = useState<ContentPost>(() => {
    if (slot.post) return { ...slot.post };
    return {
      id: `post-${slot.id}-${Date.now()}`,
      creatorId,
      title: slot.contentTheme,
      contentTheme: slot.contentTheme,
      targetPlatforms: [slot.targetPlatform],
      script: { hook: '', body: '', callToAction: '', cta: '', estimatedDurationSeconds: 0 },
      caption: { text: '', hashtags: [], characterCount: 0 },
      mediaAssets: [],
      approvalStatus: 'draft',
      publishingStatus: 'idle',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  const [activeTab, setActiveTab] = useState<ModalTab>('script');

  // Script Generation State
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [scriptMeta, setScriptMeta] = useState<{
    source: H3GenerationSource;
    label: string;
    model: string;
  } | null>(null);

  // Hashtags & Music Suggestions State (retained across tabs)
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [isSuggestingHashtags, setIsSuggestingHashtags] = useState(false);
  const [hashtagMeta, setHashtagMeta] = useState<{
    source: H3GenerationSource;
    label: string;
  } | null>(null);

  const [availableMusic, setAvailableMusic] = useState<MusicTrackSuggestion[]>([]);
  const [isSuggestingMusic, setIsSuggestingMusic] = useState(false);
  const [musicMeta, setMusicMeta] = useState<{
    source: H3GenerationSource;
    label: string;
  } | null>(null);

  const [gatewayError, setGatewayError] = useState<string | null>(null);

  // Compute full script text for downstream tasks (caption, hashtags, music)
  const getFullScriptText = (): string => {
    const s = localPost.script;
    if (!s) return localPost.title || slot.contentTheme;
    const parts = [s.hook, s.body, s.callToAction || s.cta].filter(Boolean);
    return parts.length > 0 ? parts.join('\n\n') : localPost.title || slot.contentTheme;
  };

  // 1. Task: 'script' -> Generate hook, body, cta from topic
  const handleGenerateScript = async () => {
    setGatewayError(null);
    setIsGeneratingScript(true);

    try {
      const topic = localPost.title || slot.contentTheme;
      const res = await gatewayClient.generateScript(
        {
          topic,
          format: 'short_form',
          platform: slot.targetPlatform
        },
        creatorId
      );

      if (res && res.output) {
        const out = res.output;
        const totalWords = [out.hook, out.body, out.cta].join(' ').trim().split(/\s+/).filter(Boolean).length;
        const estimatedSeconds = Math.round((totalWords / 130) * 60);

        setLocalPost((prev) => ({
          ...prev,
          script: {
            hook: out.hook,
            body: out.body,
            callToAction: out.cta,
            cta: out.cta,
            estimatedDurationSeconds: estimatedSeconds,
            notes: `Generated via ${res.model} (${res.source} cache)`
          }
        }));

        setScriptMeta({
          source: res.source,
          label: res.label || 'ai_suggested',
          model: res.model || 'gemini-flash'
        });
      }
    } catch (err: any) {
      setGatewayError(err?.message || 'Failed to generate script from AI Gateway.');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // 2. Task: 'hashtags' -> Suggest hashtags from script and platform
  const handleSuggestHashtags = async () => {
    setGatewayError(null);
    setIsSuggestingHashtags(true);

    try {
      const scriptText = getFullScriptText();
      const res = await gatewayClient.suggestHashtags(
        {
          script: scriptText,
          topic: localPost.title,
          platform: slot.targetPlatform
        },
        creatorId
      );

      if (res && res.output && Array.isArray(res.output.hashtags)) {
        setSuggestedHashtags(res.output.hashtags);
        setHashtagMeta({
          source: res.source,
          label: res.label || 'ai_suggested'
        });
      }
    } catch (err: any) {
      setGatewayError(err?.message || 'Failed to suggest hashtags from AI Gateway.');
    } finally {
      setIsSuggestingHashtags(false);
    }
  };

  // 3. Task: 'music' -> Suggest background audio cues from script and platform
  const handleSuggestMusic = async () => {
    setGatewayError(null);
    setIsSuggestingMusic(true);

    try {
      const scriptText = getFullScriptText();
      const res = await gatewayClient.suggestMusic(
        {
          script: scriptText,
          platform: slot.targetPlatform
        },
        creatorId
      );

      if (res && res.output && Array.isArray(res.output.suggestions)) {
        const tracks: MusicTrackSuggestion[] = res.output.suggestions.map((s, idx) => ({
          id: `track-${idx + 1}`,
          title: `${s.genre} - ${s.mood}`,
          artist: 'CreatorOS AI Cues',
          genre: s.genre,
          mood: s.mood,
          note: s.note,
          platformSuitability: [slot.targetPlatform]
        }));

        setAvailableMusic(tracks);
        setMusicMeta({
          source: res.source,
          label: res.label || 'ai_suggested'
        });
      }
    } catch (err: any) {
      setGatewayError(err?.message || 'Failed to suggest audio cues from AI Gateway.');
    } finally {
      setIsSuggestingMusic(false);
    }
  };

  const handleSave = () => {
    const updatedSlot: BucketSlot = {
      ...slot,
      status: localPost.publishingStatus === 'published' 
        ? 'published' 
        : localPost.publishingStatus === 'failed'
        ? 'failed'
        : localPost.approvalStatus === 'approved' 
        ? 'ready' 
        : 'drafted',
      post: {
        ...localPost,
        updatedAt: new Date().toISOString()
      }
    };
    onSaveSlot(updatedSlot);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="slot-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        zIndex: 40
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Editable Content Idea / Title */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}
        >
          <div style={{ flex: 1, marginRight: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B' }}>
                SLOT #{slot.slotNumber.toString().padStart(2, '0')}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: '#F1F5F9',
                  color: '#334155'
                }}
              >
                {slot.targetPlatform.toUpperCase()}
              </span>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                {slot.dayOfWeek} • {slot.defaultTime}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                id="slot-modal-title"
                type="text"
                value={localPost.title}
                onChange={(e) => setLocalPost((p) => ({ ...p, title: e.target.value }))}
                placeholder="Post Title / Content Idea..."
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#0F172A',
                  border: '1px solid transparent',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  width: '100%',
                  backgroundColor: 'transparent'
                }}
                onFocus={(e) => (e.target.style.borderColor = '#CBD5E1')}
                onBlur={(e) => (e.target.style.borderColor = 'transparent')}
              />
            </div>
          </div>

          <button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#64748B'
            }}
          >
            ✕
          </button>
        </div>

        {/* Global Error Banner */}
        {gatewayError && (
          <div
            role="alert"
            style={{
              padding: '8px 20px',
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              fontSize: '12px'
            }}
          >
            {gatewayError}
          </div>
        )}

        {/* Failure Warning Banner (if slot previously failed) */}
        {slot.post?.publishingFailure && (
          <div
            style={{
              padding: '10px 20px',
              backgroundColor: '#FEF2F2',
              borderBottom: '1px solid #FCA5A5',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '12px', color: '#991B1B', fontWeight: 500 }}>
              ⚠️ Publishing Failed: {slot.post.publishingFailure.errorCode}
            </span>
            {onViewFailureDiagnostics && (
              <button
                type="button"
                onClick={() => onViewFailureDiagnostics(slot)}
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                View Diagnostics
              </button>
            )}
          </div>
        )}

        {/* Tab Navigation (Sequential Content Flow) */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            padding: '0 16px'
          }}
        >
          {[
            { id: 'script', label: '1. Script & Hook' },
            { id: 'caption', label: '2. AI Caption' },
            { id: 'media', label: `3. Media Assets (${localPost.mediaAssets.length})` },
            { id: 'tags_music', label: '4. Tags & Music' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ModalTab)}
              style={{
                padding: '10px 14px',
                fontSize: '12px',
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? '#2563EB' : '#64748B',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #2563EB' : '2px solid transparent',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body (Scrollable, Preserving State Across Tabs) */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'script' && (
            <ScriptEditor
              script={localPost.script || { hook: '', body: '', callToAction: '' }}
              onChange={(updatedScript) =>
                setLocalPost((p) => ({ ...p, script: updatedScript }))
              }
              onGenerateFromTopic={handleGenerateScript}
              isGenerating={isGeneratingScript}
              generationMeta={scriptMeta}
            />
          )}

          {activeTab === 'caption' && (
            <AICaptionFlow
              topic={localPost.title}
              script={getFullScriptText()}
              platform={slot.targetPlatform}
              creatorId={creatorId}
              currentCaption={localPost.caption}
              gatewayClient={gatewayClient}
              onApplyCaption={(appliedCaption) =>
                setLocalPost((p) => ({ ...p, caption: appliedCaption }))
              }
            />
          )}

          {activeTab === 'media' && (
            <MediaUploader
              mediaAssets={localPost.mediaAssets}
              creatorId={creatorId}
              slotId={slot.id}
              storageService={storageService}
              onAssetsChange={(assets) =>
                setLocalPost((p) => ({ ...p, mediaAssets: assets }))
              }
            />
          )}

          {activeTab === 'tags_music' && (
            <TagMusicChips
              hashtags={localPost.caption?.hashtags || []}
              suggestedHashtags={suggestedHashtags}
              selectedMusic={localPost.musicTrack}
              availableMusic={availableMusic}
              onHashtagsChange={(tags) =>
                setLocalPost((p) => ({
                  ...p,
                  caption: {
                    ...(p.caption || { text: '', characterCount: 0 }),
                    hashtags: tags
                  }
                }))
              }
              onSelectMusic={(track) =>
                setLocalPost((p) => ({ ...p, musicTrack: track }))
              }
              onSuggestHashtags={handleSuggestHashtags}
              isSuggestingHashtags={isSuggestingHashtags}
              hashtagMeta={hashtagMeta}
              onSuggestMusic={handleSuggestMusic}
              isSuggestingMusic={isSuggestingMusic}
              musicMeta={musicMeta}
            />
          )}
        </div>

        {/* Approval Bar Section */}
        <div style={{ padding: '0 20px 16px 20px' }}>
          <ApprovalBar
            approvalStatus={localPost.approvalStatus}
            publishingStatus={localPost.publishingStatus}
            onStatusChange={(newStatus: ApprovalStatus) =>
              setLocalPost((p) => ({ ...p, approvalStatus: newStatus }))
            }
          />
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
            backgroundColor: '#F8FAFC'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '6px 18px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            Save Slot Changes
          </button>
        </div>
      </div>
    </div>
  );
};
