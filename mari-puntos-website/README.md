This is an [Astro](https://astro.build) project with React islands for interactive components.

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

## Deploy on Vercel

This project uses `@astrojs/vercel` in server output mode, since the beta signup API route runs on-demand.
