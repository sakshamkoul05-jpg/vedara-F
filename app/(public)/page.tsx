'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowRight, Star, Coffee, Trees, Sparkles, Music, Moon, MapPin, TreePine } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { ImageReveal } from '@/components/animations/ImageReveal';
import { MagneticButton } from '@/components/animations/MagneticButton';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { PackageBanner } from '@/components/public/PackageBanner';

const cottages = [
  { slug: 'monal-haven', name: 'Monal Haven', price: '\u20B912,000', desc: 'Premium Duplex Family Suite with private jacuzzi, attic yoga balcony, and sweeping mountain views', image: '/images/hero-1.jpg' },
  { slug: 'koklass-cove', name: 'Koklass Cove', price: '\u20B912,500', desc: 'Premium Duplex Family Suite \u2013 our largest with two viewing balconies, private jacuzzi, and unmatched privacy', image: '/images/hero-2.jpg' },
  { slug: 'magpie-retreat', name: 'Magpie Retreat', price: '\u20B911,000', desc: 'Intimate Mountain View Suite with deep-soak bathtub and dual-balcony setup', image: '/images/hero-3.jpg' },
];

const testimonials = [
  { name: 'Ananya & Rohit', content: 'Monal Haven was everything we dreamed of. Waking up to the mist over the mountains, the jacuzzi under the stars \u2013 pure magic.', rating: 5, location: 'Mumbai, India' },
  { name: 'Daniel Park', content: 'I wrote half my manuscript sitting on the balcony at Whistling Thrush. The staff was incredibly thoughtful.', rating: 5, location: 'Seoul, South Korea' },
  { name: 'Emily & James', content: 'Koklass Cove was perfection. The attic yoga balcony, the sweeping views \u2013 we felt like we were floating above the world.', rating: 5, location: 'Melbourne, Australia' },
];

const experiences = [
  { icon: Sparkles, title: 'Bonfire Nights', desc: 'Gather around crackling fires under a canopy of stars with warm drinks and stories.' },
  { icon: Music, title: 'Music Nights', desc: 'Live acoustic sessions with local artists echoing through the valley.' },
  { icon: Trees, title: 'Nature Walks', desc: 'Guided treks through cedar forests to hidden waterfalls and panoramic viewpoints.' },
  { icon: Moon, title: 'Star Gazing', desc: 'Unpolluted Himalayan skies reveal constellations you have never seen before.' },
  { icon: Coffee, title: 'Caf\u00e9 Evenings', desc: 'Handcrafted coffee and wood-fired meals as the sun sets behind the pines.' },
  { icon: MapPin, title: 'Lambhari Top Trek', desc: 'A scenic trek to Lambhari Top with panoramic Himalayan views. Explore the trail with our guided excursions.' },
  { icon: TreePine, title: 'Great Himalayan NP', desc: 'Explore the untouched wilderness of the Great Himalayan National Park and Tirthan Valley on a guided hilltop adventure.' },
  { icon: Sparkles, title: 'Kids Arena', desc: 'A dedicated space for young explorers with supervised nature activities, crafts, and outdoor games.' },
];

const nearbyAttractions = [
  { name: 'Jibhi Waterfall', distance: '4 km', icon: MapPin },
  { name: 'Mini Thailand', distance: '1.2 km', icon: MapPin },
  { name: 'Jalori Pass', distance: '10 km', icon: MapPin },
  { name: 'Serolsar Lake', distance: '10 km + trek', icon: MapPin },
];

