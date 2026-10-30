/**
 * AI Gateway Interface Types - H3 API Contract Alignment
 * 
 * Module Ownership: Content and Publishing (Bhavya)
 * Integration Target: Tilak's AI Gateway & RAG Infrastructure
 * Contract Reference: CreatorOS_AI_Team_Kit.pdf, Section 6 ("Draft API contract v0")
 * 
 * Base path: /v1
 * All requests send: Authorization: Bearer <Supabase access token>
 */

import { Platform, ContentCaption, ContentScript, MusicTrackSuggestion } from './content';

// ============================================================================
// 1. Core H3 API Envelopes & Types
// ============================================================================

/** Supported task types defined in Section 6 */
export type H3GenerationTask =
  | 'caption'
  | 'script'
  | 'hashtags'
  | 'music'
  | 'correction'
  | 'ideas'
  | 'best_time'
  | 'pitch_brief'
  | 'ad_copy';

/** Source indicator: 'fresh' indicates a live model call, 'memory' indicates a vector cache hit */
export type H3GenerationSource = 'fresh' | 'memory';

/** Unified request body for POST /v1/generate */
export interface H3GenerateRequest<TInput = Record<string, unknown>> {
  task: H3GenerationTask;
  input: TInput;
  post_id?: string;
}

/** Standard unified response envelope for POST /v1/generate */
export interface H3GenerateResponse<TOutput = Record<string, unknown>> {
  request_id: string;
  task: H3GenerationTask;
  source: H3GenerationSource;
  output: TOutput;
  label: string; // e.g. "ai_suggested"
  model: string; // e.g. "gemini-flash / llama-3"
  warnings: string[];
}

/** Documented H3 error codes */
export type H3ErrorCode =
  | 'unauthenticated'
  | 'bad_request'
  | 'rate_limited'
  | 'llm_timeout'
  | 'invalid_output'
  | string;

/** Standard error shape returned by the gateway */
export interface H3ErrorEnvelope {
  error: {
    code: H3ErrorCode;
    message: string;
  };
}

// ============================================================================
// 2. Task-Specific Inputs & Outputs (Section 6)
// ============================================================================

/** Task: 'script' -> input: { topic, format } */
export interface H3ScriptInput {
  topic: string;
  format: string; // e.g. "reel", "short", "long_form", "carousel"
}

/** Task: 'script' -> output: { hook, body, cta } */
export interface H3ScriptOutput {
  hook: string;
  body: string;
  cta: string;
}

/** Task: 'caption' -> input: { script, platform } */
export interface H3CaptionInput {
  script: string;
  platform: string;
}

export interface H3CaptionOption {
  text: string;
  tone: string;
}

/** Task: 'caption' -> output: { captions: [{ text, tone }] } (3 options) */
export interface H3CaptionOutput {
  captions: H3CaptionOption[];
}

/** Task: 'correction' -> input: { caption, script } */
export interface H3CorrectionInput {
  caption: string;
  script: string;
}

/** Task: 'correction' -> output: { corrected, changes[] } */
export interface H3CorrectionOutput {
  corrected: string;
  changes: string[];
}

/** Task: 'hashtags' -> input: { script, platform } */
export interface H3HashtagsInput {
  script: string;
  platform: string;
}

/** Task: 'hashtags' -> output: { hashtags[] } with label ai_suggested */
export interface H3HashtagsOutput {
  hashtags: string[];
}

/** Task: 'music' -> input: { script, mood? } */
export interface H3MusicInput {
  script: string;
  mood?: string;
}

export interface H3MusicSuggestionItem {
  mood: string;
  genre: string;
  note: string;
}

/** Task: 'music' -> output: { suggestions: [{ mood, genre, note }] } with label ai_suggested */
export interface H3MusicOutput {
  suggestions: H3MusicSuggestionItem[];
}

/** Task: 'ideas' -> input: { niche?, count } */
export interface H3IdeasInput {
  niche?: string;
  count: number;
}

export interface H3IdeaItem {
  title: string;
  angle: string;
}

/** Task: 'ideas' -> output: { ideas: [{ title, angle }] } */
export interface H3IdeasOutput {
  ideas: H3IdeaItem[];
}

/** Task: 'best_time' -> input: { platform } */
export interface H3BestTimeInput {
  platform: string;
}

export interface H3BestTimeSlot {
  day: string;
  time: string;
  reason: string;
}

/** Task: 'best_time' -> output: { slots: [{ day, time, reason }], basis: 'heuristic' | 'analytics' } */
export interface H3BestTimeOutput {
  slots: H3BestTimeSlot[];
  basis: 'heuristic' | 'analytics';
}

/** Task: 'pitch_brief' -> input: { product, company } */
export interface H3PitchBriefInput {
  product: string;
  company: string;
}

/** Task: 'pitch_brief' -> output: { opening_line, talking_points[], objection, reply } */
export interface H3PitchBriefOutput {
  opening_line: string;
  talking_points: string[];
  objection: string;
  reply: string;
}

/** Task: 'ad_copy' -> input: { item, platform } */
export interface H3AdCopyInput {
  item: string;
  platform: string;
}

/** Task: 'ad_copy' -> output: { variants: [{ headline, body, cta }] } */
export interface H3AdCopyOutput {
  variants: Array<{
    headline: string;
    body: string;
    cta: string;
  }>;
}

