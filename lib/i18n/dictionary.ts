/**
 * The interface copy, authored in English.
 *
 * This is the source every other language is derived from. Keys are grouped by
 * where they appear and named for meaning rather than for their English words,
 * so a wording change does not require renaming the key everywhere.
 *
 * What belongs here: navigation, buttons, form labels, statuses, short helper
 * sentences — the chrome. What does not: cottage descriptions, café items,
 * FAQs. Those live in the database and are translated through the dynamic
 * endpoint, because they change without a deploy.
 */

export const DICTIONARY = {
  // --- navigation -----------------------------------------------------------
  'nav.home': 'Home',
  'nav.about': 'About Us',
  'nav.stays': 'Stays',
  'nav.cafe': 'Café',
  'nav.gallery': 'Gallery',
  'nav.contact': 'Contact Us',
  'nav.book': 'Book Your Stay',
  'nav.myBookings': 'My Bookings',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',

  // --- shared actions -------------------------------------------------------
  'action.bookNow': 'Book Now',
  'action.viewDetails': 'View Details',
  'action.checkAvailability': 'Check Availability',
  'action.search': 'Search',
  'action.find': 'Find',
  'action.submit': 'Submit',
  'action.send': 'Send',
  'action.cancel': 'Cancel',
  'action.close': 'Close',
  'action.back': 'Back',
  'action.continue': 'Continue',
  'action.compare': 'Compare',
  'action.clear': 'Clear',
  'action.refresh': 'Refresh',
  'action.loading': 'Loading…',

  // --- stay details ---------------------------------------------------------
  'stay.checkIn': 'Check-in',
  'stay.checkOut': 'Check-out',
  'stay.selectDate': 'Select date',
  'stay.adults': 'Adults',
  'stay.children': 'Children',
  'stay.guests': 'Guests',
  'stay.nights': 'Nights',
  'stay.night': 'night',
  'stay.from': 'From',
  'stay.perNight': 'per night',
  'stay.total': 'Total',
  'stay.taxes': 'Taxes',
  'stay.available': 'Available',
  'stay.notAvailable': 'Not available',
  'stay.bookedForTheseDates': 'Booked for these dates',
  'stay.roomOnly': 'Room Only',
  'stay.breakfastIncluded': 'Breakfast Included',
  'stay.extraMattress': 'Extra mattress',
  'stay.bedrooms': 'Bedrooms',
  'stay.bathrooms': 'Bathrooms',
  'stay.size': 'Size',
  'stay.amenities': 'Amenities',
  'stay.tier': 'Tier',
  'stay.sleeps': 'Sleeps',

  // --- cottage tiers --------------------------------------------------------
  'tier.boutique': 'Boutique',
  'tier.premium': 'Premium',
  'tier.signature': 'Signature',
  'tier.studio': 'Studio',

  // --- comparison -----------------------------------------------------------
  'compare.title': 'Compare cottages',
  'compare.comparing': 'Comparing',
  'compare.pickOneMore': 'Pick one more',
  'compare.full': 'Remove one first',

  // --- guest portal ---------------------------------------------------------
  'portal.title': 'Manage Your Booking',
  'portal.reference': 'Booking reference',
  'portal.bookedWith': 'Booked with',
  'portal.email': 'Email',
  'portal.phone': 'Phone',
  'portal.status': 'Status',
  'portal.noMatch': 'No booking matches that reference and contact detail.',

  // --- service requests -----------------------------------------------------
  'request.title': 'Housekeeping & Maintenance',
  'request.new': 'New request',
  'request.whatDoYouNeed': 'What do you need?',
  'request.housekeeping': 'Housekeeping',
  'request.maintenance': 'Maintenance',
  'request.amenities': 'Amenities',
  'request.foodDrink': 'Food & Drink',
  'request.other': 'Something else',
  'request.preferredTime': 'Best time for us to come',
  'request.howSoon': 'How soon',
  'request.anyTime': 'Any time',
  'request.urgent': 'Urgent',
  'request.today': 'Today',
  'request.whenever': 'Whenever suits',
  'request.received': 'Received',
  'request.inProgress': 'On the way',
  'request.done': 'Done',
  'request.sent': 'Request sent. Our team has it and will be with you shortly.',

  // --- forms ----------------------------------------------------------------
  'form.name': 'Name',
  'form.email': 'Email address',
  'form.phone': 'Phone number',
  'form.message': 'Message',
  'form.required': 'Required',
  'form.optional': 'Optional',
  'form.specialRequests': 'Special requests',

  // --- concierge ------------------------------------------------------------
  'chat.title': 'Vedara Concierge',
  'chat.placeholder': 'Ask about cottages, café, treks…',
  'chat.listening': 'Listening…',
  'chat.askByVoice': 'Ask by voice',
  'chat.stopListening': 'Stop listening',
  'chat.readAloud': 'Read replies aloud',
  'chat.stopReading': 'Stop reading replies aloud',

  // --- language -------------------------------------------------------------
  'language.label': 'Language',
  'language.choose': 'Choose a language',
  'language.machineTranslated': 'Parts of this page are machine translated.',

  // --- misc -----------------------------------------------------------------
  'misc.reception': 'Reception',
  'misc.callUs': 'Call us',
  'misc.noResults': 'Nothing found',
  'misc.tryAgain': 'Please try again.',
} as const;

export type MessageKey = keyof typeof DICTIONARY;

export const MESSAGE_KEYS = Object.keys(DICTIONARY) as MessageKey[];

/**
 * Bumped when English copy changes in a way that should invalidate cached
 * translations. The locale endpoint includes it in its response so the browser
 * can discard a stale dictionary without anyone clearing storage by hand.
 */
export const DICTIONARY_VERSION = 1;
