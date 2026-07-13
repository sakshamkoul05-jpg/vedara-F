'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { ArrowRight, Star, Coffee, Trees, Sparkles, Music, Moon, MapPin, TreePine } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { ImageReveal } from '@/components/animations/ImageReveal';
import { MagneticButton } from '@/components/animations/MagneticButton';
import { WaterRipple } from '@/components/animations/WaterRipple';
import { MountainSpotlight } from '@/components/animations/MountainSpotlight';
import { HeroCarousel } from '@/components/home/HeroCarousel';
import { PackageBanner } from '@/components/public/PackageBanner';
import { WeatherWidget } from '@/components/public/WeatherWidget';
import { AvailabilityHeatmap } from '@/components/public/AvailabilityHeatmap';
import { getToday } from '@/lib/utils';

const cottages = [
  { slug: 'monal-haven', name: 'Monal Haven', price: '₹12,000', desc: 'Premium Duplex Family Suite with private jacuzzi, attic yoga balcony, and sweeping mountain views', image: '/images/hero-1.jpg', category: 'Premium Duplex Family Suite' },
  { slug: 'koklass-cove', name: 'Koklass Cove', price: '₹12,500', desc: 'Our largest duplex with two viewing balconies, private jacuzzi, and unmatched privacy', image: '/images/hero-2.jpg', category: 'Premium Duplex Family Suite' },
  { slug: 'magpie-retreat', name: 'Magpie Retreat', price: '₹11,000', desc: 'Charming duplex with deep-soak bathtub and dual-balcony setup', image: '/images/hero-3.jpg', category: 'Premium Duplex Family Suite' },
  { slug: 'whistling-thrush', name: 'Whistling Thrush', price: '₹7,500', desc: 'Intimate Mountain View Suite — a melody of mountain quietude', image: '/images/hero-1.jpg', category: 'Intimate Mountain View Suite' },
  { slug: 'flycatcher-nook', name: 'Flycatcher Nook', price: '₹7,500', desc: 'Intimate Mountain View Suite — your cozy Himalayan hideaway', image: '/images/hero-2.jpg', category: 'Intimate Mountain View Suite' },
  { slug: 'bulbul-nest', name: 'Bulbul Nest', price: '₹7,500', desc: 'Intimate Mountain View Suite with workstation — where coziness meets the peaks', image: '/images/hero-3.jpg', category: 'Intimate Mountain View Suite' },
  { slug: 'the-finch-nook', name: 'The Finch Nook', price: '₹5,000', desc: 'Cozy Alpine Studio — small space, boundless solitude', image: '/images/hero-1.jpg', category: 'Cozy Alpine Studio' },
];

const testimonials = [
  { name: 'Ananya & Rohit', content: 'Monal Haven was everything we dreamed of. Waking up to the mist over the mountains, the jacuzzi under the stars – pure magic.', rating: 5, location: 'Mumbai, India' },
  { name: 'Daniel Park', content: 'I wrote half my manuscript sitting on the balcony at Whistling Thrush. The staff was incredibly thoughtful.', rating: 5, location: 'Seoul, South Korea' },
  { name: 'Emily & James', content: 'Koklass Cove was perfection. The attic yoga balcony, the sweeping views – we felt like we were floating above the world.', rating: 5, location: 'Melbourne, Australia' },
];

