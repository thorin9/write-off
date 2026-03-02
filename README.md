# Write-Off ✍️💸

> AI-powered expense management and tax optimization for 1099 / freelance / self-employed workers.

Think: **"The Robinhood of tax expense tracking."**

---

## Features

- 🔐 **Auth** — Email/password + Google OAuth via Supabase
- 📊 **Dashboard** — YTD spending, estimated tax savings, monthly bar chart
- 📁 **Smart Upload** — PDF bank statements, CSV exports, receipt OCR (GPT-4o Vision)
- 🤖 **AI Expense Analyzer** — GPT-4o classifies every expense by IRS Schedule C category with deductibility verdict + confidence score
- 💬 **AI Chatbot** — Ask tax questions, get IRS-grounded answers with conversation history
- 📱 **SMS via Twilio** — Text an expense, get a deductibility verdict back instantly
- 📋 **Expense Table** — Full CRUD, inline editing, search/filter, bulk actions
- 📄 **Tax Reports** — Schedule C category breakdown, estimated savings, PDF + CSV export
- 💳 **Stripe** — Freemium model ($12/mo Pro), subscription management via webhooks
- 📧 **Email Notifications** — Monthly reminders, quarterly tax deadlines via Resend

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| Backend | Next.js API Routes |
| Database | PostgreSQL via Supabase + Prisma ORM |
| Auth | Supabase Auth (email + Google OAuth) |
| AI | OpenAI GPT-4o (analysis + chat + OCR) |
| PDF Parsing | pdf-parse |
| CSV Parsing | PapaParse |
| SMS | Twilio |
| Payments | Stripe |
| Email | Resend |

---

## Local Setup

### 1. Clone & Install

```bash
git clone https://github.com/your-org/write-off
cd write-off
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|----------|----------------|
| `DATABASE_URL` | Supabase → Settings → Database → Connection string (Transaction pooler) |
| `DIRECT_URL` | Supabase → Settings → Database → Connection string (Direct) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key |
| `OPENAI_API_KEY` | platform.openai.com → API Keys |
| `TWILIO_ACCOUNT_SID` | console.twilio.com → Account Info |
| `TWILIO_AUTH_TOKEN` | console.twilio.com → Account Info |
| `TWILIO_PHONE_NUMBER` | Your Twilio phone number (e.g. `+15551234567`) |
| `STRIPE_SECRET_KEY` | dashboard.stripe.com → Developers → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | dashboard.stripe.com → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | dashboard.stripe.com → Webhooks → Signing secret |
| `STRIPE_PRO_PRICE_ID` | Stripe product price ID for Pro plan (optional) |
| `RESEND_API_KEY` | resend.com → API Keys |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` (dev) or your production URL |

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase (or run migrations)
npx prisma db push
```

### 4. Supabase Auth Setup

In Supabase Dashboard:
- Enable **Email** and **Google** providers under Authentication → Providers
- Add `http://localhost:3000/auth/callback` to your **Redirect URLs** list

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Twilio SMS Setup

1. Buy a Twilio phone number at console.twilio.com
2. Set the **Messaging Webhook** for that number to:
   ```
   https://your-domain.com/api/twilio/sms
   ```
   (Method: POST)
3. Users can text expenses like:
   - `$84 at Staples for office supplies`
   - `Spent $200 at Adobe`
   - `DoorDash $45`

---

## Stripe Setup

1. Create a product in Stripe Dashboard: **Write-Off Pro** at `$12.00/month`
2. Copy the **Price ID** to `STRIPE_PRO_PRICE_ID`
3. Set webhook endpoint: `https://your-domain.com/api/stripe/webhook`
4. Enable events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/          # AI chatbot endpoint
│   │   ├── dashboard/     # Stats & chart data
│   │   ├── expenses/      # CRUD + AI analyzer
│   │   ├── reports/       # Summary, PDF export, CSV export
│   │   ├── stripe/        # Checkout + webhook
│   │   ├── twilio/        # SMS webhook
│   │   └── upload/        # PDF/CSV parser + OCR
│   ├── auth/              # Login, signup, OAuth callback
│   ├── dashboard/         # Main app (protected routes)
│   │   ├── chat/          # AI chatbot UI
│   │   ├── expenses/      # Expense table
│   │   ├── reports/       # Tax summary + export
│   │   ├── settings/      # Profile, plan, notifications
│   │   └── upload/        # File upload UI
│   ├── onboarding/        # 3-step setup wizard
│   └── page.tsx           # Landing page
├── lib/
│   ├── ai/
│   │   └── analyzer.ts    # GPT-4o expense classification
│   ├── supabase/          # Client, server, middleware helpers
│   ├── email.ts           # Resend email templates
│   ├── prisma.ts          # Prisma singleton
│   └── utils.ts           # Formatters, constants, IRS categories
└── middleware.ts           # Route protection
```

---

## Deductibility System

Every expense gets classified as:

| Status | Color | Meaning |
|--------|-------|---------|
| ✅ Deductible | Green | High confidence (>85%) — clearly deductible |
| 🟡 Likely Deductible | Amber | Medium confidence (50–85%) |
| ⚠️ Partially Deductible | Orange | Only part deductible (e.g. meals = 50%) |
| 🔴 Not Deductible | Red | Personal expense, no business use |

All verdicts reference **IRS Publication 535 (Business Expenses)**.

---

## Freemium Model

| Feature | Free | Pro ($12/mo) |
|---------|------|-------------|
| Expenses/month | 50 | Unlimited |
| AI analysis | ✅ | ✅ |
| Chat | ✅ | ✅ |
| PDF/CSV export | ❌ | ✅ |
| SMS tracking | ❌ | ✅ |
| Priority AI | ❌ | ✅ |

---

## Deployment

**Vercel (recommended):**
```bash
vercel --prod
```

Add all environment variables in the Vercel project dashboard.

---

## License

MIT
