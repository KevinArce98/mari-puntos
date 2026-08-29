MariPuntos marketing site — an [Astro](https://astro.build) 7 project with React islands, Tailwind CSS v4, and bilingual (ES/EN) content.

## Getting Started

```bash
pnpm dev
```

Open [http://localhost:4321](http://localhost:4321) with your browser to see the result.

Pages live in `src/pages/`, layouts in `src/layouts/`, and shared components in `src/components/`.
Interactive components (`BetaSignupForm`, `FaqAccordion`) are React islands hydrated with `client:load`.

## Environment Variables

The beta signup endpoint (`src/pages/api/beta-signup.ts`) sends email via Gmail SMTP and requires:

- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`

The endpoint is protected with per-IP + per-email rate limiting (in-memory, best-effort on serverless) and a honeypot field.

## Deploy on Vercel

This project uses `@astrojs/vercel` in server output mode, since the beta signup API route runs on-demand.
