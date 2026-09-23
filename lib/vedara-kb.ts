import { supabase } from './supabase';
import { loadPricingConfig } from './pricing/load-config';
import { lowestFromRate } from './pricing/engine';

export interface VedaraKB {
  cottages: any[];
  menu: any[];
  testimonials: any[];
  faqs: any[];
  packages: any[];
  settings: Record<string, any>;
  /** Live pricing-engine policy, so answers match what checkout charges. */
  pricing: {
    adultAgeThreshold: number;
    adultBreakfast: number | null;
    childBreakfast: { minAge: number; maxAge: number; price: number }[];
    mattressPrice: number;
  } | null;
}

let cachedKB: VedaraKB | null = null;

export async function getVedaraKB(): Promise<VedaraKB> {
  if (cachedKB) return cachedKB;

  const [cottagesRes, menuRes, testimonialsRes, faqsRes, packagesRes, settingsRes] = await Promise.all([
    supabase.from('Cottage').select('*').eq('isActive', true).order('sortOrder'),
    supabase.from('CafeCategory').select('*, items:CafeItem(*)').eq('isActive', true).order('sortOrder'),
    supabase.from('Testimonial').select('*').eq('isVisible', true).order('sortOrder'),
    supabase.from('FAQ').select('*').eq('isActive', true).order('sortOrder'),
    supabase.from('Package').select('*').eq('isActive', true).order('sortOrder'),
    supabase.from('SiteSetting').select('*'),
  ]);

  const settings: Record<string, any> = {};
  (settingsRes.data || []).forEach((s: any) => { settings[s.key] = s.value; });

  // Attach the booking engine's "from" rates and policy (spec §12, §13) so the
  // concierge never quotes the legacy flat rate or a free-breakfast promise.
  let cottages = cottagesRes.data || [];
  let pricing: VedaraKB['pricing'] = null;
  try {
    const config = await loadPricingConfig(supabase);
    const adultAge = config.settings.adultAgeThreshold;
    cottages = cottages.map((c: any) => {
      const engine = config.cottages.find((e) => e.id === c.id);
      return {
        ...c,
        fromRate: engine ? lowestFromRate(engine.id, config) : null,
        publicDescriptor: engine?.publicDescriptor ?? null,
        maxAdults: engine?.maxAdults ?? c.capacity,
        allowsExtraMattress: engine?.allowsExtraMattress ?? false,
      };
    });
    pricing = {
      adultAgeThreshold: adultAge,
      adultBreakfast: config.breakfastBands.find((b) => b.isActive && b.minAge >= adultAge)?.pricePerNight ?? null,
      childBreakfast: config.breakfastBands
        .filter((b) => b.isActive && b.maxAge < adultAge)
        .map((b) => ({ minAge: b.minAge, maxAge: b.maxAge, price: b.pricePerNight })),
      mattressPrice: config.settings.extraMattressPrice,
    };
  } catch (err) {
    console.error('Knowledge base: pricing unavailable', err);
  }

  cachedKB = {
    pricing,
    cottages,
    menu: menuRes.data || [],
    testimonials: testimonialsRes.data || [],
    faqs: faqsRes.data || [],
    packages: packagesRes.data || [],
    settings,
  };

  return cachedKB;
}

export function buildCottageContext(cottages: any[]): string {
  return cottages.map(c => {
    let amenities: string[] = [];
    try { amenities = typeof c.amenities === 'string' ? JSON.parse(c.amenities) : (c.amenities || []); } catch { amenities = []; }
    const price = c.fromRate ? `from ₹${c.fromRate}/night room only (2 adults, varies by season, day and occupancy)` : `₹${c.pricePerNight}/night`;
    const occupancy = c.publicDescriptor || `${c.capacity} guests`;
    return `- ${c.name} (${occupancy}): ${price}, ${c.bedrooms}BR/${c.bathrooms}BA, ${c.size || 'N/A'} sqft. ${c.shortDesc || ''}. Amenities: ${amenities.slice(0, 5).join(', ')}.`;
  }).join('\n');
}

export function buildMenuContext(menu: any[]): string {
  return menu.map(cat => {
    const items = (cat.items || []).map((item: any) => `${item.name} ₹${item.price}${item.isVegetarian ? ' (Veg)' : ''}`).join(', ');
    return `- ${cat.name}: ${items}`;
  }).join('\n');
}

export function buildFAQContext(faqs: any[]): string {
  return faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');
}