export default function HomePage() {
  const [homeCheckIn, setHomeCheckIn] = useState('');
  const [homeCheckOut, setHomeCheckOut] = useState('');
  const [homeAdults, setHomeAdults] = useState('2');
  const [homeChildren, setHomeChildren] = useState('0');
  const [homeNationality, setHomeNationality] = useState('Indian');
  const [dateError, setDateError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleHomeBooking = () => {
    if (!homeCheckIn || !homeCheckOut) return;
    const checkInDate = new Date(homeCheckIn);
    const checkOutDate = new Date(homeCheckOut);
    if (checkOutDate <= checkInDate) {
      setDateError('Check-out date must be after check-in date');
      return;
    }
    setDateError('');
    const params = new URLSearchParams({
      checkIn: homeCheckIn,
      checkOut: homeCheckOut,
      rooms: '1',
      adults: homeAdults,
      children: homeChildren,
      nationality: homeNationality,
    });
    window.location.href = `/booking?${params}`;
  };

  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHomeCheckIn(e.target.value);
    setDateError('');
    if (homeCheckOut && new Date(homeCheckOut) <= new Date(e.target.value)) {
      setHomeCheckOut('');
    }
  };

  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHomeCheckOut(e.target.value);
    setDateError('');
  };

  return (
    <>
      {/* Hero */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
        <HeroCarousel />
        <div className="relative z-20 text-center px-4 max-w-4xl">
          <TextReveal
            as="h1"
            className="text-6xl md:text-8xl lg:text-9xl font-serif text-alabaster leading-tight mb-4 tracking-widest"
            delay={0.5}
          >
            THE VEDARA
          </TextReveal>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-alabaster/80 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-serif tracking-wide"
          >
            A Himalayan Boutique Retreat \u2013 Seven handcrafted cottages, one cozy caf\u00e9, and a slow-living mountain escape crafted for those who seek stillness.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
          >
            <Link href="/booking" className="vintage-button bg-alabaster text-vedara-900 hover:bg-gold-50 px-10 py-4 text-base inline-flex items-center justify-center">
              Book Your Stay <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>
        </div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          onClick={() => {
            if (window.innerWidth >= 768) {
              document.getElementById('welcome')?.scrollIntoView({ behavior: 'smooth' });
            } else {
              document.getElementById('booking-bar')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 cursor-pointer"
          aria-label="Scroll to booking section"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-alabaster/60">
            <ArrowRight className="w-5 h-5 rotate-90" />
          </motion.div>
        </motion.button>
      </section>

      <PackageBanner />

      {/* Booking Bar */}
      <section id="booking-bar" className="relative z-30 mt-12 mb-12 px-4">
        <div className="vintage-container max-w-4xl">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-gold-200 p-4 md:p-6 font-sans">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end mb-3">
              <div>
                <label className="block text-xs font-medium text-vedara-900/60 mb-1">Check In</label>
                <input type="date" value={homeCheckIn} onChange={handleCheckInChange} min={today} className="w-full rounded-xl border border-gold-200 bg-white px-3 py-2.5 text-sm text-vedara-900 focus:outline-none focus:border-gold-500 transition-colors duration-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-vedara-900/60 mb-1">Check Out</label>
                <input type="date" value={homeCheckOut} onChange={handleCheckOutChange} min={homeCheckIn || today} className="w-full rounded-xl border border-gold-200 bg-white px-3 py-2.5 text-sm text-vedara-900 focus:outline-none focus:border-gold-500 transition-colors duration-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-vedara-900/60 mb-1">Adults</label>
                <select value={homeAdults} onChange={(e) => setHomeAdults(e.target.value)} className="w-full rounded-xl border border-gold-200 bg-white px-3 py-2.5 text-sm text-vedara-900 focus:outline-none focus:border-gold-500 transition-colors duration-500">
                  {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-vedara-900/60 mb-1">Children</label>
                <select value={homeChildren} onChange={(e) => setHomeChildren(e.target.value)} className="w-full rounded-xl border border-gold-200 bg-white px-3 py-2.5 text-sm text-vedara-900 focus:outline-none focus:border-gold-500 transition-colors duration-500">
                  {[0,1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-vedara-900/60 mb-1">Nationality</label>
                <select value={homeNationality} onChange={(e) => setHomeNationality(e.target.value)} className="w-full rounded-xl border border-gold-200 bg-white px-3 py-2.5 text-sm text-vedara-900 focus:outline-none focus:border-gold-500 transition-colors duration-500">
                  <option value="Indian">Indian</option>
                  <option value="Foreign">Foreign National</option>
                </select>
              </div>
              <div>
                <a onClick={handleHomeBooking} className="vintage-button-primary text-sm px-6 py-2.5 w-full text-center block cursor-pointer">
                  {homeCheckIn && homeCheckOut ? 'Check Availability' : 'Book Your Stay'}
                </a>
              </div>
            </div>
            {dateError && (
              <p className="text-red-500 text-xs mt-2 text-center">{dateError}</p>
            )}
          </div>
        </div>
      </section>

      {/* Welcome */}
      <section id="welcome" className="relative py-28 md:py-36 overflow-hidden bg-vedara-900">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=1920&q=80)', backgroundSize: 'cover' }} />
        <div className="relative z-10 vintage-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <div>
                <p className="text-gold-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Welcome to The Vedara</p>
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-alabaster mb-6">A Story Rooted in the Mountains</h2>
                <p className="text-alabaster/80 text-lg leading-relaxed mb-6">
                  Nestled in the serene village of Ghiyagi, within the untouched landscapes of Jibhi, The Vedara was born from a simple belief \u2013 that the most profound luxury is found in stillness, connection, and the raw beauty of the Himalayas.
                </p>
                <p className="text-alabaster/60 leading-relaxed mb-8">
                  With seven handcrafted cottages and a soulful caf\u00e9, we offer more than a stay. We offer a chance to pause, breathe, and remember what truly matters.
                </p>
                <Link href="/about" className="vintage-button bg-gold-500 hover:bg-gold-600 text-alabaster px-8 py-3.5">
                  Read Our Story <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <ImageReveal
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80"
                  alt="Himalayan mountain landscape at The Vedara"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Cottages */}
      <section className="section-padding bg-alabaster">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-gold-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Our Cottages</p>
              <h2 className="section-title mb-6">Seven Stories, Seven Retreats</h2>
              <p className="section-subtitle">
                Each cottage is a world unto itself \u2013 named after the birds of the valley and crafted with local materials, premium furnishings, and unobstructed mountain views.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            {cottages.map((cottage, i) => (
              <ScrollReveal key={cottage.name} delay={i * 0.15}>
                <div className="group vintage-card overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden bg-gold-100">
                    <img src={`https://images.unsplash.com/photo-${['1504384308090-c894fdcc538d', '1554118811-1e0d58224f24', '1506905925346-21bda4d32df4'][i]}?w=600&q=80`} alt={cottage.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-xl text-vedara-900">{cottage.name}</h3>
                      <span className="text-gold-600 font-semibold text-sm">{cottage.price}<span className="text-vedara-900/40 font-normal text-xs">/night</span></span>
                    </div>
                    <p className="text-charcoal/60 text-sm mb-4">{cottage.desc}</p>
                    <Link href={`/cottages/slug/${cottage.slug}`} className="text-gold-600 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all duration-500">
                      View Details <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal delay={0.3}>
            <div className="text-center mt-12">
              <Link href="/cottages" className="vintage-button-outline">
                View All Cottages <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Experiences */}
      <section id="experiences" className="relative py-28 md:py-36 overflow-hidden bg-vedara-900">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80)', backgroundSize: 'cover' }} />
        <div className="relative z-10 vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-gold-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Experiences</p>
              <h2 className="font-serif text-4xl md:text-5xl text-alabaster mb-6">Moments That Stay With You</h2>
              <p className="text-alabaster/70 text-lg">Beyond the cottages, a world of experiences awaits \u2013 each designed to bring you closer to the mountains and to yourself.</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {experiences.map((exp, i) => (
              <ScrollReveal key={exp.title} delay={i * 0.1}>
                <div className="group vintage-card bg-alabaster/10 backdrop-blur-sm border-alabaster/10 p-6 text-center hover:bg-alabaster/20 transition-all duration-500 font-sans">
                  <div className="w-14 h-14 rounded-full bg-gold-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
                    <exp.icon className="w-7 h-7 text-gold-400" />
                  </div>
                  <h3 className="font-serif text-lg text-alabaster mb-2">{exp.title}</h3>
                  <p className="text-alabaster/60 text-sm leading-relaxed">{exp.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Café */}
      <section className="relative py-28 md:py-36 overflow-hidden bg-vedara-900">
        <div className="relative z-10 vintage-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <div>
                <p className="text-gold-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Our Caf\u00e9</p>
                <h2 className="font-serif text-4xl md:text-5xl text-alabaster mb-6">Caf\u00e9 Charade</h2>
                <p className="text-alabaster/80 text-lg leading-relaxed mb-4">
                  Nestled beside a whispering stream, Caf\u00e9 Charade serves handcrafted coffee, wood-fired meals, and mountain-fresh bakes.
                </p>
                <p className="text-alabaster/60 text-sm mb-8 space-y-1">
                  <span className="block">Breakfast 7:30 AM \u2013 10:00 AM</span>
                  <span className="block">Lunch 12:00 PM \u2013 3:30 PM</span>
                  <span className="block">Dinner 7:00 PM \u2013 10:00 PM</span>
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {['Artisan Coffee', 'Home-Style Meals', 'Fresh Treats', 'Evening Sips'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-alabaster">
                      <Coffee className="w-4 h-4 text-gold-400" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <MagneticButton>
                  <Link href="/cafe" className="vintage-button bg-gold-500 hover:bg-gold-600 text-alabaster px-8 py-3.5 inline-block">
                    Explore Menu <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </MagneticButton>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <ImageReveal
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80"
                  alt="Caf\u00e9 Charade at The Vedara"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-alabaster">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-gold-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Testimonials</p>
              <h2 className="section-title mb-6">Voices from the Mountains</h2>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 0.15}>
                <motion.div
                  className="vintage-card p-8 relative overflow-hidden"
                  whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gold-500/5 to-transparent rounded-bl-full" />
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 + t.rating * 0.1 }}
                      >
                        <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-charcoal/70 text-sm leading-relaxed mb-6 italic">&ldquo;{t.content}&rdquo;</p>
                  <div className="border-t border-gold-200/50 pt-4">
                    <p className="font-serif text-vedara-900 font-medium">{t.name}</p>
                    <p className="text-xs text-charcoal/50">{t.location}</p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Nearby */}
      <section className="section-padding bg-white">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-gold-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Explore Nearby</p>
              <h2 className="section-title mb-6">Discover the Valley</h2>
              <p className="section-subtitle">The Vedara is your gateway to the raw beauty of Jibhi and beyond</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {nearbyAttractions.map((place, i) => (
              <ScrollReveal key={place.name} delay={i * 0.1}>
                <div className="vintage-card p-6 flex items-start gap-4 group hover:border-gold-300 transition-all duration-500">
                  <div className="w-11 h-11 rounded-xl bg-gold-100 flex items-center justify-center flex-shrink-0">
                    <place.icon className="w-5 h-5 text-gold-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-vedara-900 text-sm group-hover:text-gold-600 transition-colors duration-500">{place.name}</h3>
                    <span className="text-xs text-charcoal/50">{place.distance}</span>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal delay={0.3}>
            <div className="text-center mt-10">
              <button
                onClick={() => document.getElementById('how-to-reach')?.scrollIntoView({ behavior: 'smooth' })}
                className="vintage-button-outline text-sm"
              >
                Explore Nearby Attractions <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* How to Reach */}
      <section id="how-to-reach" className="section-padding bg-alabaster">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-gold-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Getting Here</p>
              <h2 className="section-title mb-6">How to Reach The Vedara</h2>
              <p className="section-subtitle">Your journey to Ghiyagi, Jibhi begins here</p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <ScrollReveal delay={0.1}>
              <div className="vintage-card p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-vedara-900/5 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-vedara-900" />
                </div>
                <h3 className="font-serif text-lg mb-3 text-vedara-900">By Road</h3>
                <p className="text-charcoal/60 text-sm leading-relaxed">Delhi to Jibhi via Mandi-Aut-Larji. ~480 km, approximately 10\u201311 hours. Buses available from Delhi ISBT to Aut, then taxi to Jibhi.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="vintage-card p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-gold-600" />
                </div>
                <h3 className="font-serif text-lg mb-3 text-vedara-900">By Rail</h3>
                <p className="text-charcoal/60 text-sm leading-relaxed">Nearest broad-gauge station: Amb Andaura (~120 km). Nearest narrow-gauge: Shimla or Joginder Nagar. Taxis available from all stations.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="vintage-card p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-gold-600" />
                </div>
                <h3 className="font-serif text-lg mb-3 text-vedara-900">By Air</h3>
                <p className="text-charcoal/60 text-sm leading-relaxed">Bhuntar Airport (Kullu) is the nearest, ~50 km from Jibhi. Flights from Delhi and Chandigarh. Taxi from Bhuntar to Ghiyagi takes ~1.5 hours.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-gold-500 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=1920&q=80)', backgroundSize: 'cover' }} />
        <div className="relative z-10 vintage-container text-center">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-5xl text-alabaster mb-4">Ready to Escape?</h2>
            <p className="text-alabaster/80 text-lg max-w-xl mx-auto mb-8">
              Book your mountain story today. Early check-in and late check-out available on request.
            </p>
            <MagneticButton>
              <Link href="/booking" className="vintage-button bg-alabaster text-vedara-900 hover:bg-gold-50 px-10 py-4 text-base inline-block">
                Begin Your Journey <Sparkles className="w-4 h-4 ml-2" />
              </Link>
            </MagneticButton>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
