# CreatorOS AI

A 48-hour hackathon prototype for an AI operating system for creators. Built with Next.js (App Router, TypeScript, Tailwind CSS, shadcn/ui), Supabase core (Auth & PostgreSQL RLS), and a typed AI gateway client.

---

## Folder Ownership & Team Responsibilities

| Owner | Modules & Responsibilities | Assigned Folders / Areas |
| :--- | :--- | :--- |
| **Shiva** | Core, Auth, Database Schema, Shell Layout, Vercel Deployment | `/app`, `/components`, `/lib/supabase`, `/supabase`, `/docs` |
| **Bhavya** | Storage Bucket, Media Assets & Publishing | `/lib/bucket`, `/components/publishing` |
| **Tilak** | Server Backend & AI Gateway Forwarder | `/lib/gateway`, `/backend`, `/mock_ai_service` |

---

## Directory Structure

```
d:\TheCreator\
├── app/                      # Next.js App Router (layout, pages, globals.css)
├── components/               # UI components & shadcn/ui primitives
│   └── ui/
│       └── button.tsx        # shadcn Button component
├── lib/
│   ├── gateway/              # Typed AI Gateway client wrapper (USE_MOCK support)
│   │   ├── index.ts          # getHealth (/v1/health) & generate (/v1/generate)
│   │   └── types.ts          # TypeScript interfaces & GatewayError
│   ├── supabase/             # Supabase clients via @supabase/ssr
│   │   ├── client.ts         # Browser client (createBrowserClient)
│   │   └── server.ts         # Server client (createServerClient with cookies)
│   └── utils.ts              # cn helper utility
├── supabase/
│   └── migrations/           # Database SQL migrations for PostgreSQL RLS
│       └── 20261021000000_initial_schema.sql
├── docs/                     # Project documentation and contracts
├── .github/
│   ├── CODEOWNERS            # PR code ownership rules
│   └── pull_request_template.md # PR checklist (1 reviewer, build pass, no secrets)
├── .env.example              # Template with environment variable names only
└── .gitignore                # Configured to ignore all .env* secret files
```

---

## AI Gateway Contract (`/lib/gateway`)

The typed gateway wrapper communicates with the AI Gateway service and includes an offline/mock mode toggle (`USE_MOCK`).

- **Base URL**: Configured via `NEXT_PUBLIC_GATEWAY_URL`.
- **Authorization**: Automatically passes `Authorization: Bearer <Supabase access token>`.
- **Mock Mode**: Set `NEXT_PUBLIC_USE_MOCK=true` to return deterministic local responses without external service calls.

### Supported Endpoints

1. **`GET /v1/health`**
   - Returns: `{ status: 'ok', version: string }`
2. **`POST /v1/generate`**
   - Payload: `{ task: string, ... }`
   - Returns: `{ request_id: string, task: string, source: 'fresh' | 'memory', output: {}, label: string, model: string, warnings: [] }`
3. **Errors**:
   - Standard format: `{ error: { code: string, message: string } }`

---

## Environment Variables

Copy `.env.example` to `.env.local` to configure your environment variables:

```bash
cp .env.example .env.local
```

| Variable | Description |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL of your Supabase instance |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anonymous public API key for Supabase client |
| `NEXT_PUBLIC_GATEWAY_URL` | Base URL for the AI gateway service |
| `NEXT_PUBLIC_USE_MOCK` | Set to `true` to enable mock gateway responses |

> **Note**: Never commit `.env` or any real API keys. `.env*` is ignored by `.gitignore`.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Build & Verification Commands

To verify that the Next.js App Router project compiles and builds cleanly:

```bash
# Type-checking and static analysis
npx tsc --noEmit

# Production build check
npm run build
```
