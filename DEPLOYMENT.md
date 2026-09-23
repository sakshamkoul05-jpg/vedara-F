# The Vedara — Deployment & Handover

Covers the changes made in this pass: the 15 UI feedback items, the payment
fix, and the Dynamic Pricing & Booking Engine v2.1.

---

## 1. Before anything else: run the database migration

The pricing engine needs new tables. Nothing prices correctly until this runs.

In the **Supabase SQL editor** (or `psql "$DATABASE_URL" -f <file>`), run in order:

1. `backend/prisma/migrations/20260921_pricing_engine_v2/migration.sql`
   Creates the rate/rule tables and adds pricing columns to `Cottage` and
   `Booking`. Safe to re-run — every statement is guarded.

2. `backend/prisma/migrations/20260921_pricing_engine_v2/seed.sql`
   Loads the v2.1 rate card. Idempotent — re-running updates rows rather than
   duplicating them.

Then part B, which closes the remaining gaps against the spec:

3. `backend/prisma/migrations/20260923_pricing_engine_v2_1b/migration.sql`
   Adds last-minute offers (§9), minimum stay (§15), maximum children (§15),
   the Stay 4 Pay 3 date window (§7), and **database defaults for every `id`
   and `updatedAt` column**. Without those defaults any insert that does not
   supply them fails — which is consistent with the data: the newest booking
   predates the old backend going down, and there are no contact messages or
   café orders at all. This fixes the contact form and café ordering too.

4. `backend/prisma/migrations/20260923_pricing_engine_v2_1b/seed.sql`
   Applies the spec's exact cottage mapping, removes rate tiers a cottage can
   no longer take, seeds the last-minute offer switched **off**, and corrects
   guest-facing content (the FAQ promising a free breakfast with every stay,
   and "Café Charade" left in the FAQ, a testimonial and a menu item). Safe on
   a live database: it only rewrites Magpie Retreat's and Whistling Thrush's
   rates and otherwise inserts what is missing, leaving admin edits alone.

The code tolerates part B not having run yet — nothing breaks — but the new
rules and the spec mapping only take effect once it has.

To regenerate a seed after editing `frontend/lib/pricing/seed-data.ts`:

```bash
cd frontend && npx tsx scripts/generate-pricing-seed.ts   > ../backend/prisma/migrations/20260921_pricing_engine_v2/seed.sql
cd frontend && npx tsx scripts/generate-pricing-seed-b.ts > ../backend/prisma/migrations/20260923_pricing_engine_v2_1b/seed.sql
```

---

## 2. Environment variables (Vercel)

Set these on the frontend project. See `frontend/.env.local.example` for the
full annotated list.

| Variable | Why it matters |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | **Required.** Without it, quoting, booking and payment all fail. Server-only — never expose it. |
| `RAZORPAY_KEY_ID` + `RAZORPAY_KEY_SECRET` | Order creation and signature verification. The secret is server-only. |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Opens the Razorpay checkout widget. |
| `JWT_SECRET` | Must match the secret the admin JWT is signed with, or admin API calls return 401. |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public data reads. |
| `BOOKING_HOLD_MINUTES` | How long a pending reservation is held. Defaults to 15. |

---

## 3. Row level security

The migration enables RLS on the new tables with public **read** and no public
write. Two things still need doing in Supabase:

1. **Lock down `Booking` and `Payment` writes.** The browser previously wrote
   these directly. Booking creation and payment confirmation now happen in
   server routes using the service role key, so the anon role should no longer
   have `INSERT`/`UPDATE` on `Booking`, `Payment` or `Guest`.
   Until that policy change lands, the old client-side path is still reachable
   by anyone calling Supabase directly with the anon key.

2. **Rotate the Supabase anon key.** It is committed as a fallback literal in
   `frontend/lib/supabase.ts`, so it is public in the GitHub repo.

---

## 4. What changed

### Payment (feedback item 6)

Booking payment could never complete. Three separate causes:

1. `POST /bookings` called `/payments/create-order` on
   `vedara-backend-production.up.railway.app`, which is dead — CORS error,
   `razorpayOrder` came back `null`, and the booking page aborted.
2. The CSP blocked `cdn.razorpay.com` (script) and `api.razorpay.com` (frame).
3. The CSP did not list the Supabase origin at all, so **Cottage and Package
   data were blocked outright on production**.

Now:

- `POST /api/bookings` — prices the stay server-side, creates the booking, and
  stores a pricing snapshot. The browser never sends an amount.
- `POST /api/payments/create-order` — reads the amount from the stored booking,
  so a tampered client cannot pay less than quoted.
