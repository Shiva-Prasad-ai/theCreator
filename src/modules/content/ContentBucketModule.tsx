/**
 * ContentBucketModule
 * 
 * Main Entry Component for Content and Publishing Module
 * Module Ownership: Bhavya (Content and Publishing)
 * Architecture standard: Next.js App Router (React Client Component)
 * 
 * NOTE: Independent of global application shell (Shiva's ownership).
 * Can be mounted into any Next.js page (e.g. /content or /dashboard/content).
 */

"use client";

import React, { useState, useMemo } from 'react';
import { BucketSlot, ApprovalStatus } from './types/content';
import { IGatewayClient } from './services/gatewayClient';
import { MockGatewayClient } from './services/mockGatewayClient';
import { IStorageService, StorageService } from './services/storageService';

import { BucketGrid } from './components/BucketGrid';
import { CalendarView } from './components/CalendarView';
import { SlotDetailModal } from './components/SlotDetailModal';
import { FailureLogDrawer } from './components/FailureLogDrawer';

import mockSlotsData from './mocks/mockSlots.json';

export interface ContentBucketModuleProps {
  initialSlots?: BucketSlot[];
  creatorId?: string;
  gatewayClient?: IGatewayClient;
  storageService?: IStorageService;
  onSlotPublishScheduled?: (slot: BucketSlot) => void;
}

export const ContentBucketModule: React.FC<ContentBucketModuleProps> = ({
  initialSlots,
  creatorId = 'creator-bhavya-01',
  gatewayClient,
  storageService,
  onSlotPublishScheduled
}) => {
  // Use injected gateway or fallback to mock client for offline / isolated development
  const resolvedGatewayClient = useMemo<IGatewayClient>(() => {
    return gatewayClient || new MockGatewayClient(350);
  }, [gatewayClient]);

  // Use injected storage or fallback to local storage service
  const resolvedStorageService = useMemo<IStorageService>(() => {
    return storageService || new StorageService();
  }, [storageService]);

  // Slots state (defaults to 12 mock slots fixture)
  const [slots, setSlots] = useState<BucketSlot[]>(() => {
    if (initialSlots && initialSlots.length > 0) return initialSlots;
    return (mockSlotsData.slots as unknown) as BucketSlot[];
  });

  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [activeSlot, setActiveSlot] = useState<BucketSlot | null>(null);
  const [activeFailureSlot, setActiveFailureSlot] = useState<BucketSlot | null>(null);

  // Quick approve action from card
  const handleQuickApprove = (slotId: string) => {
    setSlots((prev) =>
      prev.map((s) => {
        if (s.id === slotId && s.post) {
          return {
            ...s,
            status: 'ready',
            post: {
              ...s.post,
              approvalStatus: 'approved' as ApprovalStatus,
              updatedAt: new Date().toISOString()
            }
          };
        }
        return s;
      })
    );
  };

  // Save changes from SlotDetailModal
  const handleSaveSlot = (updatedSlot: BucketSlot) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === updatedSlot.id ? updatedSlot : s))
    );
    if (updatedSlot.status === 'scheduled' && onSlotPublishScheduled) {
      onSlotPublishScheduled(updatedSlot);
    }
  };

  // Retry publishing from FailureLogDrawer (simulation)
  const handleRetryPublish = (failureId: string) => {
    if (!activeFailureSlot || !activeFailureSlot.post?.publishingFailure) return;

    // Simulate scheduling retry job
    const updatedSlot: BucketSlot = {
      ...activeFailureSlot,
      status: 'scheduled',
      post: {
        ...activeFailureSlot.post,
        publishingStatus: 'scheduled',
        publishingFailure: {
          ...activeFailureSlot.post.publishingFailure,
          retryCount: activeFailureSlot.post.publishingFailure.retryCount + 1
        },
        updatedAt: new Date().toISOString()
      }
    };

    handleSaveSlot(updatedSlot);
    setActiveFailureSlot(null);
  };

  return (
    <div
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '24px 16px',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#0F172A'
      }}
    >
      {/* Module Top Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '20px',
          borderBottom: '1px solid #E2E8F0',
          paddingBottom: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#0F172A' }}>
              Content & Publishing Bucket
            </h1>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                fontWeight: 600
              }}
            >
              Module: Content (Bhavya)
            </span>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                fontWeight: 600
              }}
            >
              SAMPLE FIXTURES ACTIVE
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            12-Slot multi-platform content pipeline. Plan, draft, generate AI captions, and approve posts.
          </p>
        </div>

        {/* View Switcher: Grid vs Calendar */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px' }}>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: viewMode === 'grid' ? 600 : 500,
              backgroundColor: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'grid' ? '#0F172A' : '#64748B',
              borderRadius: '6px',
              border: 'none',
              boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
              cursor: 'pointer'
            }}
          >
            ▦ 12-Slot Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: viewMode === 'calendar' ? 600 : 500,
              backgroundColor: viewMode === 'calendar' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'calendar' ? '#0F172A' : '#64748B',
              borderRadius: '6px',
              border: 'none',
              boxShadow: viewMode === 'calendar' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
              cursor: 'pointer'
            }}
          >
            📅 Calendar Schedule
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'grid' ? (
        <BucketGrid
          slots={slots}
          selectedSlotId={activeSlot?.id}
          onSelectSlot={(slot) => setActiveSlot(slot)}
          onQuickApprove={handleQuickApprove}
        />
      ) : (
        <CalendarView
          slots={slots}
          selectedSlotId={activeSlot?.id}
          onSelectSlot={(slot) => setActiveSlot(slot)}
        />
      )}

      {/* Slot Detail Modal */}
      {activeSlot && (
        <SlotDetailModal
          slot={activeSlot}
          isOpen={Boolean(activeSlot)}
          creatorId={creatorId}
          gatewayClient={resolvedGatewayClient}
          storageService={resolvedStorageService}
          onClose={() => setActiveSlot(null)}
          onSaveSlot={handleSaveSlot}
          onViewFailureDiagnostics={(slot) => {
            setActiveFailureSlot(slot);
            setActiveSlot(null);
          }}
        />
      )}

      {/* Failure Diagnostics Drawer */}
      {activeFailureSlot?.post?.publishingFailure && (
        <FailureLogDrawer
          failure={activeFailureSlot.post.publishingFailure}
          isOpen={Boolean(activeFailureSlot)}
          onClose={() => setActiveFailureSlot(null)}
          onRetryPublish={handleRetryPublish}
        />
      )}
    </div>
  );
};

export default ContentBucketModule;
