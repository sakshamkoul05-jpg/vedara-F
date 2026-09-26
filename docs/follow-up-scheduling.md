# Scheduling the enquiry follow-up worker

`/api/cron/follow-ups` sends the nudges that have come due. Something has to
call it on a schedule; this note explains why that is split across two places.

## Why not just Vercel Cron

Vercel's **Hobby plan allows one cron run per day**, fired within ±59 minutes of
the stated hour. The follow-up ladder's first nudge is due 45 minutes after
someone abandons the booking form, so a daily run makes the whole design
pointless — and each run only drains a batch of 25.

Putting `*/15 * * * *` in `vercel.json` does not degrade gracefully: Vercel
**rejects the deployment outright**, which is what happened on 26 September
2026 and silently blocked every deploy from the follow-up commit onward. The
commit status on GitHub reads "Deployment failed" and links to the cron pricing
page; no deployment record is created, so nothing appears in the dashboard's
deployment list to explain it.

## What runs now

| Where | Schedule | Role |
|---|---|---|
| `.github/workflows/follow-ups.yml` | every ~15 min | the real cadence |
| `vercel.json` | daily, 04:00 UTC | fallback if Actions is down |

Running both is safe by design. The worker claims each follow-up out of
`PENDING` before it attempts a send, and the unique index on
`(inquiryId, channel, stage)` means a stage cannot exist twice. Overlapping
runs duplicate *work*, never a message.

## Setup

The workflow needs two repository secrets — Settings → Secrets and variables →
Actions. Until both exist it runs, reports that it is not configured, and
exits cleanly rather than failing every quarter of an hour:

- `CRON_SECRET` — the same value set in the Vercel environment
- `SITE_URL` — the deployment to call, e.g. `https://vedara-f-tau.vercel.app`

`CRON_SECRET` must match on both sides. If it does not, the worker answers 401
and the workflow fails loudly, because silence would be indistinguishable from
"nothing was due".

## On a Pro plan

Cron frequency goes to once per minute. Set `vercel.json` to
`*/15 * * * *` and delete the workflow — one scheduler is simpler than two.
