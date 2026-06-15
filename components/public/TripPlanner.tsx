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
  { id: 'romantic', label: 'Romantic Escape', icon: Star, color: 'from-pink-500/20 to-rose-500/10' },
  { id: 'adventure', label: 'Adventure Trek', icon: Mountain, color: 'from-emerald-500/20 to-teal-500/10' },
  { id: 'family', label: 'Family Retreat', icon: Users, color: 'from-amber-500/20 to-orange-500/10' },
  { id: 'wellness', label: 'Wellness & Peace', icon: TreePine, color: 'from-violet-500/20 to-indigo-500/10' },
];

const generatedPlans: Record<string, TripPlan> = {
  romantic: {
    title: 'Romantic Himalayan Escape',
    description: 'A 3-night curated journey for couples seeking intimacy, luxury, and mountain magic.',
    itinerary: [
      {
        day: 'Day 1 – Arrival & Settle In',
        activities: [
          { time: '2:00 PM', activity: 'Check into Monal Haven with private jacuzzi', icon: Mountain },
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
          { time: '2:00 PM', activity: 'Check in and acclimatize to the altitude', icon: Mountain },
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
          { time: '2:00 PM', activity: 'Check into Koklass Cove (largest family suite)', icon: Mountain },
          { time: '3:30 PM', activity: 'Kids Arena – supervised nature crafts and games', icon: Users },
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
          { time: '11:00 AM', activity: 'Kids Arena outdoor treasure hunt', icon: Star },
          { time: '3:00 PM', activity: 'Family photo session at sunset point', icon: Mountain },
        ],
      },
    ],
    tips: [
      'Koklass Cove has the most space for families – two balconies and a jacuzzi.',
      'Kids Arena is supervised from 10 AM to 4 PM daily.',
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
          { time: '2:00 PM', activity: 'Check in and settle into your cottage', icon: Mountain },
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
        className="fixed bottom-6 right-6 z-50 glass-button rounded-full px-5 py-3 flex items-center gap-2 shadow-xl cursor-pointer"
      >
        <Sparkles className="w-4 h-4 text-gold-400" />
        <span className="text-sm font-medium text-white">AI Trip Planner</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-[#1C2B3A]/80 backdrop-blur-sm" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto glass-dark rounded-3xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 pb-4 border-b border-alabaster/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500/30 to-gold-600/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl text-white">AI Trip Planner</h2>
                    <p className="text-xs text-white/50">Personalized itineraries for The Vedara</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {!plan ? (
                  <>
                    <p className="text-sm text-white/60 mb-6">What kind of trip are you dreaming of?</p>
                    <div className="grid grid-cols-2 gap-3">
                      {tripTypes.map((type) => (
                        <motion.button
                          key={type.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelect(type.id)}
                          disabled={generating}
                          className={`relative overflow-hidden rounded-xl p-4 text-left transition-all duration-300 ${
                            selectedType === type.id
                              ? 'glass-card ring-2 ring-gold-500/40'
                              : 'glass-card hover:border-gold-400/20'
                          }`}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-50`} />
                          <div className="relative z-10">
                            <type.icon className="w-6 h-6 text-gold-400 mb-2" />
                            <p className="text-sm font-medium text-white">{type.label}</p>
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
                        <Loader2 className="w-5 h-5 text-gold-400 animate-spin" />
                        <span className="text-sm text-white/60">Crafting your personalized itinerary...</span>
                      </motion.div>
                    )}
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="mb-6">
                      <h3 className="font-serif text-2xl text-white mb-2">{plan.title}</h3>
                      <p className="text-sm text-white/60">{plan.description}</p>
                    </div>

                    <div className="space-y-4 mb-6">
                      {plan.itinerary.map((day, i) => (
                        <div key={i} className="glass-card rounded-xl p-4">
                          <h4 className="font-serif text-sm text-gold-400 mb-3 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            {day.day}
                          </h4>
                          <div className="space-y-2">
                            {day.activities.map((act, j) => (
                              <div key={j} className="flex items-start gap-3">
                                <span className="text-xs text-white/40 font-mono mt-0.5 w-14 flex-shrink-0">{act.time}</span>
                                <div className="flex items-center gap-2 flex-1">
                                  <act.icon className="w-3.5 h-3.5 text-gold-400/70 flex-shrink-0" />
                                  <span className="text-sm text-white/80">{act.activity}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="glass-card rounded-xl p-4 mb-4">
                      <h4 className="font-serif text-sm text-gold-400 mb-3">Insider Tips</h4>
                      <ul className="space-y-2">
                        {plan.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                            <ChevronRight className="w-3.5 h-3.5 text-gold-400/60 mt-0.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={handleReset} className="flex-1 glass-button rounded-xl py-3 text-sm text-white font-medium">
                        Try Another
                      </button>
                      <a href="/booking" className="flex-1 bg-gold-600 hover:bg-gold-700 rounded-xl py-3 text-sm text-white font-medium text-center transition-colors">
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
