import { outcomeFromStatus, type SendOutcome, type WhatsAppMessage } from './types';

/**
 * WhatsApp through Meta's Cloud API.
 *
 * Two things make this different from email and shape the code below.
 *
 * First, outside a 24-hour customer-service window Meta only accepts *approved
 * template* messages — free text is rejected. So a follow-up names a template
 * and supplies positional parameters, and the wording lives in Meta's Business
 * Manager rather than in this repo. Changing the copy means editing and
 * resubmitting the template there.
 *
 * Second, the template has to be approved before anything sends at all. Until
 * WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN are set the adapter
 * reports itself unconfigured, and the worker records the follow-up as skipped
 * rather than failed.
 */

const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0';

const phoneNumberId = () => process.env.WHATSAPP_PHONE_NUMBER_ID;
const accessToken = () => process.env.WHATSAPP_ACCESS_TOKEN;

export function whatsappConfigured(): boolean {
  return Boolean(phoneNumberId() && accessToken());
}

/**
 * Meta wants digits only, no plus, no spaces, with the country code included.
 *
 * A number stored without a country code cannot be dialled internationally and
 * must not be guessed at — sending to the wrong person is worse than not
 * sending — so anything too short is rejected here.
 */
export function toE164Digits(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

export async function sendWhatsApp(message: WhatsAppMessage): Promise<SendOutcome> {
  const id = phoneNumberId();
  const token = accessToken();
  if (!id || !token) {
    return { ok: false, retryable: false, error: 'WhatsApp Cloud API is not configured' };
  }

  const to = toE164Digits(message.to);
  if (!to) {
    return { ok: false, retryable: false, error: 'Phone number is not dialable internationally' };
  }

  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: message.templateName,
      language: { code: message.languageCode },
      components: message.bodyParams.length
        ? [{ type: 'body', parameters: message.bodyParams.map((text) => ({ type: 'text', text })) }]
        : [],
    },
  };

  try {
    const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      return outcomeFromStatus(res.status, detail || res.statusText);
    }

    const json = await res.json().catch(() => ({}));
    return { ok: true, providerMessageId: json?.messages?.[0]?.id ?? null };
  } catch (err: any) {
    return { ok: false, retryable: true, error: `network: ${err?.message ?? 'unknown'}`.slice(0, 500) };
  }
}
