'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ArrowRight, Star, Coffee, Trees, Sparkles, Music, FireExtinguisher, Moon, MapPin } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { ImageReveal } from '@/components/animations/ImageReveal';
import { MagneticButton } from '@/components/animations/MagneticButton';
import { HeroCarousel } from '@/components/home/HeroCarousel';

const cottages = [
  { slug: 'monal-haven', name: 'Monal Haven', price: '₹12,000', desc: 'Premium duplex with jacuzzi, attic yoga balcony, and sweeping mountain views', image: '/images/hero-1.jpg' },
  { slug: 'koklass-cove', name: 'Koklass Cove', price: '₹12,500', desc: 'Our largest duplex — two viewing balconies, private jacuzzi, and unmatched privacy', image: '/images/hero-2.jpg' },
  { slug: 'magpie-retreat', name: 'Magpie Retreat', price: '₹11,000', desc: 'Charming duplex with deep-soak bath tub and dual-balcony setup', image: '/images/hero-3.jpg' },
];

const testimonials = [
  { name: 'Ananya & Rohit', content: 'Monal Haven was everything we dreamed of. Waking up to the mist over the mountains, the jacuzzi under the stars — pure magic.', rating: 5, location: 'Mumbai, India' },
  { name: 'Daniel Park', content: 'I wrote half my manuscript sitting on the balcony at Whistling Thrush. The staff was incredibly thoughtful.', rating: 5, location: 'Seoul, South Korea' },
  { name: 'Emily & James', content: 'Koklass Cove was perfection. The attic yoga balcony, the sweeping views — we felt like we were floating above the world.', rating: 5, location: 'Melbourne, Australia' },
];

