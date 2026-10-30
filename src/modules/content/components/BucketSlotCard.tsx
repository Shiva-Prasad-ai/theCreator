/**
 * BucketSlotCard Component
 * 
 * Module Ownership: Bhavya (Content and Publishing)
 * Responsibility: Renders a single slot card within the 12-slot content bucket grid.
 */

"use client";

import React from 'react';
import { BucketSlot, Platform, ApprovalStatus, PublishingStatus } from '../types/content';

export interface BucketSlotCardProps {
  slot: BucketSlot;
  isSelected?: boolean;
  onSelectSlot: (slot: BucketSlot) => void;
  onQuickApprove?: (slotId: string) => void;
}

const platformIcons: Record<Platform, string> = {
  linkedin: '💼 LinkedIn',
  instagram: '📸 Instagram',
  youtube: '▶️ YouTube'
};

const approvalBadgeColors: Record<ApprovalStatus, { bg: string; text: string }> = {
  draft: { bg: '#F1F5F9', text: '#475569' },
  pending_review: { bg: '#FEF3C7', text: '#92400E' },
  approved: { bg: '#DCFCE7', text: '#166534' },
  rejected: { bg: '#FEE2E2', text: '#991B1B' }
};

const publishingBadgeColors: Record<PublishingStatus, { bg: string; text: string }> = {
  idle: { bg: '#F3F4F6', text: '#6B7280' },
  scheduled: { bg: '#E0E7FF', text: '#3730A3' },
  publishing: { bg: '#FEF08A', text: '#854D0E' },
  published: { bg: '#D1FAE5', text: '#065F46' },
  failed: { bg: '#FEE2E2', text: '#B91C1C' }
};

export const BucketSlotCard: React.FC<BucketSlotCardProps> = ({
  slot,
  isSelected = false,
  onSelectSlot,
  onQuickApprove
}) => {
  const post = slot.post;
  const hasPost = Boolean(post);
  const mediaAsset = post?.mediaAssets?.[0];

  const approvalColors = post 
    ? approvalBadgeColors[post.approvalStatus] 
    : { bg: '#F3F4F6', text: '#6B7280' };

  const publishingColors = post 
    ? publishingBadgeColors[post.publishingStatus] 
    : { bg: '#F3F4F6', text: '#6B7280' };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Bucket Slot ${slot.slotNumber}: ${slot.contentTheme}`}
      onClick={() => onSelectSlot(slot)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectSlot(slot);
        }
      }}
      style={{
        borderRadius: '8px',
        border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
        backgroundColor: '#FFFFFF',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        minHeight: '220px',
        boxShadow: isSelected ? '0 4px 6px -1px rgba(37, 99, 235, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        transition: 'all 0.15s ease-in-out'
      }}
    >
      {/* Top Header: Slot # & Target Platform */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
            SLOT #{slot.slotNumber.toString().padStart(2, '0')}
          </span>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: '#F1F5F9',
              color: '#334155',
              fontWeight: 500
            }}
          >
            {platformIcons[slot.targetPlatform]}
          </span>
        </div>

        {/* Schedule Day & Time */}
        <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px' }}>
          {slot.dayOfWeek} • {slot.defaultTime}
        </div>

        {/* Slot Theme / Post Title */}
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A', marginBottom: '8px', lineHeight: '1.4' }}>
          {post?.title || slot.contentTheme}
        </div>

        {/* Slot Status Label */}
        {!hasPost && (
          <div style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic', marginTop: '12px' }}>
            Empty slot — click to draft content
          </div>
        )}
      </div>

      {/* Middle: Media Indicator if present */}
      {mediaAsset && (
        <div
          style={{
            fontSize: '11px',
            color: '#475569',
            backgroundColor: '#F8FAFC',
            border: '1px dashed #CBD5E1',
            borderRadius: '4px',
            padding: '6px 8px',
            margin: '8px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          <span>{mediaAsset.type === 'video' ? '🎬' : '🖼️'}</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{mediaAsset.fileName}</span>
        </div>
      )}

      {/* Bottom Footer: Badges & Quick Action */}
      {hasPost && (
        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '10px', marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: approvalColors.bg,
                  color: approvalColors.text
                }}
              >
                {post.approvalStatus.replace('_', ' ')}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: publishingColors.bg,
                  color: publishingColors.text
                }}
              >
                {post.publishingStatus}
              </span>
            </div>

            {post.approvalStatus === 'pending_review' && onQuickApprove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickApprove(slot.id);
                }}
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#166534',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Approve
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
