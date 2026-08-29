import { NextRequest, NextResponse } from 'next/server';
import { getVedaraKB, getJibhiWeather, JIBHI_LOCAL } from '@/lib/vedara-kb';

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();
    if (!message) return NextResponse.json({ reply: 'How can I help you today?' });

    const kb = await getVedaraKB();
    const lower = message.toLowerCase();
    let reply = '';

    // === GREETINGS ===
    if (/^(hi|hello|hey|namaste|good morning|good evening|good night|howdy|yo)\b/i.test(lower)) {
      const greetings = [
        'Namaste! 🏔️ Welcome to The Vedara. I\'m your mountain concierge — ask me about our cottages, café, nearby treks, local services, weather, or anything about your stay in Jibhi!',
        'Hey there! 🌿 Great to hear from you. Whether you\'re planning a trip, need local info, or just curious about The Vedara, I\'m here to help!',
        'Namaste! ✨ I\'m Vedara\'s AI concierge. What would you like to know — our cottages, the café, local adventures, emergency contacts, or weather updates?',
      ];
      reply = greetings[Math.floor(Math.random() * greetings.length)];
    }

    // === LIVE WEATHER ===
    else if (/\b(weather|temperature)\b|\brain\b|\bforecast\b|how.*hot|how.*cold|current.*temp|today.*weather/i.test(lower)) {
      const weather = await getJibhiWeather();
      if (weather) {
        const now = new Date();
        const hour = now.getHours();
        const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
        const forecastStr = weather.forecast.slice(0, 5).map(f =>
          `${f.day}: ${f.icon} ${f.low}°-${f.high}°C, ${f.description}${f.rainChance > 0 ? ` (${f.rainChance}% rain)` : ''}`
        ).join('\n');

        reply = `${timeGreeting}! Here's the live weather for Jibhi right now:\n\n${weather.icon} **Currently:** ${weather.temperature}°C (feels like ${weather.feelsLike}°C)\n☁️ ${weather.description}\n💧 Humidity: ${weather.humidity}%\n💨 Wind: ${weather.windSpeed} km/h\n☀️ UV Index: ${weather.uvIndex}\n\n📅 **${weather.forecast.length}-Day Forecast:**\n${forecastStr}\n\n💡 Jibhi sits at 2,250m. Even in summer, evenings are cool — carry a light jacket!`;
      } else {
        reply = 'I couldn\'t fetch live weather right now, but here\'s what I know about Jibhi\'s climate:\n\n🌡️ **Current Season (August):** Monsoon season. Expect 16-23°C, frequent rain showers, and misty mornings. Carry rain gear!\n\n📅 **Best Times:**\n🌸 Spring (Mar-May): 15-25°C, wildflowers\n☀️ Summer (Jun-Aug): 10-23°C, lush green\n🍂 Autumn (Sep-Nov): 10-20°C, clear skies\n❄️ Winter (Dec-Feb): 0-10°C, possible snow\n\nFor real-time weather, check weather.com or search "Jibhi weather" online.';
      }
    }

    // === EMERGENCY / POLICE / HOSPITAL ===
    else if (/emergency|police|hospital|accident|ambulance|fire|help|urgent|sos|disaster/i.test(lower)) {
      const isPolice = /police|cop|station|fir|crime/i.test(lower);
      const isMedical = /hospital|medical|doctor|clinic|health|ambulance|sick|ill|injury|accident/i.test(lower);
      const isFire = /fire|burn/i.test(lower);

      let header = '🚨 **Emergency & Essential Contacts for Jibhi Area:**\n\n';

      if (isPolice) {
        header += '👮 **Police:**\n';
        header += JIBHI_LOCAL.police.map(p => `• ${p.name}: ${p.phone}${p.email ? ` | ${p.email}` : ''} (${p.distance})`).join('\n');
        header += '\n\n📞 **Emergency Number:** 112 (All emergencies)\n📞 **Tourist Helpline:** 1363';
      } else if (isMedical) {
        header += '🏥 **Medical Facilities:**\n';
        header += JIBHI_LOCAL.hospitals.map(h => `• ${h.name}: ${h.phone} (${h.type}, ${h.distance})`).join('\n');
        header += '\n\n🚑 **Ambulance:** 108\n📞 **Emergency:** 112';
      } else if (isFire) {
        header += '🚒 **Fire Emergency:**\n• Fire Brigade: 101\n• Emergency (All): 112\n• Banjar Police Station: 01903-221227';
      } else {
        header += '👮 **Police:**\n';
        header += JIBHI_LOCAL.police.map(p => `• ${p.name}: ${p.phone} (${p.distance})`).join('\n');
        header += '\n\n🏥 **Hospitals:**\n';
        header += JIBHI_LOCAL.hospitals.slice(0, 3).map(h => `• ${h.name}: ${h.phone} (${h.distance})`).join('\n');
        header += '\n\n📞 **Quick Emergency Numbers:**\n';
        header += `• Police: ${JIBHI_LOCAL.emergencyNumbers.police}\n`;
        header += `• Ambulance: ${JIBHI_LOCAL.emergencyNumbers.ambulance}\n`;
        header += `• Fire: ${JIBHI_LOCAL.emergencyNumbers.fire}\n`;
        header += `• Disaster: ${JIBHI_LOCAL.emergencyNumbers.disaster}\n`;
        header += `• Tourist Helpline: ${JIBHI_LOCAL.emergencyNumbers.touristHelpline}\n`;
        header += `• Universal Emergency: ${JIBHI_LOCAL.emergencyNumbers.edinburgh}`;
      }
      reply = header;
    }

    // === TRAIN / RAILWAY ===
    else if (/train|railway|rail|jogindernagar|chandigarh.*train/i.test(lower)) {
      reply = '🚂 **Nearest Railway Stations:**\n\n1️⃣ **Jogindernagar** (95 km, 3 hrs)\n   • Narrow gauge toy train from Pathankot\n   • Scenic but very slow (6+ hrs for 165 km)\n   • Then taxi/bus to Jibhi\n\n2️⃣ **Chandigarh** (230 km, 6-7 hrs by road) — **Recommended**\n   • Major station with good connectivity\n   • Take Manali bus from Chandigarh ISBT to Aut\n   • Then local bus/taxi to Jibhi\n\n💡 Most travelers find Chandigarh the most practical rail hub.';
    }

    // === BUS / TRANSPORT ===
    else if (/bus|stand|busstop|bus.*stop|busstand|hrtc|volvo|shared.*jeep|jeep|station(?!.*train)/i.test(lower)) {
      if (/aut|tunnel/i.test(lower)) {
        reply = '🚌 **Aut Bus Stand (28 km, 45 min):**\n\n• Key highway stop on NH3 (Delhi-Manali route)\n• Volvo/ordinary buses to Delhi, Chandigarh, Manali\n• Delhi to Aut: Overnight Volvo, 11-12 hrs, ₹1,200-1,600\n• Aut to Banjar: Local HRTC bus every 30-45 min, ₹40-70\n• After 5 PM: Hire taxi ₹500-700\n\n**Aut to Jibhi taxi:** ₹1,200-1,500 (hatchback), ₹1,800-2,200 (SUV)';
      } else if (/banjar/i.test(lower)) {
        reply = '🚌 **Banjar Bus Stand (8 km, 15 min):**\n\n• Main transit hub of the valley\n• HRTC buses to Aut, Kullu, Manali, Jalori Pass, Shoja\n• Frequency: Every 45-60 min, 7:30 AM - 5:00 PM\n• Banjar to Jibhi: ₹20 bus fare, 20-25 min\n• Taxi from Banjar: ₹400-600 (union rate)\n• Also has: ATMs (PNB, SBI, HDFC, ICICI), hospital, market';
      } else if (/delhi|kashmere/i.test(lower)) {
        reply = '🚌 **Delhi to Jibhi by Bus:**\n\n1️⃣ Delhi ISBT Kashmere Gate → Aut (overnight Volvo)\n   • HRTC/ private buses, 11-12 hours\n   • Fare: ₹725 (ordinary) to ₹1,200-1,600 (Volvo/AC)\n   • Departures: Evening (5-9 PM)\n\n2️⃣ Aut → Banjar (local bus)\n   • 30-40 min, ₹40-70\n\n3️⃣ Banjar → Jibhi (local bus)\n   • 20-25 min, ₹20\n\n💡 **Total cost:** ₹1,200-1,700 per person\n💡 **Tip:** Tell conductor "Jibhi" — some buses go direct to Banjar.';
      } else if (/chandigarh/i.test(lower)) {
        reply = '🚌 **Chandigarh to Jibhi:**\n\n• Distance: 230 km (6-7 hours by road)\n• Route: Chandigarh → Kiratpur → Mandi → Aut → Banjar → Jibhi\n• Manali-bound buses from Chandigarh ISBT stop at Aut\n• Use Kiratpur-Mandi tunnels for faster route\n• Taxi: ₹5,000-6,000 one way\n\n💡 Board any Manali bus and alight at Aut, then local connections.';
      } else {
        const busInfo = JIBHI_LOCAL.busStations.map(b => `• **${b.name}** (${b.distance}): ${b.description}`).join('\n');
        reply = `🚌 **Bus Stations Near The Vedara:**\n\n${busInfo}\n\n⏰ **Key Timings:**\n• Banjar to Jibhi: Every 45-60 min, 7:30 AM-5 PM, ₹20\n• Aut to Banjar: Every 30-45 min, ₹40-70\n• Delhi to Aut: Overnight Volvo, ₹1,200-1,600\n\n🎫 **Tip:** Banjar Bus Stand is the main hub — most routes connect from here.`;
      }
    }

    // === TAXI / CAB ===
    else if (/taxi|cab|uber|ola|booking.*cab|hire.*car|private.*car/i.test(lower)) {
      reply = '🚕 **Taxi & Cab Services:**\n\n**Local Taxi Union Rates:**\n• Banjar → Jibhi: ₹400-600 (15 min)\n• Aut → Jibhi: ₹1,200-1,500 (hatchback), ₹1,800-2,200 (SUV)\n• Bhuntar → Jibhi: ₹1,500-2,000\n• Chandigarh → Jibhi: ₹5,000-6,000\n\n**Note:** No Uber/Ola in this area. Use local taxi unions at Banjar Bus Stand or Aut.\n\n📞 **For pre-booked cabs:** Contact us at +91-91188-82242 — we can arrange pickup from Aut, Bhuntar, or Banjar.';
    }

    // === FLIGHT / AIRPORT ===
    else if (/flight|airport|fly|plane|bhuntar|kullu.*airport/i.test(lower)) {
      reply = '✈️ **Nearest Airport:** Kullu-Manali Airport (Bhuntar)\n\n📍 **Distance:** 56 km from Jibhi (1.5-2 hours by taxi)\n🎫 **Airlines:** IndiGo, Air India (from Delhi)\n💰 **Taxi fare:** ₹1,500-2,000\n\n⚠️ **Important:** Flights to Bhuntar are frequently cancelled due to mountain weather. Always have a road backup plan!\n\n💡 **Tip:** WhatsApp us at +91-91188-82242 for trusted cab referral from Bhuntar.';
    }

    // === ATMS / CASH / MONEY ===
    else if (/atm|cash|money|bank|withdraw|upi|payment|pay.*bill/i.test(lower)) {
      reply = '💰 **ATMs & Money in Jibhi:**\n\n**ATM in Jibhi:**\n• SBI ATM (0.5 km from The Vedara) — reliability varies\n\n**ATMs in Banjar (8 km, more reliable):**\n• PNB, SBI, HDFC, ICICI\n\n💡 **Pro Tips:**\n• Withdraw cash in Banjar before reaching Jibhi\n• Carry sufficient cash — taxis and market vendors are cash-only\n• UPI is accepted at many cafes and guesthouses now\n• The nearest reliable ATMs are all in Banjar';
    }

    // === MOBILE / NETWORK / WIFI ===
    else if (/wifi|internet|mobile|network|signal|sim|airtel|jio|bsnl|phone.*signal/i.test(lower)) {
      reply = '📶 **Mobile Network & WiFi at Jibhi:**\n\n**Mobile Networks:**\n• **BSNL** — Most reliable in the area ✅\n• **Airtel** — Works in most spots\n• **Jio** — Patchy, can be weak\n\n**WiFi:** Complimentary high-speed WiFi available at The Vedara — in all cottages, café, and common areas.\n\n💡 **Pro Tips:**\n• Download offline maps before your trip\n• BSNL has the best coverage in remote treks\n• Mobile signal can be weak on trails — inform someone before trekking';
    }

    // === PETROL / FUEL ===
    else if (/petrol|diesel|fuel|gas|fill.*tank|petrol.*pump|gas.*station/i.test(lower)) {
      reply = '⛽ **Fuel Stations Near Jibhi:**\n\n• **HP Petrol Pump, Banjar** — 8 km\n• **IOC Petrol Pump, Aut** — 28 km\n\n⚠️ Fuel stations are sparse on the mountain roads. Fill up your tank in Aut or before Banjar! No fuel station in Jibhi village.';
    }

    // === PRICE / RATES ===
    else if (/price|rate|cost|tariff|how much|expensive|budget|cheapest|affordable/i.test(lower)) {
      const sorted = [...kb.cottages].sort((a, b) => a.pricePerNight - b.pricePerNight);
      const cheapest = sorted[0];
      const expensive = sorted[sorted.length - 1];
      reply = `Our cottage rates range from ₹${cheapest.pricePerNight} to ₹${expensive.pricePerNight} per night:\n\n${kb.cottages.map(c => `• ${c.name} — ₹${c.pricePerNight}/night (${c.category})`).join('\n')}\n\n💡 Prices are exclusive of 12% GST. Complimentary breakfast is included with every stay! Book at /booking`;
    }

    // === COTTAGE LIST ===
    else if (/cottage|room|accommodation|suite|stay|staying|which.*room|room.*type|room.*available/i.test(lower)) {
      if (/duplex|family|large|big|group|4\s*guest/i.test(lower)) {
        const duplexes = kb.cottages.filter(c => c.category?.includes('Duplex'));
        reply = `Premium Duplex Family Suites:\n\n${duplexes.map(c => `• ${c.name} — ₹${c.pricePerNight}/night, ${c.capacity} guests, ${c.size} sqft`).join('\n')}\n\nPrivate jacuzzis, attic yoga balconies, dual balconies. Details at /cottages`;
      } else if (/intimate|couple|solo|small|cozy|view.*suite/i.test(lower)) {
        const suites = kb.cottages.filter(c => c.category?.includes('Mountain View'));
        reply = `Intimate Mountain View Suites:\n\n${suites.map(c => `• ${c.name} — ₹${c.pricePerNight}/night, ${c.capacity} guests, ${c.size} sqft`).join('\n')}\n\nPanoramic balconies, blackout curtains, mountain views. Browse at /cottages`;
      } else if (/studio|solo|cheapest|budget/i.test(lower)) {
        reply = `The Finch Nook — Cozy Alpine Studio: ₹5,000/night\n\n120 sqft, wooden paneling, study desk, queen bed. Perfect for solo travelers. Check it out at /cottages`;
      } else {
        reply = `7 unique stays at The Vedara:\n\nPremium Duplex Family Suites (3):\n${kb.cottages.filter(c => c.category?.includes('Duplex')).map(c => `  • ${c.name} — ₹${c.pricePerNight}/night`).join('\n')}\n\nIntimate Mountain View Suites (3):\n${kb.cottages.filter(c => c.category?.includes('Mountain View')).map(c => `  • ${c.name} — ₹${c.pricePerNight}/night`).join('\n')}\n\nCozy Alpine Studio (1):\n  • The Finch Nook — ₹5,000/night\n\nAll include complimentary breakfast! /cottages`;
      }
    }

    // === SPECIFIC COTTAGE ===
    else if (/monal|koklass|magpie|whistling|flycatcher|bulbul|finch/i.test(lower)) {
      const cottage = kb.cottages.find(c => lower.includes(c.name.toLowerCase().split(' ')[0]));
      if (cottage) {
        let amenities: string[] = [];
        try { amenities = typeof cottage.amenities === 'string' ? JSON.parse(cottage.amenities) : (cottage.amenities || []); } catch { amenities = []; }
        reply = `✨ ${cottage.name}\n${cottage.category} — ₹${cottage.pricePerNight}/night\n\n${cottage.shortDesc || cottage.description?.substring(0, 150)}\n\n📏 ${cottage.size} sqft | 👥 ${cottage.capacity} guests | 🛏️ ${cottage.bedrooms}BR | 🚿 ${cottage.bathrooms}BA\n\nAmenities: ${amenities.slice(0, 6).join(', ')}\n\nDetails at /cottages/slug/${cottage.slug}`;
      } else {
        reply = 'I couldn\'t find that specific cottage. We have 7 cottages — Monal Haven, Koklass Cove, Magpie Retreat, Whistling Thrush, Flycatcher Nook, Bulbul Nest, and The Finch Nook. Which one interests you?';
      }
    }

    // === CAFÉ / FOOD ===
    else if (/cafe|café|menu|food|eat|breakfast|lunch|dinner|coffee|drink|meal|hungry|restaurant|charade/i.test(lower)) {
      if (/breakfast|morning/i.test(lower)) {
        const breakfast = kb.menu.find((c: any) => c.name?.toLowerCase().includes('breakfast'));
        if (breakfast) {
          const items = (breakfast.items || []).slice(0, 8).map((i: any) => `• ${i.name} — ₹${i.price}`).join('\n');
          reply = `☀️ Café Charade — Breakfast (7:30 AM – 10:00 AM)\n\n${items}\n\nAll breakfasts complimentary with your stay! Full menu at /cafe`;
        } else {
          reply = 'Breakfast served 7:30-10:00 AM at Café Charade, complimentary with every stay. Full menu at /cafe';
        }
      } else if (/coffee|tea|drink|beverage/i.test(lower)) {
        const bev = kb.menu.find((c: any) => c.name?.toLowerCase().includes('beverage'));
        if (bev) {
          const items = (bev.items || []).slice(0, 8).map((i: any) => `• ${i.name} — ₹${i.price}`).join('\n');
          reply = `☕ Café Charade — Beverages:\n\n${items}\n\nHimalayan Cold Coffee and Filter Coffee are guest favourites! /cafe`;
        } else {
          reply = 'Artisan coffees, herbal teas, fresh juices at Café Charade. Full menu at /cafe ☕';
        }
      } else {
        const cats = kb.menu.map((c: any) => `• ${c.name} (${(c.items || []).length} items)`).join('\n');
        reply = `🍽️ Café Charade Menu:\n\n${cats}\n\n📍 Hours: Breakfast 7:30-10AM | Lunch 12-3:30PM | Dinner 7-10PM\nBrowse & order at /cafe`;
      }
    }

    // === BOOKING ===
    else if (/book|reserve|availability|available|check.?in|check.?out|date|vacancy/i.test(lower)) {
      reply = `📅 To book at The Vedara:\n\n1. Visit /booking for real-time availability\n2. Select dates, cottage, guests\n3. Pay securely via Razorpay\n\nCheck-in: 1:00 PM | Check-out: 11:00 AM\nComplimentary breakfast included!\n\nHelp? Call +91-91188-82242`;
    }

    // === CANCELLATION ===
    else if (/cancel|refund|reschedule|modify.*booking/i.test(lower)) {
      reply = `📋 Cancellation Policy:\n\n✅ 15+ days: 90% refund\n✅ 8-15 days: 50% refund\n❌ <7 days: No refund\n\nPeak season (Dec-Jan): 21+ days for 50% refund.\n\nCall +91-91188-82242 to cancel/modify. /policies`;
    }

    // === WEATHER (seasons) ===
    else if (/season|when.*visit|best time|summer|winter|monsoon|spring|autumn/i.test(lower)) {
      reply = `🌤️ Best times to visit The Vedara:\n\n🌸 Spring (Mar-May): 15-25°C, wildflowers, perfect treks\n☀️ Summer (Jun-Aug): 10-23°C, lush green, light monsoon\n🍂 Autumn (Sep-Nov): 10-20°C, clear skies, golden foliage\n❄️ Winter (Dec-Feb): 0-10°C, possible snow, cozy fireplaces!\n\nWinter magical but pack warm! Room heaters available (₹600/night).\nBook at /booking`;
    }

    // === THINGS TO DO ===
    else if (/thing.*do|activit|trek|adventure|hike|explore|nearby|attraction|waterfall|pass|lake|park/i.test(lower)) {
      reply = `🏔️ Things to do near The Vedara:\n\n📍 Walking Distance:\n• Jibhi Waterfall — 4 km\n• Mini Thailand — 1.2 km\n\n🚗 Short Drive:\n• Jalori Pass — 10 km (stunning mountain pass)\n• Serolsar Lake — 10 km + trek (sacred alpine lake)\n• Great Himalayan National Park — guided tours\n\n🎒 At The Vedara:\n• Bonfire nights with music & stargazing\n• Guided nature walks & forest trails\n• Lambhari Top sunrise trek\n• Kids Zone\n\nAsk about any specific activity!`;
    }

    // === CHECK-IN/OUT ===
    else if (/check.?in|check.?out|arrival|early.*check|late.*check/i.test(lower)) {
      reply = `🕐 Check-in & Check-out:\n\n✅ Check-in: 1:00 PM\n✅ Check-out: 11:00 AM\n\nReception: 8:00 AM – 10:30 PM\n\nEarly/late check-out on request (subject to availability).\n📞 +91-91188-82242`;
    }

    // === PARKING ===
    else if (/park|car|vehicle|drive|parking/i.test(lower)) {
      reply = '🅿️ Complimentary on-site parking for all guests. Property easily accessible by car — ~480 km from Delhi (10-11 hrs via Mandi-Aut-Larji).';
    }

    // === DIRECTIONS ===
    else if (/how.*reach|direction|location|where.*exactly|address|map|navigate|chandigarh.*jibhi|jibhi.*chandigarh/i.test(lower)) {
      reply = `📍 The Vedara, Ghiyagi, Jibhi, Himachal Pradesh\n\n🚗 By Road: Delhi → Mandi → Aut → Larji → Jibhi (~480 km, 10-11 hrs)\n🚂 By Rail: Chandigarh (230 km, recommended) or Jogindernagar (95 km, slow)\n✈️ By Air: Bhuntar Airport (56 km, 1.5 hrs taxi)\n\n📍 Nearest landmark: Ghiyagi Bus Stop (5 min walk)\n\nGet directions: https://www.google.com/maps/search/The+Vedara+Jibhi`;
    }

    // === PHONE / CONTACT ===
    else if (/phone|contact|call|number|reach.*you|talk.*human/i.test(lower)) {
      reply = `📞 Contact The Vedara:\n\n📱 Phone: +91-91188-82242\n💬 WhatsApp: wa.me/919118882242\n📧 Email: vedararetreat@gmail.com\n\n🕐 Reception: 8:00 AM – 10:30 PM daily`;
    }

    // === REVIEWS ===
    else if (/review|testimonial|what.*people|guest.*say|feedback|rating/i.test(lower)) {
      if (kb.testimonials.length > 0) {
        const random = kb.testimonials.sort(() => Math.random() - 0.5).slice(0, 3);
        reply = `⭐ Guest reviews:\n\n${random.map(t => `"${t.content.substring(0, 120)}..." — ${t.name} (${t.rating}/5)`).join('\n\n')}\n\nBook your own at /booking`;
      } else {
        reply = 'Our guests love The Vedara! Check reviews on Google. Book at /booking ⭐';
      }
    }

    // === GIFTS / PACKAGES ===
    else if (/gift|package|offer|deal|discount|coupon|promo/i.test(lower)) {
      if (kb.packages.length > 0) {
        reply = `🎁 Current packages:\n\n${kb.packages.map(p => `• ${p.title}: ${p.description || 'Special offer'}`).join('\n\n')}\n\nCheck /booking for latest rates!`;
      } else {
        reply = '🎁 Check our website for seasonal offers! Visit /booking or call +91-91188-82242.';
      }
    }

    // === PETS ===
    else if (/pet|dog|cat|animal/i.test(lower)) {
      reply = '🐾 Pets not allowed at The Vedara. Service animals welcome with prior arrangement — call +91-91188-82242.';
    }

    // === SMOKING ===
    else if (/smok|cigarette|vape/i.test(lower)) {
      reply = '🚭 No smoking inside cottages. Designated outdoor areas available.';
    }

    // === QUIET HOURS ===
    else if (/quiet|noise|music|party|night.*time/i.test(lower)) {
      reply = '🌙 Quiet hours: 11:00 PM – 7:00 AM. Live music and bonfires wind down by 10:30 PM.';
    }

    // === ID PROOF ===
    else if (/id|identity|proof|aadhaar|passport/i.test(lower)) {
      reply = '🪪 Valid photo ID required at check-in:\n• Indians: Aadhaar, Passport, or DL\n• Foreigners: Passport\n\nCarry original ID.';
    }

    // === HEATER ===
    else if (/heater|warm|cold|blanket|winter.*gear/i.test(lower)) {
      reply = '❄️ Room heaters complimentary in winter (Nov-Feb). Outside peak winter: ₹600/night. Premium quilts and extra blankets on request.';
    }

    // === SPA / WELLNESS ===
    else if (/spa|massage|wellness|yoga|meditation|relax/i.test(lower)) {
      reply = '🧘 Wellness at The Vedara:\n\n• Morning yoga on cottage balconies\n• Guided meditation in the mountains\n• Forest bathing walks through cedar trails\n• Relaxation areas with mountain views\n\nAsk about wellness sessions during your stay!';
    }

    // === DISTANCE / HOW FAR ===
    else if (/how far|distance|km|kilometer|how.*long.*drive|how.*long.*take/i.test(lower)) {
      reply = '📏 Distances from The Vedara:\n\n• Jibhi Village Center: 0.5 km\n• Jibhi Waterfall: 4 km\n• Mini Thailand: 1.2 km\n• Banjar: 8 km (15 min)\n• Jalori Pass: 10 km\n• Serolsar Lake: 10 km + trek\n• Aut (highway): 28 km (45 min)\n• Bhuntar Airport: 56 km (1.5 hrs)\n• Kullu: 75 km\n• Mandi: 68 km\n• Chandigarh: 230 km (6-7 hrs)\n• Delhi: 480 km (10-11 hrs)';
    }

    // === LIVE SUPPORT ===
    else if (/live.*support|talk.*human|agent|representative|real.*person/i.test(lower)) {
      reply = '👨‍💼 To connect with our team:\n\n📱 Call: +91-91188-82242 (8 AM - 10:30 PM)\n💬 WhatsApp: wa.me/919118882242';
    }

    // === THANKS ===
    else if (/thank|thanks|thx|appreciate|helpful/i.test(lower)) {
      reply = 'You\'re most welcome! 😊 If you have more questions about The Vedara, local services, or anything else — just ask. Happy planning! 🏔️';
    }

    // === BYE ===
    else if (/bye|goodbye|see you|talk later|ttyl/i.test(lower)) {
      reply = 'Goodbye! 👋 Hope to welcome you to The Vedara soon. We\'re just a message away. Safe travels! 🏔️✨';
    }

    // === HELP ===
    else if (/help|what.*can.*you|what.*do|feature/i.test(lower)) {
      reply = `🤖 I can help with:\n\n🏠 Cottage info & pricing\n🍽️ Café Charade menu\n📅 Booking & availability\n🚌 Transport (bus, taxi, flights, trains)\n📍 Directions & distances\n🌤️ Live weather & best seasons\n🚨 Emergency contacts (police, hospital)\n💰 ATM & cash info\n📶 Mobile network & WiFi\n🗺️ Nearby attractions & treks\n⭐ Guest reviews\n🎒 Activities & wellness\n📞 Contact info\n🎁 Offers\n\nJust ask me anything!`;
    }

    // === INTELLIGENT FALLBACK ===
    else {
      const lowerWords = lower.split(/\s+/);
      const relevantCottage = kb.cottages.find(c => {
        const words = c.name.toLowerCase().split(/\s+/);
        return words.some((w: string) => lowerWords.includes(w));
      });

      if (relevantCottage) {
        reply = `It looks like you're asking about ${relevantCottage.name}! 🏔️\n\n${relevantCottage.name} is a ${relevantCottage.category} at ₹${relevantCottage.pricePerNight}/night, accommodating ${relevantCottage.capacity} guests in ${relevantCottage.size} sqft.\n\nDetails at /cottages/slug/${relevantCottage.slug}\n\nWhat else would you like to know?`;
      } else {
        reply = `I'd be happy to help! I specialize in The Vedara retreat and the Jibhi area:\n\n🏠 Cottage types & pricing\n🍽️ Café menu & dining\n🚌 Transport (bus, taxi, flights, trains)\n🌤️ Live weather updates\n🚨 Emergency contacts\n💰 ATM & cash info\n📍 Directions & distances\n🗺️ Nearby attractions\n\nCould you rephrase, or ask about any of these? You can also call +91-91188-82242 for immediate help.`;
      }
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({ reply: 'I\'m having a momentary hiccup! 🏔️ Please try again, or call +91-91188-82242 for immediate help.' });
  }
}