const experiences = [
  { icon: Sparkles, title: 'Bonfire Nights', desc: 'Cozy evenings with music, stories and starlit skies', image: 'https://images.unsplash.com/photo-1574336310290-8f545d91cd5f?w=600&q=80' },
  { icon: Trees, title: 'Nature Walks', desc: 'Guided forest trails to waterfalls and viewpoints', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80' },
  { icon: Coffee, title: 'Café Experience', desc: 'Fresh local cuisine and artisan coffee', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80' },
  { icon: Moon, title: 'Mountain Mornings', desc: 'Peaceful sunrise views over the Himalayas', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80' },
  { icon: Music, title: 'Music Nights', desc: 'Live acoustic sessions with local artists', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80' },
  { icon: MapPin, title: 'Lambhari Top Trek', desc: 'Panoramic Himalayan summit views', image: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=600&q=80' },
  { icon: TreePine, title: 'Great Himalayan NP', desc: 'UNESCO wilderness guided adventure', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80' },
  { icon: Sparkles, title: 'Kids Zone', desc: 'Nature-inspired games for young explorers', image: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&q=80' },
];

const nearbyAttractions = [
  { name: 'Jibhi Waterfall', distance: '4 km', icon: MapPin, mapQuery: 'Jibhi+Waterfall+Himachal+Pradesh' },
  { name: 'Mini Thailand', distance: '1.2 km', icon: MapPin, mapQuery: 'Mini+Thailand+Jibhi+Himachal+Pradesh' },
  { name: 'Jalori Pass', distance: '10 km', icon: MapPin, mapQuery: 'Jalori+Pass+Himachal+Pradesh' },
  { name: 'Serolsar Lake', distance: '10 km + trek', icon: MapPin, mapQuery: 'Serolsar+Lake+Himachal+Pradesh' },
];

export default function HomePage() {
  const [homeCheckIn, setHomeCheckIn] = useState('');
  const [homeCheckOut, setHomeCheckOut] = useState('');
  const [homeAdults, setHomeAdults] = useState('2');
  const [homeChildren, setHomeChildren] = useState('0');
  const [homeNationality, setHomeNationality] = useState('Indian');
  const [dateError, setDateError] = useState('');
  const heroRef = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  const today = getToday();

  useEffect(() => {
    const hero = heroRef.current;
    const spotlight = spotlightRef.current;
    if (!hero || !spotlight) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spotlight.style.background = `
        radial-gradient(
          circle 220px at ${x}px ${y}px,
          transparent 0%,
          rgba(28, 43, 58, 0.7) 100%
        )
      `;
    };

    const handleMouseLeave = () => {
      spotlight.style.background = `
        radial-gradient(
          circle 220px at 50% 50%,
          transparent 0%,
          rgba(28, 43, 58, 0.7) 100%
        )
      `;
    };

    hero.addEventListener('mousemove', handleMouseMove);
    hero.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      hero.removeEventListener('mousemove', handleMouseMove);
      hero.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const hero = heroRef.current;
      if (!hero || y > window.innerHeight) return;

      const layers = hero.querySelectorAll('[data-parallax]');
      layers.forEach((layer) => {
        const speed = parseFloat((layer as HTMLElement).dataset.parallax || '0');
        (layer as HTMLElement).style.transform = `translateY(${y * speed}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    window.location.href = `/booking?${params.toString()}`;
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
      <WaterRipple />
      <MountainSpotlight selector="#hero" radius={220} color="rgba(28, 43, 58, 0.7)" />
      
      {/* Hero */}
      <section id="hero" ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden" data-spotlight>
        {/* Parallax Background Layers */}
        <div data-parallax="0.05" className="absolute inset-0 bg-cover bg-center scale-110" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=1920&q=80)' }} />
        <div data-parallax="0.15" className="absolute inset-0 bg-cover bg-center opacity-60 mix-blend-overlay" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80)' }} />
        <div data-parallax="0.3" className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-soft-light" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80)' }} />
        <div data-parallax="0.5" className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#1C2B3A]/80 to-transparent" />

        {/* Spotlight Overlay */}
        <div
          ref={spotlightRef}
          className="absolute inset-0 z-10 pointer-events-none transition-none"
          style={{
            background: 'radial-gradient(circle 220px at 50% 50%, transparent 0%, rgba(28, 43, 58, 0.7) 100%)',
          }}
        />

        {/* Cinematic warm scrim for legibility */}
        <div className="absolute inset-0 z-[11] pointer-events-none bg-gradient-to-b from-[#0E0A06]/45 via-[#0E0A06]/10 to-[#0E0A06]/75" />

        <div className="relative z-20 text-center px-4 max-w-4xl">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="inline-flex items-center gap-3 mb-5 text-[0.7rem] font-sans font-semibold uppercase tracking-[0.3em] text-gold-300/90"
          >
            <span className="h-px w-8 bg-gold-300/60" />
            Jibhi · Himachal Pradesh
            <span className="h-px w-8 bg-gold-300/60" />
          </motion.span>
          <TextReveal
            as="h1"
            className="display text-4xl md:text-5xl lg:text-6xl text-white leading-[1.05] mb-5 tracking-[0.08em]"
            delay={0.5}
          >
            THE VEDARA
          </TextReveal>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-gold-300 text-lg md:text-xl max-w-2xl mx-auto mb-6 font-serif tracking-wide"
          >
            A Himalayan Boutique Retreat
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-white/80 text-sm md:text-base max-w-xl mx-auto mb-8 font-sans leading-relaxed"
          >
            Handcrafted sanctuaries, a soulful café, and a slow-living mountain escape crafted for those who seek stillness.
          </motion.p>
            <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 1.3, duration: 0.8 }}
           >
             <Link href="/booking" className="vintage-button bg-gold-600 text-white hover:bg-gold-700 px-12 py-4 text-base md:text-lg font-semibold inline-flex items-center justify-center shadow-glow ring-2 ring-gold-300/40 hover:ring-gold-300/70 hover:-translate-y-0.5 btn-fill-slide btn-fill-light hover:text-[#1C2B3A]">
                Book Your Stay <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
           </motion.div>
        </div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          onClick={() => {
            document.getElementById('booking-bar')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 cursor-pointer"
          aria-label="Scroll to booking section"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-white/50">
            <ArrowRight className="w-5 h-5 rotate-90" />
          </motion.div>
        </motion.button>
      </section>

      <PackageBanner />

      {/* Booking Bar */}
      <section id="booking-bar" className="relative z-30 mb-12 px-4">
        <div className="vintage-container max-w-6xl">
          <div className="grid md:grid-cols-3 gap-4">
            <div style={{ gridColumn: 'span 2 / span 2', background: 'var(--clr-surface)', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 4px 24px rgba(28,43,58,0.12)', border: '1px solid var(--clr-stone)' }} className="md:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end mb-3">
                <div>
                  <label className="vintage-label">Check In</label>
                  <input type="date" value={homeCheckIn} onChange={handleCheckInChange} min={today} className="vintage-input" style={{ borderBottom: '1px solid var(--clr-stone)', fontSize: '0.9rem', padding: '8px 0' }} />
                </div>
                <div>
                  <label className="vintage-label">Check Out</label>
                  <input type="date" value={homeCheckOut} onChange={handleCheckOutChange} min={homeCheckIn || today} className="vintage-input" style={{ borderBottom: '1px solid var(--clr-stone)', fontSize: '0.9rem', padding: '8px 0' }} />
                </div>
                <div>
                  <label className="vintage-label">Adults</label>
                  <select value={homeAdults} onChange={(e) => setHomeAdults(e.target.value)} className="vintage-input" style={{ borderBottom: '1px solid var(--clr-stone)', fontSize: '0.9rem', padding: '8px 0', background: 'transparent' }}>
                    {[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="vintage-label">Children</label>
                  <select value={homeChildren} onChange={(e) => setHomeChildren(e.target.value)} className="vintage-input" style={{ borderBottom: '1px solid var(--clr-stone)', fontSize: '0.9rem', padding: '8px 0', background: 'transparent' }}>
                    {[0,1,2,3].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="vintage-label">Nationality</label>
                  <select value={homeNationality} onChange={(e) => setHomeNationality(e.target.value)} className="vintage-input" style={{ borderBottom: '1px solid var(--clr-stone)', fontSize: '0.9rem', padding: '8px 0', background: 'transparent' }}>
                    <option value="Indian">Indian</option>
                    <option value="Foreign">Foreign National</option>
                  </select>
                </div>
                <div>
                  <button onClick={handleHomeBooking} className="vintage-button-primary" style={{ width: '100%', padding: '12px 24px', fontSize: '0.85rem' }}>
                    {homeCheckIn && homeCheckOut ? 'Check Availability' : 'Book Your Stay'}
                  </button>
                </div>
              </div>
              {dateError && (
                <p style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '8px', textAlign: 'center' }}>{dateError}</p>
              )}
            </div>
            <div className="hidden md:block">
              <WeatherWidget />
            </div>
          </div>
        </div>
      </section>

      {/* Welcome */}
      <section id="welcome" className="relative py-28 md:py-36 overflow-hidden section-dark">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=1920&q=80)', backgroundSize: 'cover' }} />
        <div className="relative z-10 vintage-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <div>
                <p className="eyebrow mb-4">Welcome to The Vedara</p>
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-6">A Story Rooted in the Mountains</h2>
                <p className="text-white/80 text-lg leading-relaxed mb-6">
                  Nestled in the serene village of Ghiyagi, within the untouched landscapes of Jibhi, The Vedara was born from a simple belief – that the most profound luxury is found in stillness, connection, and the raw beauty of the Himalayas.
                </p>
                <p className="text-white/60 leading-relaxed mb-8">
                  With six cozy cottages and one alpine studio, and a soulful café, we offer more than a stay. We offer a chance to pause, breathe, and remember what truly matters.
                </p>
                <Link href="/about" className="vintage-button bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3.5 shadow-lg btn-bottom-fill">
                  Read Our Story <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <div className="aspect-[4/5] rounded-lg overflow-hidden shadow-2xl">
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
      <section className="section-padding bg-background frosted-section">
        <div className="relative z-10 vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="eyebrow-center mb-4">Our Cottages</p>
              <h2 className="section-title mb-6">6 Cozy Cottages & 1 Alpine Studio</h2>
              <p className="section-subtitle">
                Each cottage is a world unto itself – named after the birds of the valley and crafted with local materials, premium furnishings, and unobstructed mountain views.
              </p>
            </div>
          </ScrollReveal>
          {/* Premium Duplex Family Suites */}
          <div className="mb-12">
            <ScrollReveal>
              <div className="mb-6">
                <p className="text-gold-500 text-xs tracking-[0.2em] uppercase mb-1 font-sans">Cottages 1 – 3</p>
                <h3 className="font-serif text-xl text-foreground">Premium Duplex Family Suites</h3>
              </div>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cottages.filter(c => c.category === 'Premium Duplex Family Suite').map((cottage, i) => (
                <ScrollReveal key={cottage.name} delay={i * 0.08} direction="up" distance={40}>
                    <article className="group vintage-card overflow-hidden reveal h-full flex flex-col">
                    <div className="aspect-[4/3] overflow-hidden bg-sand-200">
                      <img src={`https://images.unsplash.com/photo-${['1504384308090-c894fdcc538d', '1554118811-1e0d58224f24', '1506905925346-21bda4d32df4'][i]}?w=600&q=80`} alt={`${cottage.name} - premium duplex suite at The Vedara`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-serif text-lg text-foreground">{cottage.name}</h4>
                        <span className="text-primary font-semibold text-sm">{cottage.price}<span className="text-muted-foreground font-normal text-xs">/night</span></span>
                      </div>
                      <p className="text-muted-foreground text-xs mb-3 leading-relaxed line-clamp-2 flex-1">{cottage.desc}</p>
                      <Link href={`/cottages/slug/${cottage.slug}`} className="text-primary text-xs font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all duration-500 mt-auto">
                        View Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Intimate Mountain View Suites */}
          <div className="mb-12">
            <ScrollReveal>
              <div className="mb-6">
                <p className="text-gold-500 text-xs tracking-[0.2em] uppercase mb-1 font-sans">Cottages 4 – 6</p>
                <h3 className="font-serif text-xl text-foreground">Intimate Mountain View Suites</h3>
              </div>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cottages.filter(c => c.category === 'Intimate Mountain View Suite').map((cottage, i) => (
                <ScrollReveal key={cottage.name} delay={i * 0.08} direction="up" distance={40}>
                    <article className="group vintage-card overflow-hidden reveal h-full flex flex-col">
                    <div className="aspect-[4/3] overflow-hidden bg-sand-200">
                      <img src={`https://images.unsplash.com/photo-${['1476514525535-07fb3b4ae5f1', '1519681393784-d120267933ba', '1469476568026-46a7f7b2f9c2'][i]}?w=600&q=80`} alt={`${cottage.name} - intimate mountain view suite at The Vedara`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-serif text-lg text-foreground">{cottage.name}</h4>
                        <span className="text-primary font-semibold text-sm">{cottage.price}<span className="text-muted-foreground font-normal text-xs">/night</span></span>
                      </div>
                      <p className="text-muted-foreground text-xs mb-3 leading-relaxed line-clamp-2 flex-1">{cottage.desc}</p>
                      <Link href={`/cottages/slug/${cottage.slug}`} className="text-primary text-xs font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all duration-500 mt-auto">
                        View Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>

          {/* Cozy Alpine Studio */}
          <div className="mb-12">
            <ScrollReveal>
              <div className="mb-6">
                <p className="text-gold-500 text-xs tracking-[0.2em] uppercase mb-1 font-sans">Cottage 6</p>
                <h3 className="font-serif text-xl text-foreground">Cozy Alpine Studio</h3>
              </div>
            </ScrollReveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cottages.filter(c => c.category === 'Cozy Alpine Studio').map((cottage, i) => (
                <ScrollReveal key={cottage.name} delay={i * 0.08} direction="up" distance={40}>
                    <article className="group vintage-card overflow-hidden reveal h-full flex flex-col">
                    <div className="aspect-[4/3] overflow-hidden bg-sand-200">
                      <img src={`https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80`} alt={`${cottage.name} - cozy alpine studio at The Vedara`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-serif text-lg text-foreground">{cottage.name}</h4>
                        <span className="text-primary font-semibold text-sm">{cottage.price}<span className="text-muted-foreground font-normal text-xs">/night</span></span>
                      </div>
                      <p className="text-muted-foreground text-xs mb-3 leading-relaxed line-clamp-2 flex-1">{cottage.desc}</p>
                      <Link href={`/cottages/slug/${cottage.slug}`} className="text-primary text-xs font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all duration-500 mt-auto">
                        View Details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </div>

          <ScrollReveal delay={0.3}>
            <div className="text-center mt-10">
              <Link href="/cottages" className="vintage-button-outline">
                View All Cottages <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Experiences */}
      <section id="experiences" className="relative py-28 md:py-36 overflow-hidden section-dark">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80)', backgroundSize: 'cover' }} />
        <div className="absolute inset-0 liquid-gradient opacity-30" />
        <div className="relative z-10 vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="eyebrow mb-4">Experiences</p>
              <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">Moments That Stay With You</h2>
              <p className="text-white/70 text-lg">Beyond the cottages, a world of experiences awaits – each designed to bring you closer to the mountains and to yourself.</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {experiences.map((exp, i) => (
                  <ScrollReveal key={exp.title} delay={i * 0.08} direction="up" distance={40}>
                    <article className="group rounded-2xl overflow-hidden transition-all duration-500 font-sans border border-white/8 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] reveal h-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="aspect-[16/10] overflow-hidden relative">
                        <img src={exp.image} alt={exp.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="font-serif text-lg text-white mb-1">{exp.title}</h3>
                          <p className="text-white/70 text-xs leading-relaxed">{exp.desc}</p>
                        </div>
                      </div>
                    </article>
                  </ScrollReveal>
                ))}
          </div>
        </div>
      </section>

      {/* Café */}
      <section className="relative py-28 md:py-36 overflow-hidden section-dark">
        <div className="relative z-10 vintage-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <div>
                <p className="eyebrow mb-4">Our Café</p>
                <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">Café Charade</h2>
                <p className="text-white/80 text-lg leading-relaxed mb-4">
                  Nestled beside a whispering stream, Café Charade serves handcrafted coffee, wood-fired meals, and mountain-fresh bakes.
                </p>
                <p className="text-white/60 text-sm mb-8 space-y-1">
                  <span className="block">Breakfast 7:30 AM – 10:00 AM</span>
                  <span className="block">Lunch 12:00 PM – 3:30 PM</span>
                  <span className="block">Dinner 7:00 PM – 10:00 PM</span>
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {['Artisan Coffee', 'Home-Style Meals', 'Mixed Pakodas', 'Fresh Treats'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-white">
                      <Coffee className="w-4 h-4 text-gold-400" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
                <MagneticButton>
                  <Link href="/cafe" className="vintage-button bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3.5 inline-block shadow-lg btn-bottom-fill">
                    Explore Menu <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </MagneticButton>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <div className="aspect-[4/5] rounded-lg overflow-hidden shadow-2xl">
                <ImageReveal
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80"
                  alt="Café Charade at The Vedara"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-slate-50 dark:bg-[#13110E]">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="eyebrow-center mb-4">Testimonials</p>
              <h2 className="section-title mb-6">Voices from the Mountains</h2>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 0.12} direction="up" distance={40}>
                  <motion.article
                    className="vintage-card p-7 relative overflow-hidden reveal h-full"
                  whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/8 to-transparent rounded-bl-full" />
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 + t.rating * 0.1 }}
                      >
                        <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5 italic">&ldquo;{t.content}&rdquo;</p>
                  <div className="border-t border-border/30 pt-4">
                    <p className="font-serif text-foreground font-medium text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground/70">{t.location}</p>
                  </div>
                </motion.article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Nearby */}
      <section className="section-padding bg-background frosted-section">
        <div className="relative z-10 vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="eyebrow-center mb-4">Explore Nearby</p>
              <h2 className="section-title mb-6">Discover the Valley</h2>
              <p className="section-subtitle">The Vedara is your gateway to the raw beauty of Jibhi and beyond</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {nearbyAttractions.map((place, i) => (
              <ScrollReveal key={place.name} delay={i * 0.1} direction="up" distance={40}>
                <a
                  href={`https://www.google.com/maps/search/${place.mapQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block vintage-card p-5 flex items-start gap-4 group hover:border-primary/30 transition-all duration-300 reveal h-full"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-300">
                    <place.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm group-hover:text-primary transition-colors duration-300">{place.name}</h3>
                    <span className="text-xs text-muted-foreground/70">{place.distance}</span>
                  </div>
                </a>
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
      <section id="how-to-reach" className="section-padding bg-slate-50 dark:bg-[#13110E]">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="eyebrow-center mb-4">Getting Here</p>
              <h2 className="section-title mb-6">How to Reach The Vedara</h2>
              <p className="section-subtitle">Your journey to Ghiyagi, Jibhi, begins here</p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <ScrollReveal delay={0.1} direction="up" distance={40}>
              <article className="vintage-card p-7 text-center reveal h-full">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-lg mb-3 text-foreground">By Road</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Delhi to Jibhi via Mandi–Aut–Larji. Approximately 480 km, 10–11 hours. Buses available from Delhi ISBT to Aut, then a taxi to Jibhi.</p>
              </article>
            </ScrollReveal>
            <ScrollReveal delay={0.2} direction="up" distance={40}>
              <article className="vintage-card p-7 text-center reveal h-full">
                <div className="w-14 h-14 rounded-2xl bg-[#9B8EA0]/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-[#9B8EA0]" />
                </div>
                <h3 className="font-serif text-lg mb-3 text-foreground">By Rail</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Nearest broad-gauge station: Amb Andaura (~120 km). Nearest narrow-gauge: Shimla or Joginder Nagar. Taxis available from all stations.</p>
              </article>
            </ScrollReveal>
            <ScrollReveal delay={0.3} direction="up" distance={40}>
              <article className="vintage-card p-7 text-center reveal h-full">
                <div className="w-14 h-14 rounded-2xl bg-gold-400/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-gold-500" />
                </div>
                <h3 className="font-serif text-lg mb-3 text-foreground">By Air</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Bhuntar Airport (Kullu) is the nearest, ~50 km from Jibhi. Flights from Delhi and Chandigarh. Taxi from Bhuntar to Ghiyagi takes ~1.5 hours.</p>
              </article>
            </ScrollReveal>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <div className="vintage-card rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Nearest Landmark</p>
                <p className="text-sm font-medium text-foreground">Ghiyagi Bus Stop</p>
              </div>
            </div>
              <div className="vintage-card rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold-100 dark:bg-gold-800/30 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-gold-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Distance from Bus Stop</p>
                <p className="text-sm font-medium text-foreground">~5 min walk / 2 min drive</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 section-dark relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=1920&q=80)', backgroundSize: 'cover' }} />
        <div className="absolute inset-0 liquid-gradient opacity-20" />
        <div className="relative z-10 vintage-container text-center">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-5xl text-white mb-4">Ready to Escape?</h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
              Book your mountain story today. Early check-in and late check-out are subject to availability and prior confirmation.
            </p>
            <MagneticButton>
              <Link href="/booking" className="vintage-button bg-white/90 text-[#1C2B3A] hover:bg-white px-10 py-4 text-base inline-block shadow-xl btn-fill-slide btn-fill-dark hover:text-white">
                Begin Your Journey <Sparkles className="w-4 h-4 ml-2" />
              </Link>
            </MagneticButton>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
