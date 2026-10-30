export interface HealthResponse {
  status: 'ok'
  version: string
}

export interface GenerateRequest {
  task: string
  [key: string]: unknown
}

export interface GenerateResponse {
  request_id: string
  task: string
  source: 'fresh' | 'memory' | string
  output: Record<string, unknown>
  label: string
  model: string
  warnings: string[]
}

export interface ProfileMemoryPayload {
  persona: string
  display_name: string
  niche: string
  tone: string
  audience: string
  goals: string
  platforms: string[]
  extras?: Record<string, unknown>
}

export interface ProfileMemoryResponse {
  ok: true
  profile_hash: string
}

export interface GetProfileMemoryResult {
  profile: Record<string, unknown> | null
  status: 'ok' | 'no_profile_yet'
  message?: string
}

export interface GatewayErrorResponse {
  error: {
    code: string
    message: string
  }
}

export type GatewayErrorCode =
  | 'unauthenticated'
  | 'bad_request'
  | 'rate_limited'
  | 'llm_timeout'
  | 'invalid_output'
  | 'not_found'
  | string

export const GATEWAY_FRIENDLY_MESSAGES: Record<string, string> = {
  unauthenticated:
    'Authentication required. Your session token is invalid or missing. Please sign in again.',
  bad_request: 'Invalid request. Please verify the provided payload parameters and try again.',
  rate_limited:
    'Rate limit exceeded. The AI gateway is receiving too many requests. Please wait a moment.',
  llm_timeout:
    'AI model request timed out. The generation took too long; please retry.',
  invalid_output:
    'Invalid output received from the AI service. Please try again.',
  not_found: 'The requested resource was not found on the AI gateway.',
}

export function getFriendlyErrorMessage(code: string, fallback?: string): string {
  if (code && GATEWAY_FRIENDLY_MESSAGES[code]) {
    return GATEWAY_FRIENDLY_MESSAGES[code]
  }
  return fallback || 'An unexpected AI gateway error occurred.'
}

export class GatewayError extends Error {
  code: string
  rawMessage?: string
  status?: number

  constructor(code: string, message: string, rawMessage?: string, status?: number) {
    super(message)
    this.name = 'GatewayError'
    this.code = code
    this.rawMessage = rawMessage
    this.status = status
  }
}

export interface GatewayClientOptions {
  baseUrl?: string
  useMock?: boolean
  mockError?: string
  mockSource?: 'fresh' | 'memory' | string
  headers?: Record<string, string>
}
