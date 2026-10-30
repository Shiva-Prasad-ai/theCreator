/**
 * TagMusicChips Component
 * 
 * Module Ownership: Bhavya (Content and Publishing)
 * Responsibility: Manages interactive hashtag chips and background audio / music selections.
 * Contract Alignment: CreatorOS_AI_Team_Kit.pdf, Section 6 (POST /v1/generate tasks 'hashtags' & 'music')
 * Section 8 Rule: Always treat hashtag and music results as AI-suggested, never as live trends.
 */

"use client";

import React, { useState } from 'react';
import { MusicTrackSuggestion } from '../types/content';
import { H3GenerationSource } from '../types/gateway';

export interface TagMusicChipsProps {
  hashtags: string[];
  suggestedHashtags?: string[];
  selectedMusic?: MusicTrackSuggestion;
  availableMusic?: MusicTrackSuggestion[];
  onHashtagsChange: (tags: string[]) => void;
  onSelectMusic?: (track?: MusicTrackSuggestion) => void;
  onSuggestHashtags?: () => void;
  isSuggestingHashtags?: boolean;
  hashtagMeta?: { source: H3GenerationSource; label: string } | null;
  onSuggestMusic?: () => void;
  isSuggestingMusic?: boolean;
  musicMeta?: { source: H3GenerationSource; label: string } | null;
  disabled?: boolean;
}

