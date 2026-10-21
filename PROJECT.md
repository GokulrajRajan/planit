# Planit — Project Overview

Planit is a blogging / publishing platform ("Write more. Reach more." — "the calm, beautiful home for everything you write and publish"). It is a monorepo with two apps:

| Folder      | Stack                                                                 | Port (dev) |
|-------------|-----------------------------------------------------------------------|------------|
| `frontend/` | Next.js 16.3 (App Router), React 19.2, TypeScript, Tailwind CSS v4    | 3000       |
| `backend/`  | Flask 3 REST API, SQLAlchemy, PostgreSQL, JWT auth, Marshmallow        | 5000       |

The frontend proxies `/api/*` to the Flask server via a Next.js rewrite, so the browser only ever talks to one origin.

---

## Current status

**Built:**
- Full REST API: auth, users, posts, categories, tags, comments, dashboard stats.
- Marketing landing page (`/`): heavily animated, scroll-driven, with video.
- Login (`/login`) and register (`/register`) pages wired to the API, with session restore on reload.

**Not built yet (frontend):**
- Post list / post detail / reading pages
- Writing editor (create/edit post)
- Author/admin dashboard UI
- Comment UI, category/tag browsing, user profile, admin user management
- Search (the nav search button does nothing yet)

**Gaps in the repo:**
- `backend/.env.example` refers to `FLASK_APP=run.py`, but there is **no `run.py`** yet. It needs `from app import create_app; app = create_app()`.
- There is **no `migrations/` folder**. Run `flask db init && flask db migrate && flask db upgrade` to create the schema.
- `backend/tests/` exists but is empty. pytest is installed, and a `TestingConfig` uses `TEST_DATABASE_URL`.
- shadcn/ui components (`frontend/components/ui/*`), TanStack React Query and `sonner` are installed but not used yet.
- Most nav/footer menu links are placeholder anchors (`#guides`, `#`, etc.).

---

## Repository layout

```
Planit/
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   ├── tests/                 (empty)
│   └── app/
│       ├── __init__.py        create_app(): extensions, CORS, JWT callbacks, blueprints
│       ├── config.py          Development / Testing / Production configs from env
│       ├── extensions.py      db, migrate, jwt, ma, cors singletons
│       ├── models/            user, post (+ post_tags), category, tag, comment
│       ├── schemas/           Marshmallow input validation + output serialization
│       ├── services/          business logic (one module per resource)
│       ├── routes/            thin Flask blueprints that call services
│       └── utils/             responses.py, errors.py, decorators.py, slugify.py
└── frontend/
    ├── next.config.ts         /api/* rewrite → API_URL (default http://localhost:5000)
    ├── lib/
    │   ├── api.ts             axios instance (baseURL "/api"), ApiEnvelope type, toApiError()
    │   ├── auth.ts            in-memory auth store, useAuth(), login/register/logout
    │   └── utils.ts           cn()
    ├── components/ui/         shadcn/ui primitives (unused so far)
    ├── public/hero/           hero videos (.mp4) + poster frames (.jpg), Mixkit free license
    └── app/
        ├── layout.tsx         fonts (Jost, Source Serif 4, Geist) + metadata
        ├── page.tsx           landing page composition
        ├── globals.css        all landing/auth styles (~2,200 lines, BEM-ish classes)
        ├── (auth)/            layout.tsx, forms.tsx, login/page.tsx, register/page.tsx
        └── components/        Hero, Nav, sections, visuals, scene, reveal, motion
```

---

## Backend

### Architecture conventions
- **Layering:** `routes/` (HTTP, auth checks) → `services/` (logic, DB writes) → `models/`. Keep routes thin.
- **Response envelope:** every endpoint returns
  - success: `{ "success": true, "data": {...}, "message": "..." }`
  - error: `{ "success": false, "message": "...", "errors": {...} | null }`

  Use `success()` / `error()` from `app/utils/responses.py`.
- **Errors:** raise `APIError(message, status, errors=None)` from services or routes. Marshmallow `ValidationError` becomes a **422** with field errors. Unhandled exceptions return 500, with details shown only in debug mode.
- **Authorization:** `@jwt_required()` for any logged-in user. `@role_required(UserRole.AUTHOR, UserRole.ADMIN)` checks the `role` claim in the JWT. Ownership checks live in services (`can_manage_post`, `can_delete_comment`).
- **Slugs:** `unique_slug(text, Model, exclude_id=None)` adds `-2`, `-3`, … when a slug is taken.

### Data model (PostgreSQL)

