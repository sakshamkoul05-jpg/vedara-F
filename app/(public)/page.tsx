'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Coffee, Trees, Sparkles, Music, FireExtinguisher, Binoculars, Moon, MapPin, UtensilsCrossed } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { ImageReveal } from '@/components/animations/ImageReveal';
import { FogParticles } from '@/components/animations/FogParticles';
import { ScrollProgress } from '@/components/animations/ScrollProgress';
import { MagneticButton } from '@/components/animations/MagneticButton';

const cottages = [
  { name: 'The Pine Perch', price: '₹8,500', desc: 'Secluded pine-wood haven with mountain views', image: '/images/hero-1.jpg' },
  { name: 'The Cedar Nook', price: '₹7,500', desc: 'Intimate cedar retreat with private garden', image: '/images/hero-2.jpg' },
  { name: 'The Maple Suite', price: '₹14,000', desc: 'Spacious family cottage with wraparound veranda', image: '/images/hero-3.jpg' },
];

const testimonials = [
  { name: 'Ananya & Rohit', content: '"The Pine Perch was everything we dreamed of. Waking up to the mist over the mountains, the warm fireplace at night — pure magic."', rating: 5, location: 'Mumbai, India' },
  { name: 'Daniel Park', content: '"I wrote half my manuscript sitting by the stream at Fern Hollow. The staff was incredibly thoughtful."', rating: 5, location: 'Seoul, South Korea' },
  { name: 'Emily & James', content: '"The Ridge View infinity tub under the stars — we felt like we were floating above the world."', rating: 5, location: 'Melbourne, Australia' },
];

const experiences = [
  { icon: FireExtinguisher, title: 'Bonfire Nights', desc: 'Gather around crackling fires under a canopy of stars with warm drinks and stories.' },
  { icon: Music, title: 'Music Nights', desc: 'Live acoustic sessions with local artists echoing through the valley.' },
  { icon: Trees, title: 'Nature Walks', desc: 'Guided treks through cedar forests to hidden waterfalls and panoramic viewpoints.' },
  { icon: Moon, title: 'Star Gazing', desc: 'Unpolluted Himalayan skies reveal constellations you have never seen before.' },
  { icon: Coffee, title: 'Cafe Evenings', desc: 'Handcrafted coffee and wood-fired meals as the sun sets behind the pines.' },
];

const nearbyAttractions = [
  { name: 'Jibhi Waterfall', distance: '4 km', icon: MapPin },
  { name: 'Mini Thailand', distance: '1.2 km', icon: MapPin },
  { name: 'Jalori Pass', distance: '10 km', icon: MapPin },
  { name: 'Serolsar Lake', distance: '10 km + trek', icon: MapPin },
];

export default function HomePage() {
  return (
    <>
      <ScrollProgress />
      <FogParticles opacity={0.15} count={20} color="255,255,255" speed={0.2} />

      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 z-10" />
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/images/hero-bg.webp)',
            filter: 'saturate(0.85) brightness(0.75) contrast(1.15) sepia(0.15)',
          }}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{ duration: 3, ease: [0.25, 0.1, 0.25, 1] }}
        />
        <div className="relative z-20 text-center px-4 max-w-4xl">
          <TextReveal
            as="h1"
            className="text-5xl md:text-7xl lg:text-8xl font-serif text-cream-50 leading-tight mb-6"
            delay={0.5}
          >
            Vedara Retreat
          </TextReveal>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-cream-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-sans leading-relaxed"
          >
            Six handcrafted cottages, one cozy cafe — a slow-living mountain escape crafted for those who seek stillness.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <MagneticButton>
              <Link href="/booking" className="vintage-button-primary text-base px-8 py-4 inline-block">
                Reserve Your Cottage
              </Link>
            </MagneticButton>
            <MagneticButton>
              <Link href="/cottages" className="vintage-button bg-white/10 text-cream-50 border border-cream-200/30 hover:bg-white/20 backdrop-blur-sm px-8 py-4 inline-block">
                Explore Cottages
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-cream-200/60">
            <ArrowRight className="w-5 h-5 rotate-90" />
          </motion.div>
        </motion.div>
      </section>

      <section className="relative py-28 md:py-36 overflow-hidden bg-earth-900">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80)', backgroundSize: 'cover', backgroundAttachment: 'fixed' }} />
        <div className="relative z-10 vintage-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <div>
                <p className="text-clay-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Welcome to Vedara</p>
                <h2 className="font-serif text-4xl md:text-5xl text-cream-50 mb-6">A Story Rooted in the Mountains</h2>
                <p className="text-cream-200/80 text-lg leading-relaxed mb-6">
                  Nestled in the serene village of Ghiyagi, within the untouched landscapes of Jibhi, Vedara was born from a simple belief — that the most profound luxury is found in stillness, connection, and the raw beauty of the Himalayas.
                </p>
                <p className="text-cream-200/60 leading-relaxed mb-8">
                  With just six handcrafted cottages and a soulful cafe, we offer more than a stay. We offer a chance to pause, breathe, and remember what truly matters.
                </p>
                <Link href="/about" className="vintage-button bg-clay-500 hover:bg-clay-600 text-cream-50 px-8 py-3.5">
                  Read Our Story <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <ImageReveal
                  src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80"
                  alt="Mountain landscape at Vedara"
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
              <h2 className="section-title mb-6">Six Stories, Six Sanctuaries</h2>
              <p className="section-subtitle">
                Each cottage is a world unto itself, crafted with local materials, vintage furnishings, and unobstructed views of the mountain wilderness.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            {cottages.map((cottage, i) => (
              <ScrollReveal key={cottage.name} delay={i * 0.15}>
                <div className="group vintage-card overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden">
                    <div className="w-full h-full bg-earth-200 dark:bg-earth-700 group-hover:scale-105 transition-transform duration-700 flex items-center justify-center text-earth-400">
                      <Trees className="w-12 h-12" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-serif text-xl text-foreground">{cottage.name}</h3>
                      <span className="text-forest-600 dark:text-forest-400 font-semibold text-sm">{cottage.price}<span className="text-earth-400 font-normal text-xs">/night</span></span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4">{cottage.desc}</p>
                    <Link href="/cottages" className="text-forest-600 dark:text-forest-400 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
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

      <section className="relative py-28 md:py-36 overflow-hidden bg-forest-800">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=80)', backgroundSize: 'cover', backgroundAttachment: 'fixed' }} />
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
                <div className="group vintage-card bg-white/10 backdrop-blur-sm border-cream-200/10 p-6 text-center hover:bg-white/20 transition-all duration-500">
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
                <p className="text-clay-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Our Cafe</p>
                <h2 className="font-serif text-4xl md:text-5xl text-cream-50 mb-6">The Forest Pantry</h2>
                <p className="text-cream-200/80 text-lg leading-relaxed mb-8">
                  Nestled beside a whispering stream, our cafe serves handcrafted coffee, wood-fired meals,
                  and mountain-fresh bakes. Open from sunrise to starlight — for guests and wanderers alike.
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
                  alt="The Forest Pantry Cafe"
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
                  <p className="text-earth-700 dark:text-cream-300 text-sm leading-relaxed mb-6 italic">&ldquo;{t.content.replace(/"/g, '')}&rdquo;</p>
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
              <Link href="/about" className="vintage-button-outline text-sm">
                View All Attractions <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-forest-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80)', backgroundSize: 'cover' }} />
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
