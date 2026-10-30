import {
  HealthResponse,
  GenerateRequest,
  GenerateResponse,
  ProfileMemoryPayload,
  ProfileMemoryResponse,
  GetProfileMemoryResult,
  GatewayErrorResponse,
  GatewayError,
  GatewayClientOptions,
  getFriendlyErrorMessage,
} from './types'

export * from './types'

// USE_MOCK is turned off; set to false
export const USE_MOCK: boolean = false

const DEFAULT_BASE_URL: string =
  process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://orca-1.tailacbf6d.ts.net'

function getMockHealth(): HealthResponse {
  return {
    status: 'ok',
    version: '1.0.0-mock',
  }
}

function getMockGenerate(payload: GenerateRequest): GenerateResponse {
  return {
    request_id: `req_mock_${Date.now()}`,
    task: payload.task,
    source: 'fresh',
    output: {
      generated_content: `Mock output for task: ${payload.task}`,
    },
    label: 'sample',
    model: 'mock-model-v1',
    warnings: [],
  }
}

function getMockProfileMemory(): ProfileMemoryResponse {
  return {
    ok: true,
    profile_hash: `hash_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`,
  }
}

/**
 * Parses response from AI Gateway:
 * - Treats any 2xx as success.
 * - Parses errors as { error: { code, message } } and branches on error.code:
 *   unauthenticated, bad_request, rate_limited, llm_timeout, invalid_output, not_found.
 * - Throws GatewayError with a friendly message for each code.
 */
async function handleResponse<T>(res: Response): Promise<T> {
  const is2xx = res.status >= 200 && res.status < 300
  let body: unknown = null

  try {
    const text = await res.text()
    if (text) {
      body = JSON.parse(text)
    }
  } catch {
    body = null
  }

  // Treat any 2xx as success
  if (is2xx) {
    return body as T
  }

  // Non-2xx: Parse error payload
  let code = `HTTP_${res.status}`
  let rawMessage = res.statusText || `Request failed with status ${res.status}`

  if (body && typeof body === 'object' && 'error' in body) {
    const errObj = (body as GatewayErrorResponse).error
    if (errObj) {
      if (errObj.code) code = String(errObj.code).toLowerCase()
      if (errObj.message) rawMessage = String(errObj.message)
    }
  }

  // Branch on code and map to friendly user message
  const friendlyMessage = getFriendlyErrorMessage(code, rawMessage)

  throw new GatewayError(code, friendlyMessage, rawMessage, res.status)
}

function buildHeaders(token?: string, options?: GatewayClientOptions): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Support test headers for live mock inspection
  if (options?.mockError) {
    headers['X-Mock-Error'] = options.mockError
  }
  if (options?.mockSource) {
    headers['X-Mock-Source'] = options.mockSource
  }

  if (options?.headers) {
    Object.assign(headers, options.headers)
  }

  return headers
}

/**
 * GET /v1/health
 */
export async function getHealth(
  token?: string,
  options?: GatewayClientOptions
): Promise<HealthResponse> {
  const isMock = options?.useMock ?? USE_MOCK
  if (isMock) {
    return getMockHealth()
  }

  const baseUrl = options?.baseUrl || DEFAULT_BASE_URL
  const headers = buildHeaders(token, options)

  const res = await fetch(`${baseUrl}/v1/health`, {
    method: 'GET',
    headers,
  })

  return handleResponse<HealthResponse>(res)
}

/**
 * POST /v1/generate
 */
export async function generate(
  token: string,
  payload: GenerateRequest,
  options?: GatewayClientOptions
): Promise<GenerateResponse> {
  const isMock = options?.useMock ?? USE_MOCK
  if (isMock) {
    return getMockGenerate(payload)
  }

  const baseUrl = options?.baseUrl || DEFAULT_BASE_URL
  const headers = {
    ...buildHeaders(token, options),
    'Content-Type': 'application/json',
  }

  const res = await fetch(`${baseUrl}/v1/generate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  return handleResponse<GenerateResponse>(res)
}

/**
 * POST /v1/memory/profile
 * Stores profile memory context in the AI gateway
 */
export async function saveProfileMemory(
  token: string,
  payload: ProfileMemoryPayload,
  options?: GatewayClientOptions
): Promise<ProfileMemoryResponse> {
  const isMock = options?.useMock ?? USE_MOCK
  if (isMock) {
    return getMockProfileMemory()
  }

  const baseUrl = options?.baseUrl || DEFAULT_BASE_URL
  const headers = {
    ...buildHeaders(token, options),
    'Content-Type': 'application/json',
  }

  const res = await fetch(`${baseUrl}/v1/memory/profile`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })

  return handleResponse<ProfileMemoryResponse>(res)
}

/**
 * GET /v1/memory/profile
 * Retrieves profile memory from AI gateway.
 * Returning 404 means "no profile yet", not an error.
 */
export async function getProfileMemory(
  token: string,
  options?: GatewayClientOptions
): Promise<GetProfileMemoryResult> {
  const baseUrl = options?.baseUrl || DEFAULT_BASE_URL
  const headers = buildHeaders(token, options)

  const res = await fetch(`${baseUrl}/v1/memory/profile`, {
    method: 'GET',
    headers,
  })

  // GET /v1/memory/profile returning 404 means "no profile yet", not an error
  if (res.status === 404) {
    return {
      profile: null,
      status: 'no_profile_yet',
      message: 'no profile yet',
    }
  }

  const data = await handleResponse<Record<string, unknown>>(res)
  return {
    profile: data,
    status: 'ok',
    message: 'profile retrieved',
  }
}

export const gateway = {
  getHealth,
  generate,
  saveProfileMemory,
  getProfileMemory,
}