| Table        | Key fields |
|--------------|-----------|
| `users`      | id, name, email (unique), password_hash, role (`reader` \| `author` \| `admin`, default `reader`), created_at |
| `posts`      | id, title, slug (unique), excerpt (≤500), content, cover_image_url, status (`draft` \| `published`), author_id → users (CASCADE), category_id → categories (SET NULL), created_at, updated_at, published_at |
| `categories` | id, name (unique), slug (unique) |
| `tags`       | id, name (unique), slug (unique) |
| `post_tags`  | post_id, tag_id (many-to-many, CASCADE) |
| `comments`   | id, content, post_id → posts (CASCADE), user_id → users (CASCADE), created_at |

`published_at` is set the first time a post's status becomes `published`. Tags are passed as `tag_names: string[]`. Matching is case-insensitive, and tags that don't exist yet are created automatically.

### Auth flow (JWT)
- Register and login return `{ user, access_token }` in the body and set an **httpOnly refresh-token cookie**, scoped to `/api/auth/refresh`. They also set a readable `csrf_refresh_token` cookie.
- The access token is sent as `Authorization: Bearer <token>`. It expires after 60 minutes by default.
- `POST /api/auth/refresh` needs the refresh cookie **and** an `X-CSRF-TOKEN` header holding the `csrf_refresh_token` value. It returns a new access token and rotates the refresh cookie. Refresh tokens last 30 days by default.
- Access-token claims are `role`, `name` and `email`. The identity is the user id as a string.
- New users are always created as `reader`. Only an admin can change a role, via `PATCH /api/users/:id`.

### API endpoints (all prefixed `/api`)

**Auth**
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/auth/register` | public | `{name (2–120), email, password (8–128)}` → 201. Returns 409 if the email already exists |
| POST | `/auth/login` | public | `{email, password}`. Returns 401 for bad credentials |
| POST | `/auth/refresh` | refresh cookie + CSRF header | → `{access_token}` |
| POST | `/auth/logout` | logged in | clears the cookies |
| GET  | `/auth/me` | logged in | → `{user}` |

**Users**
| Method | Path | Access |
|---|---|---|
| GET | `/users` | admin |
| GET | `/users/:id` | self or admin |
| PATCH | `/users/:id` | self or admin. `{name?, role?}`; only an admin can send `role` |
| DELETE | `/users/:id` | admin |

**Posts**
| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/posts` | public | Published posts only, newest first. Query: `page`, `per_page` (default 10, max 50), `category` (slug), `tag` (slug), `search` (title/excerpt, case-insensitive) |
| GET | `/posts/mine` | author, admin | Own posts, including drafts (an admin sees all posts) |
| GET | `/posts/:slug` | public | Drafts are visible only to their author or an admin; anyone else gets 404 |
| POST | `/posts` | author, admin | `{title (3–200), content, excerpt?, cover_image_url?, status?, category_id?, tag_names?}` |
| PATCH | `/posts/:id` | owner or admin | same fields, all optional; changing the title regenerates the slug |
| DELETE | `/posts/:id` | owner or admin | |

List responses look like `{ posts: [...], meta: { page, per_page, total, pages } }`. Summary items leave out `content` and `updated_at`.

**Categories / Tags**
| Method | Path | Access |
|---|---|---|
| GET | `/categories` | public |
| POST / PATCH / DELETE | `/categories`, `/categories/:id` | admin (`{name}` 2–100) |
| GET | `/tags` | public |
| PATCH / DELETE | `/tags/:id` | admin (tags are created implicitly through posts) |

**Comments**
| Method | Path | Access |
|---|---|---|
| GET | `/posts/:post_id/comments` | public (oldest first) |
| POST | `/posts/:post_id/comments` | logged in (`{content}` 1–2000) |
| DELETE | `/comments/:id` | comment author or admin |

**Dashboard**
| Method | Path | Access | Returns |
|---|---|---|---|
| GET | `/dashboard/stats` | author, admin | `total_posts, published_posts, draft_posts, total_comments` (own posts only, or every post for an admin). Admins also get `total_users` |

### Environment (`backend/.env`)
```
FLASK_ENV=development
FLASK_APP=run.py
SECRET_KEY=...
DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/planit_db
TEST_DATABASE_URL=postgresql+psycopg://postgres:password@localhost:5432/planit_db_test
JWT_SECRET_KEY=...
JWT_ACCESS_TOKEN_EXPIRES_MINUTES=60
JWT_REFRESH_TOKEN_EXPIRES_DAYS=30
JWT_COOKIE_SECURE=false        # true once served over HTTPS
CORS_ORIGINS=http://localhost:3000
```

---

## Frontend

