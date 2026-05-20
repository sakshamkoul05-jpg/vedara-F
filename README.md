# Vedara Retreat — Frontend

Next.js 15 frontend for Vedara Retreat Hotels — a vintage, cinematic mountain retreat management platform.

## Tech Stack

- **Framework:** Next.js 15 (App Router), TypeScript
- **Styling:** Tailwind CSS, Shadcn UI
- **Animations:** Framer Motion, GSAP, Lenis
- **State:** Zustand
- **Forms:** React Hook Form + Zod

## Quick Start

```bash
# Install dependencies
npm install

# Copy env and configure
cp .env.local.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
vedara-frontend/
├── app/
│   ├── (public)/        # Public-facing pages
│   │   ├── page.tsx      # Home
│   │   ├── about/        # About
│   │   ├── cottages/     # Cottages listing + detail
│   │   ├── cafe/         # Cafe menu + ordering
│   │   ├── booking/      # Booking flow
│   │   ├── contact/      # Contact form
│   │   ├── gallery/      # Photo gallery
│   │   └── policies/     # Policies + FAQs
│   ├── (admin)/          # Admin dashboard + CMS
│   │   ├── dashboard/    # Admin overview
│   │   ├── cms/          # Content management
│   │   ├── analytics/    # Analytics
│   │   └── login/        # Staff login
│   └── (employee)/       # Employee dashboard
│       └── dashboard/    # Staff interface
├── components/
│   ├── animations/       # ScrollReveal, TextReveal, Parallax
│   ├── chatbot/          # AI chatbot widget
│   ├── layout/           # Header, Footer
│   └── ui/               # Button, Input
├── store/                # Zustand stores
├── lib/                  # API client, utilities
├── types/                # TypeScript types
└── styles/               # Global CSS
```

## Pages

| Route | Description |
|-------|-------------|
| `/` | Cinematic hero, cottage showcase, cafe intro |
| `/about` | Brand story, philosophy, team |
| `/cottages` | Cottage grid with filters |
| `/cottages/[id]` | Cottage detail, amenities |
| `/cafe` | Digital menu, table ordering |
| `/booking` | Check-in/out, availability, payment |
| `/contact` | Contact form, info |
| `/gallery` | Atmospheric photo grid |
| `/policies` | Hotel policies, FAQs |
| `/admin/login` | Staff authentication |
| `/admin/dashboard` | Admin overview |
| `/admin/cms` | Content management |
| `/admin/analytics` | Business analytics |
| `/employee/dashboard` | Staff operations |

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## Deployment

```bash
npm run build
```

Deploy to Vercel — configure `NEXT_PUBLIC_API_URL` to point to your deployed backend.
