'use client';

import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { Mountain, Heart, Shield, Leaf } from 'lucide-react';

const values = [
  { icon: Leaf, title: 'Slow Living', desc: 'We believe in the art of unhurried days. No schedules, no rush — just the rhythm of nature.' },
  { icon: Heart, title: 'Handcrafted Hospitality', desc: 'Every detail, from the linen to the meals, is made with intention and love.' },
  { icon: Shield, title: 'Mountain Stewardship', desc: 'We source locally, minimize waste, and protect the wilderness that surrounds us.' },
  { icon: Mountain, title: 'Authentic Experiences', desc: 'No manufactured luxury — only real mountain living, thoughtfully curated.' },
];

const team = [
  { name: 'Arjun Singh', role: 'Founder & Host', bio: 'A former architect who traded blueprints for mountain trails.' },
  { name: 'Meera Joshi', role: 'Head of Hospitality', bio: 'Twenty years of hotel experience, now crafting mountain memories.' },
  { name: 'Chef Kabir', role: 'Cafe & Kitchen', bio: 'Trained in Paris, cooking from the heart in the mountains.' },
];

export default function AboutPage() {
  return (
    <>
      <section className="pt-32 pb-20 bg-cream-50 dark:bg-earth-900">
        <div className="vintage-container">
          <ScrollReveal>
            <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Our Story</p>
            <TextReveal as="h1" className="section-title max-w-3xl">
              A Love Letter to the Mountains
            </TextReveal>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-20">
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
                  Vedara Retreat was born from a simple belief: that the best luxury is the luxury of being yourself,
                  surrounded by nature, with nothing to prove and nowhere to rush.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed mb-6">
                  What started as a single restored cottage has grown into a collection of six unique sanctuaries,
                  each with its own personality, its own view, its own story. We restored rather than built,
                  preserving the character of the land while adding handcrafted comforts.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed">
                  Every morning, our cafe fills with the aroma of freshly ground coffee and wood-fired bread.
                  Every evening, guests gather around crackling fires under canopies of stars.
                  This is not a resort. This is a home in the mountains — and you are welcome here.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section className="section-padding bg-cream-50 dark:bg-earth-900">
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

      <section className="section-padding">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Our Team</p>
              <h2 className="section-title mb-6">The People Behind the Magic</h2>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <ScrollReveal key={member.name} delay={i * 0.15}>
                <div className="vintage-card p-8 text-center">
                  <div className="w-20 h-20 rounded-full bg-earth-200 dark:bg-earth-700 flex items-center justify-center mx-auto mb-4">
                    <span className="font-serif text-2xl text-earth-500">{member.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <h3 className="font-serif text-lg text-foreground mb-1">{member.name}</h3>
                  <p className="text-clay-500 text-sm font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
