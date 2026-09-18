# Security

AlphaLens keeps all sensitive credentials on the server side and never exposes them to the browser bundle.

## Required environment variables

- NEXT_PUBLIC_SUPABASE_URL: public Supabase project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY: public anon key used for client access
- SUPABASE_SERVICE_ROLE_KEY: server-only key for privileged admin operations
- INDIAN_API_KEY: IndianAPI key for live or delayed market data
- TEJHQ_API_KEY: TejHQ key for provider-backed research data
- NEWS_API_KEY: configurable news provider key
- AI_API_KEY: server-side AI provider key

## Security principles

- Validate all API inputs before use.
- Keep provider keys in environment variables and never commit them.
- Apply authentication checks to protected routes and database actions.
- Use server-side code for all API interactions and data processing.
- Sanitize external URLs and restrict untrusted content.
- Store no user passwords in application code.

AlphaLens is designed for research and educational purposes and does not guarantee future return or investment advice.
