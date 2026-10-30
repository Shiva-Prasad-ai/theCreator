/**
 * BucketGrid Component
 * 
 * Module Ownership: Bhavya (Content and Publishing)
 * Responsibility: Renders the 12-slot content grid with filtering controls.
 */

"use client";

import React, { useState, useMemo } from 'react';
import { BucketSlot, Platform, SlotStatus } from '../types/content';
import { BucketSlotCard } from './BucketSlotCard';

export interface BucketGridProps {
  slots: BucketSlot[];
  selectedSlotId?: string;
  onSelectSlot: (slot: BucketSlot) => void;
  onQuickApprove?: (slotId: string) => void;
  isLoading?: boolean;
}

export const BucketGrid: React.FC<BucketGridProps> = ({
  slots,
  selectedSlotId,
  onSelectSlot,
  onQuickApprove,
  isLoading = false
}) => {
  const [platformFilter, setPlatformFilter] = useState<'all' | Platform>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | SlotStatus>('all');

  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const matchesPlatform = platformFilter === 'all' || slot.targetPlatform === platformFilter;
      const matchesStatus = statusFilter === 'all' || slot.status === statusFilter;
      return matchesPlatform && matchesStatus;
    });
  }, [slots, platformFilter, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: slots.length,
      published: slots.filter((s) => s.status === 'published').length,
      scheduled: slots.filter((s) => s.status === 'scheduled').length,
      failed: slots.filter((s) => s.status === 'failed').length,
      empty: slots.filter((s) => s.status === 'empty').length
    };
  }, [slots]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Controls: Summary Metrics & Filters */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          backgroundColor: '#F8FAFC',
          borderRadius: '8px',
          border: '1px solid #E2E8F0'
        }}
      >
        {/* Slot Metric Counters */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#475569' }}>
          <span><strong>Total:</strong> {stats.total} slots</span>
          <span><strong>Published:</strong> {stats.published}</span>
          <span><strong>Scheduled:</strong> {stats.scheduled}</span>
          {stats.failed > 0 && (
            <span style={{ color: '#DC2626', fontWeight: 600 }}>
              ⚠️ Failed: {stats.failed}
            </span>
          )}
          <span><strong>Unfilled:</strong> {stats.empty}</span>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Platform Filter */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as any)}
            aria-label="Filter slots by platform"
            style={{
              fontSize: '12px',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#1E293B'
            }}
          >
            <option value="all">All Platforms</option>
            <option value="linkedin">LinkedIn</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            aria-label="Filter slots by status"
            style={{
              fontSize: '12px',
              padding: '6px 10px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#1E293B'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="empty">Empty</option>
            <option value="drafted">Drafted</option>
            <option value="ready">Ready</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Grid Container (Responsive 1-4 columns) */}
      {isLoading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
          Loading 12-Slot Content Bucket...
        </div>
      ) : filteredSlots.length === 0 ? (
        <div
          style={{
            padding: '48px',
            textAlign: 'center',
            backgroundColor: '#F8FAFC',
            borderRadius: '8px',
            border: '1px dashed #CBD5E1',
            color: '#64748B'
          }}
        >
          No bucket slots match the selected filters.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px'
          }}
        >
          {filteredSlots.map((slot) => (
            <BucketSlotCard
              key={slot.id}
              slot={slot}
              isSelected={slot.id === selectedSlotId}
              onSelectSlot={onSelectSlot}
              onQuickApprove={onQuickApprove}
            />
          ))}
        </div>
      )}
    </div>
  );
};
