/**
 * The follow-up ladder.
 *
 * Three nudges over three days, then silence. The shape is deliberate: the
 * first lands while the trip is still being thought about, the second the next
 * morning, the third as a last word before we stop. A fourth would be pestering
 * someone who has already decided, and would cost more in spam reports than it
 * would win back in bookings.
 */

export type Stage = {
  stage: number;
  /** Minutes after the inquiry was last touched. */
  delayMinutes: number;
  /** Channels this stage goes out on, when the contact detail exists. */
  channels: ('EMAIL' | 'WHATSAPP')[];
};

export const LADDER: Stage[] = [
  // Long enough that someone who stepped away mid-form is not interrupted
  // mid-thought, short enough that the trip is still on their mind.
  { stage: 1, delayMinutes: 45, channels: ['EMAIL', 'WHATSAPP'] },
  // The next day, in the morning for most of our markets.
  { stage: 2, delayMinutes: 24 * 60, channels: ['EMAIL'] },
  // Final word. Email only: a third WhatsApp is what gets a number blocked.
  { stage: 3, delayMinutes: 72 * 60, channels: ['EMAIL'] },
];

/**
 * Stop following up once the trip itself has passed.
 *
 * Someone whose check-in date has come and gone does not want to hear that
 * their cottage is still waiting, and the message reads as carelessness.
 */
export function inquiryIsStale(checkIn: string | null, now = Date.now()): boolean {
  if (!checkIn) return false;
  return Date.parse(checkIn) < now;
}

/** When each stage of an inquiry becomes due. */
export function scheduleFor(createdAt: string): { stage: number; channel: 'EMAIL' | 'WHATSAPP'; scheduledAt: string }[] {
  const base = Date.parse(createdAt);
  const rows: { stage: number; channel: 'EMAIL' | 'WHATSAPP'; scheduledAt: string }[] = [];

  for (const { stage, delayMinutes, channels } of LADDER) {
    const scheduledAt = new Date(base + delayMinutes * 60 * 1000).toISOString();
    for (const channel of channels) rows.push({ stage, channel, scheduledAt });
  }

  return rows;
}
