# WealthLens

See the business behind the stock.

## Overview

WealthLens is a research platform for Indian equities. It blends market overview, company research, historical prices, company news, and analytical context in a focused research workspace.

## Features

- Landing page and market dashboard
- Company pages with core financial metrics
- Search and market data overview
- IndianAPI-backed company news and research context
- Calculation utilities for return, CAGR, volatility, drawdown, beta, and Sharpe metrics
- Provider abstraction and environment-driven configuration
- Security guidance and deployment-ready structure

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- React 19
- Lucide icons
- Recharts and UI primitives
- Supabase client foundation

## Architecture

- app/: route-level pages and layouts
- components/: reusable UI and market widgets
- lib/: calculations, demo data, validation, utilities, Supabase client
- SECURITY.md: server security guidance
- .env.example: environment variable template

## Data providers

WealthLens uses one primary market provider:

- IndianAPI for documented NSE/BSE company data, quotes, historical data, movers, and company news
- TejHQ is configured only as a legacy credential and is not called by the application
- `NEWS_API_KEY` is currently unused because no provider identity or integration exists for it
- Google Gemini is the selected AI provider. The app uses Gemini 3.8 Flash through Google's Interactions API by default. Optionally configure `AI_PROVIDER=google` and `AI_MODEL` to select another supported text model, and set a server-only key from Google AI Studio. The app accepts `GOOGLE_GEMINI_API_KEY` or the generic `AI_API_KEY` as the Gemini key (the explicit Google key takes precedence). Interactions are not stored by Google.

IndianAPI documents its stock and trending endpoints as real-time; historical data is historical. Unsupported metrics, including indices without a documented endpoint in the current integration, are shown as unavailable rather than fabricated.

NIFTY/SENSEX and other market indices remain unavailable because the current IndianAPI integration has no documented index endpoint. Company pages prefer the verified NSE ticker for TradingView and show the provider error state when a symbol is unsupported.

Research and settings require a Supabase session. The current repository has no user-owned tables or database writes; those operations must be added with reviewed RLS policies before they can be tested.

The browser and SSR session clients use `NEXT_PUBLIC_SUPABASE_ANON_KEY`. If privileged server operations are added later, configure the Supabase dashboard Secret key (`sb_secret_...`) under `SUPABASE_SERVICE_ROLE_KEY`, on one uninterrupted environment-variable line. Never expose that key to client code.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the relevant values.

For Gemini, create an API key in Google AI Studio, enable the Gemini API for its project, and add the key as `GOOGLE_GEMINI_API_KEY`. Keep `AI_PROVIDER`, `AI_MODEL`, and the key server-side. Do not paste the key into chat or use a `NEXT_PUBLIC_` prefix.

## Local development

```bash
npm install
npm run dev
```

## Testing and validation

```bash
npm run lint
npm run build
```

## Deployment

This project is structured for Vercel deployment. Ensure environment variables are configured in the hosting environment and that no secrets are exposed to the browser bundle.

## Data limitations

IndianAPI data availability depends on the provider response and supported endpoint. Market data should be treated as educational and analytical information rather than guaranteed live market data.

## License

This project is intended for portfolio/demo use and is not regulated financial advice.
