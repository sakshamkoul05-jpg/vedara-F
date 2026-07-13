'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Mountain, TreePine, Coffee, Star, MapPin, Calendar, Users, ChevronRight, X, Compass, Loader2 } from 'lucide-react';

interface TripPlan {
  title: string;
  description: string;
  itinerary: { day: string; activities: { time: string; activity: string; icon: typeof Mountain }[] }[];
  tips: string[];
}

const tripTypes = [
  { id: 'romantic', label: 'Romantic Escape', icon: Star, color: 'rgba(236,72,153,0.1)' },
  { id: 'adventure', label: 'Adventure Trek', icon: Mountain, color: 'rgba(22,163,74,0.1)' },
  { id: 'family', label: 'Family Retreat', icon: Users, color: 'rgba(245,158,11,0.1)' },
  { id: 'wellness', label: 'Wellness & Peace', icon: TreePine, color: 'rgba(139,92,246,0.1)' },
];

const generatedPlans: Record<string, TripPlan> = {
  romantic: {
    title: 'Romantic Himalayan Escape',
    description: 'A 3-night curated journey for couples seeking intimacy, luxury, and mountain magic.',
    itinerary: [
      {
        day: 'Day 1 – Arrival & Settle In',
        activities: [
          { time: '1:00 PM', activity: 'Check into Monal Haven with private jacuzzi', icon: Mountain },
          { time: '4:00 PM', activity: 'Welcome tea at Café Charade with valley views', icon: Coffee },
          { time: '7:00 PM', activity: 'Private bonfire dinner under the stars', icon: Star },
        ],
      },
      {
        day: 'Day 2 – Explore & Connect',
        activities: [
          { time: '7:00 AM', activity: 'Sunrise yoga on the attic balcony', icon: Compass },
          { time: '10:00 AM', activity: 'Guided walk to Jibhi Waterfall (4 km)', icon: TreePine },
          { time: '3:00 PM', activity: 'Couple\'s spa and mountain massage', icon: Sparkles },
          { time: '7:30 PM', activity: 'Candlelit dinner at Café Charade', icon: Coffee },
        ],
      },
      {
        day: 'Day 3 – Adventure & Farewell',
        activities: [
          { time: '6:30 AM', activity: 'Lambhari Top sunrise trek (8 km)', icon: Mountain },
          { time: '1:00 PM', activity: 'Packed lunch at Serolsar Lake', icon: TreePine },
          { time: '5:00 PM', activity: 'Stargazing session with hot chocolate', icon: Star },
        ],
      },
    ],
    tips: [
      'Request a cottage with a private jacuzzi for the ultimate experience.',
      'Carry warm layers for evening bonfires – mountain nights are cool.',
      'Book Café Charade\'s candlelit dinner at least a day in advance.',
    ],
  },
  adventure: {
    title: 'Himalayan Adventure Trek',
    description: 'A 4-night thrill-packed itinerary for adventure enthusiasts and nature lovers.',
    itinerary: [
      {
        day: 'Day 1 – Arrival & Acclimatize',
        activities: [
          { time: '1:00 PM', activity: 'Check in and acclimatize to the altitude', icon: Mountain },
          { time: '4:00 PM', activity: 'Short nature trail around Ghiyagi village', icon: TreePine },
          { time: '7:00 PM', activity: 'Bonfire briefing for upcoming treks', icon: Star },
        ],
      },
      {
        day: 'Day 2 – Jalori Pass Expedition',
        activities: [
          { time: '5:00 AM', activity: 'Early start for Jalori Pass (10 km drive + trek)', icon: Mountain },
          { time: '10:00 AM', activity: 'Summit views and photography', icon: Compass },
          { time: '2:00 PM', activity: 'Descend and visit Chehni Kothi fortress', icon: MapPin },
        ],
      },
      {
        day: 'Day 3 – Serolsar Lake Trek',
        activities: [
          { time: '6:00 AM', activity: 'Trek to Serolsar Lake through ancient oak forests', icon: TreePine },
          { time: '11:00 AM', activity: 'Lake-side picnic and bird watching', icon: Star },
          { time: '3:00 PM', activity: 'Return trek with waterfall stops', icon: MapPin },
        ],
      },
      {
        day: 'Day 4 – Great Himalayan NP',
        activities: [
          { time: '7:00 AM', activity: 'Day trek to Great Himalayan National Park', icon: TreePine },
          { time: '1:00 PM', activity: 'Wildlife spotting and packed lunch', icon: Compass },
          { time: '5:00 PM', activity: 'Return and farewell dinner', icon: Coffee },
        ],
      },
    ],
    tips: [
      'Start treks early to avoid afternoon clouds and maximize visibility.',
      'Carry at least 2 liters of water per person for each trek.',
      'Trekking poles are available at the property – ask at reception.',
    ],
  },
  family: {
    title: 'Family Mountain Retreat',
    description: 'A 3-night wholesome getaway designed for families with kids and elderly members.',
    itinerary: [
      {
        day: 'Day 1 – Arrive & Settle',
        activities: [
          { time: '1:00 PM', activity: 'Check into Koklass Cove (largest family suite)', icon: Mountain },
          { time: '3:30 PM', activity: 'Kids Zone – supervised nature crafts and games', icon: Users },
          { time: '6:00 PM', activity: 'Family bonfire with storytelling', icon: Star },
        ],
      },
      {
        day: 'Day 2 – Explore Together',
        activities: [
          { time: '8:00 AM', activity: 'Leisurely breakfast at Café Charade', icon: Coffee },
          { time: '10:00 AM', activity: 'Visit Jibhi Waterfall (easy 4 km walk)', icon: TreePine },
          { time: '1:00 PM', activity: 'Lunch at the café + board games', icon: Users },
          { time: '4:00 PM', activity: 'Mini Thailand river visit (1.2 km)', icon: MapPin },
        ],
      },
      {
        day: 'Day 3 – Adventure Day',
        activities: [
          { time: '8:00 AM', activity: 'Guided nature walk with bird identification', icon: Compass },
          { time: '11:00 AM', activity: 'Kids Zone outdoor treasure hunt', icon: Star },
          { time: '3:00 PM', activity: 'Family photo session at sunset point', icon: Mountain },
        ],
      },
    ],
    tips: [
      'Koklass Cove has the most space for families – two balconies and a jacuzzi.',
      'Kids Zone is supervised from 10 AM to 4 PM daily.',
      'Carry sunscreen and hats for little ones during outdoor activities.',
    ],
  },
  wellness: {
    title: 'Wellness & Mindfulness Retreat',
    description: 'A 4-night restorative journey for those seeking inner peace and rejuvenation.',
    itinerary: [
      {
        day: 'Day 1 – Arrival & Grounding',
        activities: [
          { time: '1:00 PM', activity: 'Check in and settle into your cottage', icon: Mountain },
          { time: '4:00 PM', activity: 'Guided breathing session on the balcony', icon: Compass },
          { time: '6:30 PM', activity: 'Herbal tea ceremony at Café Charade', icon: Coffee },
        ],
      },
      {
        day: 'Day 2 – Deep Immersion',
        activities: [
          { time: '6:00 AM', activity: 'Sunrise meditation at Lambhari Top viewpoint', icon: Star },
          { time: '9:00 AM', activity: 'Farm-to-table breakfast preparation', icon: TreePine },
          { time: '2:00 PM', activity: 'Forest bathing walk through cedar trails', icon: TreePine },
          { time: '7:00 PM', activity: 'Sound healing session under the stars', icon: Sparkles },
        ],
      },
      {
        day: 'Day 3 – Reflection',
        activities: [
          { time: '7:00 AM', activity: 'Yoga and journaling by the stream', icon: Compass },
          { time: '11:00 AM', activity: 'Solo trek to Serolsar Lake for reflection', icon: Mountain },
          { time: '4:00 PM', activity: 'Mountain massage and wellness spa', icon: Sparkles },
        ],
      },
      {
        day: 'Day 4 – Departure',
        activities: [
          { time: '6:30 AM', activity: 'Final sunrise meditation', icon: Star },
          { time: '9:00 AM', activity: 'Wellness journaling and intention setting', icon: Compass },
          { time: '12:00 PM', activity: 'Farewell lunch at Café Charade', icon: Coffee },
        ],
      },
    ],
    tips: [
      'Bring comfortable clothing for yoga and meditation sessions.',
      'Request a quiet cottage away from common areas for deeper rest.',
      'Digital detox recommended – leave devices in the cottage safe.',
    ],
  },
};

