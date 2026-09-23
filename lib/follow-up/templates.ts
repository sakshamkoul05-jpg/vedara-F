import type { EmailMessage, WhatsAppMessage } from '@/lib/messaging/types';

/**
 * Follow-up copy.
 *
 * Written to sound like the front desk noticing, not like a retargeting funnel:
 * no countdown timers, no invented scarcity, no "your cart is about to expire".
 * The rates quoted are the ones the engine actually gave them, so a reply of
 * "but it said 6,500" is never met with a different number.
 *
 * WhatsApp copy is *not* here. Meta only accepts approved templates outside a
 * service window, so that wording lives in Business Manager; this file supplies
 * the positional parameters those templates expect.
 */

export type InquiryContext = {
  name: string | null;
  cottageName: string | null;
  checkIn: string | null;
  checkOut: string | null;
  adults: number | null;
  quotedAmount: number | null;
  unsubscribeUrl: string;
  bookingUrl: string;
};

const PHONE = '+91-91188-82242';

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

const formatMoney = (amount: number | null) =>
  amount ? `₹${Math.round(amount).toLocaleString('en-IN')}` : null;

const firstName = (name: string | null) => (name ? name.trim().split(/\s+/)[0] : null);

/** A plain description of the stay, or null when we never got the details. */
function stayLine(ctx: InquiryContext): string | null {
  const checkIn = formatDate(ctx.checkIn);
  const checkOut = formatDate(ctx.checkOut);
  if (!checkIn || !checkOut) return null;
  const who = ctx.adults ? ` for ${ctx.adults} ${ctx.adults === 1 ? 'guest' : 'guests'}` : '';
  const where = ctx.cottageName ? `${ctx.cottageName}, ` : '';
  return `${where}${checkIn} to ${checkOut}${who}`;
}

const SUBJECTS: Record<number, (ctx: InquiryContext) => string> = {
  1: (ctx) => (ctx.cottageName ? `${ctx.cottageName} is still free for your dates` : 'Your Jibhi dates are still open'),
  2: () => 'Anything we can help you decide?',
  3: () => 'We will leave you to it',
};

const BODIES: Record<number, (ctx: InquiryContext) => string[]> = {
  1: (ctx) => {
    const stay = stayLine(ctx);
    const price = formatMoney(ctx.quotedAmount);
    return [
      `${firstName(ctx.name) ? `Hello ${firstName(ctx.name)},` : 'Hello,'}`,
      stay
        ? `You were looking at ${stay}${price ? `, which came to ${price}` : ''}. It is still available.`
        : 'You started planning a stay with us and did not finish — the dates you were looking at are still open.',
      'If something stopped you — the dates, the cottage, how many of you there are — just reply to this email and we will sort it out. We answer everything ourselves.',
      `You can pick up where you left off here: ${ctx.bookingUrl}`,
    ];
  },
  2: (ctx) => [
    `${firstName(ctx.name) ? `Hello ${firstName(ctx.name)},` : 'Hello,'}`,
    'Jibhi is four hours past Kullu, and most people have a question or two before they commit — how the drive is in the season you are coming, whether the cottage suits your group, what there is to do if it rains.',
    `Ask us anything and we will answer honestly, including when the answer is "come another month". Reply here, or call ${PHONE}.`,
    `Your dates: ${ctx.bookingUrl}`,
  ],
  3: (ctx) => [
    `${firstName(ctx.name) ? `Hello ${firstName(ctx.name)},` : 'Hello,'}`,
    'This is the last you will hear from us about these dates.',
    `If the trip is still on, everything is where you left it: ${ctx.bookingUrl}. If plans changed, no matter at all — we hope to host you another time.`,
  ],
};

function htmlFrom(paragraphs: string[], ctx: InquiryContext): string {
  const body = paragraphs
    .map((line) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#2b2b2b;">${escapeHtml(line)}</p>`)
    .join('');

  return `<!doctype html><html><body style="margin:0;padding:24px;background:#faf8f5;font-family:Georgia,'Times New Roman',serif;">
<div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
<p style="margin:0 0 24px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#8a7a5c;">The Vedara</p>
${body}
<hr style="border:none;border-top:1px solid #eee;margin:28px 0 16px;">
<p style="margin:0;font-size:12px;line-height:1.6;color:#8a8a8a;">
The Vedara &middot; Ghiyagi, Jibhi, Himachal Pradesh 175123 &middot; ${PHONE}<br>
<a href="${ctx.unsubscribeUrl}" style="color:#8a8a8a;">Stop these emails</a>
</p>
</div></body></html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function emailForStage(stage: number, to: string, ctx: InquiryContext): EmailMessage {
  const subject = (SUBJECTS[stage] ?? SUBJECTS[1])(ctx);
  const paragraphs = (BODIES[stage] ?? BODIES[1])(ctx);

  return {
    to,
    subject,
    text: `${paragraphs.join('\n\n')}\n\n—\nThe Vedara · Jibhi, Himachal Pradesh · ${PHONE}\nStop these emails: ${ctx.unsubscribeUrl}`,
    html: htmlFrom(paragraphs, ctx),
    unsubscribeUrl: ctx.unsubscribeUrl,
  };
}

/**
 * Parameters for the approved WhatsApp template.
 *
 * The template registered with Meta is expected to read roughly:
 *   "Hello {{1}}, your stay at {{2}} from {{3}} is still available.
 *    Reply here or call us to finish booking."
 *
 * Meta rejects a send whose parameter count does not match the approved body,
 * so these three are filled with a sensible stand-in rather than omitted when
 * the detail is missing.
 */
export function whatsappForStage(stage: number, to: string, ctx: InquiryContext): WhatsAppMessage {
  return {
    to,
    templateName: process.env.WHATSAPP_TEMPLATE_FOLLOWUP || 'vedara_inquiry_followup',
    languageCode: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en',
    bodyParams: [
      firstName(ctx.name) ?? 'there',
      ctx.cottageName ?? 'The Vedara',
      formatDate(ctx.checkIn) ?? 'your chosen dates',
    ],
  };
}
