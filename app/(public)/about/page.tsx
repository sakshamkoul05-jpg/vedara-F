'use client';

import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { Mountain, Home, Coffee, Leaf } from 'lucide-react';

const pillars = [
  {
    icon: Home,
    title: 'The Sanctuary',
    desc: 'Our spaces are designed in harmony with the terrain. Utilizing locally sourced materials and traditional mountain craftsmanship, our architecture honors the land it rests upon. Every room acts as a private viewing deck to the grand Himalayan canvas, offering sophisticated comfort without distracting from the natural majesty outside.',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  },
  {
    icon: Coffee,
    title: 'The Gastronomy',
    subtitle: 'Café Charade',
    desc: 'Food at Café Charade is a celebration of time and tradition. We lean into the philosophy of slow food — where meals are crafted from scratch using farm-to-table ingredients and local mountain produce. From slow-simmered regional Himachali heritage delicacies like Dham and Pahadi specialties to comforting artisan barista brews and wild herbal infusions, every plate tells the story of the valley.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  },
  {
    icon: Leaf,
    title: 'The Slow Living Philosophy',
    desc: 'Mindfulness is woven into the fabric of your day. Whether you spend your morning breathing in the crisp, high-altitude air with a hot cup of saffron milk, reading by a crackling fire, or wandering through nearby village trails, Vedara is a space designed to help you reconnect with yourself.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 bg-cream-100">
        <div className="vintage-container">
          <ScrollReveal>
            <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Our Story</p>
            <TextReveal as="h1" className="section-title max-w-4xl">
              The Vedara – A Haven of Wisdom, Wilderness, and Quiet Luxury
            </TextReveal>
          </ScrollReveal>
        </div>
      </section>

      {/* Intro — centered elegant block */}
      <section className="py-20 md:py-28">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-earth-700 text-lg md:text-xl leading-relaxed mb-8">
                Vedara was born out of a simple, intentional desire: to create a sanctuary where time slows down. In a world that demands constant momentum, we invite you to pause. Tucked away in the pristine embrace of the Himalayas, Vedara is not just a place to stay — it is a conscious return to nature, architecture, and quiet luxury.
              </p>
              <p className="text-earth-600 leading-relaxed mb-8">
                Here, luxury isn&apos;t loud. It is found in the scent of local cedarwood, the touch of native hand-hewn stone, the sound of the wind through the pines, and the unfiltered panoramic vistas that greet you at every sunrise. We intentionally chose to remain an intimate boutique retreat, swapping the crowds of commercial hospitality for personalized care, quiet corners, and deep, restorative stillness.
              </p>
              <div className="w-16 h-px bg-clay-400 mx-auto" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* The Pillars — 3-column grid */}
      <section className="pb-20 md:pb-28">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">The Vedara Experience</p>
              <h2 className="section-title mb-6">Our Pillars</h2>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {pillars.map((pillar, i) => (
              <ScrollReveal key={pillar.title} delay={i * 0.15}>
                <div className="group">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6">
                    <img
                      src={pillar.image}
                      alt={pillar.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-forest-100 flex items-center justify-center flex-shrink-0">
                      <pillar.icon className="w-5 h-5 text-forest-600" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-earth-900">{pillar.title}</h3>
                      {pillar.subtitle && (
                        <p className="text-clay-500 text-xs font-sans">{pillar.subtitle}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-earth-600 leading-relaxed text-sm">{pillar.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How to Reach */}
      <section className="section-padding bg-earth-900">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-clay-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Getting Here</p>
              <h2 className="font-serif text-4xl md:text-5xl text-cream-50 mb-6">How to Reach The Vedara</h2>
              <p className="text-cream-200/70 text-lg">Your journey to the mountains, simplified.</p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            <ScrollReveal delay={0.1}>
              <div className="vintage-card bg-cream-50/10 backdrop-blur-sm border-cream-200/10 p-6 text-center font-sans">
                <div className="w-14 h-14 rounded-full bg-clay-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-clay-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 7v4l2 2" /></svg>
                </div>
                <h3 className="font-serif text-lg text-cream-50 mb-2">By Air</h3>
                <p className="text-cream-200/60 text-sm leading-relaxed">
                  Nearest airport: <strong className="text-cream-200">Kullu-Bhuntar Airport</strong> (70 km, ~2.5 hr drive).
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="vintage-card bg-cream-50/10 backdrop-blur-sm border-cream-200/10 p-6 text-center font-sans">
                <div className="w-14 h-14 rounded-full bg-clay-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-clay-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="font-serif text-lg text-cream-50 mb-2">By Train</h3>
                <p className="text-cream-200/60 text-sm leading-relaxed">
                  Nearest railway station: <strong className="text-cream-200">Joginder Nagar</strong> (80 km). Major railheads at Chandigarh and Pathankot.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="vintage-card bg-cream-50/10 backdrop-blur-sm border-cream-200/10 p-6 text-center font-sans">
                <div className="w-14 h-14 rounded-full bg-clay-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-clay-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="font-serif text-lg text-cream-50 mb-2">By Road</h3>
                <p className="text-cream-200/60 text-sm leading-relaxed">
                  Vedara is in Ghiyagi, Jibhi — a 5–6 hr scenic drive from Chandigarh via NH-5.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
