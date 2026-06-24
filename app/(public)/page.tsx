'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';
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
  { icon: Sparkles, title: 'Bonfire Nights', desc: 'Gather around crackling fires under a canopy of stars with warm drinks and stories.' },
  { icon: Music, title: 'Music Nights', desc: 'Live acoustic sessions with local artists echoing through the valley.' },
  { icon: Trees, title: 'Nature Walks', desc: 'Guided treks through cedar forests to hidden waterfalls and panoramic viewpoints.' },
  { icon: Moon, title: 'Star Gazing', desc: 'Unpolluted Himalayan skies reveal constellations you have never seen before.' },
  { icon: Coffee, title: 'Café Evenings', desc: 'Handcrafted coffee and wood-fired meals as the sun sets behind the pines.' },
  { icon: MapPin, title: 'Lambhari Top Trek', desc: 'A scenic trek to Lambhari Top with panoramic Himalayan views. Explore the trail with our guided excursions.' },
  { icon: TreePine, title: 'Great Himalayan NP', desc: 'Explore the untouched wilderness of the Great Himalayan National Park and Tirthan Valley on a guided hilltop adventure.' },
  { icon: Sparkles, title: 'Kids Zone', desc: 'Dedicated outdoor space for young explorers featuring games, activities, and nature-inspired experiences.' },
];

