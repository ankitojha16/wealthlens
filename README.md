# AlphaLens

See the business behind the stock.

## Overview

AlphaLens is a production-style financial research platform for Indian equities. It blends market overview, company research, charts, business metrics, valuation signals, and AI-guided analysis in a clean research workspace.

## Features

- Landing page and market dashboard
- Company pages with core financial metrics
- Search and market data overview
- News summaries and research context
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
- Supabase-ready architecture

## Architecture

- app/: route-level pages and layouts
- components/: reusable UI and market widgets
- lib/: calculations, demo data, validation, utilities, Supabase client
- SECURITY.md: server security guidance
- .env.example: environment variable template

## Data providers

AlphaLens is designed around provider abstraction and supports:

- IndianAPI for live/delayed market information when available
- TejHQ for EOD, historical, and company-data retrieval when available
- Configurable news provider through environment variables
- AI provider with env-based selection

Market availability depends on each provider and may be delayed or end-of-day.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the relevant values.

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

AlphaLens uses external data providers where available. Data may be delayed, EOD, or unavailable, and should be treated as educational and analytical information rather than guaranteed live market data.

## License

This project is intended for portfolio/demo use and is not regulated financial advice.
