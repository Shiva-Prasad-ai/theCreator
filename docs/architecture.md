# CreatorOS AI Documentation

## Overview
CreatorOS AI is an AI-powered SaaS platform for creators built during a 48-hour hackathon prototype.

## Architecture
- **Web App**: Next.js (App Router, TypeScript, Tailwind CSS, shadcn/ui) deployed on Vercel.
- **Data & Auth Core**: Supabase (Auth with `@supabase/ssr`, PostgreSQL with Row-Level Security).
- **AI Gateway**: Centralized API gateway interface via `/lib/gateway`.
- **Mock Mode**: Built-in mock layer activated by `NEXT_PUBLIC_USE_MOCK=true`.

## Gateway Endpoints
The AI gateway adheres to two minimal endpoints:
1. `GET /v1/health`
   - Response: `{ "status": "ok", "version": "<version>" }`
2. `POST /v1/generate`
   - Headers: `Authorization: Bearer <Supabase access token>`
   - Response: `{ "request_id": "<id>", "task": "<task>", "source": "fresh" | "memory", "output": {}, "label": "<label>", "model": "<model>", "warnings": [] }`

Errors are returned in the format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error description"
  }
}
```
