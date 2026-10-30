/**
 * Content and Publishing Module - Domain & Database Types
 * 
 * Module Ownership: Bhavya (Content and Publishing)
 * Architecture Standard: Next.js App Router + TypeScript
 * 
 * Clear Separation of Concerns:
 * 1. UI Domain Models: Used across interactive Bucket components (BucketGrid, SlotDetailModal, ScriptEditor, etc.)
 * 2. Database Models: Strictly matches Team Kit Section 7 ("Draft database tables v1") owned by Bhavya
 * 3. H3 API Types: Defined in types/gateway.ts matching Team Kit Section 6
 */

// ============================================================================
// 1. UI Domain Primitives & Models
// ============================================================================

export type Platform = 'linkedin' | 'instagram' | 'youtube';

export type ApprovalStatus = 
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected';

export type PublishingStatus = 
  | 'idle'
  | 'scheduled'
  | 'publishing'
  | 'published'
  | 'failed';

export type SlotStatus = 
  | 'empty'
  | 'drafted'
  | 'ready'
  | 'scheduled'
  | 'published'
  | 'failed';

export type MediaType = 'video' | 'image';

export interface MediaAsset {
  id: string;
  url: string;
  thumbnailUrl?: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  type: MediaType;
  durationSeconds?: number;
  width?: number;
  height?: number;
  storagePath?: string;
}

/** UI Model for Scriptwriting - Maps to H3 { hook, body, cta } */
export interface ContentScript {
  hook: string;
  body: string;
  callToAction: string;
  cta?: string; // H3 contract alias for callToAction
  estimatedDurationSeconds?: number;
  notes?: string;
}

/** UI Model for Captions - Generated from H3 /v1/generate task='caption' */
export interface ContentCaption {
  text: string;
  tone?: string;
  hashtags: string[];
  callToAction?: string;
  characterCount: number;
  language?: string;
}

/** UI Model for Music Suggestions - Maps to H3 { mood, genre, note } */
export interface MusicTrackSuggestion {
  id: string;
  title: string;
  artist: string;
  genre: string;
  mood: string;
  note?: string; // H3 suggestion note
  bpm?: number;
  previewUrl?: string;
  platformSuitability: Platform[];
}

export interface PublishingFailure {
  id: string;
  slotId: string;
  platform: Platform;
  errorCode: string;
  errorMessage: string;
  failedAt: string; // ISO 8601 string
  retryCount: number;
  maxRetries: number;
  rawResponse?: Record<string, unknown>;
  suggestedAction?: string;
}

export interface ContentPost {
  id: string;
  creatorId: string;
  title: string;
  contentTheme?: string;
  targetPlatforms: Platform[];
  script?: ContentScript;
  caption?: ContentCaption;
  mediaAssets: MediaAsset[];
  musicTrack?: MusicTrackSuggestion;
  approvalStatus: ApprovalStatus;
  publishingStatus: PublishingStatus;
  scheduledPublishTime?: string; // ISO 8601 string
  publishedAt?: string; // ISO 8601 string
  publishingFailure?: PublishingFailure;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export interface BucketSlot {
  id: string;
  slotNumber: number; // 1 through 12
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  defaultTime: string; // e.g. "10:00 AM"
  targetPlatform: Platform;
  contentTheme: string;
  status: SlotStatus;
  post?: ContentPost;
}

// ============================================================================
// 2. Database Schema Types (Section 7: Draft Database Tables v1)
// ============================================================================

/**
 * Section 7 Table: posts
 * Owner: BCA Bhavya
 * Key Columns: id, user_id, title, platform, status, video_path, scheduled_at, published_at, external_url, campaign_id
 */
export type DBPostStatus = 
  | 'draft'
  | 'in_review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'failed';

export interface DBPostRecord {
  id: string;
  user_id: string;
  title: string;
  platform: Platform;
  status: DBPostStatus;
  video_path: string | null;
  scheduled_at: string | null; // ISO 8601
  published_at: string | null; // ISO 8601
  external_url: string | null;
  campaign_id: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Section 7 Table: scripts
 * Owner: BCA Bhavya
 * Key Columns: post_id, body, version, created_by (user or ai)
 */
export interface DBScriptRecord {
  post_id: string;
  body: string;
  version: number;
  created_by: 'user' | 'ai';
  created_at?: string;
}

/**
 * Section 7 Table: captions
 * Owner: BCA Bhavya
 * Key Columns: post_id, text, hashtags, music_suggestion, source (ai or user), approved
 */
export interface DBCaptionRecord {
  post_id: string;
  text: string;
  hashtags: string[];
  music_suggestion: string | null;
  source: 'ai' | 'user';
  approved: boolean;
  created_at?: string;
}

/**
 * Section 7 Table: approvals
 * Owner: BCA Bhavya
 * Key Columns: post_id, state, reviewer, reason, at
 */
export interface DBApprovalRecord {
  post_id: string;
  state: 'pending' | 'approved' | 'rejected';
  reviewer: string;
  reason: string | null;
  at: string; // ISO 8601
}

/**
 * Section 7 Table: failure_logs
 * Owner: BCA Bhavya
 * Key Columns: post_id, stage, error, retry_count, resolved
 */
export interface DBFailureLogRecord {
  id?: string;
  post_id: string;
  stage: 'media_upload' | 'token_refresh' | 'validation' | 'queue_enqueue' | 'platform_publish';
  error: string;
  retry_count: number;
  resolved: boolean;
  created_at?: string;
}

// ============================================================================
// 3. Mapping Utilities (UI Domain Model <-> Section 7 Database Records)
// ============================================================================

/** Maps UI ContentPost to Section 7 DBPostRecord */
export function toDBPostRecord(post: ContentPost, userId: string): DBPostRecord {
  let dbStatus: DBPostStatus = 'draft';
  if (post.publishingStatus === 'published') dbStatus = 'published';
  else if (post.publishingStatus === 'failed') dbStatus = 'failed';
  else if (post.publishingStatus === 'scheduled') dbStatus = 'scheduled';
  else if (post.approvalStatus === 'approved') dbStatus = 'approved';
  else if (post.approvalStatus === 'pending_review') dbStatus = 'in_review';

  return {
    id: post.id,
    user_id: userId,
    title: post.title,
    platform: post.targetPlatforms[0] || 'linkedin',
    status: dbStatus,
    video_path: post.mediaAssets[0]?.storagePath || null,
    scheduled_at: post.scheduledPublishTime || null,
    published_at: post.publishedAt || null,
    external_url: null,
    campaign_id: null
  };
}
