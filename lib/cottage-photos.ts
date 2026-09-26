/**
 * Photographs of the property, by cottage.
 *
 * These replace the three stock Unsplash pictures the cards used to cycle
 * through by position, which meant every cottage showed one of the same three
 * generic interiors — and the cottage a guest clicked was never the one in the
 * photo.
 *
 * Ordered so the first image is the one that sells the cottage: the jacuzzi
 * for the Signature pair, the bath tub for Whistling Thrush. A card shows only
 * the first, so that ordering is what most visitors ever see.
 *
 * A cottage's own `images` column still wins when it has one, so uploading
 * photographs through admin later supersedes this file without a deploy.
 */

export const COTTAGE_PHOTOS: Record<string, string[]> = {
  'monal-haven': [
    '/images/cottages/monal-haven-1.webp',
    '/images/cottages/monal-haven-2.webp',
    '/images/cottages/monal-haven-3.webp',
    '/images/cottages/monal-haven-4.webp',
    '/images/cottages/monal-haven-5.webp',
  ],
  'koklass-cove': [
    '/images/cottages/koklass-cove-1.webp',
    '/images/cottages/koklass-cove-2.webp',
    '/images/cottages/koklass-cove-3.webp',
  ],
  'whistling-thrush': [
    '/images/cottages/whistling-thrush-1.webp',
    '/images/cottages/whistling-thrush-2.webp',
    '/images/cottages/whistling-thrush-3.webp',
    '/images/cottages/whistling-thrush-4.webp',
    '/images/cottages/whistling-thrush-5.webp',
  ],
};

/**
 * Shown for a cottage we have no photographs of yet.
 *
 * The property's own hero shot rather than a stock interior: it is at least
 * honestly this place, and it does not promise a room that may not look like
 * that.
 */
export const PHOTO_PLACEHOLDER = '/images/hero-bg.webp';

/** Whatever a cottage record carries, normalised to a list of URLs. */
function storedImages(cottage: any): string[] {
  const raw = cottage?.images;
  if (Array.isArray(raw)) return raw.filter((v) => typeof v === 'string' && v.trim());
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string' && v.trim()) : [raw];
    } catch {
      return [raw];
    }
  }
  return [];
}

/**
 * Every photograph for a cottage, best first.
 *
 * The photographs in this repo come *before* the cottage's own `images`
 * column, which is the opposite of what you would expect. The reason is that
 * every row currently holds paths like `/images/cottages/magpie-retreat-1.jpg`
 * for files that were never uploaded — all seven 404. The hardcoded stock
 * photos the cards used to show were masking it.
 *
 * Once those rows hold real uploads, flip this to prefer `stored` so admin
 * can change a photograph without a deploy. Until then, trusting the column
 * means shipping broken images.
 */
export function photosFor(cottage: any): string[] {
  const bySlug = COTTAGE_PHOTOS[cottage?.slug];
  if (bySlug?.length) return bySlug;

  const stored = storedImages(cottage);
  if (stored.length > 0) return stored;

  return [PHOTO_PLACEHOLDER];
}

/** The single image a card shows. */
export function coverPhoto(cottage: any): string {
  return photosFor(cottage)[0];
}

/** True when these are real photographs of this cottage, not the placeholder. */
export function hasOwnPhotos(cottage: any): boolean {
  return storedImages(cottage).length > 0 || Boolean(COTTAGE_PHOTOS[cottage?.slug]?.length);
}

/**
 * Swap in the placeholder when an image fails to load.
 *
 * Belt and braces for a path that is wrong in the database, or a file removed
 * from the bucket: the alternative is a browser's broken-image icon on a page
 * selling a mountain retreat. Clears the handler first so a missing
 * placeholder cannot loop.
 */
export function onPhotoError(event: React.SyntheticEvent<HTMLImageElement>): void {
  const img = event.currentTarget;
  img.onerror = null;
  if (!img.src.endsWith(PHOTO_PLACEHOLDER)) img.src = PHOTO_PLACEHOLDER;
}