export const TagMusicChips: React.FC<TagMusicChipsProps> = ({
  hashtags,
  suggestedHashtags = [],
  selectedMusic,
  availableMusic = [],
  onHashtagsChange,
  onSelectMusic,
  onSuggestHashtags,
  isSuggestingHashtags = false,
  hashtagMeta,
  onSuggestMusic,
  isSuggestingMusic = false,
  musicMeta,
  disabled = false
}) => {
  const [customTagInput, setCustomTagInput] = useState('');

  const handleAddTag = (tagToAdd: string) => {
    const cleaned = tagToAdd.replace(/^#/, '').trim();
    if (!cleaned) return;
    if (!hashtags.includes(cleaned)) {
      onHashtagsChange([...hashtags, cleaned]);
    }
    setCustomTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onHashtagsChange(hashtags.filter((t) => t !== tagToRemove));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Hashtags Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', margin: 0 }}>
            Hashtags ({hashtags.length})
          </label>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Memory Badge for Hashtags */}
            {hashtagMeta && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 600,
                  backgroundColor: hashtagMeta.source === 'memory' ? '#FEF3C7' : '#EFF6FF',
                  color: hashtagMeta.source === 'memory' ? '#92400E' : '#1E40AF',
                  border: `1px solid ${hashtagMeta.source === 'memory' ? '#FCD34D' : '#BFDBFE'}`
                }}
              >
                {hashtagMeta.source === 'memory' ? '🧠 Creator Memory Hit' : '✨ Fresh AI'}
              </span>
            )}

            {onSuggestHashtags && (
              <button
                type="button"
                onClick={onSuggestHashtags}
                disabled={disabled || isSuggestingHashtags}
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#EFF6FF',
                  color: '#1D4ED8',
                  border: '1px solid #BFDBFE',
                  cursor: disabled || isSuggestingHashtags ? 'not-allowed' : 'pointer',
                  fontWeight: 500
                }}
              >
                {isSuggestingHashtags ? 'Suggesting Tags...' : '✨ Suggest Hashtags'}
              </button>
            )}
          </div>
        </div>

        {/* Selected Tag Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
          {hashtags.map((tag) => (
            <span
              key={tag}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 500,
                padding: '3px 8px',
                borderRadius: '9999px',
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                border: '1px solid #BFDBFE'
              }}
            >
              #{tag}
              <button
                type="button"
                aria-label={`Remove #${tag}`}
                onClick={() => handleRemoveTag(tag)}
                disabled={disabled}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: disabled ? 'default' : 'pointer',
                  color: '#1D4ED8',
                  padding: 0,
                  fontSize: '12px',
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </span>
          ))}

          {hashtags.length === 0 && (
            <span style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic' }}>
              No hashtags added yet
            </span>
          )}
        </div>

        {/* Custom Tag Input */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
          <input
            type="text"
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag(customTagInput);
              }
            }}
            placeholder="Add hashtag (press Enter)..."
            disabled={disabled}
            style={{
              flex: 1,
              fontSize: '12px',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              color: '#0F172A'
            }}
          />
          <button
            type="button"
            onClick={() => handleAddTag(customTagInput)}
            disabled={disabled || !customTagInput.trim()}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: '#F1F5F9',
              color: '#334155',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              cursor: disabled || !customTagInput.trim() ? 'not-allowed' : 'pointer'
            }}
          >
            Add
          </button>
        </div>

        {/* Suggested Hashtags */}
        {suggestedHashtags.length > 0 && (
          <div>
            <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '4px' }}>
              AI-suggested tags (click to add):
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {suggestedHashtags.filter((t) => !hashtags.includes(t)).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  disabled={disabled}
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: '#F8FAFC',
                    color: '#475569',
                    border: '1px dashed #CBD5E1',
                    cursor: disabled ? 'default' : 'pointer'
                  }}
                >
                  + #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Audio & Music Track Section */}
      {onSelectMusic && (
        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155', margin: 0 }}>
              Background Audio / Music
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Memory Badge for Music */}
              {musicMeta && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 600,
                    backgroundColor: musicMeta.source === 'memory' ? '#FEF3C7' : '#EFF6FF',
                    color: musicMeta.source === 'memory' ? '#92400E' : '#1E40AF',
                    border: `1px solid ${musicMeta.source === 'memory' ? '#FCD34D' : '#BFDBFE'}`
                  }}
                >
                  {musicMeta.source === 'memory' ? '🧠 Creator Memory Hit' : '✨ Fresh AI'}
                </span>
              )}

              {onSuggestMusic && (
                <button
                  type="button"
                  onClick={onSuggestMusic}
                  disabled={disabled || isSuggestingMusic}
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1px solid #BFDBFE',
                    cursor: disabled || isSuggestingMusic ? 'not-allowed' : 'pointer',
                    fontWeight: 500
                  }}
                >
                  {isSuggestingMusic ? 'Finding Cues...' : '✨ Suggest Music'}
                </button>
              )}
            </div>
          </div>

          {selectedMusic ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '6px',
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0'
              }}
            >
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#166534' }}>
                  🎵 {selectedMusic.title}
                </div>
                <div style={{ fontSize: '11px', color: '#15803D' }}>
                  {selectedMusic.genre} • Mood: {selectedMusic.mood}
                </div>
                {selectedMusic.note && (
                  <div style={{ fontSize: '11px', color: '#166534', marginTop: '2px', fontStyle: 'italic' }}>
                    Note: {selectedMusic.note}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => onSelectMusic(undefined)}
                disabled={disabled}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#15803D',
                  fontSize: '11px',
                  cursor: disabled ? 'default' : 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Remove Audio
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                Select AI-suggested audio recommendation:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {availableMusic.map((track) => (
                  <button
                    key={track.id}
                    type="button"
                    onClick={() => onSelectMusic(track)}
                    disabled={disabled}
                    style={{
                      fontSize: '11px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      backgroundColor: '#FFFFFF',
                      color: '#334155',
                      border: '1px solid #CBD5E1',
                      cursor: disabled ? 'default' : 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div>🎵 <strong>{track.title}</strong> <span style={{ color: '#64748B' }}>({track.mood})</span></div>
                    {track.note && (
                      <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>
                        {track.note}
                      </div>
                    )}
                  </button>
                ))}

                {availableMusic.length === 0 && (
                  <span style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic' }}>
                    Click "✨ Suggest Music" above to load contextual background cues for this post.
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
