# ML Knowledge Hub — Frontend

Mobile-first personal AI/ML learning platform. Next.js 15 (App Router) + TypeScript
+ Tailwind (The Verge design system) + React Query + Radix UI + Framer-friendly
primitives + react-pdf + mammoth.

The frontend talks to the **NestJS backend** over REST. It never touches Supabase
or MongoDB directly — all storage URLs are issued as short-lived **signed URLs**
by the backend, so the only environment variable the client needs is the API URL.

## Stack

- **Next.js 15** (App Router, RSC where possible, client components for interactivity)
- **Tailwind CSS** — palette + radii wired to CSS variables so **dark (default) and light** both work
- **Radix UI** — accessible Dialog / Dropdown / Select / Tabs / Tooltip / Switch / Progress
- **TanStack Query** — caching, invalidation, optimistic updates
- **React Hook Form + Zod** — typed forms with validation
- **react-pdf (pdf.js)** — in-browser PDF reader (pagination, zoom, search, bookmarks, fullscreen, dark mode)
- **mammoth** — DOC/DOCX → HTML rendering
- **Sonner** — toasts
- **next-themes** — dark/light toggle

## Run

```bash
cp .env.example .env.local      # then set NEXT_PUBLIC_API_BASE_URL
npm install
npm run dev                     # http://localhost:3000
```

The backend must be running (default `http://localhost:5000/api/v1`). Start it
with MongoDB + Supabase configured (see backend README). No Supabase keys are
required on the frontend.

### Environment

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the NestJS API (incl. `/api/v1`) |
| `NEXT_PUBLIC_APP_NAME` | App name (used in metadata) |
| `NEXT_PUBLIC_MAX_UPLOAD_SIZE_MB` | Client-side guard for uploads |
| `NEXT_PUBLIC_PDF_WORKER_SRC` | Path to the self-hosted pdf.js worker (`/pdf.worker.min.mjs`) |

> The pdf.js worker is copied from `node_modules` into `public/` during setup.
> If you upgrade `react-pdf`, re-copy it:
> `cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/`

## How the frontend connects to the backend

All requests go through `src/lib/api/client.ts`, which unwraps the backend's
uniform envelope `{ success, data, message, timestamp, path }` and throws a
typed `ApiClientError` (with the validator's `message` array) so toasts can show
it directly.

| Concern | Endpoint |
|---|---|
| Resources | `GET/POST /resources`, `GET /resources/:id`, `GET /resources/:id/file-url`, `PATCH /resources/:id`, `PATCH /resources/:id/progress`, `PATCH /resources/:id/favorite`, `POST/DELETE /resources/:id/bookmarks/:page` |
| Uploads | `POST /uploads` (multipart `file`) → returns `path, signedUrl, pages, …` |
| Todos | `GET/POST /todos`, `GET /todos/summary`, `PATCH /todos/:id/complete`, `/start`, `PATCH/DELETE /todos/:id` |
| Notes | `GET/POST /notes`, `GET /notes/summary`, `PATCH/DELETE /notes/:id` |
| Search | `GET /search?q=` (resources + todos + notes) |
| Dashboard | `GET /stats/dashboard` (one call, fully composed) |

Domain hooks live under `src/features/*/hooks` and encapsulate the React Query
calls + Sonner toasts + cache invalidation. Shared UI primitives are in
`src/components/ui`; the responsive shell (sidebar / bottom-nav / top-bar / FAB /
⌘K command palette) is in `src/components/layout`.

## Design system

The visual language follows `DESIGN-theverge.md`: near-black canvas (`#131313`),
acid-mint `#3cffd0` + ultraviolet `#5200ff` hazard accents, pill radii everywhere,
colour-as-elevation (hairline borders, not shadows), and mono-uppercase labels.
Fonts: Archivo Black (display), Space Grotesk (UI), Space Mono (labels) — all
loaded via `next/font`.
