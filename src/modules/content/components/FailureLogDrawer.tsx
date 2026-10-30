/**
 * FailureLogDrawer Component
 * 
 * Module Ownership: Bhavya (Content and Publishing)
 * Responsibility: Displays detailed diagnostics and retry actions for failed publishing tasks.
 */

"use client";

import React from 'react';
import { PublishingFailure } from '../types/content';

export interface FailureLogDrawerProps {
  failure?: PublishingFailure;
  isOpen: boolean;
  onClose: () => void;
  onRetryPublish?: (failureId: string) => void;
  isRetrying?: boolean;
}

export const FailureLogDrawer: React.FC<FailureLogDrawerProps> = ({
  failure,
  isOpen,
  onClose,
  onRetryPublish,
  isRetrying = false
}) => {
  if (!isOpen || !failure) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="failure-log-title"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        justifyContent: 'flex-end',
        zIndex: 50
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <h2 id="failure-log-title" style={{ fontSize: '15px', fontWeight: 700, color: '#991B1B', margin: 0 }}>
              ⚠️ Publishing Failure Diagnostics
            </h2>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              Slot: {failure.slotId} • Platform: {failure.platform.toUpperCase()}
            </span>
          </div>

          <button
            type="button"
            aria-label="Close diagnostics drawer"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#64748B'
            }}
          >
            ✕
          </button>
        </div>

        {/* Drawer Body: Diagnostic Details */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
          {/* Error Banner */}
          <div
            style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '6px',
              padding: '12px'
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#991B1B', marginBottom: '4px' }}>
              {failure.errorCode}
            </div>
            <div style={{ fontSize: '12px', color: '#7F1D1D', lineHeight: '1.4' }}>
              {failure.errorMessage}
            </div>
          </div>

          {/* Metadata Table */}
          <div
            style={{
              fontSize: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              border: '1px solid #E2E8F0',
              borderRadius: '6px',
              padding: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Failed At:</span>
              <span style={{ fontWeight: 500, color: '#1E293B' }}>
                {new Date(failure.failedAt).toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Retry Attempts:</span>
              <span style={{ fontWeight: 500, color: '#1E293B' }}>
                {failure.retryCount} of {failure.maxRetries}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Worker Queue:</span>
              <span style={{ fontWeight: 500, color: '#1E293B' }}>
                Tilak's Background Worker
              </span>
            </div>
          </div>

          {/* Suggested Resolution */}
          {failure.suggestedAction && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#1E293B', marginBottom: '4px' }}>
                Recommended Action
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#334155',
                  backgroundColor: '#F8FAFC',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0'
                }}
              >
                {failure.suggestedAction}
              </div>
            </div>
          )}

          {/* Raw Error Payload */}
          {failure.rawResponse && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>
                Raw Provider Response
              </div>
              <pre
                style={{
                  backgroundColor: '#0F172A',
                  color: '#F8FAFC',
                  fontSize: '11px',
                  padding: '10px',
                  borderRadius: '6px',
                  overflowX: 'auto',
                  margin: 0
                }}
              >
                {JSON.stringify(failure.rawResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
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
              padding: '6px 12px',
              fontSize: '12px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            Close
          </button>

          {onRetryPublish && (
            <button
              type="button"
              onClick={() => onRetryPublish(failure.id)}
              disabled={isRetrying || failure.retryCount >= failure.maxRetries}
              style={{
                padding: '6px 16px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: '6px',
                border: 'none',
                backgroundColor: isRetrying || failure.retryCount >= failure.maxRetries ? '#CBD5E1' : '#2563EB',
                color: '#FFFFFF',
                cursor: isRetrying || failure.retryCount >= failure.maxRetries ? 'not-allowed' : 'pointer'
              }}
            >
              {isRetrying ? 'Retrying Queue...' : 'Retry Publishing'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