export function buildTestimonialContext(testimonials: any[]): string {
  return testimonials.map(t => `"${t.content}" - ${t.name} (${t.rating}/5 stars)`).join('\n');
}

const VEDARA_SYSTEM_PROMPT = `You are Vedara's AI mountain concierge — warm, knowledgeable, and passionate about The Vedara retreat in Jibhi, Himachal Pradesh.

CORE IDENTITY:
- You work for The Vedara, a boutique Himalayan retreat in Ghiyagi, Jibhi, Himachal Pradesh
- You are warm, helpful, and deeply knowledgeable about the property and region
- Always respond in a friendly, conversational tone
- Keep responses concise but informative (2-4 sentences typically)
- Use emojis sparingly and naturally (🏔️ 🌿 ☕ ✨)

KNOWLEDGE:
- 7 accommodations: 3 Premium Duplex Family Suites, 3 Intimate Mountain View Suites, 1 Cozy Alpine Studio
- The Perch serves breakfast (7:30-10AM), lunch (12-3:30PM), dinner (7-10PM)
- Check-in: 1:00 PM, Check-out: 11:00 AM
- Contact: +91-91188-82242
- Location: Ghiyagi, Jibhi, Himachal Pradesh
- Two rate plans: Room Only, or Breakfast Included (₹400 per adult per night; children 0-5 free, 6-11 ₹250 per night)
- Children up to 11 stay free when sharing existing bedding; guests 12+ count as adults
- Extra mattress (₹1,250/night) only in Whistling Thrush, Monal Haven and Koklass Cove
- Stay 4 nights, pay for 3 (Value and Regular seasons); GST extra as applicable
- Room heater available (₹600/night in winter)
- Pets not allowed
- Free WiFi throughout
- Free parking

NEARBY ATTRACTIONS:
- Jibhi Waterfall (4 km)
- Mini Thailand (1.2 km)
- Jalori Pass (10 km)
- Serolsar Lake (10 km + trek)
- Great Himalayan National Park

EXPERIENCES:
- Bonfire nights with music and stargazing
- Guided nature walks and forest trails
- The Perch with artisan coffee and wood-fired meals
- Mountain mornings with sunrise views
- Live acoustic music nights
- Lambhari Top trek
- Kids Zone activities

POLICIES:
- Free cancellation 15+ days before (90% refund)
- 8-15 days: 50% refund
- Less than 7 days: no refund
- Valid ID required at check-in (Aadhaar/Passport/DL for Indians, Passport for foreigners)
- No smoking in rooms
- Quiet hours: 11 PM - 7 AM

RULES:
- Always be helpful and accurate
- If you don't know something specific, suggest calling +91-91188-82242
- For bookings, direct to /booking page
- For café orders, direct to /cafe page
- Never make up prices or availability — use the data provided
- If asked about something unrelated to The Vedara, politely redirect`;

export function buildChatSystemMessage(kb: VedaraKB): string {
  const cottageCtx = buildCottageContext(kb.cottages);
  const menuCtx = buildMenuContext(kb.menu);
  const faqCtx = buildFAQContext(kb.faqs);
  const testimonialCtx = buildTestimonialContext(kb.testimonials);

  return `${VEDARA_SYSTEM_PROMPT}

CURRENT COTTAGE DATA:
${cottageCtx}

CURRENT CAFÉ MENU:
${menuCtx}

FAQs:
${faqCtx}

GUEST REVIEWS:
${testimonialCtx}

When answering, use this real-time data to give accurate, specific answers. Always reference actual cottage names, prices, and menu items.`;
}

const TRIP_PLANNER_PROMPT = `You are a Himalayan travel curator for The Vedara retreat in Jibhi, Himachal Pradesh.

Create a personalized day-by-day itinerary based on the user's preferences. Use the actual cottage names, nearby attractions, and café items from the data provided.

RULES:
- Return ONLY valid JSON (no markdown, no explanation)
- Include 2-5 days depending on the trip type
- Each day should have 3-5 activities with realistic timings
- Include actual cottage recommendations
- Include actual café meals
- Include 3-4 practical tips
- Be specific with distances and timings

JSON SCHEMA:
{
  "title": "string - evocative trip title",
  "description": "string - 1-2 sentence summary",
  "cottage": "string - recommended cottage name",
  "cottagePrice": "string - price per night",
  "totalEstimate": "string - estimated total cost",
  "itinerary": [
    {
      "day": "string - e.g. 'Day 1 – Arrival & First Impressions'",
      "activities": [
        {
          "time": "string - e.g. '2:00 PM'",
          "activity": "string - what to do",
          "icon": "string - one of: Mountain, Coffee, TreePine, Star, Compass, MapPin, Sparkles, Users",
          "location": "string - where this happens"
        }
      ]
    }
  ],
  "tips": ["string - practical tip 1", "string - practical tip 2", "string - practical tip 3", "string - practical tip 4"]
}`;

