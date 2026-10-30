/**
 * Storage Service for Content Media Assets
 * 
 * Module Ownership: Bhavya (Content and Publishing)
 * Integration Partner: Shiva (Shared Supabase configuration & Auth)
 * 
 * NOTE: Does NOT create duplicate Supabase client instances.
 * Accepts Shiva's shared Supabase client via dependency injection,
 * and provides a local mock fallback for development.
 */

import { MediaAsset, MediaType } from '../types/content';

export interface StorageUploadResult {
  asset: MediaAsset;
  success: boolean;
  error?: string;
}

export interface IStorageService {
  uploadMedia(file: File, creatorId: string, slotId: string): Promise<StorageUploadResult>;
  deleteMedia(storagePath: string): Promise<boolean>;
  getPublicUrl(storagePath: string): string;
}

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/quicktime', 'video/webm'];

export class StorageService implements IStorageService {
  private bucketName: string;
  private supabaseClient?: any; // Injected from Shiva's shared Supabase module

  constructor(supabaseClient?: any, bucketName = 'creator-content-media') {
    this.supabaseClient = supabaseClient;
    this.bucketName = bucketName;
  }

  async uploadMedia(file: File, creatorId: string, slotId: string): Promise<StorageUploadResult> {
    // 1. Validation
    const isImage = ALLOWED_IMAGE_MIMES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_MIMES.includes(file.type);

    if (!isImage && !isVideo) {
      return {
        success: false,
        error: `Unsupported file type: ${file.type}. Allowed: PNG, JPG, WEBP, MP4, MOV, WEBM.`,
        asset: null as any
      };
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE_BYTES : MAX_IMAGE_SIZE_BYTES;
    if (file.size > maxSize) {
      const maxMb = maxSize / (1024 * 1024);
      return {
        success: false,
        error: `File size exceeds the ${maxMb}MB limit for ${isVideo ? 'video' : 'image'}.`,
        asset: null as any
      };
    }

    const mediaType: MediaType = isVideo ? 'video' : 'image';
    const fileExt = file.name.split('.').pop() || (isVideo ? 'mp4' : 'png');
    const storagePath = `${creatorId}/${slotId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

    // 2. If Shiva's shared Supabase client is supplied, perform real upload
    if (this.supabaseClient?.storage) {
      try {
        const { error: uploadError } = await this.supabaseClient.storage
          .from(this.bucketName)
          .upload(storagePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) {
          return {
            success: false,
            error: uploadError.message,
            asset: null as any
          };
        }

        const publicUrl = this.getPublicUrl(storagePath);

        const asset: MediaAsset = {
          id: `media-${Date.now()}`,
          url: publicUrl,
          thumbnailUrl: isImage ? publicUrl : undefined,
          fileName: file.name,
          fileSizeBytes: file.size,
          mimeType: file.type,
          type: mediaType,
          storagePath
        };

        return { success: true, asset };
      } catch (err: any) {
        return {
          success: false,
          error: err?.message || 'Unknown error during Supabase storage upload',
          asset: null as any
        };
      }
    }

    // 3. Mock fallback for local development / testing without live Supabase
    const mockUrl = typeof URL !== 'undefined' && URL.createObjectURL 
      ? URL.createObjectURL(file) 
      : `https://mock.storage.local/${storagePath}`;

    const mockAsset: MediaAsset = {
      id: `media-mock-${Date.now()}`,
      url: mockUrl,
      thumbnailUrl: isImage ? mockUrl : undefined,
      fileName: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type,
      type: mediaType,
      storagePath: `mock/${storagePath}`
    };

    return {
      success: true,
      asset: mockAsset
    };
  }

  async deleteMedia(storagePath: string): Promise<boolean> {
    if (this.supabaseClient?.storage) {
      const { error } = await this.supabaseClient.storage
        .from(this.bucketName)
        .remove([storagePath]);
      return !error;
    }
    return true;
  }

  getPublicUrl(storagePath: string): string {
    if (this.supabaseClient?.storage) {
      const { data } = this.supabaseClient.storage
        .from(this.bucketName)
        .getPublicUrl(storagePath);
      return data?.publicUrl || '';
    }
    return `https://mock.storage.local/${storagePath}`;
  }
}
