# CLAUDE.md — LLM Tinder

Guidance for working in this repo.

## What this is

A Tinder-style web app where users **swipe on LLM models** (instead of people) based
on each model's feature set.

- **Swipe left** → the model is hidden from that user's deck forever.
- **Swipe right** → it becomes a **match**, shown in the Matches list.
- **Later phase:** users set their own AI **preferences** and see which preferences a
  model satisfies, on the card. The `Feature` / `AiModelFeature` / `UserPreference`
  tables exist now; the preference-matching UI is not built yet.

## Tech stack

- **Next.js 16** (App Router, TypeScript, React 19) — Server Components + Server Actions.
- **Prisma 6** ORM on **Supabase Postgres** — pooled `DATABASE_URL` (:6543, `pgbouncer=true`) for
  the app, direct `DIRECT_URL` (:5432) for schema work. Pinned to v6 on purpose — v7 requires a
  driver-adapter setup we don't need yet. Schema is applied with `prisma db push` (no migration history).
- **Auth.js (NextAuth v5 beta)** with `@auth/prisma-adapter`, **Credentials + Google OAuth** providers, **JWT sessions**.
- **Tailwind CSS v4** + **framer-motion** for the draggable swipe cards.

## Data model (`prisma/schema.prisma`)

- **User** (+ Auth.js `Account` / `Session` / `VerificationToken`) — `passwordHash` holds the bcrypt hash; `emailVerified` is set on OAuth sign-ups (the adapter requires it).
- **AiModel** — the swipeable "profiles": name, provider, tagline, description, contextWindow, pricing, `isActive`.
- **Swipe** — canonical record. `direction` is a Postgres `enum SwipeDirection` (`LEFT | RIGHT`).
  - Unique `(userId, aiModelId)` → one decision per user per model.
  - **A match = a Swipe with `direction = "RIGHT"`** (no separate Match table).
  - The deck excludes any model the user has already swiped.
- **Feature** / **AiModelFeature** — each model's feature set (drives card chips).
- **UserPreference** — per-user feature weighting (wired for the later phase).

## Project structure

```
app/
  layout.tsx                  # wraps pages in <NavBar/>
  page.tsx                    # redirects to /swipe
  login/  register/           # auth pages + their server actions (actions.ts)
  swipe/page.tsx              # the deck (auth-guarded) → <SwipeDeck/>
  matches/page.tsx            # right-swiped models → <MatchList/>
  api/auth/[...nextauth]/     # Auth.js route handler
lib/
  prisma.ts                   # PrismaClient singleton
  auth.ts                     # NextAuth config (Credentials + adapter + JWT)
  swipes.ts                   # data layer: getDeck / recordSwipe / getMatches (+ DTO mapping)
  actions.ts                  # "use server": swipeAction, signInWithGoogle, signOutAction
  types.ts                    # ModelCardData / MatchData / SwipeDirection
components/
  NavBar, SwipeDeck, ModelCard, SwipeButtons, MatchList, GoogleSignInButton
prisma/
  schema.prisma  seed.ts       # no migrations/ — schema applied via `prisma db push`
types/next-auth.d.ts          # adds user.id to Session/JWT
```

## Conventions

- **Auth is server-trusted.** Server Actions read the userId from `auth()` — never accept a
  userId from the client. See `lib/actions.ts`.
- **Server → client data** goes through the plain DTOs in `lib/types.ts` (`lib/swipes.ts`
  maps Prisma rows, converting `Date` → ISO string).
- Pages that need a user call `auth()` and `redirect("/login")` when absent.
- Import the Prisma singleton from `@/lib/prisma` (don't `new PrismaClient()` in app code).

## Commands

```bash
npm run dev -- -p 3100   # start the app on :3100 (the port registered for Google OAuth)
npx prisma db push   # apply schema.prisma changes to Supabase (use this, not migrate dev)
npm run db:seed      # seed AI models + features (idempotent)
npm run db:studio    # browse the DB in Prisma Studio
npm run build        # production build
npm run lint         # eslint
```

Env (`.env`, see `.env.example`): `DATABASE_URL` (pooled), `DIRECT_URL` (direct), `AUTH_SECRET`,
`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_URL`.

## Database: Supabase Postgres

The app runs on **Supabase Postgres** (project ref `qjtidopotedjqvvdecje`).

- `.env` (gitignored) holds `DATABASE_URL` (transaction pooler, :6543, `pgbouncer=true`) for the
  app and `DIRECT_URL` (session pooler, :5432) for schema work. `.env.example` shows the template.
- Apply schema changes with **`npx prisma db push`** — `prisma migrate dev` trips over the Supabase
  pooler's shadow-database step, so we use `db push`. There's no `prisma/migrations/` history yet;
  add a baseline migration later if you want versioned migrations.
- After editing `schema.prisma`: `npx prisma db push`, then `npm run db:seed` if needed.
- **RLS:** Row Level Security is enabled on all tables with **no policies**. The app is unaffected —
  Prisma connects as the table-owner `postgres` role, which bypasses RLS — this just closes
  Supabase's public Data API. Only add policies if you start using the Supabase client (anon key).
- A **Supabase MCP** is configured in `.mcp.json` (project scope) for inspecting the DB directly.

## Auth

- **Providers:** email/password (Credentials) **and Google OAuth**, both in `lib/auth.ts`; **JWT** sessions.
- **Google OAuth (local):** reads `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`. The app must run on the port
  registered in Google Cloud — **`http://localhost:3100`** — with redirect URI
  `http://localhost:3100/api/auth/callback/google`, and the signing-in Google account must be a
  **test user** while the consent screen is in Testing mode. `AUTH_URL` pins the callback base.
- The adapter tables (`Account` / `Session` / `VerificationToken`) link OAuth logins to `User` rows.
  `allowDangerousEmailAccountLinking` lets Google attach to an existing same-email account.
- Swapping to **Supabase Auth** later is still an optional alternative.

## Deploying to Vercel (next step)

The database is already cloud-hosted, so deploying is mostly wiring env + OAuth:

1. Import the GitHub repo (`christianhoustonfloyd/llm-tinder`) into Vercel.
2. Set env vars in Vercel → Settings → Environment Variables: `DATABASE_URL`, `DIRECT_URL`,
   `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`. Set `AUTH_URL` to the deployed URL
   (`https://<app>.vercel.app`) once known — **do not** reuse `localhost:3100`.
3. The pooled `DATABASE_URL` (:6543, `pgbouncer`) is the right one for Vercel's serverless functions.
4. Prisma client is built on deploy via the `postinstall: prisma generate` script (already in package.json).
5. Google Cloud → your OAuth client: add the production redirect URI
   `https://<app>.vercel.app/api/auth/callback/google` (keep the localhost one too) and add the
   domain to Authorized JavaScript origins.
6. The Google consent screen is in **Testing** — only listed test users can sign in until you
   publish the app.

## Schema diagram

`schema.dbml` mirrors the Prisma schema for the `schema-viz` MCP viewer. Run `/schema`
(or ask to "render the schema") to see the interactive ER diagram.

---

Project-specific Next.js notes live in [AGENTS.md](AGENTS.md).
