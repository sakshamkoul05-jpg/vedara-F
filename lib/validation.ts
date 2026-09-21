/**
 * Shared guest-facing form validation.
 *
 * Centralised so the contact form, the booking form and the My Bookings lookup
 * all apply the same rules — they previously validated (or failed to validate)
 * independently.
 */

/** Deliberately permissive: real-world addresses vary more than most regexes allow. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

/**
 * Letters, spaces, apostrophes, hyphens and dots only.
 * Unicode-aware so non-Latin names are accepted.
 */
const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}\s'’.-]*$/u;

const DIGITS_RE = /\d/;

export function validateName(value: string): string | undefined {
  const name = value.trim();
  if (!name) return 'Name is required.';
  if (name.length < 2) return 'Please enter your full name.';
  if (name.length > 100) return 'Name is too long.';
  if (DIGITS_RE.test(name)) return 'Name cannot contain numbers.';
  if (!NAME_RE.test(name)) return 'Name can only contain letters, spaces, hyphens and apostrophes.';
  return undefined;
}

export function validateEmail(value: string, { required = true } = {}): string | undefined {
  const email = value.trim();
  if (!email) return required ? 'Email is required.' : undefined;
  if (email.length > 150) return 'Email is too long.';
  if (!EMAIL_RE.test(email)) return 'Please enter a valid email address.';
  return undefined;
}

/**
 * Validates an international phone number.
 *
 * `react-phone-input-2` hands back the full number including country code and
 * without a leading "+", so the check is on total digit length: ITU-T E.164
 * allows up to 15 digits, and the shortest usable international numbers are
 * around 8 including the country code.
 */
export function validatePhone(
  value: string,
  { required = true, dialCode = '' }: { required?: boolean; dialCode?: string } = {}
): string | undefined {
  const digits = (value || '').replace(/\D/g, '');
  const dial = (dialCode || '').replace(/\D/g, '');

  if (!digits || digits === dial) {
    return required ? 'Phone number is required.' : undefined;
  }

  const national = dial && digits.startsWith(dial) ? digits.slice(dial.length) : digits;

  if (national.length < 4) return 'Phone number is too short.';
  if (digits.length < 8) return 'Please enter a valid phone number including country code.';
  if (digits.length > 15) return 'Phone number is too long.';

  // India is the primary market, so give a precise message for a wrong-length
  // Indian number rather than the generic one.
  if (dial === '91' && national.length !== 10) {
    return 'An Indian mobile number must be 10 digits.';
  }

  return undefined;
}

/** Strips characters a name field should never accept, for use in onChange. */
export function sanitizeNameInput(value: string): string {
  return value.replace(/[^\p{L}\p{M}\s'’.-]/gu, '');
}
