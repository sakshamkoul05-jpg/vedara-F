'use client';

import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { Mountain, Heart, Shield, Leaf, Home, Coffee, MapPin, Users } from 'lucide-react';

const values = [
  { icon: Leaf, title: 'Slow Living', desc: 'A retreat for those who seek more than just a getaway — to slow down, breathe deeply, and reconnect with what truly matters.' },
  { icon: Heart, title: 'Soulful Hospitality', desc: 'Every detail reflects a balance between refined comfort and the raw beauty of the Himalayas, creating experiences that feel deeply personal.' },
  { icon: Shield, title: 'Intimate by Design', desc: 'With just six thoughtfully designed cottages, we offer privacy, exclusivity, and a deeply personal stay experience.' },
  { icon: Coffee, title: 'Café + Stay Experience', desc: 'Anchored by a curated in-house café that creates a social yet serene atmosphere where conversations, coffee, and calm coexist.' },
];

const highlights = [
  { icon: Home, label: '6 Cottages', desc: '18–22 guests, intimate and exclusive' },
  { icon: MapPin, label: 'Ghiyagi, Jibhi', desc: 'Untouched Himalayan beauty, away from crowds' },
  { icon: Leaf, label: 'Launch 2026', desc: 'A sanctuary of wisdom, wilderness, and quiet luxury' },
  { icon: Users, label: 'Target Guests', desc: 'Couples, families, solo travellers, remote workers, small groups' },
];

export default function AboutPage() {
  return (
    <>
      <section className="pt-32 pb-20 bg-cream-50 dark:bg-earth-900">
        <div className="vintage-container">
          <ScrollReveal>
            <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Our Story</p>
            <TextReveal as="h1" className="section-title max-w-4xl">
              Vedara — a sanctuary of wisdom, wilderness, and quiet luxury.
            </TextReveal>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-16">
        <div className="vintage-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-earth-200 dark:bg-earth-700 flex items-center justify-center">
                <Mountain className="w-20 h-20 text-earth-400" />
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div className="prose prose-earth dark:prose-invert max-w-none">
                <p className="text-lg text-earth-700 dark:text-cream-200 leading-relaxed mb-6">
                  Nestled in the serene village of <strong>Ghiyagi</strong>, within the untouched landscapes of Jibhi, where cedar forests whisper through the mountains and time moves with quiet grace, Vedara was envisioned as a retreat for those who seek more than just a getaway.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed mb-6">
                  Inspired by the essence of wisdom, reflection, and the soul of the forest, Vedara is a space that invites you to slow down, breathe deeply, and reconnect with what truly matters.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed mb-6">
                  Thoughtfully designed to feel intimate yet refined, every corner blends seamlessly with nature — warm wooden textures, open skies, mountain air, and soulful hospitality — creating an experience that feels both luxurious and deeply personal.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed mb-6">
                  Mornings begin with golden light through the pines, bird song echoing through the mountains, and the aroma of freshly brewed coffee rising through the valley. Afternoons unfold slowly beside flowing rivers and quiet conversations, while evenings are filled with starlit skies, the gentle sound of the flowing river, and a rare sense of calm.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed mb-6">
                  Intentionally intimate and away from the rush of crowded resorts, Vedara adapts effortlessly to every guest — whether you are a traveller seeking stillness, a couple seeking intimacy, or a family longing to reconnect.
                </p>
                <p className="text-forest-600 dark:text-forest-400 font-medium italic">
                  Because true luxury is not excess. It is stillness, connection, warmth, and unforgettable moments.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="py-16 bg-cream-50 dark:bg-earth-900">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">About the Property</p>
              <h2 className="section-title mb-6">Vedara — Himalayan Boutique Retreat</h2>
              <p className="section-subtitle">6 cottages | 18–22 guests | Launch 2026 | Ghiyagi, Jibhi</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((h, i) => (
              <ScrollReveal key={h.label} delay={i * 0.1}>
                <div className="vintage-card p-6 text-center">
                  <h.icon className="w-8 h-8 text-forest-500 mx-auto mb-3" />
                  <h3 className="font-serif text-lg text-foreground mb-1">{h.label}</h3>
                  <p className="text-muted-foreground text-sm">{h.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="vintage-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <div className="prose prose-earth dark:prose-invert max-w-none">
                <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Your Host</p>
                <h2 className="font-serif text-3xl text-foreground mb-6">From Boardrooms to Mountain Horizons</h2>
                <p className="text-earth-700 dark:text-cream-200 leading-relaxed mb-6">
                  After years of navigating boardrooms, deadlines, and the fast-moving corporate world, the founder of Vedara made an unexpected choice — to trade city skylines for mountain horizons.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed mb-6">
                  Drawn to the untouched beauty and slower rhythm of Ghiyagi, what started as a search for peace soon became a deeper calling: to build a space where people could pause, reconnect, and experience the kind of calm modern life often forgets.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed mb-6">
                  That vision became Vedara — a boutique mountain retreat shaped by nature, thoughtful living, and soulful hospitality. Every detail reflects a balance between refined comfort and the raw beauty of the Himalayas, creating experiences that feel intimate, grounding, and deeply personal.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed">
                  More than a host, the founder is a traveler at heart — someone who believes that the most memorable stays are not just about luxury, but about how a place makes you feel long after you leave.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="right">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-earth-200 dark:bg-earth-700 flex items-center justify-center">
                <Mountain className="w-20 h-20 text-earth-400" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="section-padding bg-cream-50 dark:bg-earth-900">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">What Makes Vedara Unique</p>
              <h2 className="section-title mb-6">Intentionally Different</h2>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Boutique by Design',
                desc: 'With just six thoughtfully designed cottages, Vedara offers privacy, exclusivity, and a deeply personal stay experience. Each space blends minimal luxury with natural materials, creating a refined yet calming environment.',
                icon: Home,
              },
              {
                title: 'Café + Stay Experience',
                desc: 'Vedara is anchored by a curated in-house café that creates a social yet serene atmosphere where conversations, coffee, and calm coexist.',
                icon: Coffee,
              },
              {
                title: 'Location That\'s Still Untouched',
                desc: 'Set in Jibhi away from over-commercialised hill stations, Vedara offers access to raw Himalayan beauty where forests, mountains, and silence define the experience.',
                icon: MapPin,
              },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.1}>
                <div className="vintage-card p-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-forest-100 dark:bg-forest-900/50 flex items-center justify-center mx-auto mb-5">
                    <item.icon className="w-7 h-7 text-forest-600 dark:text-forest-400" />
                  </div>
                  <h3 className="font-serif text-xl text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Philosophy</p>
              <h2 className="section-title mb-6">What We Stand For</h2>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <ScrollReveal key={v.title} delay={i * 0.1}>
                <div className="vintage-card p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-forest-100 dark:bg-forest-900/50 flex items-center justify-center mx-auto mb-4">
                    <v.icon className="w-6 h-6 text-forest-600 dark:text-forest-400" />
                  </div>
                  <h3 className="font-serif text-lg text-foreground mb-2">{v.title}</h3>
                  <p className="text-muted-foreground text-sm">{v.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