const nearbyAttractions = [
  { name: 'Jibhi Waterfall', distance: '4 km', icon: MapPin },
  { name: 'Mini Thailand', distance: '1.2 km', icon: MapPin },
  { name: 'Jalori Pass', distance: '10 km', icon: MapPin },
  { name: 'Serolsar Lake', distance: '10 km + trek', icon: MapPin },
];

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

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

        <div className="relative z-20 text-center px-4 max-w-4xl">
          <TextReveal
            as="h1"
            className="text-6xl md:text-8xl lg:text-9xl font-serif text-white leading-tight mb-4 tracking-widest"
            delay={0.5}
          >
            THE VEDARA
          </TextReveal>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-white/75 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-serif tracking-wide"
          >
            A Himalayan Boutique Retreat – Eight handcrafted sanctuaries, one cozy café, and a slow-living mountain escape crafted for those who seek stillness.
          </motion.p>
            <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 1.3, duration: 0.8 }}
           >
             <Link href="/booking" className="vintage-button bg-white/90 text-[#1C2B3A] hover:bg-white px-10 py-4 text-base inline-flex items-center justify-center shadow-lg btn-fill-slide">
               Book Your Stay <ArrowRight className="w-4 h-4 ml-2" />
             </Link>
           </motion.div>
        </div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          onClick={() => {
            document.getElementById('welcome')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 cursor-pointer"
          aria-label="Scroll to content"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-white/50">
            <ArrowRight className="w-5 h-5 rotate-90" />
          </motion.div>
        </motion.button>
      </section>

      <PackageBanner />

      {/* Weather Section */}
      <section className="relative z-30 mb-12 px-4">
        <div className="vintage-container max-w-4xl">
          <WeatherWidget />
        </div>
      </section>

      {/* Welcome */}
      <section id="welcome" className="relative py-28 md:py-36 overflow-hidden bg-[#1C2B3A]">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=1920&q=80)', backgroundSize: 'cover' }} />
        <div className="relative z-10 vintage-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <div>
                <p className="text-gold-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Welcome to The Vedara</p>
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-6">A Story Rooted in the Mountains</h2>
                <p className="text-white/80 text-lg leading-relaxed mb-6">
                  Nestled in the serene village of Ghiyagi, within the untouched landscapes of Jibhi, The Vedara was born from a simple belief – that the most profound luxury is found in stillness, connection, and the raw beauty of the Himalayas.
                </p>
                <p className="text-white/60 leading-relaxed mb-8">
                  With seven cozy cottages and one alpine studio, and a soulful café, we offer more than a stay. We offer a chance to pause, breathe, and remember what truly matters.
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
              <p className="text-primary text-sm tracking-[0.2em] uppercase mb-4 font-sans">Our Cottages</p>
              <h2 className="section-title mb-6">7 Cozy Cottages & 1 Alpine Studio</h2>
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
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {cottages.filter(c => c.category === 'Premium Duplex Family Suite').map((cottage, i) => (
                <ScrollReveal key={cottage.name} delay={i * 0.08} direction="up" distance={40}>
                  <article className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 reveal h-full flex flex-col">
                    <div className="aspect-[4/3] overflow-hidden bg-sand-200">
                      <img src={`https://images.unsplash.com/photo-${['1504384308090-c894fdcc538d', '1554118811-1e0d58224f24', '1506905925346-21bda4d32df4'][i]}?w=600&q=80`} alt={cottage.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
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
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {cottages.filter(c => c.category === 'Intimate Mountain View Suite').map((cottage, i) => (
                <ScrollReveal key={cottage.name} delay={i * 0.08} direction="up" distance={40}>
                  <article className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 reveal h-full flex flex-col">
                    <div className="aspect-[4/3] overflow-hidden bg-sand-200">
                      <img src={`https://images.unsplash.com/photo-${['1476514525535-07fb3b4ae5f1', '1519681393784-d120267933ba', '1469476568026-46a7f7b2f9c2'][i]}?w=600&q=80`} alt={cottage.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
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
                <p className="text-gold-500 text-xs tracking-[0.2em] uppercase mb-1 font-sans">Cottage 7</p>
                <h3 className="font-serif text-xl text-foreground">Cozy Alpine Studio</h3>
              </div>
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {cottages.filter(c => c.category === 'Cozy Alpine Studio').map((cottage, i) => (
                <ScrollReveal key={cottage.name} delay={i * 0.08} direction="up" distance={40}>
                  <article className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-500 reveal h-full flex flex-col">
                    <div className="aspect-[4/3] overflow-hidden bg-sand-200">
                      <img src={`https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&q=80`} alt={cottage.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
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
      <section id="experiences" className="relative py-28 md:py-36 overflow-hidden bg-[#1C2B3A]">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80)', backgroundSize: 'cover' }} />
        <div className="absolute inset-0 liquid-gradient opacity-30" />
        <div className="relative z-10 vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-gold-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Experiences</p>
              <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">Moments That Stay With You</h2>
              <p className="text-white/70 text-lg">Beyond the cottages, a world of experiences awaits – each designed to bring you closer to the mountains and to yourself.</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {experiences.map((exp, i) => (
                  <ScrollReveal key={exp.title} delay={i * 0.08} direction="up" distance={40}>
                    <article className="group rounded-2xl p-6 text-center transition-all duration-500 font-sans border border-white/8 reveal h-[220px] flex flex-col items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#9B8EA0]/25 to-[#9B8EA0]/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                        <exp.icon className="w-7 h-7 text-[#9B8EA0]" />
                      </div>
                      <h3 className="font-serif text-lg text-white mb-2">{exp.title}</h3>
                      <p className="text-white/60 text-sm leading-relaxed line-clamp-3">{exp.desc}</p>
                    </article>
                  </ScrollReveal>
                ))}
          </div>
        </div>
      </section>

      {/* Café */}
      <section className="relative py-28 md:py-36 overflow-hidden bg-[#1C2B3A]">
        <div className="relative z-10 vintage-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <div>
                <p className="text-gold-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Our Café</p>
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
      <section className="section-padding bg-slate-50">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-primary text-sm tracking-[0.2em] uppercase mb-4 font-sans">Testimonials</p>
              <h2 className="section-title mb-6">Voices from the Mountains</h2>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 0.12} direction="up" distance={40}>
                <motion.article
                  className="bg-white rounded-2xl p-7 relative overflow-hidden reveal h-[260px] flex flex-col"
                  whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.06)' }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/8 to-transparent rounded-bl-full" />
                  <div className="flex gap-1 mb-4 flex-shrink-0">
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
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5 italic flex-1 line-clamp-4">&ldquo;{t.content}&rdquo;</p>
                  <div className="border-t border-border/30 pt-4 flex-shrink-0">
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
              <p className="text-primary text-sm tracking-[0.2em] uppercase mb-4 font-sans">Explore Nearby</p>
              <h2 className="section-title mb-6">Discover the Valley</h2>
              <p className="section-subtitle">The Vedara is your gateway to the raw beauty of Jibhi and beyond</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {nearbyAttractions.map((place, i) => (
              <ScrollReveal key={place.name} delay={i * 0.1} direction="up" distance={40}>
                <article className="bg-white rounded-2xl p-5 flex items-start gap-4 group hover:border-primary/30 transition-all duration-500 reveal h-[100px]">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-500">
                    <place.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm group-hover:text-primary transition-colors duration-500">{place.name}</h3>
                    <span className="text-xs text-muted-foreground/70">{place.distance}</span>
                  </div>
                </article>
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
      <section id="how-to-reach" className="section-padding bg-slate-50">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-primary text-sm tracking-[0.2em] uppercase mb-4 font-sans">Getting Here</p>
              <h2 className="section-title mb-6">How to Reach The Vedara</h2>
              <p className="section-subtitle">Your journey to Ghiyagi, Jibhi, begins here</p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <ScrollReveal delay={0.1} direction="up" distance={40}>
              <article className="bg-white rounded-2xl p-7 text-center reveal h-[240px] flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 flex-shrink-0">
                  <MapPin className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-lg mb-3 text-foreground">By Road</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Delhi to Jibhi via Mandi–Aut–Larji. Approximately 480 km, 10–11 hours. Buses available from Delhi ISBT to Aut, then a taxi to Jibhi.</p>
              </article>
            </ScrollReveal>
            <ScrollReveal delay={0.2} direction="up" distance={40}>
              <article className="bg-white rounded-2xl p-7 text-center reveal h-[240px] flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-[#9B8EA0]/10 flex items-center justify-center mb-4 flex-shrink-0">
                  <MapPin className="w-7 h-7 text-[#9B8EA0]" />
                </div>
                <h3 className="font-serif text-lg mb-3 text-foreground">By Rail</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Nearest broad-gauge station: Amb Andaura (~120 km). Nearest narrow-gauge: Shimla or Joginder Nagar. Taxis available from all stations.</p>
              </article>
            </ScrollReveal>
            <ScrollReveal delay={0.3} direction="up" distance={40}>
              <article className="bg-white rounded-2xl p-7 text-center reveal h-[240px] flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-gold-400/10 flex items-center justify-center mb-4 flex-shrink-0">
                  <MapPin className="w-7 h-7 text-gold-500" />
                </div>
                <h3 className="font-serif text-lg mb-3 text-foreground">By Air</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">Bhuntar Airport (Kullu) is the nearest, ~50 km from Jibhi. Flights from Delhi and Chandigarh. Taxi from Bhuntar to Ghiyagi takes ~1.5 hours.</p>
              </article>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 bg-[#1C2B3A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=1920&q=80)', backgroundSize: 'cover' }} />
        <div className="absolute inset-0 liquid-gradient opacity-20" />
        <div className="relative z-10 vintage-container text-center">
          <ScrollReveal>
            <h2 className="font-serif text-3xl md:text-5xl text-white mb-4">Ready to Escape?</h2>
            <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
              Book your mountain story today. Early check-in and late check-out are subject to availability and prior confirmation.
            </p>
            <MagneticButton>
              <Link href="/booking" className="vintage-button bg-white/90 text-[#1C2B3A] hover:bg-white px-10 py-4 text-base inline-block shadow-xl btn-fill-slide">
                Begin Your Journey <Sparkles className="w-4 h-4 ml-2" />
              </Link>
            </MagneticButton>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
