# CharityLink — Golf Charity Subscription Platform

A subscription-based web application combining golf performance tracking, charity fundraising, and a monthly draw-based reward engine.

## Live Demo
https://golf-charity-platform-56gs.vercel.app

## Tech Stack
- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui + Framer Motion
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Payments:** Stripe (subscriptions + webhooks)
- **Deployment:** Vercel

## Features

### User Side
- Subscription engine (monthly €9.99 / yearly €99.99) via Stripe
- Stableford score entry with rolling 5-score logic (1-45 range)
- Monthly draw participation with algorithmic + random draw modes
- Charity selection with configurable contribution percentage (min 10%)
- Full dashboard: subscription status, scores, charity, draws, winnings
- Winner proof upload with verification flow

### Admin Side
- User management with role promotion
- Draw management: create, simulate, publish with live prize pool calculation
- Prize pool auto-calculation: 40% jackpot / 35% match-4 / 25% match-3
- Jackpot rollover if unclaimed
- Charity CRUD with featured spotlight
- Winner verification with password-confirmed admin actions
- Analytics overview

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Stripe account

### Installation

1. Clone the repository
```bash
git clone https://github.com/Jeffrey-Hamlin-V/Golf-Charity-Platform.git
cd Golf-Charity-Platform
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables — create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_MONTHLY_PRICE_ID=your_monthly_price_id
STRIPE_YEARLY_PRICE_ID=your_yearly_price_id
STRIPE_WEBHOOK_SECRET=your_webhook_secret
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server
```bash
npm run dev
```

5. For Stripe webhooks locally:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

## Database Schema
- `profiles` — user profiles extending Supabase auth
- `charities` — charity listings with featured flag
- `scores` — rolling 5-score per user with auto-enforcement trigger
- `draws` — monthly draws with logic type and prize pools
- `draw_entries` — user participation per draw with matched numbers
- `winners` — winner records with verification and payout tracking

## Deployment
Deployed on Vercel with Supabase backend. Environment variables configured in Vercel dashboard. Production Stripe webhook pointing to `/api/stripe/webhook`.

## License
MIT
