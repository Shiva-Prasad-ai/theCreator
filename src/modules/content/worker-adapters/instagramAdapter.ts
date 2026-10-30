/**
 * Instagram Worker Adapter
 * 
 * Module Ownership: Bhavya (Content and Publishing)
 * Integration Partner: Tilak (Background Worker & Queue)
 * 
 * Formats and validates publishing payloads for Instagram Feed / Reels.
 * Does NOT execute live external API calls.
 */

import { ContentPost, MediaAsset } from '../types/content';
import { AdapterValidationResult } from './linkedinAdapter';

export interface InstagramWorkerJobPayload {
  platform: 'instagram';
  postId: string;
  creatorId: string;
  scheduledTime?: string;
  postData: {
    caption: string;
    mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'REELS';
    mediaUrls: string[];
    audioName?: string;
    coverImageUrl?: string;
    shareToFeed: boolean;
  };
  metadata: {
    slotId?: string;
    preparedAt: string;
    contentTheme?: string;
  };
}

const INSTAGRAM_MAX_CHARS = 2200;
const INSTAGRAM_MAX_HASHTAGS = 30;

export class InstagramAdapter {
  static validate(post: ContentPost): AdapterValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Instagram mandates media
    if (!post.mediaAssets || post.mediaAssets.length === 0) {
      errors.push('Instagram requires at least one media asset (image or video).');
    }

    const caption = this.buildCaption(post);
    if (caption.length > INSTAGRAM_MAX_CHARS) {
      errors.push(`Instagram caption exceeds ${INSTAGRAM_MAX_CHARS} characters.`);
    }

    const hashtagsCount = (post.caption?.hashtags || []).length;
    if (hashtagsCount > INSTAGRAM_MAX_HASHTAGS) {
      errors.push(`Instagram allows a maximum of ${INSTAGRAM_MAX_HASHTAGS} hashtags.`);
    }

    if (post.mediaAssets && post.mediaAssets.length > 10) {
      errors.push('Instagram carousel allows up to 10 media items.');
    }

    const videoAssets = post.mediaAssets?.filter((m) => m.type === 'video') || [];
    if (videoAssets.length > 0 && !post.mediaAssets[0].thumbnailUrl) {
      warnings.push('A cover thumbnail is recommended for video/Reel publishing.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  static buildCaption(post: ContentPost): string {
    const parts: string[] = [];
    if (post.caption?.text) {
      parts.push(post.caption.text.trim());
    } else if (post.script?.hook) {
      parts.push(post.script.hook);
      if (post.script.body) parts.push(post.script.body);
    } else {
      parts.push(post.title || '');
    }

    if (post.caption?.hashtags && post.caption.hashtags.length > 0) {
      const formatted = post.caption.hashtags
        .map((h) => (h.startsWith('#') ? h : `#${h}`))
        .join(' ');
      parts.push(`\n.\n.\n${formatted}`);
    }

    return parts.join('\n');
  }

  static prepareJobPayload(post: ContentPost, slotId?: string): InstagramWorkerJobPayload {
    const caption = this.buildCaption(post);
    const mediaList = post.mediaAssets || [];

    let mediaType: InstagramWorkerJobPayload['postData']['mediaType'] = 'IMAGE';
    if (mediaList.length > 1) {
      mediaType = 'CAROUSEL';
    } else if (mediaList.length === 1 && mediaList[0].type === 'video') {
      mediaType = 'REELS';
    }

    return {
      platform: 'instagram',
      postId: post.id,
      creatorId: post.creatorId,
      scheduledTime: post.scheduledPublishTime,
      postData: {
        caption,
        mediaType,
        mediaUrls: mediaList.map((m) => m.url),
        coverImageUrl: mediaList[0]?.thumbnailUrl,
        audioName: post.musicTrack?.title,
        shareToFeed: true
      },
      metadata: {
        slotId,
        preparedAt: new Date().toISOString(),
        contentTheme: post.contentTheme
      }
    };
  }
}
