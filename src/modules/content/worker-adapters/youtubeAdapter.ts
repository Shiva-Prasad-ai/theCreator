/**
 * YouTube Worker Adapter
 * 
 * Module Ownership: Bhavya (Content and Publishing)
 * Integration Partner: Tilak (Background Worker & Queue)
 * 
 * Formats and validates publishing payloads for YouTube Shorts and Videos.
 * Does NOT execute live external API calls.
 */

import { ContentPost, MediaAsset } from '../types/content';
import { AdapterValidationResult } from './linkedinAdapter';

export interface YouTubeWorkerJobPayload {
  platform: 'youtube';
  postId: string;
  creatorId: string;
  scheduledTime?: string;
  postData: {
    title: string;
    description: string;
    tags: string[];
    privacyStatus: 'private' | 'unlisted' | 'public';
    isShorts: boolean;
    videoUrl: string;
    thumbnailUrl?: string;
    categoryId?: string; // e.g. "28" for Science & Technology
  };
  metadata: {
    slotId?: string;
    preparedAt: string;
    contentTheme?: string;
  };
}

const YOUTUBE_MAX_TITLE = 100;
const YOUTUBE_MAX_DESCRIPTION = 5000;

export class YouTubeAdapter {
  static validate(post: ContentPost): AdapterValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Video is strictly mandatory for YouTube
    const videoAsset = post.mediaAssets?.find((m) => m.type === 'video');
    if (!videoAsset) {
      errors.push('YouTube publishing requires a video media asset.');
    }

    const title = post.title || '';
    if (!title.trim()) {
      errors.push('YouTube video requires a non-empty title.');
    } else if (title.length > YOUTUBE_MAX_TITLE) {
      errors.push(`YouTube title exceeds ${YOUTUBE_MAX_TITLE} characters (${title.length}/${YOUTUBE_MAX_TITLE}).`);
    }

    const description = this.buildDescription(post);
    if (description.length > YOUTUBE_MAX_DESCRIPTION) {
      errors.push(`YouTube description exceeds ${YOUTUBE_MAX_DESCRIPTION} characters.`);
    }

    if (videoAsset?.durationSeconds && videoAsset.durationSeconds > 60 && title.toLowerCase().includes('#shorts')) {
      warnings.push('Video duration is over 60 seconds; YouTube may not classify it as a Short.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static buildDescription(post: ContentPost): string {
    const parts: string[] = [];

    if (post.caption?.text) {
      parts.push(post.caption.text.trim());
    }

    if (post.script) {
      parts.push('\n--- SCRIPT BREAKDOWN ---');
      if (post.script.hook) parts.push(`Hook: ${post.script.hook}`);
      if (post.script.body) parts.push(`Key Content: ${post.script.body}`);
      if (post.script.callToAction) parts.push(`Action: ${post.script.callToAction}`);
    }

    if (post.caption?.hashtags && post.caption.hashtags.length > 0) {
      const formatted = post.caption.hashtags
        .map((h) => (h.startsWith('#') ? h : `#${h}`))
        .join(' ');
      parts.push(`\n\n${formatted}`);
    }

    return parts.join('\n');
  }

  static isShortsVideo(post: ContentPost, videoAsset?: MediaAsset): boolean {
    const hasShortTag = 
      post.title?.toLowerCase().includes('#shorts') ||
      post.caption?.hashtags?.some((h) => h.toLowerCase() === 'shorts');
    const isUnder60Sec = (videoAsset?.durationSeconds || 0) <= 60 && (videoAsset?.durationSeconds || 0) > 0;
    return Boolean(hasShortTag || isUnder60Sec);
  }

  static prepareJobPayload(post: ContentPost, slotId?: string): YouTubeWorkerJobPayload {
    const videoAsset = post.mediaAssets?.find((m) => m.type === 'video');
    const isShorts = this.isShortsVideo(post, videoAsset);
    const description = this.buildDescription(post);

    const tags: string[] = [];
    if (post.caption?.hashtags) {
      tags.push(...post.caption.hashtags.map((h) => h.replace(/^#/, '')));
    }
    if (isShorts && !tags.includes('Shorts')) {
      tags.push('Shorts');
    }

    return {
      platform: 'youtube',
      postId: post.id,
      creatorId: post.creatorId,
      scheduledTime: post.scheduledPublishTime,
      postData: {
        title: post.title || 'Untitled Video',
        description,
        tags,
        privacyStatus: 'public',
        isShorts,
        videoUrl: videoAsset?.url || '',
        thumbnailUrl: videoAsset?.thumbnailUrl,
        categoryId: '28' // Science & Technology
      },
      metadata: {
        slotId,
        preparedAt: new Date().toISOString(),
        contentTheme: post.contentTheme
      }
    };
  }
}
