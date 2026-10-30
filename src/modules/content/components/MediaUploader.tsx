/**
 * MediaUploader Component
 * 
 * Module Ownership: Bhavya (Content and Publishing)
 * Responsibility: Handles media asset selection, file preview, validation and upload triggering.
 */

"use client";

import React, { useState, useRef } from 'react';
import { MediaAsset } from '../types/content';
import { IStorageService } from '../services/storageService';

export interface MediaUploaderProps {
  mediaAssets: MediaAsset[];
  creatorId: string;
  slotId: string;
  storageService?: IStorageService;
  onAssetsChange: (assets: MediaAsset[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  mediaAssets,
  creatorId,
  slotId,
  storageService,
  onAssetsChange,
  maxFiles = 5,
  disabled = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMessage(null);
    setIsUploading(true);

    try {
      const newAssets: MediaAsset[] = [...mediaAssets];

      for (let i = 0; i < files.length; i++) {
        if (newAssets.length >= maxFiles) {
          setErrorMessage(`Maximum of ${maxFiles} media files reached.`);
          break;
        }

        const file = files[i];

        if (storageService) {
          const result = await storageService.uploadMedia(file, creatorId, slotId);
          if (result.success && result.asset) {
            newAssets.push(result.asset);
          } else {
            setErrorMessage(result.error || 'Upload failed');
          }
        } else {
          // Local fallback object preview
          const isVideo = file.type.startsWith('video');
          const mockAsset: MediaAsset = {
            id: `media-local-${Date.now()}-${i}`,
            url: URL.createObjectURL(file),
            thumbnailUrl: isVideo ? undefined : URL.createObjectURL(file),
            fileName: file.name,
            fileSizeBytes: file.size,
            mimeType: file.type,
            type: isVideo ? 'video' : 'image'
          };
          newAssets.push(mockAsset);
        }
      }

      onAssetsChange(newAssets);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAsset = (assetId: string) => {
    const filtered = mediaAssets.filter((a) => a.id !== assetId);
    onAssetsChange(filtered);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
        Media Assets ({mediaAssets.length}/{maxFiles})
      </label>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime,video/webm"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={disabled || isUploading || mediaAssets.length >= maxFiles}
      />

      {/* Drag & Drop / Click Zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload media files"
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            !disabled && !isUploading && fileInputRef.current?.click();
          }
        }}
        style={{
          border: '2px dashed #CBD5E1',
          borderRadius: '8px',
          padding: '24px 16px',
          textAlign: 'center',
          backgroundColor: disabled ? '#F1F5F9' : '#F8FAFC',
          cursor: disabled || isUploading ? 'not-allowed' : 'pointer',
          transition: 'border-color 0.15s ease'
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>
          {isUploading ? '⏳' : '📤'}
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>
          {isUploading ? 'Processing upload...' : 'Click to upload image or video'}
        </div>
        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
          PNG, JPG, MP4, MOV (Up to 10MB image, 100MB video)
        </div>
      </div>

      {/* Error Banner */}
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

      {/* Asset Preview List */}
      {mediaAssets.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
          {mediaAssets.map((asset) => (
            <div
              key={asset.id}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                fontSize: '12px',
                color: '#334155'
              }}
            >
              <span>{asset.type === 'video' ? '🎬' : '🖼️'}</span>
              <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {asset.fileName}
              </span>
              <button
                type="button"
                aria-label={`Remove ${asset.fileName}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveAsset(asset.id);
                }}
                disabled={disabled}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: disabled ? 'default' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  marginLeft: '4px'
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
