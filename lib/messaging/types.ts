/**
 * One interface for the two channels a follow-up can go out on.
 *
 * Both adapters report *why* they failed rather than throwing, because the
 * worker has to tell a permanent failure (bad address, template rejected) from
 * a temporary one (rate limited, provider down). The first should stop trying;
 * the second should be left to the next run.
 */

export type SendOutcome =
  | { ok: true; providerMessageId: string | null }
  | { ok: false; retryable: boolean; error: string };

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
  /** Put in List-Unsubscribe, so a mail client can offer one-click opt-out. */
  unsubscribeUrl?: string;
}

export interface WhatsAppMessage {
  /** E.164 without the leading plus, as Meta's API expects. */
  to: string;
  /** An approved template name. Meta rejects free-form text outside a session. */
  templateName: string;
  /** BCP-47 code for the approved template's language, e.g. "en" or "en_GB". */
  languageCode: string;
  /** Ordered positional parameters for the template body. */
  bodyParams: string[];
}

/** Treated as permanent: retrying will not change the answer. */
export const PERMANENT_STATUSES = new Set([400, 401, 403, 404, 410, 422]);

export function outcomeFromStatus(status: number, error: string): SendOutcome {
  return { ok: false, retryable: !PERMANENT_STATUSES.has(status), error: `${status}: ${error}`.slice(0, 500) };
}
