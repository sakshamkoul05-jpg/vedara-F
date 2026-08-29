import { NextRequest, NextResponse } from 'next/server';
import { getVedaraKB, buildCottageContext, buildMenuContext, buildFAQContext } from '@/lib/vedara-kb';

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
        'Namaste! 🏔️ Welcome to The Vedara. I\'m your mountain concierge — ask me about our cottages, café menu, nearby treks, or anything about your stay in Jibhi!',
        'Hey there! 🌿 Great to hear from you. Whether you\'re planning a trip or just curious about The Vedara, I\'m here to help!',
        'Namaste! ✨ I\'m Vedara\'s AI concierge. What would you like to know — our cottages, the café, local adventures, or booking details?',
      ];
      reply = greetings[Math.floor(Math.random() * greetings.length)];
    }
    // === PRICING / RATES ===
    else if (/price|rate|cost|tariff|how much|expensive|budget|cheapest|affordable/i.test(lower)) {
      const sorted = [...kb.cottages].sort((a, b) => a.pricePerNight - b.pricePerNight);
      const cheapest = sorted[0];
      const expensive = sorted[sorted.length - 1];
      reply = `Our cottage rates range from ₹${cheapest.pricePerNight} to ₹${expensive.pricePerNight} per night:\n\n${kb.cottages.map(c => `• ${c.name} — ₹${c.pricePerNight}/night (${c.category})`).join('\n')}\n\n💡 Prices are exclusive of 12% GST. Complimentary breakfast is included with every stay! Book at /booking`;
    }
    // === COTTAGE LIST / CATEGORIES ===
    else if (/cottage|room|accommodation|suite|stay|staying|which.*room|room.*type|room.*available/i.test(lower)) {
      if (/duplex|family|large|big|group|4\s*guest/i.test(lower)) {
        const duplexes = kb.cottages.filter(c => c.category?.includes('Duplex'));
        reply = `Our Premium Duplex Family Suites are perfect for families and groups! 🏔️\n\n${duplexes.map(c => `• ${c.name} — ₹${c.pricePerNight}/night, ${c.capacity} guests, ${c.size} sqft`).join('\n')}\n\nThese feature private jacuzzis, attic yoga balconies, and dual balconies with sweeping mountain views. See details at /cottages`;
      } else if (/intimate|couple|solo|small|cozy|view.*suite/i.test(lower)) {
        const suites = kb.cottages.filter(c => c.category?.includes('Mountain View'));
        reply = `Our Intimate Mountain View Suites are designed for couples and solo travelers! 🌿\n\n${suites.map(c => `• ${c.name} — ₹${c.pricePerNight}/night, ${c.capacity} guests, ${c.size} sqft`).join('\n')}\n\nEach features panoramic balconies, blackout curtains, and mountain views. Perfect for a peaceful escape! Browse at /cottages`;
      } else if (/studio|solo|cheapest|budget/i.test(lower)) {
        reply = `The Finch Nook is our Cozy Alpine Studio — ₹5,000/night 👑\n\nA charming 120 sqft retreat with wooden paneling, study desk, queen bed, and all the essentials. Ideal for solo travelers and digital nomads. Check it out at /cottages`;
      } else {
        reply = `We have 7 unique stays at The Vedara:\n\n🏔️ Premium Duplex Family Suites (3):\n${kb.cottages.filter(c => c.category?.includes('Duplex')).map(c => `  • ${c.name} — ₹${c.pricePerNight}/night`).join('\n')}\n\n🌄 Intimate Mountain View Suites (3):\n${kb.cottages.filter(c => c.category?.includes('Mountain View')).map(c => `  • ${c.name} — ₹${c.pricePerNight}/night`).join('\n')}\n\n🪵 Cozy Alpine Studio (1):\n  • The Finch Nook — ₹5,000/night\n\nAll include complimentary breakfast! View details at /cottages`;
      }
    }
    // === SPECIFIC COTTAGE ===
    else if (/monal|koklass|magpie|whistling|flycatcher|bulbul|finch/i.test(lower)) {
      const cottage = kb.cottages.find(c => lower.includes(c.name.toLowerCase().split(' ')[0]));
      if (cottage) {
        let amenities: string[] = [];
        try { amenities = typeof cottage.amenities === 'string' ? JSON.parse(cottage.amenities) : (cottage.amenities || []); } catch { amenities = []; }
        reply = `✨ ${cottage.name}\n${cottage.category} — ₹${cottage.pricePerNight}/night\n\n${cottage.shortDesc || cottage.description?.substring(0, 150)}\n\n📏 ${cottage.size} sqft | 👥 ${cottage.capacity} guests | 🛏️ ${cottage.bedrooms}BR | 🚿 ${cottage.bathrooms}BA\n\nKey amenities: ${amenities.slice(0, 6).join(', ')}\n\nView full details at /cottages/slug/${cottage.slug}`;
      } else {
        reply = 'I couldn\'t find that specific cottage. We have 7 cottages — Monal Haven, Koklass Cove, Magpie Retreat, Whistling Thrush, Flycatcher Nook, Bulbul Nest, and The Finch Nook. Which one interests you?';
      }
    }
    // === CAFÉ / FOOD / MENU ===
    else if (/cafe|café|menu|food|eat|breakfast|lunch|dinner|coffee|drink|meal|hungry|restaurant|charade/i.test(lower)) {
      if (/breakfast|morning/i.test(lower)) {
        const breakfast = kb.menu.find((c: any) => c.name?.toLowerCase().includes('breakfast'));
        if (breakfast) {
          const items = (breakfast.items || []).slice(0, 8).map((i: any) => `• ${i.name} — ₹${i.price}`).join('\n');
          reply = `☀️ Café Charade — Breakfast (7:30 AM – 10:00 AM)\n\n${items}\n\nAll breakfasts are complimentary with your stay! Full menu at /cafe`;
        } else {
          reply = 'Breakfast is served 7:30-10:00 AM at Café Charade and is complimentary with every stay. See the full menu at /cafe';
        }
      } else if (/coffee|tea|drink|beverage/i.test(lower)) {
        const bev = kb.menu.find((c: any) => c.name?.toLowerCase().includes('beverage'));
        if (bev) {
          const items = (bev.items || []).slice(0, 8).map((i: any) => `• ${i.name} — ₹${i.price}`).join('\n');
          reply = `☕ Café Charade — Beverages:\n\n${items}\n\nOur Himalayan Cold Coffee and Filter Coffee are guest favourites! Full menu at /cafe`;
        } else {
          reply = 'We serve artisan coffees, herbal teas, fresh juices, and more at Café Charade. Browse the full menu at /cafe ☕';
        }
      } else {
        const cats = kb.menu.map((c: any) => {
          const count = (c.items || []).length;
          return `• ${c.name} (${count} items)`;
        }).join('\n');
        reply = `🍽️ Café Charade Menu:\n\n${cats}\n\n📍 Hours: Breakfast 7:30-10AM | Lunch 12-3:30PM | Dinner 7-10PM\n\nBrowse & order at /cafe`;
      }
    }
    // === BOOKING ===
    else if (/book|reserve|availability|available|check.?in|check.?out|date|vacancy|occupancy/i.test(lower)) {
      reply = `📅 To book your stay at The Vedara:\n\n1. Visit /booking to check real-time availability\n2. Select your dates, cottage, and guests\n3. Complete payment securely via Razorpay\n\nCheck-in: 1:00 PM | Check-out: 11:00 AM\nComplimentary breakfast included!\n\nNeed help? Call us at +91-91188-82242`;
    }
    // === CANCELLATION / POLICY ===
    else if (/cancel|refund|reschedule|change.*date|modify.*booking/i.test(lower)) {
      reply = `📋 Cancellation Policy:\n\n✅ 15+ days before: 90% refund\n✅ 8-15 days: 50% refund\n❌ Less than 7 days: No refund\n\nPeak season (Dec-Jan) requires 21+ days notice for 50% refund.\n\nTo cancel or modify, call +91-91188-82242 or check /policies for full details.`;
    }
    // === WEATHER / SEASON / BEST TIME ===
    else if (/weather|season|when.*visit|best time|temperature|cold|snow|rain|summer|winter|monsoon/i.test(lower)) {
      reply = `🌤️ Best times to visit The Vedara:\n\n🌸 Spring (Mar-May): Pleasant 15-25°C, blooming wildflowers, perfect for treks\n☀️ Summer (Jun-Aug): Cool 10-20°C, lush green, light monsoon rains\n🍂 Autumn (Sep-Nov): Clear skies 10-20°C, stunning golden foliage\n❄️ Winter (Dec-Feb): Cold 0-10°C, possible snow, cozy fireplaces!\n\nWinter is magical but pack warm! Room heaters available (₹600/night).\nBook at /booking`;
    }
    // === THINGS TO DO / ACTIVITIES / TREKS ===
    else if (/thing.*do|activit|trek|adventure|hike|explore|nearby|attraction|waterfall|pass|lake|park/i.test(lower)) {
      reply = `🏔️ Things to do near The Vedara:\n\n📍 Walking Distance:\n• Jibhi Waterfall — 4 km (easy walk)\n• Mini Thailand — 1.2 km (riverside spot)\n\n🚗 Short Drive:\n• Jalori Pass — 10 km (stunning mountain pass)\n• Serolsar Lake — 10 km + trek (sacred alpine lake)\n• Great Himalayan National Park — guided tours\n\n🎒 At The Vedara:\n• Bonfire nights with music & stargazing\n• Guided nature walks & forest trails\n• Lambhari Top sunrise trek\n• Kids Zone activities\n\nAsk me about any specific activity!`;
    }
    // === CHECK-IN / CHECK-OUT ===
    else if (/check.?in|check.?out|arrival|early.*check|late.*check|time.*arrive/i.test(lower)) {
      reply = `🕐 Check-in & Check-out:\n\n✅ Check-in: 1:00 PM\n✅ Check-out: 11:00 AM\n\nReception: 8:00 AM – 10:30 PM daily\n\nEarly check-in / late check-out available on request (subject to availability). Just let us know your arrival time when booking!\n\n📞 +91-91188-82242`;
    }
    // === WIFI / INTERNET ===
    else if (/wifi|internet|wifi.*password|network|signal/i.test(lower)) {
      reply = `📶 Yes, we have complimentary high-speed WiFi throughout the property — in all cottages, the café, and common areas. The network name and password are provided at check-in.`;
    }
    // === PARKING ===
    else if (/park|car|vehicle|drive|parking/i.test(lower)) {
      reply = `🅿️ Yes, we offer complimentary on-site parking for all guests. The property is easily accessible by car — approximately 480 km from Delhi (10-11 hours drive via Mandi-Aut-Larji).`;
    }
    // === DIRECTIONS / HOW TO REACH ===
    else if (/how.*reach|direction|location|where.*exactly|address|map|GPS|navigate/i.test(lower)) {
      reply = `📍 The Vedara, Ghiyagi, Jibhi, Himachal Pradesh\n\n🚗 By Road: Delhi → Mandi → Aut → Larji → Jibhi (~480 km, 10-11 hrs)\n🚂 By Rail: Nearest station Amb Andaura (~120 km)\n✈️ By Air: Bhuntar Airport, Kullu (~50 km, 1.5 hrs taxi)\n\n📍 Nearest landmark: Ghiyagi Bus Stop (5 min walk)\n\nGet directions: https://www.google.com/maps/search/The+Vedara+Jibhi`;
    }
    // === PHONE / CONTACT ===
    else if (/phone|contact|call|number|reach.*you|talk.*human|speak.*someone/i.test(lower)) {
      reply = `📞 Contact The Vedara:\n\n📱 Phone: +91-91188-82242\n💬 WhatsApp: wa.me/919118882242\n📧 Email: vedararetreat@gmail.com\n\n🕐 Reception: 8:00 AM – 10:30 PM daily\n\nFeel free to call us for immediate assistance!`;
    }
    // === TESTIMONIALS / REVIEWS ===
    else if (/review|testimonial|what.*people|guest.*say|feedback|rating/i.test(lower)) {
      if (kb.testimonials.length > 0) {
        const random = kb.testimonials.sort(() => Math.random() - 0.5).slice(0, 3);
        reply = `⭐ What our guests say:\n\n${random.map(t => `"${t.content.substring(0, 120)}..." — ${t.name} (${t.rating}/5)`).join('\n\n')}\n\nWe\'re proud of our guest experiences! Book your own at /booking`;
      } else {
        reply = 'Our guests love The Vedara! Check out reviews on Google and booking platforms. Ready to create your own memory? Book at /booking ⭐';
      }
    }
    // === GIFTS / PACKAGES ===
    else if (/gift|package|offer|deal|discount|coupon|promo/i.test(lower)) {
      if (kb.packages.length > 0) {
        reply = `🎁 Current packages & offers:\n\n${kb.packages.map(p => `• ${p.title}: ${p.description || 'Special offer'}`).join('\n\n')}\n\nCheck /booking for the latest rates and availability!`;
      } else {
        reply = '🎁 Check our website for seasonal offers and packages! We occasionally have special deals, especially during off-peak seasons. Visit /booking or call +91-91188-82242 for the latest offers.';
      }
    }
    // === PETS ===
    else if (/pet|dog|cat|animal/i.test(lower)) {
      reply = '🐾 Unfortunately, pets are not allowed at The Vedara. We understand this may be disappointing, but it\'s to ensure comfort for all guests. Service animals are welcome with prior arrangement — please call +91-91188-82242.';
    }
    // === SMOKING ===
    else if (/smok|cigarette|vape/i.test(lower)) {
      reply = '🚭 Smoking is not permitted inside the cottages. Designated outdoor smoking areas are available. We appreciate your cooperation in keeping our spaces fresh for all guests.';
    }
    // === QUIET HOURS ===
    else if (/quiet|noise|music|party|night/i.test(lower)) {
      reply = '🌙 Quiet hours are observed from 11:00 PM to 7:00 AM. We want every guest to enjoy the peaceful mountain nights. Live music and bonfire sessions typically wind down by 10:30 PM.';
    }
    // === ID PROOF ===
    else if (/id|identity|proof|aadhaar|passport|document/i.test(lower)) {
      reply = '🪪 A valid photo ID is required at check-in:\n\nIndian nationals: Aadhaar, Passport, or Driving Licence\nForeign nationals: Passport\n\nPlease carry your original ID (not a photocopy).';
    }
    // === HEATER / WINTER ===
    else if (/heater|warm|cold|blanket|quilt|winter|snow|temperature/i.test(lower)) {
      reply = '❄️ During winter (Nov-Feb), room heaters are provided complimentary! Outside of peak winter, heaters are available at ₹600/night. Each cottage also has premium mountain-grade quilts and extra blankets on request.';
    }
    // === SPA / MASSAGE / WELLNESS ===
    else if (/spa|massage|wellness|yoga|meditation|relax/i.test(lower)) {
      reply = '🧘 Wellness at The Vedara:\n\n• Morning yoga sessions on cottage balconies\n• Guided meditation in the mountains\n• Forest bathing walks through cedar trails\n• Relaxation areas with mountain views\n\nOur attic balconies are perfect for private yoga and meditation. Ask us about arranging wellness sessions during your stay!';
    }
    // === LIVE SUPPORT ===
    else if (/live.*support|talk.*human|agent|representative|real.*person/i.test(lower)) {
      reply = '👨‍💼 To connect with our team:\n\n📱 Call: +91-91188-82242 (8 AM - 10:30 PM)\n💬 WhatsApp: wa.me/919118882242\n\nOur live chat support is also available during support hours. Click the Live Support button in the chat widget!';
    }
    // === THANKS ===
    else if (/thank|thanks|thx|appreciate|helpful/i.test(lower)) {
      reply = 'You\'re most welcome! 😊 That\'s what I\'m here for. If you have any more questions about The Vedara, cottages, café, or anything else — just ask. Happy planning! 🏔️';
    }
    // === BYE ===
    else if (/bye|goodbye|see you|talk later|ttyl|cya/i.test(lower)) {
      reply = 'Goodbye! 👋 Hope to welcome you to The Vedara soon. Remember, we\'re just a message away if you need anything. Safe travels! 🏔️✨';
    }
    // === HELP / WHAT CAN YOU DO ===
    else if (/help|what.*can.*you|what.*do|feature|menu.*option/i.test(lower)) {
      reply = '🤖 Here\'s what I can help with:\n\n🏠 Cottage info & pricing\n🍽️ Café Charade menu\n📅 Booking & availability\n📍 Directions & nearby attractions\n🌤️ Weather & best times to visit\n📋 Policies (cancellation, check-in/out)\n⭐ Guest reviews\n🎒 Activities & treks\n📞 Contact info\n🎁 Special offers\n\nJust ask me anything!';
    }
    // === INTELLIGENT FALLBACK ===
    else {
      // Try to find relevant context from the KB
      const lowerWords = lower.split(/\s+/);
      const relevantCottage = kb.cottages.find(c => {
        const words = c.name.toLowerCase().split(/\s+/);
        return words.some((w: string) => lowerWords.includes(w));
      });

      if (relevantCottage) {
        reply = `It looks like you're asking about ${relevantCottage.name}! 🏔️\n\n${relevantCottage.name} is a ${relevantCottage.category} priced at ₹${relevantCottage.pricePerNight}/night, accommodating ${relevantCottage.capacity} guests in ${relevantCottage.size} sqft.\n\nView full details at /cottages/slug/${relevantCottage.slug}\n\nWhat else would you like to know?`;
      } else {
        reply = `I'd be happy to help with that! While I specialize in The Vedara retreat, here's what I know best:\n\n🏠 Cottage types & pricing\n🍽️ Café menu & dining\n📅 Booking process\n📍 Jibhi area attractions\n🌤️ Best times to visit\n\nCould you rephrase your question, or ask me about any of these topics? You can also call us at +91-91188-82242 for immediate help.`;
      }
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({ reply: 'I\'m having a momentary hiccup! 🏔️ Please try again, or call us at +91-91188-82242 for immediate help.' });
  }
}
