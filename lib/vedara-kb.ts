import { supabase } from './supabase';

export interface VedaraKB {
  cottages: any[];
  menu: any[];
  testimonials: any[];
  faqs: any[];
  packages: any[];
  settings: Record<string, any>;
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

  cachedKB = {
    cottages: cottagesRes.data || [],
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
    return `- ${c.name} (${c.category || 'Cottage'}): ₹${c.pricePerNight}/night, ${c.capacity} guests, ${c.bedrooms}BR/${c.bathrooms}BA, ${c.size || 'N/A'} sqft. ${c.shortDesc || ''}. Amenities: ${amenities.slice(0, 5).join(', ')}.`;
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
- Café Charade serves breakfast (7:30-10AM), lunch (12-3:30PM), dinner (7-10PM)
- Check-in: 1:00 PM, Check-out: 11:00 AM
- Contact: +91-91188-82242
- Location: Ghiyagi, Jibhi, Himachal Pradesh
- Complimentary breakfast included with every stay
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
- Café Charade with artisan coffee and wood-fired meals
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