- `POST /api/payments/verify` — verifies Razorpay's HMAC signature before
  confirming. **This closes a live security hole**: the previous code marked a
  booking `PAID` and `CONFIRMED` purely from client input, with no verification
  at all, meaning anyone could confirm any booking without paying.

### Pricing engine (spec v2.1)

- `frontend/lib/pricing/engine.ts` — pure calculation, no rates inside.
- `frontend/lib/pricing/seed-data.ts` — the v2.1 rate card, seed only.
- `frontend/lib/pricing/engine.test.ts` — 70 tests covering the spec's §17
  acceptance checklist and the worked examples in §7 and §14.

```bash
cd frontend && npx tsx lib/pricing/engine.test.ts
```

Admin screens live at **`/admin/pricing`**, covering every control in spec §15:
seasons and rates, Special Peak dates, cottage occupancy and bedding, breakfast
and child bands, Stay 4 Pay 3, inventory uplift, GST slabs and global settings.
A **Preview** tab prices a test stay through the same endpoint the booking form
uses. Changes take effect on the next quote — no redeploy.

The page shows a warning banner for configuration gaps that would otherwise
surface as a failed quote for a guest: months with no active season, cottages
with no pricing category, missing rate rows, no active tax slab.

---

## 5. Decisions taken, worth re-confirming with the client

**The cottage mapping follows the spec exactly, as the client decided.**
Spec §1 makes Magpie Retreat Boutique and Whistling Thrush Premium:

| Category | Cottages | Max adults | Max children | Extra mattress |
|---|---|---|---|---|
| Boutique | Magpie Retreat, Flycatcher Nook, Bulbul Nest | 2 | 1 | No |
| Premium | Whistling Thrush (bathtub) | 4 | 2 | Yes, ₹1,250 |
| Signature | Monal Haven, Koklass Cove (jacuzzi) | 4 | 2 | Yes, ₹1,250 |
| Studio | The Finch Nook | 2 | 1 | No |

**The cottage descriptions still say the opposite.** The website copy
(`The_Vedara_7_Cottages_Updated.docx`) and the Cottage records describe Magpie
Retreat as a 556 sq ft duplex with a bath tub sleeping 4, and Whistling Thrush
as a 270 sq ft suite sleeping 2. The booking engine now caps Magpie Retreat at
2 adults and offers Whistling Thrush up to 4. The client should update those
two cottages' descriptions, photos, bedroom counts and sizes in the CMS so the
page a guest reads matches what they can book.

**The Finch Nook is not in the pricing spec at all.** It is a 7th cottage the
spec predates. Seeded as a Studio tier one step below Boutique
(₹3,500–₹6,000 room-only). These numbers are a placeholder for the client to
confirm.

**Inventory thresholds are ratios, not counts.** Spec §8 says "4 of 6" and
"5 of 6", but there are 7 live cottages. Stored as booked ratios, which maps
onto the same "cottages remaining" behaviour: 3 left = base, 2 left = +10%,
1 left = +20%.

**GST slabs** are seeded to the standard Indian hotel treatment (12% up to
₹7,500/night, 18% above). Spec §14 requires this be configurable rather than
hard-coded, so confirm the rates with the client's accountant and adjust on the
Tax tab.

---

## 6. Known gaps — not addressed in this pass

- **Realtime features are dead.** `services/socket.ts` connects to the retired
  Express backend. Admin chat and live kitchen order updates do not work.
- **`getImageUrl` in `lib/utils.ts`** builds relative image URLs against the
  same dead backend. Absolute URLs (Cloudinary, Unsplash) are unaffected.
- **The `vedara-B` repo is not deployed.** Its Prisma schema has been kept in
  step with the migration so it stays the canonical schema definition, but the
  booking logic in `src/services/booking.service.ts` still uses the old flat
  `pricePerNight × nights` calculation. If that backend is ever revived it must
  be pointed at the new engine, or it will price differently from the website.
- **Lapsed holds are ignored, not swept.** An unpaid booking whose
  `holdExpiresAt` has passed no longer blocks the cottage or counts toward the
  demand uplift, but its row stays `PENDING`. A scheduled job to mark such rows
  `EXPIRED` would tidy the admin booking list.
- **No database-level double-booking guard.** Availability is checked before
  insert, so two guests confirming the same cottage in the same second could
  both succeed. A Postgres exclusion constraint on (cottage, date range) would
  close this; it needs existing overlapping rows cleaned up first.
- **Legacy "Extra Guest Charge"** is still editable in the CMS cottage form but
  the pricing engine ignores it; occupancy is priced by adult tier instead.
