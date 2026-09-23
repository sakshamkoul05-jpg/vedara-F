import { outcomeFromStatus, type EmailMessage, type SendOutcome } from './types';

/**
 * Email through Resend.
 *
 * Server-only: RESEND_API_KEY must never reach the browser. When the key is
 * absent the adapter reports itself unconfigured rather than failing sends, so
 * a deployment without email set up still runs and the worker records why
 * nothing went out.
 */

const API_URL = 'https://api.resend.com/emails';

const apiKey = () => process.env.RESEND_API_KEY;

/** Must be a domain verified in Resend, or every send is rejected. */
const fromAddress = () => process.env.RESEND_FROM || 'The Vedara <hello@vedararetreat.com>';

const replyTo = () => process.env.RESEND_REPLY_TO || 'vedararetreat@gmail.com';

export function emailConfigured(): boolean {
  return Boolean(apiKey());
}

export async function sendEmail(message: EmailMessage): Promise<SendOutcome> {
  const key = apiKey();
  if (!key) {
    return { ok: false, retryable: false, error: 'RESEND_API_KEY is not set' };
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Idempotency-Key': `${message.to}:${message.subject}`.slice(0, 200),
  };

  const body: Record<string, unknown> = {
    from: fromAddress(),
    to: [message.to],
    reply_to: replyTo(),
    subject: message.subject,
    text: message.text,
    html: message.html,
  };

  // Mail clients surface this as a native unsubscribe button, which keeps
  // people from reporting the message as spam to get the same result.
  if (message.unsubscribeUrl) {
    body.headers = {
      'List-Unsubscribe': `<${message.unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    };
  }

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { ...headers, Authorization: `Bearer ${key}` },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return outcomeFromStatus(res.status, detail || res.statusText);
    }

    const json = await res.json().catch(() => ({}));
    return { ok: true, providerMessageId: json?.id ?? null };
  } catch (err: any) {
    // A network failure is worth another attempt on the next run.
    return { ok: false, retryable: true, error: `network: ${err?.message ?? 'unknown'}`.slice(0, 500) };
  }
}
