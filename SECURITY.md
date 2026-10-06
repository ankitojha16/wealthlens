# Security

WealthLens keeps all sensitive credentials on the server side and never exposes them to the browser bundle.

## Required environment variables

- NEXT_PUBLIC_SUPABASE_URL: public Supabase project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY: public anon key used for client access
- SUPABASE_SERVICE_ROLE_KEY: server-only Supabase Secret key (`sb_secret_...`) for privileged admin operations if such operations are added; the current app does not read this variable
- MARKET_API_BASE_URL: IndianAPI server URL, defaulting to `https://stock.indianapi.in`
- MARKET_API_KEY: server-only IndianAPI key; `INDIAN_API_KEY` is supported only as a legacy fallback
- NEWS_API_KEY: currently unused until its provider identity is established
- AI_PROVIDER: server-side AI provider identifier; currently supported value is `google`
- AI_MODEL: Gemini model name, defaulting to `gemini-3.8-flash` via the Interactions API
- GOOGLE_GEMINI_API_KEY: server-only Google AI Studio API key; never use a `NEXT_PUBLIC_` name

## Security principles

- Validate all API inputs before use.
- Keep provider keys in environment variables and never commit them.
- Apply authentication checks to protected routes and database actions.
- `/research`, `/settings`, and `POST /api/research` require an authenticated Supabase session.
- No production database tables, migrations, or user-owned CRUD operations are present in this repository; do not infer RLS coverage until the production service credential is valid and the schema is inspected.
- Use server-side code for all API interactions and data processing.
- Sanitize external URLs and restrict untrusted content.
- Store no user passwords in application code.
- The AI route sends only verified IndianAPI context to Gemini, uses `store=false`, and returns no generated answer when the provider is not configured.

WealthLens is designed for research and educational purposes and does not guarantee future return or investment advice.
