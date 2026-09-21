'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, MapPin, Sparkles, Mountain, Coffee, TreePine, Star, Users, Calendar, Loader2, ArrowRight, RotateCcw, ExternalLink, X } from 'lucide-react';

interface Activity {
  time: string;
  activity: string;
  icon: string;
  location: string;
}

interface DayPlan {
  day: string;
  activities: Activity[];
}

interface TripPlan {
  title: string;
  description: string;
  cottage: string;
  cottagePrice: string;
  totalEstimate: string;
  itinerary: DayPlan[];
  tips: string[];
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Compass: <Compass className="w-5 h-5" />,
  MapPin: <MapPin className="w-5 h-5" />,
  Sparkles: <Sparkles className="w-5 h-5" />,
  Mountain: <Mountain className="w-5 h-5" />,
  Coffee: <Coffee className="w-5 h-5" />,
  TreePine: <TreePine className="w-5 h-5" />,
  Star: <Star className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
};

const INTERESTS = [
  { id: 'adventure', label: 'Adventure & Treks', icon: '🏔️', desc: 'Jalori Pass, Serolsar Lake, GHNP' },
  { id: 'wellness', label: 'Peace & Wellness', icon: '🧘', desc: 'Yoga, meditation, nature walks' },
  { id: 'romance', label: 'Romantic Escape', icon: '💑', desc: 'Sunsets, cozy dinners, bonfires' },
  { id: 'family', label: 'Family Fun', icon: '👨‍👩‍👧‍👦', desc: 'Kids Zone, easy walks, village life' },
  { id: 'culture', label: 'Culture & Heritage', icon: '🏛️', desc: 'Temples, villages, local crafts' },
];

const DURATIONS = [
  { id: '1', label: '1 Day', desc: 'Quick getaway' },
  { id: '2', label: '2 Days', desc: 'Weekend escape' },
  { id: '3', label: '3 Days', desc: 'Perfect balance' },
  { id: '4', label: '4 Days', desc: 'Deep immersion' },
  { id: '5', label: '5+ Days', desc: 'Complete retreat' },
];

const STYLES = [
  { id: 'relaxed', label: 'Relaxed', icon: '🌴', desc: 'Easy pace, lots of downtime' },
  { id: 'balanced', label: 'Balanced', icon: '⚖️', desc: 'Mix of activity and rest' },
  { id: 'active', label: 'Action-Packed', icon: '⚡', desc: 'Maximum adventures' },
];

