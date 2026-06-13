# Quietly

Quietly is a mobile-first anonymous wellbeing app built with Next.js, TypeScript, Tailwind CSS, and Supabase. It uses manual auth logic with anonymous login codes, bcrypt password hashing, hashed recovery codes, rolling JWT cookies, Supabase JS / Data API access, custom Supabase Realtime JWTs, and a Gemini-powered supportive chat.

## Features

- Anonymous account creation with user-chosen `login_code` and generated `recovery_code`
- No email, phone number, or personal profile data
- Secure login with `login_code + password`
- httpOnly signed session cookie
- Bottom-tab authenticated app flow: `Dashboard`, `Chat`, and `Habits`
- Supportive workplace chat backed by Gemini
- Crisis-safe fallback response for self-harm or immediate-danger language
- Stored chat session summary in Supabase
- User-owned habits with daily completions and gentle streaks
- Supabase tables with Row Level Security
- Mobile-first UI with reusable shadcn-style components

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Data API and Realtime
- `@supabase/supabase-js` for server and browser data access
- `bcryptjs` for password hashing
- `jose` for signed JWT cookie sessions
- Gemini API via Google AI Studio key

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your local environment file:

```bash
cp .env.example .env.local
```

3. Fill in `.env.local`:

- `SESSION_SECRET`: a random secret with at least 32 characters
- `SUPABASE_SERVICE_ROLE_KEY`: your server-only Supabase service role key
- `GEMINI_API_KEY`: your Google AI Studio Gemini API key
- `GEMINI_MODEL`: optional, defaults to `gemini-2.5-flash`
- `SUPABASE_JWT_SECRET`: your Supabase project JWT secret, used server-side to mint short-lived Realtime tokens
- `NEXT_PUBLIC_SUPABASE_URL`: your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: your Supabase publishable / anon key for Realtime subscriptions

4. Run the SQL in [supabase/schema.sql](/Users/wikusia/Desktop/startup/supabase/schema.sql) inside the Supabase SQL editor.
   If you already created the earlier version of the app, rerun the file so the new `chat_sessions`, `chat_messages`, `habits`, and `habit_completions` tables are added.

5. Start the app:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Authentication flow

1. User chooses a login code and password.
2. Server checks whether the login code is available.
3. Server generates a recovery code like `forest-lamp-river-82`.
4. The app stores:
   - `login_code_hash`
   - `password_hash`
   - `recovery_code_hash`
   - `user_id`
5. Signed httpOnly access and refresh cookies store the session after signup or login.

## Chat notes

- The authenticated app includes bottom tabs for `Dashboard`, `Chat`, and `Habits`
- `Chat` is the only fully implemented tab in MVP v0
- `Habits` includes 3 starter habits, add-habit support, daily checkoffs, and gentle streak tracking
- Chat history is stored in Supabase and the latest session summary is updated after each exchange
- Gemini runs server-side so the API key never reaches the browser
- Crisis language triggers a direct safety response instead of a model-generated reply

## Security notes

- Passwords are hashed with bcrypt using 12 rounds.
- Login and recovery codes are stored only as SHA-256 hashes.
- API writes are protected with CSRF validation and origin checks.
- Access cookies refresh on a rolling 60-minute window, backed by a longer refresh token.
- API responses include baseline security headers, CORS allowlisting, rate limiting, and request timing metrics.
- Supabase Realtime uses short-lived custom JWTs minted on the server and refreshed in the browser before expiry.
- The app never stores personal identity fields.
- Chat records are stored per `user_id` and session summary data stays in Supabase.
- Habits and habit completions are stored per `user_id`.
- External model calls are allowlisted through an SSRF-safe outbound helper.
- Server-side data writes use the Supabase service role key and manually scope every query by `user_id`.

## Project structure

- `app/`: routes and page-level screens
- `components/`: reusable UI and feature components
- `lib/auth/`: auth, session, and validation logic
- `lib/db/`: database access helpers
- `lib/actions/`: server actions for auth
- `supabase/`: SQL schema and RLS policies

## Production notes

- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only and never expose it to the browser.
- Set `SESSION_SECRET` to a strong random value in production.
- Serve the app over HTTPS so secure cookies are always enabled.

## GitHub Actions

This repo includes two workflows in `.github/workflows/`:

- `ci.yml`
  Runs `npm ci`, `npm run typecheck`, and `npm run build` on pull requests to `main` and pushes to `main`.
- `deploy-vercel.yml`
  Deploys to Vercel only after the `CI` workflow succeeds on a push to `main`.

To enable safe Vercel deploys from GitHub, add these repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Recommended GitHub protection:

1. Open GitHub `Settings -> Branches`.
2. Add a branch protection rule for `main`.
3. Require status checks to pass before merging.
4. Select the `CI / verify` check.

That way broken code can still be committed locally, but it cannot be merged to `main`, and production deploy will not run unless CI passes first.
