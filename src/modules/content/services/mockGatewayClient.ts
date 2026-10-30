/**
 * Mock AI Gateway Client for Local Development & Testing
 * 
 * Module Ownership: Bhavya (Content and Publishing)
 * Contract Alignment: CreatorOS_AI_Team_Kit.pdf, Section 6 ("Draft API contract v0")
 * 
 * Purpose: Allows full frontend module development without blocking on Tilak's backend availability.
 * Implements the exact H3 method signatures and response envelopes.
 * Simulates 'fresh' vs 'memory' cache hits in memory.
 */

import { Platform } from '../types/content';
import { IGatewayClient } from './gatewayClient';
import {
  H3GenerationTask,
  H3GenerationSource,
  H3GenerateRequest,
  H3GenerateResponse,
  H3CaptionInput,
  H3CaptionOutput,
  H3ScriptInput,
  H3ScriptOutput,
  H3HashtagsInput,
  H3HashtagsOutput,
  H3MusicInput,
  H3MusicOutput,
  H3CorrectionInput,
  H3CorrectionOutput,
  H3IdeasInput,
  H3IdeasOutput,
  H3BestTimeInput,
  H3BestTimeOutput,
  H3MemoryProfile,
  H3MemoryProfileResponse,
  H3FeedbackRequest,
  H3FeedbackResponse,
  H3CreateJobRequest,
  H3CreateJobResponse,
  H3JobStatusResponse,
  H3HealthResponse
} from '../types/gateway';

