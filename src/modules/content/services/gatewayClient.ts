/**
 * AI Gateway Client Interface & Implementation
 * 
 * Module Ownership: Bhavya (Content and Publishing)
 * Integration Target: Tilak's AI Gateway & RAG Infrastructure
 * Contract Reference: CreatorOS_AI_Team_Kit.pdf, Section 6 ("Draft API contract v0")
 * 
 * Base path: /v1
 * All requests send: Authorization: Bearer <Supabase access token>
 * 
 * Security: Accepts Supabase access token through dependency injection.
 * Does NOT hardcode secrets, credentials, or URLs.
 */

import { Platform } from '../types/content';
import {
  H3GenerationTask,
  H3GenerateRequest,
  H3GenerateResponse,
  H3ErrorEnvelope,
  H3ErrorCode,
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

/** Token provider can be a static string or a dynamic callback resolving a token */
export type TokenProvider = string | (() => string | null | Promise<string | null>);

export interface GatewayClientConfig {
  gatewayBaseUrl?: string;
  tokenProvider?: TokenProvider;
}

/** Standard Client-Side Error Wrapper matching H3 Error Envelope */
export class H3ClientError extends Error {
  public readonly code: H3ErrorCode;
  public readonly statusCode?: number;

  constructor(code: H3ErrorCode, message: string, statusCode?: number) {
    super(message);
    this.name = 'H3ClientError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

/** Gateway Client Interface representing Section 6 Endpoints */
export interface IGatewayClient {
  // 1. Unified Generation (POST /v1/generate)
  generate<TOutput = Record<string, unknown>, TInput = Record<string, unknown>>(
    request: H3GenerateRequest<TInput>
  ): Promise<H3GenerateResponse<TOutput>>;

  // 2. Creator Memory Profile (GET & POST /v1/memory/profile)
  getMemoryProfile(): Promise<H3MemoryProfile>;
  saveMemoryProfile(profile: Partial<H3MemoryProfile>): Promise<H3MemoryProfileResponse>;

  // 3. Generation Feedback (POST /v1/memory/feedback)
  sendFeedback(feedback: H3FeedbackRequest): Promise<H3FeedbackResponse>;

  // 4. Job Queue & Status (POST /v1/jobs & GET /v1/jobs/:id)
  createJob(job: H3CreateJobRequest): Promise<H3CreateJobResponse>;
  getJob(jobId: string): Promise<H3JobStatusResponse>;

  // 5. Health Check (GET /v1/health)
  getHealth(): Promise<H3HealthResponse>;

  // --- Contract Task Helper Methods for Component Ergonomics ---
  generateCaption(
    payload: { script?: string; topic?: string; platform: Platform; tone?: string; context?: string },
    creatorId?: string
  ): Promise<H3GenerateResponse<H3CaptionOutput>>;

  suggestHashtags(
    payload: { script?: string; topic?: string; platform: Platform; limit?: number },
    creatorId?: string
  ): Promise<H3GenerateResponse<H3HashtagsOutput>>;

  suggestMusic(
    payload: { script?: string; mood?: string; platform?: Platform },
    creatorId?: string
  ): Promise<H3GenerateResponse<H3MusicOutput>>;

  generateScript(
    payload: { topic: string; format?: string; platform?: Platform },
    creatorId?: string
  ): Promise<H3GenerateResponse<H3ScriptOutput>>;

  correctCaption(
    payload: { caption: string; script: string }
  ): Promise<H3GenerateResponse<H3CorrectionOutput>>;

  suggestIdeas(
    payload: { niche?: string; count?: number }
  ): Promise<H3GenerateResponse<H3IdeasOutput>>;

  suggestBestTime(
    payload: { platform: Platform | string }
  ): Promise<H3GenerateResponse<H3BestTimeOutput>>;
}

export class AIGatewayClient implements IGatewayClient {
  private gatewayBaseUrl: string;
  private tokenProvider?: TokenProvider;

  constructor(config?: GatewayClientConfig | string) {
    if (typeof config === 'string') {
      this.gatewayBaseUrl = config;
    } else {
      this.gatewayBaseUrl = config?.gatewayBaseUrl || process.env.NEXT_PUBLIC_AI_GATEWAY_URL || '';
      this.tokenProvider = config?.tokenProvider;
    }
  }

  /** Injects or updates the Supabase auth token provider */
  public setTokenProvider(provider: TokenProvider): void {
    this.tokenProvider = provider;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    let token: string | null = null;
    if (typeof this.tokenProvider === 'function') {
      token = await this.tokenProvider();
    } else if (typeof this.tokenProvider === 'string') {
      token = this.tokenProvider;
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private sanitizeUrl(url: string): string {
    // Strips trailing slashes to guarantee clean path joins
    return url.replace(/\/+$/, '');
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let errorCode: H3ErrorCode = 'invalid_output';
      let errorMessage = `HTTP error ${res.status}`;

      try {
        const errorBody: H3ErrorEnvelope = await res.json();
        if (errorBody && errorBody.error) {
          errorCode = errorBody.error.code || errorCode;
          errorMessage = errorBody.error.message || errorMessage;
        }
      } catch {
        // Fallback for non-JSON error bodies
        if (res.status === 401) errorCode = 'unauthenticated';
        else if (res.status === 400) errorCode = 'bad_request';
        else if (res.status === 429) errorCode = 'rate_limited';
        else if (res.status === 504) errorCode = 'llm_timeout';
      }

      throw new H3ClientError(errorCode, errorMessage, res.status);
    }

    return (await res.json()) as T;
  }

  // ==========================================================================
  // Section 6 Endpoints Implementation
  // ==========================================================================

  /** POST /v1/generate */
  async generate<TOutput = Record<string, unknown>, TInput = Record<string, unknown>>(
    request: H3GenerateRequest<TInput>
  ): Promise<H3GenerateResponse<TOutput>> {
    const baseUrl = this.sanitizeUrl(this.gatewayBaseUrl);
    const headers = await this.getAuthHeaders();

    const res = await fetch(`${baseUrl}/v1/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request)
    });

    return await this.handleResponse<H3GenerateResponse<TOutput>>(res);
  }

  /** GET /v1/memory/profile */
  async getMemoryProfile(): Promise<H3MemoryProfile> {
    const baseUrl = this.sanitizeUrl(this.gatewayBaseUrl);
    const headers = await this.getAuthHeaders();

    const res = await fetch(`${baseUrl}/v1/memory/profile`, {
      method: 'GET',
      headers
    });

    return await this.handleResponse<H3MemoryProfile>(res);
  }

  /** POST /v1/memory/profile */
  async saveMemoryProfile(profile: Partial<H3MemoryProfile>): Promise<H3MemoryProfileResponse> {
    const baseUrl = this.sanitizeUrl(this.gatewayBaseUrl);
    const headers = await this.getAuthHeaders();

    const res = await fetch(`${baseUrl}/v1/memory/profile`, {
      method: 'POST',
      headers,
      body: JSON.stringify(profile)
    });

    return await this.handleResponse<H3MemoryProfileResponse>(res);
  }

  /** POST /v1/memory/feedback */
  async sendFeedback(feedback: H3FeedbackRequest): Promise<H3FeedbackResponse> {
    const baseUrl = this.sanitizeUrl(this.gatewayBaseUrl);
    const headers = await this.getAuthHeaders();

    const res = await fetch(`${baseUrl}/v1/memory/feedback`, {
      method: 'POST',
      headers,
      body: JSON.stringify(feedback)
    });

    return await this.handleResponse<H3FeedbackResponse>(res);
  }

  /** POST /v1/jobs */
  async createJob(job: H3CreateJobRequest): Promise<H3CreateJobResponse> {
    const baseUrl = this.sanitizeUrl(this.gatewayBaseUrl);
    const headers = await this.getAuthHeaders();

    const res = await fetch(`${baseUrl}/v1/jobs`, {
      method: 'POST',
      headers,
      body: JSON.stringify(job)
    });

    return await this.handleResponse<H3CreateJobResponse>(res);
  }

  /** GET /v1/jobs/:id */
  async getJob(jobId: string): Promise<H3JobStatusResponse> {
    const baseUrl = this.sanitizeUrl(this.gatewayBaseUrl);
    const headers = await this.getAuthHeaders();

    const res = await fetch(`${baseUrl}/v1/jobs/${encodeURIComponent(jobId)}`, {
      method: 'GET',
      headers
    });

    return await this.handleResponse<H3JobStatusResponse>(res);
  }

  /** GET /v1/health */
  async getHealth(): Promise<H3HealthResponse> {
    const baseUrl = this.sanitizeUrl(this.gatewayBaseUrl);
    const headers = await this.getAuthHeaders();

    const res = await fetch(`${baseUrl}/v1/health`, {
      method: 'GET',
      headers
    });

    return await this.handleResponse<H3HealthResponse>(res);
  }

  // ==========================================================================
  // Helper Delegation Methods for Supported Tasks
  // ==========================================================================

  async generateCaption(
    payload: { script?: string; topic?: string; platform: Platform; tone?: string; context?: string },
    creatorId?: string
  ): Promise<H3GenerateResponse<H3CaptionOutput>> {
    // In H3 contract, caption generation is derived from script
    const scriptContent = payload.script || payload.topic || 'Engineering Best Practices';
    return this.generate<H3CaptionOutput, H3CaptionInput>({
      task: 'caption',
      input: {
        script: scriptContent,
        platform: payload.platform
      }
    });
  }

  async suggestHashtags(
    payload: { script?: string; topic?: string; platform: Platform; limit?: number },
    creatorId?: string
  ): Promise<H3GenerateResponse<H3HashtagsOutput>> {
    const scriptContent = payload.script || payload.topic || 'Developer Tooling & System Architecture';
    return this.generate<H3HashtagsOutput, H3HashtagsInput>({
      task: 'hashtags',
      input: {
        script: scriptContent,
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
        script: payload.script || 'High-signal technical video walkthrough',
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
