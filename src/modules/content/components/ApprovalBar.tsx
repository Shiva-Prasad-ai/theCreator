/**
 * ApprovalBar Component
 * 
 * Module Ownership: Bhavya (Content and Publishing)
 * Responsibility: Manages post approval workflow states (Draft -> Pending Review -> Approved).
 */

"use client";

import React from 'react';
import { ApprovalStatus, PublishingStatus } from '../types/content';

export interface ApprovalBarProps {
  approvalStatus: ApprovalStatus;
  publishingStatus: PublishingStatus;
  onStatusChange: (newStatus: ApprovalStatus) => void;
  onTriggerPublish?: () => void;
  isUpdating?: boolean;
  disabled?: boolean;
}

const steps: Array<{ status: ApprovalStatus; label: string }> = [
  { status: 'draft', label: '1. Draft' },
  { status: 'pending_review', label: '2. Review' },
  { status: 'approved', label: '3. Approved' }
];

export const ApprovalBar: React.FC<ApprovalBarProps> = ({
  approvalStatus,
  publishingStatus,
  onStatusChange,
  onTriggerPublish,
  isUpdating = false,
  disabled = false
}) => {
  return (
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
      {/* Workflow Steps Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {steps.map((step, idx) => {
          const isCurrent = approvalStatus === step.status;
          const isPassed =
            (step.status === 'draft' && (approvalStatus === 'pending_review' || approvalStatus === 'approved')) ||
            (step.status === 'pending_review' && approvalStatus === 'approved');

          return (
            <React.Fragment key={step.status}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? '#2563EB' : isPassed ? '#166534' : '#94A3B8'
                }}
              >
                <span>{isPassed ? '✓' : isCurrent ? '●' : '○'}</span>
                <span>{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <span style={{ color: '#CBD5E1', fontSize: '12px' }}>→</span>
              )}
            </React.Fragment>
          );
        })}

        {approvalStatus === 'rejected' && (
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#DC2626', marginLeft: '6px' }}>
            [Needs Revisions]
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {approvalStatus === 'draft' && (
          <button
            type="button"
            onClick={() => onStatusChange('pending_review')}
            disabled={disabled || isUpdating}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 500,
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #FCD34D',
              borderRadius: '6px',
              cursor: disabled || isUpdating ? 'not-allowed' : 'pointer'
            }}
          >
            Submit for Review
          </button>
        )}

        {approvalStatus === 'pending_review' && (
          <>
            <button
              type="button"
              onClick={() => onStatusChange('rejected')}
              disabled={disabled || isUpdating}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 500,
                backgroundColor: '#FEE2E2',
                color: '#991B1B',
                border: '1px solid #FCA5A5',
                borderRadius: '6px',
                cursor: disabled || isUpdating ? 'not-allowed' : 'pointer'
              }}
            >
              Request Changes
            </button>
            <button
              type="button"
              onClick={() => onStatusChange('approved')}
              disabled={disabled || isUpdating}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: '#166534',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                cursor: disabled || isUpdating ? 'not-allowed' : 'pointer'
              }}
            >
              Approve Post
            </button>
          </>
        )}

        {approvalStatus === 'approved' && (
          <button
            type="button"
            onClick={() => onStatusChange('draft')}
            disabled={disabled || isUpdating}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 500,
              backgroundColor: '#F1F5F9',
              color: '#475569',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              cursor: disabled || isUpdating ? 'not-allowed' : 'pointer'
            }}
          >
            Revert to Draft
          </button>
        )}
      </div>
    </div>
  );
};