import mockGenerations from '../mocks/mockGenerations.json';
import mockProfile from '../mocks/mockProfile.json';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockGatewayClient implements IGatewayClient {
  private simulatedLatencyMs: number;
  private memoryCache: Set<string> = new Set();
  private savedProfile: H3MemoryProfile;
  private feedbackHistory: H3FeedbackRequest[] = [];
  private jobHistory: Map<string, H3JobStatusResponse> = new Map();

  constructor(simulatedLatencyMs = 350) {
    this.simulatedLatencyMs = simulatedLatencyMs;
    // Initialize profile from mock fixture
    const { isSample, __notice__, ...profileData } = mockProfile as any;
    this.savedProfile = profileData as H3MemoryProfile;
  }

  // ==========================================================================
  // Section 6 Unified Generation: POST /v1/generate
  // ==========================================================================

  async generate<TOutput = Record<string, unknown>, TInput = Record<string, unknown>>(
    request: H3GenerateRequest<TInput>
  ): Promise<H3GenerateResponse<TOutput>> {
    await delay(this.simulatedLatencyMs);

    // Simulate memory cache hit for repeated identical requests
    const cacheKey = `${request.task}:${JSON.stringify(request.input)}`;
    let source: H3GenerationSource = 'fresh';

    if (this.memoryCache.has(cacheKey)) {
      source = 'memory';
    } else {
      this.memoryCache.add(cacheKey);
      source = 'fresh';
    }

    let output: unknown;

    switch (request.task) {
      case 'caption': {
        output = mockGenerations.caption;
        break;
      }
      case 'script': {
        const input = request.input as unknown as H3ScriptInput;
        output = {
          ...mockGenerations.script,
          hook: input?.topic
            ? `The single biggest mistake teams make with ${input.topic} in 2026.`
            : mockGenerations.script.hook
        };
        break;
      }
      case 'hashtags': {
        output = mockGenerations.hashtags;
        break;
      }
      case 'music': {
        output = mockGenerations.music;
        break;
      }
      case 'correction': {
        output = mockGenerations.correction;
        break;
      }
      case 'ideas': {
        output = mockGenerations.ideas;
        break;
      }
      case 'best_time': {
        output = mockGenerations.best_time;
        break;
      }
      default: {
        output = { note: `Simulated mock response for ${request.task}` };
      }
    }

    return {
      request_id: `req_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`,
      task: request.task,
      source,
      output: output as TOutput,
      label: 'ai_suggested',
      model: 'gemini-flash',
      warnings: []
    };
  }

  // ==========================================================================
  // Memory Profile: GET & POST /v1/memory/profile
  // ==========================================================================

  async getMemoryProfile(): Promise<H3MemoryProfile> {
    await delay(this.simulatedLatencyMs);
    return { ...this.savedProfile };
  }

  async saveMemoryProfile(profile: Partial<H3MemoryProfile>): Promise<H3MemoryProfileResponse> {
    await delay(this.simulatedLatencyMs);
    this.savedProfile = {
      ...this.savedProfile,
      ...profile,
      extras: {
        ...this.savedProfile.extras,
        ...(profile.extras || {})
      }
    };

    const newHash = `hash_${Math.random().toString(16).substring(2, 10)}`;
    this.savedProfile.profile_hash = newHash;

    return {
      ok: true,
      profile_hash: newHash
    };
  }

  // ==========================================================================
  // Memory Feedback: POST /v1/memory/feedback
  // ==========================================================================

  async sendFeedback(feedback: H3FeedbackRequest): Promise<H3FeedbackResponse> {
    await delay(this.simulatedLatencyMs / 2);
    this.feedbackHistory.push({ ...feedback });
    return { ok: true };
  }

  public getFeedbackHistory(): H3FeedbackRequest[] {
    return [...this.feedbackHistory];
  }

  // ==========================================================================
  // Job Queue: POST /v1/jobs & GET /v1/jobs/:id
  // ==========================================================================

  async createJob(job: H3CreateJobRequest): Promise<H3CreateJobResponse> {
    await delay(this.simulatedLatencyMs);
    const jobId = `job_pub_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    this.jobHistory.set(jobId, {
      status: 'queued',
      attempts: 0
    });

    return {
      job_id: jobId,
      status: 'queued'
    };
  }

  async getJob(jobId: string): Promise<H3JobStatusResponse> {
    await delay(this.simulatedLatencyMs / 2);
    const existing = this.jobHistory.get(jobId);

    if (existing) {
      // Simulate completion on poll
      return {
        status: 'completed',
        attempts: existing.attempts + 1,
        result: {
          published: true,
          platform_post_id: `urn:li:share:${Date.now()}`
        }
      };
    }

    return {
      status: 'completed',
      attempts: 1,
      result: { published: true }
    };
  }

  // ==========================================================================
  // Health: GET /v1/health
  // ==========================================================================

  async getHealth(): Promise<H3HealthResponse> {
    await delay(50);
    return {
      status: 'ok',
      version: 'v1.0.0-mock'
    };
  }

  // ==========================================================================
  // Convenience Methods
  // ==========================================================================

  async generateCaption(
    payload: { script?: string; topic?: string; platform: Platform; tone?: string; context?: string },
    creatorId?: string
  ): Promise<H3GenerateResponse<H3CaptionOutput>> {
    return this.generate<H3CaptionOutput, H3CaptionInput>({
      task: 'caption',
      input: {
        script: payload.script || payload.topic || 'Engineering Architecture',
        platform: payload.platform
      }
    });
  }

  async suggestHashtags(
    payload: { script?: string; topic?: string; platform: Platform; limit?: number },
    creatorId?: string
  ): Promise<H3GenerateResponse<H3HashtagsOutput>> {
    return this.generate<H3HashtagsOutput, H3HashtagsInput>({
      task: 'hashtags',
      input: {
        script: payload.script || payload.topic || 'Engineering Best Practices',
        platform: payload.platform
      }
    });
  }

  async suggestMusic(
    payload: { script?: string; mood?: string; platform?: Platform },
    creatorId?: string
  ): Promise<H3GenerateResponse<H3MusicOutput>> {
    return this.generate<H3MusicOutput, H3MusicInput>({
      task: 'music',
      input: {
        script: payload.script || 'Technical Walkthrough',
        mood: payload.mood || 'Focus / Tech'
      }
    });
  }

  async generateScript(
    payload: { topic: string; format?: string; platform?: Platform },
    creatorId?: string
  ): Promise<H3GenerateResponse<H3ScriptOutput>> {
    return this.generate<H3ScriptOutput, H3ScriptInput>({
      task: 'script',
      input: {
        topic: payload.topic,
        format: payload.format || 'short_form'
      }
    });
  }

  async correctCaption(
    payload: { caption: string; script: string }
  ): Promise<H3GenerateResponse<H3CorrectionOutput>> {
    return this.generate<H3CorrectionOutput, H3CorrectionInput>({
      task: 'correction',
      input: {
        caption: payload.caption,
        script: payload.script
      }
    });
  }

  async suggestIdeas(
    payload: { niche?: string; count?: number }
  ): Promise<H3GenerateResponse<H3IdeasOutput>> {
    return this.generate<H3IdeasOutput, H3IdeasInput>({
      task: 'ideas',
      input: {
        niche: payload.niche,
        count: payload.count || 3
      }
    });
  }

  async suggestBestTime(
    payload: { platform: Platform | string }
  ): Promise<H3GenerateResponse<H3BestTimeOutput>> {
    return this.generate<H3BestTimeOutput, H3BestTimeInput>({
      task: 'best_time',
      input: {
        platform: payload.platform
      }
    });
  }
}
