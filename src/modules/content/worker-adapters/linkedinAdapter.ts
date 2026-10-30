/**
 * LinkedIn Worker Adapter
 * 
 * Module Ownership: Bhavya (Content and Publishing)
 * Integration Partner: Tilak (Background Worker & Queue)
 * 
 * Prepares and validates normalized publishing payloads for Tilak's background worker.
 * Does NOT execute live external API calls.
 */

import { ContentPost, MediaAsset } from '../types/content';

export interface LinkedInWorkerJobPayload {
  platform: 'linkedin';
  postId: string;
  creatorId: string;
  scheduledTime?: string;
  postData: {
    authorUrn?: string;
    text: string;
    visibility: 'PUBLIC' | 'CONNECTIONS';
    mediaCategory: 'NONE' | 'IMAGE' | 'VIDEO' | 'ARTICLE';
    mediaAssets: Array<{
      url: string;
      title?: string;
      description?: string;
    }>;
  };
  metadata: {
    slotId?: string;
    preparedAt: string;
    contentTheme?: string;
  };
}

export interface AdapterValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const LINKEDIN_MAX_CHARS = 3000;

export class LinkedInAdapter {
  /**
   * Validate post compatibility with LinkedIn publishing requirements
   */
  static validate(post: ContentPost): AdapterValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const text = this.buildPublishingText(post);

    if (!text || text.trim().length === 0) {
      errors.push('LinkedIn post must have text content (caption or script body).');
    }

    if (text.length > LINKEDIN_MAX_CHARS) {
      errors.push(`LinkedIn text exceeds character limit (${text.length}/${LINKEDIN_MAX_CHARS}).`);
    }

    if (post.mediaAssets && post.mediaAssets.length > 9) {
      errors.push('LinkedIn allows a maximum of 9 images per post.');
    }

    const videoAssets = post.mediaAssets?.filter((m) => m.type === 'video') || [];
    if (videoAssets.length > 1) {
      errors.push('LinkedIn does not support multiple video attachments in a single post.');
    }

    if (!post.caption?.hashtags || post.caption.hashtags.length === 0) {
      warnings.push('Adding 3-5 relevant hashtags is recommended for LinkedIn reach.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Combine caption, hashtags, and CTA into final publishing text
   */
  static buildPublishingText(post: ContentPost): string {
    if (post.caption?.text) {
      const parts = [post.caption.text.trim()];
      
      if (post.caption.hashtags && post.caption.hashtags.length > 0) {
        const tagsString = post.caption.hashtags
          .map((t) => (t.startsWith('#') ? t : `#${t}`))
          .join(' ');
        parts.push(`\n\n${tagsString}`);
      }

      return parts.join('');
    }

    // Fallback to script content if caption is empty
    if (post.script) {
      const parts: string[] = [];
      if (post.script.hook) parts.push(post.script.hook);
      if (post.script.body) parts.push(post.script.body);
      if (post.script.callToAction) parts.push(post.script.callToAction);
      return parts.join('\n\n');
    }

    return post.title || '';
  }

  /**
   * Formats the post into Tilak's background worker job payload
   */
  static prepareJobPayload(post: ContentPost, slotId?: string): LinkedInWorkerJobPayload {
    const text = this.buildPublishingText(post);
    
    let mediaCategory: LinkedInWorkerJobPayload['postData']['mediaCategory'] = 'NONE';
    const mediaAssets: LinkedInWorkerJobPayload['postData']['mediaAssets'] = [];

    if (post.mediaAssets && post.mediaAssets.length > 0) {
      const firstMedia = post.mediaAssets[0];
      if (firstMedia.type === 'video') {
        mediaCategory = 'VIDEO';
        mediaAssets.push({
          url: firstMedia.url,
          title: post.title,
          description: post.script?.hook
        });
      } else {
        mediaCategory = 'IMAGE';
        post.mediaAssets.forEach((asset) => {
          mediaAssets.push({
            url: asset.url,
            title: asset.fileName
          });
        });
      }
    }

    return {
      platform: 'linkedin',
      postId: post.id,
      creatorId: post.creatorId,
      scheduledTime: post.scheduledPublishTime,
      postData: {
        text,
        visibility: 'PUBLIC',
        mediaCategory,
        mediaAssets
      },
      metadata: {
        slotId,
        preparedAt: new Date().toISOString(),
        contentTheme: post.contentTheme
      }
    };
  }
}