const GROUPS = [
  { id: 'solo', label: 'Solo', icon: '🧑' },
  { id: 'couple', label: 'Couple', icon: '💑' },
  { id: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { id: 'friends', label: 'Friends', icon: '👫' },
];

export function TripPlanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState<TripPlan | null>(null);

  const [interests, setInterests] = useState('');
  const [duration, setDuration] = useState('3');
  const [style, setStyle] = useState('balanced');
  const [group, setGroup] = useState('couple');
  const [travelDates, setTravelDates] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const canProceed = () => {
    if (step === 0) return !!interests;
    if (step === 1) return !!duration;
    if (step === 2) return !!style;
    if (step === 3) return !!group;
    return true;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          days: parseInt(duration),
          interests,
          travelStyle: style,
          groupType: group,
          travelDates,
          specialRequests,
        }),
      });
      const data = await res.json();
      setPlan(data);
      setStep(5);
    } catch {
      setPlan({
        title: 'Your Himalayan Escape',
        description: `${duration} days of mountain magic at The Vedara in Jibhi.`,
        cottage: 'Monal Haven',
        cottagePrice: '₹7,000/night',
        totalEstimate: `₹${(parseInt(duration) * 8500).toLocaleString()}`,
        itinerary: [
          {
            day: 'Day 1 – Arrival & First Impressions',
            activities: [
              { time: '1:00 PM', activity: 'Arrive & settle into The Vedara', icon: 'Compass', location: 'The Vedara' },
              { time: '3:00 PM', activity: 'Walk to Jibhi Waterfall', icon: 'MapPin', location: 'Jibhi Waterfall' },
              { time: '5:30 PM', activity: 'Sunset coffee at The Perch', icon: 'Coffee', location: 'The Perch' },
              { time: '8:00 PM', activity: 'Bonfire night under the stars', icon: 'Star', location: 'The Vedara' },
            ],
          },
          {
            day: 'Day 2 – Mountain Adventures',
            activities: [
              { time: '7:30 AM', activity: 'Breakfast at The Perch', icon: 'Coffee', location: 'The Perch' },
              { time: '9:30 AM', activity: 'Drive to Jalori Pass', icon: 'Mountain', location: 'Jalori Pass' },
              { time: '12:00 PM', activity: 'Trek to Serolsar Lake', icon: 'TreePine', location: 'Serolsar Lake' },
              { time: '7:00 PM', activity: 'Dinner at The Perch', icon: 'Coffee', location: 'The Perch' },
            ],
          },
        ],
        tips: [
          'Book Jalori Pass for clear mornings.',
          'Try the Himalayan Cold Coffee at The Perch.',
          'Carry cash — ATMs are limited in Jibhi.',
          'Download offline maps for treks.',
        ],
      });
      setStep(5);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setPlan(null);
    setInterests('');
    setDuration('3');
    setStyle('balanced');
    setGroup('couple');
    setTravelDates('');
    setSpecialRequests('');
  };

  const STEPS = ['Interests', 'Duration', 'Travel Style', 'Group', 'Dates', 'Your Itinerary'];

  return (
    <>
      {/* Floating trigger. This used to sit in normal document flow at the very
          bottom of the page, so it only appeared once the guest had scrolled all
          the way down. It is now pinned and visible throughout.
          Offset above the chatbot bubble, which occupies bottom-6 right-6. */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        aria-label="Plan my trip"
        className="fixed bottom-24 right-6 z-[100] inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
      >
        <Sparkles className="w-5 h-5 shrink-0" />
        <span className="hidden sm:inline">Plan My Trip</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl modal-viewport bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-6 py-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Compass className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">AI Trip Planner</h2>
                    <p className="text-xs opacity-90">Personalized Himalayan itineraries</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="px-6 py-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                <div className="flex items-center gap-2">
                  {STEPS.map((s, i) => (
                    <div key={s} className="flex items-center gap-2 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        i < step ? 'bg-green-500 text-white' : i === step ? 'bg-amber-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                      }`}>
                        {i < step ? '✓' : i + 1}
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 rounded ${i < step ? 'bg-green-500' : 'bg-zinc-200 dark:bg-zinc-700'}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <AnimatePresence mode="wait">
                  {/* Step 0: Interests */}
                  {step === 0 && (
                    <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">What draws you to the mountains?</h3>
                      <p className="text-sm text-zinc-500 mb-6">Choose your primary interest</p>
                      <div className="grid gap-3">
                        {INTERESTS.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => setInterests(item.id)}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                              interests === item.id
                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                            }`}
                          >
                            <span className="text-2xl">{item.icon}</span>
                            <div>
                              <div className="font-semibold text-zinc-900 dark:text-white">{item.label}</div>
                              <div className="text-xs text-zinc-500">{item.desc}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 1: Duration */}
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">How long?</h3>
                      <p className="text-sm text-zinc-500 mb-6">Select your trip duration</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {DURATIONS.map((d) => (
                          <button
                            key={d.id}
                            onClick={() => setDuration(d.id)}
                            className={`p-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
                              duration === d.id
                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                            }`}
                          >
                            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{d.label}</div>
                            <div className="text-xs text-zinc-500 mt-1">{d.desc}</div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Travel Style */}
                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Your travel style?</h3>
                      <p className="text-sm text-zinc-500 mb-6">How do you like to travel?</p>
                      <div className="grid gap-3">
                        {STYLES.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setStyle(s.id)}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                              style === s.id
                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                            }`}
                          >
                            <span className="text-2xl">{s.icon}</span>
                            <div>
                              <div className="font-semibold text-zinc-900 dark:text-white">{s.label}</div>
                              <div className="text-xs text-zinc-500">{s.desc}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Group */}
                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Who&apos;s traveling?</h3>
                      <p className="text-sm text-zinc-500 mb-6">Select your group type</p>
                      <div className="grid grid-cols-2 gap-3">
                        {GROUPS.map((g) => (
                          <button
                            key={g.id}
                            onClick={() => setGroup(g.id)}
                            className={`p-5 rounded-xl border-2 text-center transition-all cursor-pointer ${
                              group === g.id
                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                                : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                            }`}
                          >
                            <span className="text-3xl block mb-2">{g.icon}</span>
                            <div className="font-semibold text-zinc-900 dark:text-white">{g.label}</div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Step 4: Dates & Extras */}
                  {step === 4 && (
                    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Any preferences?</h3>
                      <p className="text-sm text-zinc-500 mb-6">Optional details to personalize your itinerary</p>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Travel Dates (optional)</label>
                          <input
                            type="text"
                            value={travelDates}
                            onChange={(e) => setTravelDates(e.target.value)}
                            placeholder="e.g., December 20-23, 2026"
                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Special Requests</label>
                          <textarea
                            value={specialRequests}
                            onChange={(e) => setSpecialRequests(e.target.value)}
                            placeholder="e.g., Anniversary celebration, need kid-friendly activities, dietary restrictions..."
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 5: Result */}
                  {step === 5 && plan && (
                    <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-5 h-5 text-amber-500" />
                          <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Your Personalized Itinerary</span>
                        </div>
                        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">{plan.title}</h3>
                        <p className="text-sm text-zinc-500 mt-1">{plan.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-3 mb-6">
                        <div className="px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                          <span className="text-xs text-zinc-500">Cottage</span>
                          <div className="text-sm font-semibold text-amber-700 dark:text-amber-300">{plan.cottage}</div>
                        </div>
                        <div className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <span className="text-xs text-zinc-500">Rate</span>
                          <div className="text-sm font-semibold text-green-700 dark:text-green-300">{plan.cottagePrice}</div>
                        </div>
                        <div className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <span className="text-xs text-zinc-500">Est. Total</span>
                          <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">{plan.totalEstimate}</div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {plan.itinerary.map((day, dayIdx) => (
                          <div key={dayIdx}>
                            <h4 className="font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2">
                              <span className="w-7 h-7 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-xs font-bold text-amber-600">{dayIdx + 1}</span>
                              {day.day}
                            </h4>
                            <div className="ml-4 border-l-2 border-amber-200 dark:border-amber-800 pl-4 space-y-3">
                              {day.activities.map((act, actIdx) => (
                                <div key={actIdx} className="flex items-start gap-3">
                                  <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 shrink-0 mt-0.5">
                                    {ICON_MAP[act.icon] || <MapPin className="w-5 h-5" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">{act.time}</div>
                                    <div className="text-sm font-medium text-zinc-900 dark:text-white">{act.activity}</div>
                                    <div className="text-xs text-zinc-500 flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {act.location}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {plan.tips.length > 0 && (
                        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                          <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                            <Star className="w-4 h-4" /> Insider Tips
                          </h4>
                          <ul className="space-y-1.5">
                            {plan.tips.map((tip, i) => (
                              <li key={i} className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Loading */}
                  {isGenerating && (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-16">
                      <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                      </div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Crafting your itinerary...</h3>
                      <p className="text-sm text-zinc-500">Personalizing based on your preferences</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
                {step > 0 && step < 5 && !isGenerating && (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                )}
                {step === 5 && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Start Over
                  </button>
                )}
                {step < 5 && !isGenerating && (
                  <div className="ml-auto">
                    {step === 4 ? (
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        Generate My Itinerary
                      </button>
                    ) : (
                      <button
                        onClick={() => setStep(s => s + 1)}
                        disabled={!canProceed()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer"
                      >
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
                {step === 5 && (
                  <a
                    href="/booking"
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
                  >
                    Book Now
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