export { TRIP_PLANNER_PROMPT };

// === LOCAL JIBHI KNOWLEDGE ===

export const JIBHI_LOCAL = {
  busStations: [
    { name: 'Jibhi Bus Stop', distance: '0.5 km', description: 'Local village bus stop, walking distance from The Vedara. Shared jeeps and local HRTC buses.' },
    { name: 'Banjar Bus Stand', distance: '8 km (15 min)', description: 'Main transit hub. HRTC buses to Aut, Kullu, Manali, Jalori Pass, Shoja. Buses every 45-60 min, 7:30 AM - 5 PM.' },
    { name: 'Aut Bus Stand', distance: '28 km (45 min)', description: 'Highway stop on NH3. Volvo/ordinary buses to Delhi, Chandigarh, Manali. Key transfer point.' },
    { name: 'Bhuntar Bus Stand', distance: '56 km (1.5 hrs)', description: 'Near Kullu-Manali Airport. Buses to Kullu, Manali, Leh.' },
  ],
  busTimings: {
    banjarToJibhi: 'Every 45-60 min, 7:30 AM - 5:00 PM. Fare: ₹20. Duration: 20-25 min.',
    autToBanjar: 'Every 30-45 min, 6:30 AM onwards. Fare: ₹40-70. Duration: 30-40 min.',
    delhiToAut: 'Overnight Volvo from ISBT Kashmere Gate. 11-12 hours. ₹1,200-1,600.',
    chandigarhToAut: 'Manali-bound buses. 6-7 hours. ₹800-1,200.',
  },
  taxiFares: {
    banjarToJibhi: '₹400-600 (union rate, 15 min)',
    autToJibhi: '₹1,200-1,500 (hatchback), ₹1,800-2,200 (SUV)',
    bhuntarToJibhi: '₹1,500-2,000',
    chandigarhToJibhi: '₹5,000-6,000',
  },
  police: [
    { name: 'Banjar Police Station (SHO)', phone: '01903-221227', email: 'police.banjar-hp@nic.in', distance: '8 km' },
    { name: 'Police Post, Sainj', phone: '01903-230065', distance: '25 km' },
    { name: 'SP Office, Kullu', phone: '01902-224700', email: 'sp-kul-hp@nic.in', distance: '75 km' },
    { name: 'Emergency (All)', phone: '112', distance: 'N/A' },
  ],
  hospitals: [
    { name: 'Civil Hospital Banjar', phone: '01903-221214', distance: '8 km', type: 'Government Hospital' },
    { name: 'Arushi Nursing Home, Banjar', phone: '94180-98544', distance: '8 km', type: 'Private Nursing Home' },
    { name: 'Community Health Centre, Sainj', phone: 'N/A', distance: '25 km', type: 'Government CHC' },
    { name: 'Ajay Sharma Clinic, Sainj', phone: '98164-73116', distance: '25 km', type: 'Private Clinic' },
    { name: 'LLR Hospital, Kullu', phone: '01902-222361', distance: '75 km', type: 'Major Government Hospital' },
    { name: 'Ambulance', phone: '108', distance: 'N/A', type: 'Emergency Ambulance' },
  ],
  atms: [
    { name: 'SBI ATM, Jibhi', bank: 'State Bank of India', distance: '0.5 km', note: 'Only ATM in Jibhi village. Reliability varies.' },
    { name: 'PNB ATM, Banjar', bank: 'Punjab National Bank', distance: '8 km', note: 'Reliable' },
    { name: 'SBI ATM, Banjar', bank: 'State Bank of India', distance: '8 km', note: 'Reliable' },
    { name: 'HDFC ATM, Banjar', bank: 'HDFC Bank', distance: '8 km', note: 'Reliable' },
    { name: 'ICICI ATM, Banjar', bank: 'ICICI Bank', distance: '8 km', note: 'Reliable' },
  ],
  petrol: [
    { name: 'HP Petrol Pump, Banjar', distance: '8 km' },
    { name: 'IOC Petrol Pump, Aut', distance: '28 km' },
  ],
  mobileNetwork: [
    { provider: 'BSNL', reliability: 'Best in area', note: 'Most reliable signal in Jibhi valley' },
    { provider: 'Airtel', reliability: 'Good', note: 'Works in most spots' },
    { provider: 'Jio', reliability: 'Patchy', note: 'Signal can be weak/intermittent' },
  ],
  nearestAirport: { name: 'Kullu-Manali Airport (Bhuntar)', code: 'KUU', distance: '56 km (1.5-2 hrs)', airlines: 'IndiGo, Air India from Delhi', note: 'Flights frequently cancelled in bad weather. Always have road backup.' },
  nearestRailway: { name: 'Jogindernagar', distance: '95 km (3 hrs)', gauge: 'Narrow gauge toy train from Pathankot', note: 'Scenic but very slow (6+ hrs for 165 km). Chandigarh (230 km) is more practical.' },
  emergencyNumbers: {
    police: '100',
    ambulance: '108',
    fire: '101',
    disaster: '108',
    touristHelpline: '1363',
    edinburgh: '112',
  },
};

