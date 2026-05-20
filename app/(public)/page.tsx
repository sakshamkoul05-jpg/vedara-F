'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Coffee, Trees, Sparkles } from 'lucide-react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';

const cottages = [
  { name: 'The Pine Perch', price: '₹8,500', desc: 'Secluded pine-wood haven with mountain views', image: '/images/hero-1.jpg' },
  { name: 'The Cedar Nook', price: '₹7,500', desc: 'Intimate cedar retreat with private garden', image: '/images/hero-2.jpg' },
  { name: 'The Maple Suite', price: '₹14,000', desc: 'Spacious family cottage with wraparound veranda', image: '/images/hero-3.jpg' },
];

const testimonials = [
  { name: 'Ananya & Rohit', content: '"The Pine Perch was everything we dreamed of. Waking up to the mist over the mountains, the warm fireplace at night — pure magic."', rating: 5 },
  { name: 'Daniel Park', content: '"I wrote half my manuscript sitting by the stream at Fern Hollow. The staff was incredibly thoughtful."', rating: 5 },
  { name: 'Emily & James', content: '"The Ridge View infinity tub under the stars — we felt like we were floating above the world."', rating: 5 },
];

export default function HomePage() {
  return (
    <>
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
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear', delay: 2 }}
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-48 opacity-30"
            animate={{ rotate: [0, 0.5, -0.3, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformOrigin: 'bottom center' }}
          >
            <svg viewBox="0 0 1440 200" className="w-full h-full" preserveAspectRatio="xMidYMax meet">
              <path d="M0,120 L60,40 L120,100 L180,20 L240,90 L300,10 L360,80 L420,0 L480,70 L540,10 L600,80 L660,0 L720,60 L780,10 L840,70 L900,0 L960,60 L1020,20 L1080,80 L1140,10 L1200,70 L1260,20 L1320,90 L1380,30 L1440,100 L1440,200 L0,200 Z" fill="rgba(0,0,0,0.4)" />
              <path d="M0,140 L80,60 L160,120 L240,40 L320,110 L400,30 L480,100 L560,20 L640,90 L720,10 L800,80 L880,20 L960,90 L1040,30 L1120,100 L1200,40 L1280,110 L1360,50 L1440,120 L1440,200 L0,200 Z" fill="rgba(0,0,0,0.25)" />
            </svg>
          </motion.div>
          {[{ x: 15, y: 25, d: 6 }, { x: 35, y: 40, d: 4 }, { x: 55, y: 20, d: 5 }, { x: 75, y: 45, d: 3 }, { x: 90, y: 30, d: 4 }].map((p, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/15"
              style={{ width: p.d, height: p.d, left: `${p.x}%`, top: `${p.y}%` }}
              animate={{ x: [0, 120, 0], opacity: [0, 0.8, 0] }}
              transition={{ duration: 8 + i * 2, repeat: Infinity, delay: i * 1.5, ease: 'linear' }}
            />
          ))}
        </div>
        <div className="relative z-20 text-center px-4 max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-cream-200 text-sm md:text-base tracking-[0.3em] uppercase mb-6 font-sans"
          >
            Vedara Retreat Hotels
          </motion.p>
          <TextReveal
            as="h1"
            className="text-5xl md:text-7xl lg:text-8xl font-serif text-cream-50 leading-tight mb-6"
            delay={0.5}
          >
            Where Mountains Tell Stories
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
            <Link href="/booking" className="vintage-button-primary text-base px-8 py-4">
              Reserve Your Cottage
            </Link>
            <Link href="/cottages" className="vintage-button bg-white/10 text-cream-50 border border-cream-200/30 hover:bg-white/20 backdrop-blur-sm px-8 py-4">
              Explore Cottages
            </Link>
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

      <section className="relative py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-earth-900" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1920&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
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
                <Link href="/cafe" className="vintage-button bg-clay-500 hover:bg-clay-600 text-cream-50 px-8 py-3.5">
                  Explore Menu <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right" delay={0.2}>
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <div className="w-full h-full bg-earth-800 flex items-center justify-center">
                  <Coffee className="w-16 h-16 text-earth-600" />
                </div>
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
                <div className="vintage-card p-8">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-clay-400 text-clay-400" />
                    ))}
                  </div>
                  <p className="text-earth-700 dark:text-cream-300 text-sm leading-relaxed mb-6">{t.content}</p>
                  <p className="font-serif text-foreground font-medium">{t.name}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
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
            <Link href="/booking" className="vintage-button bg-cream-50 text-forest-800 hover:bg-cream-100 px-10 py-4 text-base">
              Begin Your Journey <Sparkles className="w-4 h-4 ml-2" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