// ============================================================================
// 3. Memory Profile & Feedback Endpoints (Section 6)
// ============================================================================

/** Payload for POST /v1/memory/profile and response for GET /v1/memory/profile */
export interface H3MemoryProfile {
  persona: string;
  display_name: string;
  niche: string;
  tone: string;
  audience: string;
  goals: string;
  platforms: string[];
  extras: Record<string, unknown>;
  profile_hash?: string;
}

/** Response for POST /v1/memory/profile */
export interface H3MemoryProfileResponse {
  ok: boolean;
  profile_hash: string;
}

/** Request body for POST /v1/memory/feedback */
export interface H3FeedbackRequest {
  request_id: string;
  action: 'accepted' | 'edited' | 'rejected';
  edited_text?: string;
}

/** Response for POST /v1/memory/feedback */
export interface H3FeedbackResponse {
  ok: boolean;
}

// ============================================================================
// 4. Background Job Queue Endpoints (Section 6)
// ============================================================================

/** Request body for POST /v1/jobs */
export interface H3CreateJobRequest {
  type: 'publish';
  platform: string;
  post_id: string;
  run_at?: string; // ISO 8601 string
}

/** Response for POST /v1/jobs */
export interface H3CreateJobResponse {
  job_id: string;
  status: 'queued';
}

/** Response for GET /v1/jobs/:id */
export interface H3JobStatusResponse {
  status: 'queued' | 'running' | 'completed' | 'failed';
  attempts: number;
  error?: string;
  result?: Record<string, unknown>;
}

// ============================================================================
// 5. Health Check Endpoint (Section 6)
// ============================================================================

/** Response for GET /v1/health */
export interface H3HealthResponse {
  status: 'ok';
  version: string;
}

// ============================================================================
// 6. UI Compatibility & Domain Mapping Adapters
// ============================================================================

/** Legacy UI Profile Model (mapped to/from H3MemoryProfile) */
export interface CreatorMemoryProfile {
  creatorId: string;
  name: string;
  handle: string;
  bio?: string;
  niche: string;
  tonePreferences: string[];
  targetAudience: string;
  frequentHashtags: string[];
  voiceGuidelines: string;
  prohibitedTerms?: string[];
  sampleHooks?: string[];
  lastUpdated: string;
}

/** Option item rendered in AICaptionFlow UI */
export interface GeneratedCaptionOption {
  id: string;
  caption: ContentCaption;
  score: number;
  reasoning?: string;
  source?: H3GenerationSource;
  requestId?: string;
}

/** Explicit mapping from H3MemoryProfile to UI CreatorMemoryProfile */
export function mapH3ProfileToUI(h3: H3MemoryProfile, creatorId = 'creator-bhavya-01'): CreatorMemoryProfile {
  const extras = h3.extras || {};
  return {
    creatorId,
    name: h3.display_name,
    handle: `@${h3.display_name.toLowerCase().replace(/\s+/g, '_')}`,
    bio: `${h3.persona} specializing in ${h3.niche}.`,
    niche: h3.niche,
    tonePreferences: h3.tone ? h3.tone.split(',').map((t) => t.trim()) : ['thought-leadership'],
    targetAudience: h3.audience,
    frequentHashtags: (extras.frequentHashtags as string[]) || [],
    voiceGuidelines: (extras.voiceGuidelines as string) || `Tone: ${h3.tone}. Goals: ${h3.goals}`,
    prohibitedTerms: (extras.prohibitedTerms as string[]) || [],
    sampleHooks: (extras.preferredHooks as string[]) || [],
    lastUpdated: new Date().toISOString()
  };
}

/** Explicit mapping from UI CreatorMemoryProfile to H3MemoryProfile */
export function mapUIToH3Profile(ui: Partial<CreatorMemoryProfile>): H3MemoryProfile {
  return {
    persona: 'Content Creator',
    display_name: ui.name || 'Bhavya',
    niche: ui.niche || 'Software Engineering',
    tone: Array.isArray(ui.tonePreferences) ? ui.tonePreferences.join(', ') : 'authoritative, concise',
    audience: ui.targetAudience || 'Developers and tech leads',
    goals: 'Build authority and share technical architectural knowledge',
    platforms: ['linkedin', 'instagram', 'youtube'],
    extras: {
      voiceGuidelines: ui.voiceGuidelines || '',
      prohibitedTerms: ui.prohibitedTerms || [],
      preferredHooks: ui.sampleHooks || [],
      frequentHashtags: ui.frequentHashtags || []
    }
  };
}

/** Maps H3 Caption Output to UI GeneratedCaptionOption list */
export function mapH3CaptionsToUI(
  h3Response: H3GenerateResponse<H3CaptionOutput>,
  platform: Platform
): GeneratedCaptionOption[] {
  const captions = h3Response.output?.captions || [];
  return captions.map((opt, idx) => ({
    id: `opt-${h3Response.request_id || Date.now()}-${idx + 1}`,
    caption: {
      text: opt.text,
      tone: opt.tone,
      hashtags: [],
      characterCount: opt.text.length,
      callToAction: undefined
    },
    score: Number((0.98 - idx * 0.04).toFixed(2)),
    reasoning: `${h3Response.label} (${h3Response.source} memory) via ${h3Response.model}`,
    source: h3Response.source,
    requestId: h3Response.request_id
  }));
}