export function TripPlanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<TripPlan | null>(null);

  const handleSelect = (typeId: string) => {
    setSelectedType(typeId);
    setGenerating(true);
    setTimeout(() => {
      setPlan(generatedPlans[typeId]);
      setGenerating(false);
    }, 1500);
  };

  const handleReset = () => {
    setSelectedType(null);
    setPlan(null);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full px-5 py-3 flex items-center gap-2 shadow-xl cursor-pointer transition-all bg-gold-600 text-white hover:bg-gold-700 border-0"
      >
        <Sparkles className="w-4 h-4" />
        <span className="text-sm font-medium">AI Trip Planner</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl"
              style={{ background: '#1C2B3A', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,148,58,0.15)' }}>
                    <Sparkles style={{ width: '1.25rem', height: '1.25rem', color: 'var(--clr-saffron)' }} />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'white' }}>AI Trip Planner</h2>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Personalized itineraries for The Vedara</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} style={{ color: 'rgba(255,255,255,0.5)' }} className="hover:text-white transition-colors">
                  <X style={{ width: '1.25rem', height: '1.25rem' }} />
                </button>
              </div>

              <div className="p-6">
                {!plan ? (
                  <>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>What kind of trip are you dreaming of?</p>
                    <div className="grid grid-cols-2 gap-3">
                      {tripTypes.map((type) => (
                        <motion.button
                          key={type.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelect(type.id)}
                          disabled={generating}
                          className="relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300"
                          style={{
                            background: selectedType === type.id ? 'rgba(201,148,58,0.15)' : 'rgba(255,255,255,0.05)',
                            border: selectedType === type.id ? '1px solid rgba(201,148,58,0.3)' : '1px solid rgba(255,255,255,0.08)',
                          }}
                        >
                          <div className="absolute inset-0" style={{ background: type.color, opacity: 0.5 }} />
                          <div className="relative z-10">
                            <type.icon style={{ width: '1.5rem', height: '1.5rem', color: 'var(--clr-saffron)', marginBottom: '8px' }} />
                            <p style={{ fontSize: '0.85rem', fontWeight: 400, color: 'white' }}>{type.label}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    {generating && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 flex items-center justify-center gap-3 py-8"
                      >
                        <Loader2 style={{ width: '1.25rem', height: '1.25rem', color: 'var(--clr-saffron)' }} className="animate-spin" />
                        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Crafting your personalized itinerary...</span>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="mb-6">
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'white', marginBottom: '8px' }}>{plan.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>{plan.description}</p>
                    </div>

                    <div className="space-y-4 mb-6">
                      {plan.itinerary.map((day, i) => (
                        <div key={i} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--clr-saffron)', marginBottom: '12px' }} className="flex items-center gap-2">
                            <Calendar style={{ width: '0.875rem', height: '0.875rem' }} />
                            {day.day}
                          </h4>
                          <div className="space-y-2">
                            {day.activities.map((act, j) => (
                              <div key={j} className="flex items-start gap-3">
                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', marginTop: '2px', minWidth: '56px', flexShrink: 0 }}>{act.time}</span>
                                <div className="flex items-center gap-2 flex-1">
                                  <act.icon style={{ width: '0.875rem', height: '0.875rem', color: 'rgba(201,148,58,0.7)', flexShrink: 0 }} />
                                  <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>{act.activity}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--clr-saffron)', marginBottom: '12px' }}>Insider Tips</h4>
                      <ul className="space-y-2">
                        {plan.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                            <ChevronRight style={{ width: '0.875rem', height: '0.875rem', color: 'rgba(201,148,58,0.6)', marginTop: '2px', flexShrink: 0 }} />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={handleReset} className="flex-1 rounded-xl py-3 text-sm font-medium" style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.08)' }}>
                        Try Another
                      </button>
                      <a href="/booking" className="flex-1 rounded-xl py-3 text-sm font-medium text-center transition-colors" style={{ background: 'var(--clr-saffron)', color: 'white' }}>
                        Book This Trip
                      </a>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