const experiences = [
  { icon: FireExtinguisher, title: 'Bonfire Nights', desc: 'Gather around crackling fires under a canopy of stars with warm drinks and stories.' },
  { icon: Music, title: 'Music Nights', desc: 'Live acoustic sessions with local artists echoing through the valley.' },
  { icon: Trees, title: 'Nature Walks', desc: 'Guided treks through cedar forests to hidden waterfalls and panoramic viewpoints.' },
  { icon: Moon, title: 'Star Gazing', desc: 'Unpolluted Himalayan skies reveal constellations you have never seen before.' },
  { icon: Coffee, title: 'Café Evenings', desc: 'Handcrafted coffee and wood-fired meals as the sun sets behind the pines.' },
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

  const handleHomeBooking = (e: React.MouseEvent) => {
    if (!homeCheckIn || !homeCheckOut) return;
    const params = new URLSearchParams({ checkIn: homeCheckIn, checkOut: homeCheckOut });
    window.location.href = `/booking?${params}`;
  };

  return (
    <>
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
        <HeroCarousel />
        <div className="relative z-20 text-center px-4 max-w-4xl">
          <TextReveal
            as="h1"
            className="text-5xl md:text-7xl lg:text-8xl font-serif text-cream-50 leading-tight mb-6"
            delay={0.5}
          >
            The Vedara — A Himalayan Boutique Retreat
          </TextReveal>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-cream-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-sans leading-relaxed"
          >
            Seven handcrafted cottages, one cozy café — a slow-living mountain escape crafted for those who seek stillness.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
          >
            <Link href="/booking" className="vintage-button bg-cream-50 text-forest-800 hover:bg-cream-100 px-10 py-4 text-base inline-block">
              Book Your Stay <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </motion.div>
        </div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          onClick={() => document.getElementById('booking-bar')?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 cursor-pointer"
          aria-label="Scroll to booking section"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-cream-200/60">
            <ArrowRight className="w-5 h-5 rotate-90" />
          </motion.div>
        </motion.button>
      </section>

      <section id="booking-bar" className="relative z-30 -mt-12 mb-12 px-4">
        <div className="vintage-container max-w-4xl">
          <div className="bg-white/80 dark:bg-earth-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-earth-200 dark:border-earth-700 p-4 md:p-6 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-earth-600 dark:text-cream-300 mb-1">Property</label>
                <select className="w-full rounded-xl border border-earth-200 dark:border-earth-600 bg-white dark:bg-earth-700 px-3 py-2.5 text-sm text-earth-900 dark:text-cream-100 focus:outline-none focus:border-forest-500">
                  <option>The Vedara — Himalayan Boutique Retreat</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-earth-600 dark:text-cream-300 mb-1">Check In</label>
                <input type="date" value={homeCheckIn} onChange={(e) => setHomeCheckIn(e.target.value)} className="w-full rounded-xl border border-earth-200 dark:border-earth-600 bg-white dark:bg-earth-700 px-3 py-2.5 text-sm text-earth-900 dark:text-cream-100 focus:outline-none focus:border-forest-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-earth-600 dark:text-cream-300 mb-1">Check Out</label>
                <input type="date" value={homeCheckOut} onChange={(e) => setHomeCheckOut(e.target.value)} className="w-full rounded-xl border border-earth-200 dark:border-earth-600 bg-white dark:bg-earth-700 px-3 py-2.5 text-sm text-earth-900 dark:text-cream-100 focus:outline-none focus:border-forest-500" />
              </div>
              <div>
                <a onClick={handleHomeBooking} className="vintage-button-primary text-sm px-6 py-2.5 w-full text-center block cursor-pointer">
                  {homeCheckIn && homeCheckOut ? 'Check Availability' : 'Book Your Stay'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-28 md:py-36 overflow-hidden bg-earth-900">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=1920&q=80)', backgroundSize: 'cover' }} />
        <div className="relative z-10 vintage-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <div>
                <p className="text-clay-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Welcome to Vedara</p>
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-cream-50 mb-6">A Story Rooted in the Mountains</h2>
                <p className="text-cream-200/80 text-lg leading-relaxed mb-6">
                  Nestled in the serene village of Ghiyagi, within the untouched landscapes of Jibhi, Vedara was born from a simple belief — that the most profound luxury is found in stillness, connection, and the raw beauty of the Himalayas.
                </p>
                <p className="text-cream-200/60 leading-relaxed mb-8">
                  With seven handcrafted cottages and a soulful café, we offer more than a stay. We offer a chance to pause, breathe, and remember what truly matters.
                </p>
                <Link href="/about" className="vintage-button bg-clay-500 hover:bg-clay-600 text-cream-50 px-8 py-3.5">
                  Read Our Story <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <ImageReveal
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80"
                  alt="Himalayan mountain landscape at Vedara"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="section-padding bg-cream-50 dark:bg-earth-900">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Our Cottages</p>
              <h2 className="section-title mb-6">Seven Stories, Seven Retreats</h2>
              <p className="section-subtitle">
                Each cottage is a world unto itself — named after the birds of the valley and crafted with local materials, premium furnishings, and unobstructed mountain views.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            {cottages.map((cottage, i) => (
              <ScrollReveal key={cottage.name} delay={i * 0.15}>
                <div className="group vintage-card overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden bg-earth-200 dark:bg-earth-700">
                    <img src={`https://images.unsplash.com/photo-${['1504384308090-c894fdcc538d', '1554118811-1e0d58224f24', '1506905925346-21bda4d32df4'][i]}?w=600&q=80`} alt={cottage.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-xl text-foreground">{cottage.name}</h3>
                      <span className="text-forest-600 dark:text-forest-400 font-semibold text-sm">{cottage.price}<span className="text-earth-400 font-normal text-xs">/night</span></span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{cottage.desc}</p>
                    <Link href={`/cottages/slug/${cottage.slug}`} className="text-forest-600 dark:text-forest-400 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
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

      <section id="experiences" className="relative py-28 md:py-36 overflow-hidden bg-forest-800">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80)', backgroundSize: 'cover' }} />
        <div className="relative z-10 vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-clay-300 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Experiences</p>
              <h2 className="font-serif text-4xl md:text-5xl text-cream-50 mb-6">Moments That Stay With You</h2>
              <p className="text-cream-200/70 text-lg">Beyond the cottages, a world of experiences awaits — each designed to bring you closer to the mountains and to yourself.</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {experiences.map((exp, i) => (
              <ScrollReveal key={exp.title} delay={i * 0.1}>
                <div className="group vintage-card bg-white/10 backdrop-blur-sm border-cream-200/10 p-6 text-center hover:bg-white/20 transition-all duration-500 font-sans">
                  <div className="w-14 h-14 rounded-full bg-clay-500/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
                    <exp.icon className="w-7 h-7 text-clay-300" />
                  </div>
                  <h3 className="font-serif text-lg text-cream-50 mb-2">{exp.title}</h3>
                  <p className="text-cream-200/60 text-sm leading-relaxed">{exp.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-28 md:py-36 overflow-hidden bg-earth-900">
        <div className="relative z-10 vintage-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <div>
                <p className="text-clay-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Our Café</p>
                <h2 className="font-serif text-4xl md:text-5xl text-cream-50 mb-6">Café Charade</h2>
                <p className="text-cream-200/80 text-lg leading-relaxed mb-4">
                  Nestled beside a whispering stream, Café Charade serves handcrafted coffee, wood-fired meals, and mountain-fresh bakes.
                </p>
                <p className="text-cream-200/60 text-sm mb-8 space-y-1">
                  <span className="block">Breakfast 7:30 AM – 10:00 AM</span>
                  <span className="block">Lunch 12:00 PM – 3:30 PM</span>
                  <span className="block">Dinner 7:00 PM – 10:00 PM</span>
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {['Artisan Coffee', 'Wood-Fired', 'Fresh Bakes', 'Evening Sips'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-cream-200">
                      <Coffee className="w-4 h-4 text-clay-400" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <MagneticButton>
                  <Link href="/cafe" className="vintage-button bg-clay-500 hover:bg-clay-600 text-cream-50 px-8 py-3.5 inline-block">
                    Explore Menu <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </MagneticButton>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <ImageReveal
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80"
                  alt="Café Charade at The Vedara"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="section-padding bg-cream-50 dark:bg-earth-900">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Testimonials</p>
              <h2 className="section-title mb-6">Voices from the Mountains</h2>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 0.15}>
                <motion.div
                  className="vintage-card p-8 relative overflow-hidden"
                  whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-clay-500/5 to-transparent rounded-bl-full" />
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 + t.rating * 0.1 }}
                      >
                        <Star className="w-4 h-4 fill-clay-400 text-clay-400" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-earth-700 dark:text-cream-300 text-sm leading-relaxed mb-6 italic">&ldquo;{t.content}&rdquo;</p>
                  <div className="border-t border-border/50 pt-4">
                    <p className="font-serif text-foreground font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Explore Nearby</p>
              <h2 className="section-title mb-6">Discover the Valley</h2>
              <p className="section-subtitle">Vedara is your gateway to the raw beauty of Jibhi and beyond</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {nearbyAttractions.map((place, i) => (
              <ScrollReveal key={place.name} delay={i * 0.1}>
                <div className="vintage-card p-6 flex items-start gap-4 group hover:border-clay-300 transition-colors">
                  <div className="w-11 h-11 rounded-xl bg-clay-100 dark:bg-clay-900/30 flex items-center justify-center flex-shrink-0">
                    <place.icon className="w-5 h-5 text-clay-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm group-hover:text-clay-600 transition-colors">{place.name}</h3>
                    <span className="text-xs text-muted-foreground">{place.distance}</span>
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

      <section id="how-to-reach" className="section-padding bg-cream-50 dark:bg-earth-900">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Getting Here</p>
              <h2 className="section-title mb-6">How to Reach The Vedara</h2>
              <p className="section-subtitle">Your journey to Ghiyagi, Jibhi begins here</p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <ScrollReveal delay={0.1}>
              <div className="vintage-card p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-forest-600 dark:text-forest-400" />
                </div>
                <h3 className="font-serif text-lg mb-3">By Road</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Delhi to Jibhi via Mandi-Aut-Larji. ~480 km, approximately 10–11 hours. Buses available from Delhi ISBT to Aut, then taxi to Jibhi.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="vintage-card p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-clay-100 dark:bg-clay-900/30 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-clay-500" />
                </div>
                <h3 className="font-serif text-lg mb-3">By Rail</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Nearest broad-gauge station: Amb Andaura (~120 km). Nearest narrow-gauge: Shimla or Joginder Nagar. Taxis available from all stations.</p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="vintage-card p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-cream-200 dark:bg-cream-800/30 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-clay-600 dark:text-clay-400" />
                </div>
                <h3 className="font-serif text-lg mb-3">By Air</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Bhuntar Airport (Kullu) is the nearest, ~50 km from Jibhi. Flights from Delhi and Chandigarh. Taxi from Bhuntar to Ghiyagi takes ~1.5 hours.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-forest-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=1920&q=80)', backgroundSize: 'cover' }} />
        <div className="relative z-10 vintage-container text-center">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-5xl text-cream-50 mb-4">Ready to Escape?</h2>
            <p className="text-cream-200/80 text-lg max-w-xl mx-auto mb-8">
              Book your mountain story today. Early check-in and late check-out available on request.
            </p>
            <MagneticButton>
              <Link href="/booking" className="vintage-button bg-cream-50 text-forest-800 hover:bg-cream-100 px-10 py-4 text-base inline-block">
                Begin Your Journey <Sparkles className="w-4 h-4 ml-2" />
              </Link>
            </MagneticButton>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
