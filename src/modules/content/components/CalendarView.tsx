/**
 * CalendarView Component
 * 
 * Module Ownership: Bhavya (Content and Publishing)
 * Responsibility: Visualizes content bucket slots organized by publishing schedule days.
 */

"use client";

import React, { useState } from 'react';
import { BucketSlot, Platform } from '../types/content';

export interface CalendarViewProps {
  slots: BucketSlot[];
  onSelectSlot: (slot: BucketSlot) => void;
  selectedSlotId?: string;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

const platformColors: Record<Platform, { bg: string; text: string }> = {
  linkedin: { bg: '#E0E7FF', text: '#3730A3' },
  instagram: { bg: '#FCE7F3', text: '#9D174D' },
  youtube: { bg: '#FEE2E2', text: '#991B1B' }
};

export const CalendarView: React.FC<CalendarViewProps> = ({
  slots,
  onSelectSlot,
  selectedSlotId
}) => {
  const [activeWeekOffset, setActiveWeekOffset] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Calendar Navigation Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          backgroundColor: '#F8FAFC',
          borderRadius: '8px',
          border: '1px solid #E2E8F0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
            Weekly Publishing Schedule
          </span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            {activeWeekOffset === 0 ? 'Current Week' : `Week ${activeWeekOffset > 0 ? `+${activeWeekOffset}` : activeWeekOffset}`}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setActiveWeekOffset((w) => w - 1)}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              borderRadius: '4px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            ← Prev Week
          </button>
          <button
            type="button"
            onClick={() => setActiveWeekOffset(0)}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              borderRadius: '4px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            Current
          </button>
          <button
            type="button"
            onClick={() => setActiveWeekOffset((w) => w + 1)}
            style={{
              padding: '4px 8px',
              fontSize: '11px',
              borderRadius: '4px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              cursor: 'pointer'
            }}
          >
            Next Week →
          </button>
        </div>
      </div>

      {/* 7-Day Calendar Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
          overflowX: 'auto'
        }}
      >
        {DAYS_OF_WEEK.map((day) => {
          const daySlots = slots.filter((s) => s.dayOfWeek === day);

          return (
            <div
              key={day}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '10px',
                minHeight: '260px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {/* Day Header */}
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#334155',
                  borderBottom: '1px solid #F1F5F9',
                  paddingBottom: '6px',
                  textAlign: 'center'
                }}
              >
                {day}
              </div>

              {/* Slots Scheduled on this day */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                {daySlots.map((slot) => {
                  const isSelected = slot.id === selectedSlotId;
                  const colors = platformColors[slot.targetPlatform];

                  return (
                    <div
                      key={slot.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectSlot(slot)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onSelectSlot(slot);
                      }}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        border: isSelected ? '2px solid #2563EB' : '1px solid #E2E8F0',
                        backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                        cursor: 'pointer',
                        fontSize: '11px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            backgroundColor: colors.bg,
                            color: colors.text,
                            textTransform: 'uppercase'
                          }}
                        >
                          {slot.targetPlatform}
                        </span>
                        <span style={{ fontSize: '10px', color: '#64748B' }}>
                          {slot.defaultTime}
                        </span>
                      </div>

                      <div style={{ fontWeight: 600, color: '#0F172A', lineHeight: '1.3' }}>
                        {slot.post?.title || slot.contentTheme}
                      </div>

                      <div style={{ fontSize: '10px', color: slot.status === 'published' ? '#166534' : slot.status === 'failed' ? '#DC2626' : '#64748B' }}>
                        ● {slot.status}
                      </div>
                    </div>
                  );
                })}

                {daySlots.length === 0 && (
                  <div
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      color: '#CBD5E1',
                      fontStyle: 'italic'
                    }}
                  >
                    No scheduled slots
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