// === LIVE WEATHER ===

export interface JibhiWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
  uvIndex: number;
  forecast: { day: string; high: number; low: number; description: string; icon: string; rainChance: number }[];
}

let cachedWeather: JibhiWeather | null = null;
let weatherCacheTime = 0;
const WEATHER_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export async function getJibhiWeather(): Promise<JibhiWeather | null> {
  const now = Date.now();
  if (cachedWeather && now - weatherCacheTime < WEATHER_CACHE_TTL) return cachedWeather;

  try {
    // Open-Meteo free API — Jibhi coordinates: 31.75°N, 77.25°E
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=31.75&longitude=77.25&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,uv_index&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=Asia/Kolkata&forecast_days=7';
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const data = await res.json();

    const current = data.current;
    const daily = data.daily;

    const weatherCodes: Record<number, { desc: string; icon: string }> = {
      0: { desc: 'Clear sky', icon: '☀️' },
      1: { desc: 'Mainly clear', icon: '🌤️' },
      2: { desc: 'Partly cloudy', icon: '⛅' },
      3: { desc: 'Overcast', icon: '☁️' },
      45: { desc: 'Foggy', icon: '🌫️' },
      48: { desc: 'Depositing rime fog', icon: '🌫️' },
      51: { desc: 'Light drizzle', icon: '🌦️' },
      53: { desc: 'Moderate drizzle', icon: '🌦️' },
      55: { desc: 'Dense drizzle', icon: '🌧️' },
      61: { desc: 'Slight rain', icon: '🌦️' },
      63: { desc: 'Moderate rain', icon: '🌧️' },
      65: { desc: 'Heavy rain', icon: '🌧️' },
      71: { desc: 'Slight snow', icon: '❄️' },
      73: { desc: 'Moderate snow', icon: '❄️' },
      75: { desc: 'Heavy snow', icon: '❄️' },
      80: { desc: 'Slight rain showers', icon: '🌦️' },
      81: { desc: 'Moderate rain showers', icon: '🌧️' },
      82: { desc: 'Violent rain showers', icon: '⛈️' },
      85: { desc: 'Slight snow showers', icon: '🌨️' },
      86: { desc: 'Heavy snow showers', icon: '❄️' },
      95: { desc: 'Thunderstorm', icon: '⛈️' },
      96: { desc: 'Thunderstorm with hail', icon: '⛈️' },
      99: { desc: 'Thunderstorm with heavy hail', icon: '⛈️' },
    };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const forecast = daily.time.slice(0, 7).map((date: string, i: number) => {
      const d = new Date(date + 'T00:00:00');
      const code = daily.weather_code[i];
      const info = weatherCodes[code] || { desc: 'Unknown', icon: '🌡️' };
      return {
        day: i === 0 ? 'Today' : dayNames[d.getDay()],
        high: Math.round(daily.temperature_2m_max[i]),
        low: Math.round(daily.temperature_2m_min[i]),
        description: info.desc,
        icon: info.icon,
        rainChance: daily.precipitation_probability_max[i] || 0,
      };
    });

    const currentCode = current.weather_code;
    const currentInfo = weatherCodes[currentCode] || { desc: 'Unknown', icon: '🌡️' };

    cachedWeather = {
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      description: currentInfo.desc,
      icon: currentInfo.icon,
      uvIndex: current.uv_index,
      forecast,
    };
    weatherCacheTime = now;
    return cachedWeather;
  } catch {
    return null;
  }
}