> **Important:** `frontend/AGENTS.md` warns that this Next.js version (16.3) has breaking changes compared with older versions. Check `node_modules/next/dist/docs/` before relying on older Next.js conventions. For example, page and layout props use the global `LayoutProps<"/">` / `PageProps` helper types.

### Talking to the API
- `lib/api.ts` exports an axios instance with `baseURL: "/api"` and `withCredentials: true`, plus the `ApiEnvelope<T>` type. `toApiError(err)` normalizes failures into an `ApiError { message, status, fieldErrors }`.
- `lib/auth.ts` is a small external store, read through `useSyncExternalStore`:
  - The access token is kept **in memory only**. An axios request interceptor attaches it.
  - On first `useAuth()` subscription, it restores the session: if the `csrf_refresh_token` cookie exists, it calls `/auth/refresh` and then `/auth/me`.
  - `useAuth()` → `{status: "loading" | "anonymous" | "authenticated", user}`.
  - It exports `login()`, `register()` and `logout()`.
  - It does **not** yet retry a request after a 401 by refreshing the token. Add a response interceptor once there are protected pages that stay open longer than 60 minutes.
- Forms use **react-hook-form + zod**. The zod schemas mirror the Marshmallow rules. Server field errors are mapped back onto the matching inputs.

### Pages
- **`/` (landing)**, from `app/page.tsx`, in order: `Nav` → `Hero` → `WordStack` ("Write, Publish, Organize, Discuss, Grow") → a series of `FeaturePanel`s (Editor / Pro / Tags / Dashboard / Categories), with `Manifesto` placed after Pro → `Newsletter` ("TLDR") → `Trusted` (stats) → `Footer`, plus `FloatingControls` (pause motion).
  - The stats and figures on this page are illustrative; the page says so in its own disclaimer.
- **`/login`, `/register`**: a split layout. The form column sits on the left; the right side shows decorative art (`GlassReads` card, "Write more. Reach more.").

### Motion system (landing page)
- `Scene` (`components/scene.tsx`) is a full-screen "slide". With `hold > 0` it pins while you scroll. It exposes progress as CSS custom properties (`--enter, --hold, --reveal, --v, --swipe, --exit, --total`) and to JS through `useSceneFrame()`.
- `Reveal` / `Lines` (`components/reveal.tsx`) reveal text line by line from scene progress. Elements with `data-block` / `data-block="late"` fade in as blocks.
- `Hero` is a scroll-scrubbed animation. A photo turns into a glass "reads" dashboard while an animated SVG line is drawn. Floating video tiles are cut from one 3×2 grid video (`tiles.mp4`) and drawn to canvases, so the browser decodes a single stream. `Odometer` gives the rolling digits.
- `MotionProvider` / `useMotion()` provide a global pause state. `usePrefersReducedMotion()` respects the OS setting. `playClip()` / `pauseClip()` handle browsers that block autoplay (iOS Low Power Mode): blocked clips start on the visitor's first tap.
- `next.config.ts` sets `allowedDevOrigins: ["192.168.*.*"]` so the dev site can be tested from a phone on the LAN.

### Design language
- **Fonts:** Jost (`--font-futura`, the main UI/landing font), Source Serif 4 (`--font-serif`), Geist (`--font-sans`, shadcn).
- **Palette** (in `:root` in `globals.css`): graphite `#32302f`, paper `#fcfcfc`, linen `#faf8f5`, cream `#f5f1ed` (page background), fog `#f1f0f0`, stone `#e4e2e1`, pebble `#686664`, charcoal `#09090a`, ink `#2d2a28` (text), butter `#ecdfa6`.
- **Shape and layout tokens:** `--radius-pill: 1600px`, `--radius-card: 16px`, `--page-max: 1200px`, `--gutter: clamp(20px, 5vw, 40px)`, easing `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`.
- **Style:** calm, warm and editorial, with soft gradients and pill buttons (`.pill`, `.pill--dark`, `.pill--outline`, `.pill--lg`). Landing and auth styles are hand-written classes in `globals.css` under `.landing`. shadcn/Tailwind tokens are also set up for app UI.

---

## Running locally

```bash
# Backend
cd backend
python -m venv venv && venv\Scripts\activate      # Windows
pip install -r requirements.txt
cp .env.example .env                              # then edit the DB credentials and secrets
# create run.py first (see "Gaps" above), then:
flask db init && flask db migrate -m "init" && flask db upgrade
flask run                                         # http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev                                       # http://localhost:3000
```

To make yourself an author or admin, update `users.role` directly in the database. Through the API, only an existing admin can change roles.
