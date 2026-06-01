'use client';

import { BackButton } from '@/components/layout/BackButton';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { ImageReveal } from '@/components/animations/ImageReveal';
import { Mountain, Heart, Shield, Leaf, Home, Coffee, MapPin, Users, Wifi, Car, Flame, TreePine, UtensilsCrossed, ExternalLink } from 'lucide-react';

const values = [
  { icon: Leaf, title: 'Slow Living', desc: 'A retreat for those who seek more than just a getaway — to slow down, breathe deeply, and reconnect with what truly matters in the Himalayas.' },
  { icon: Heart, title: 'Soulful Hospitality', desc: 'Every detail reflects a balance between refined comfort and the raw beauty of the mountains, creating experiences that feel deeply personal.' },
  { icon: Shield, title: 'Intimate by Design', desc: 'With just seven thoughtfully designed cottages, we offer privacy, exclusivity, and a deeply personal boutique resort in Jibhi experience.' },
  { icon: Coffee, title: 'Café + Stay Experience', desc: 'Anchored by a curated in-house café that creates a social yet serene atmosphere where conversations, coffee, and calm coexist.' },
];

const highlights = [
  { icon: Home, label: '7 Cottages', desc: '18–22 guests, intimate and exclusive' },
  { icon: MapPin, label: 'Ghiyagi, Jibhi', desc: 'Untouched Himalayan beauty, away from crowds' },
  { icon: Leaf, label: 'Launch 2026', desc: 'A haven of wisdom, wilderness, and quiet luxury' },
  { icon: Users, label: 'Target Guests', desc: 'Families, solo travellers, remote workers, and groups seeking stillness' },
  { icon: Wifi, label: 'High-Speed WiFi', desc: 'Available throughout the property' },
  { icon: Mountain, label: 'What Makes Us Unique', desc: 'Boutique by Design • Café + Stay Experience • Untouched Location' },
];

const amenities = [
  { icon: Coffee, label: 'In-house Café', desc: 'Multi-cuisine + Himachali delicacies' },
  { icon: Flame, label: 'Bonfire & Outdoor Seating', desc: 'Evening gatherings under the stars' },
  { icon: Mountain, label: 'Mountain View', desc: 'Panoramic Himalayan vistas from every corner' },
  { icon: TreePine, label: 'Garden & Relaxation Spaces', desc: 'Lush green spaces to unwind' },
  { icon: Car, label: 'Parking', desc: 'Complimentary on-site parking' },
  { icon: UtensilsCrossed, label: 'Activities', desc: 'Nature walks, waterfall visits, Jalori Pass, café evenings' },
];

const attractions = [
  { name: 'Jibhi Waterfall', distance: '4 km', image: '/images/jibhi-waterfall.avif', desc: 'A cascading gem hidden in the forest — a perfect spot for a peaceful afternoon.' },
  { name: 'Mini Thailand', distance: '1.2 km', image: '/images/mini-thailand.jpg', desc: 'Serene river bend with turquoise pools, known as a boutique stay in Jibhi highlight.' },
  { name: 'Jalori Pass', distance: '10 km', image: '/images/jalori-pass.jpg', desc: 'High-altitude pass with sweeping views — a must for any nature retreat Himachal visit.' },
  { name: 'Serolsar Lake', distance: '10 km + trek', image: '/images/seroslar-lake.webp', desc: 'Crystal-clear lake surrounded by ancient oaks — a luxury stay in Tirthan Valley experience.' },
  { name: 'Chehni Kothi', distance: '10 km', image: '/images/chehni-kothi.jpg', desc: 'Centuries-old medieval tower fortress offering a glimpse into local history.' },
  { name: 'Tirthan Valley', distance: '26 km', image: '/images/tirthan-valley.jpg', desc: 'Pristine valley famous for trout fishing — ideal for luxury cottages Jibhi explorers.' },
  { name: 'Lambhari Top', distance: '8 km', image: '/images/hero-1.jpg', desc: 'A breathtaking trek to the summit with panoramic Himalayan views. Our guided excursions make for an unforgettable mountain adventure.' },
  { name: 'Great Himalayan National Park', distance: '30 km', image: '/images/hero-2.jpg', desc: 'A UNESCO World Heritage site with pristine alpine meadows, dense forests, and rich wildlife. Perfect for a day trek from The Vedara.' },
  { name: 'Kids Arena', distance: 'On-site', image: '/images/hero-3.jpg', desc: 'A dedicated play and activity zone for young explorers featuring nature crafts, outdoor games, and supervised adventures.' },
];

export default function AboutPage() {
  return (
    <>
      <section className="pt-32 pb-20 bg-cream-50 dark:bg-earth-900">
        <div className="vintage-container">
          <BackButton />
          <ScrollReveal>
            <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Our Story</p>
            <TextReveal as="h1" className="section-title max-w-4xl">
              The Vedara — a haven of wisdom, wilderness, and quiet luxury.
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
                  Nestled in the serene village of <strong>Ghiyagi</strong>, within the untouched landscapes of Jibhi, where cedar forests whisper through the mountains and time moves with quiet grace, The Vedara was envisioned as a <strong>boutique stay in Jibhi</strong> for those who seek more than just a getaway.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed mb-6">
                  Inspired by the essence of wisdom, reflection, and the soul of the forest, The Vedara is a space that invites you to slow down, breathe deeply, and reconnect with what truly matters.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed mb-6">
                  Thoughtfully designed to feel intimate yet refined, every corner blends seamlessly with nature — warm wooden textures, open skies, mountain air, and soulful hospitality — creating an experience that feels both luxurious and deeply personal.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed mb-6">
                  Mornings begin with golden light through the pines, bird song echoing through the mountains, and the aroma of freshly brewed coffee rising through the valley. Afternoons unfold slowly beside flowing rivers and quiet conversations, while evenings are filled with starlit skies, the gentle sound of the flowing river, and a rare sense of calm.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed mb-6">
                  Intentionally intimate and away from the rush of crowded resorts, The Vedara adapts effortlessly to every guest — whether you are a traveller seeking stillness or a family longing to reconnect.
                </p>
              <p className="text-forest-600 dark:text-forest-400 font-medium italic">
                A <strong>luxury stay in Tirthan Valley</strong> where true luxury is not excess. It is stillness, connection, warmth, and unforgettable moments.
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
              <h2 className="section-title mb-6">The Vedara — Himalayan Boutique Retreat</h2>
              <p className="section-subtitle">7 luxury cottages Jibhi | 18–22 guests | Launch 2026 | A nature retreat Himachal</p>
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
                  After years of navigating boardrooms, deadlines, and the fast-moving corporate world, the founder of The Vedara made an unexpected choice — to trade city skylines for mountain horizons.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed mb-6">
                  Drawn to the untouched beauty and slower rhythm of Ghiyagi, what started as a search for peace soon became a deeper calling: to build a space where people could pause, reconnect, and experience the kind of calm modern life often forgets.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed mb-6">
                  That vision became The Vedara — a boutique mountain retreat shaped by nature, thoughtful living, and soulful hospitality. Every detail reflects a balance between refined comfort and the raw beauty of the Himalayas, creating experiences that feel intimate, grounding, and deeply personal.
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
              <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">What Makes The Vedara Unique</p>
              <h2 className="section-title mb-6">Intentionally Different</h2>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Boutique by Design',
                desc: 'With just seven thoughtfully designed cottages, The Vedara offers privacy, exclusivity, and a deeply personal stay experience. Each space blends minimal luxury with natural materials, creating a refined yet calming environment.',
                icon: Home,
              },
              {
                title: 'Café + Stay Experience',
                desc: 'The Vedara is anchored by a curated in-house café that creates a social yet serene atmosphere where conversations, coffee, and calm coexist.',
                icon: Coffee,
              },
              {
                title: 'Location That\'s Still Untouched',
                desc: 'Set in Jibhi away from over-commercialised hill stations, The Vedara offers access to raw Himalayan beauty where forests, mountains, and silence define the experience.',
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
              <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Amenities</p>
              <h2 className="section-title mb-6">Facilities & Experiences</h2>
              <p className="section-subtitle">Every comfort thoughtfully curated for your mountain stay</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {amenities.map((a, i) => (
              <ScrollReveal key={a.label} delay={i * 0.08}>
                <div className="vintage-card p-6 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center flex-shrink-0">
                    <a.icon className="w-5 h-5 text-forest-600 dark:text-forest-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm">{a.label}</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">{a.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal delay={0.2}>
            <div className="mt-8 vintage-card p-5 inline-flex items-center gap-3 mx-auto">
              <Wifi className="w-5 h-5 text-forest-500" />
              <span className="text-sm text-foreground"><strong>High-speed WiFi</strong> available throughout the property</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

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
              <div className="vintage-card bg-white/10 backdrop-blur-sm border-cream-200/10 p-6 text-center font-sans">
                <div className="w-14 h-14 rounded-full bg-clay-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-clay-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 7v4l2 2" /></svg>
                </div>
                <h3 className="font-serif text-lg text-cream-50 mb-2">By Air</h3>
                <p className="text-cream-200/60 text-sm leading-relaxed">
                  Nearest airport: <strong className="text-cream-200">Kullu-Bhuntar Airport</strong> (70 km, ~2.5 hr drive). Taxis and private cabs available from the airport. Delhi to Kullu flights operate daily.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="vintage-card bg-white/10 backdrop-blur-sm border-cream-200/10 p-6 text-center font-sans">
                <div className="w-14 h-14 rounded-full bg-clay-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-clay-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="font-serif text-lg text-cream-50 mb-2">By Train</h3>
                <p className="text-cream-200/60 text-sm leading-relaxed">
                  Nearest railway station: <strong className="text-cream-200">Joginder Nagar Railway Station</strong> (80 km). For broader connectivity, <strong className="text-cream-200">Chandigarh</strong> (280 km) and <strong className="text-cream-200">Pathankot</strong> (200 km) are major railheads with taxi services to Jibhi.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="vintage-card bg-white/10 backdrop-blur-sm border-cream-200/10 p-6 text-center font-sans">
                <div className="w-14 h-14 rounded-full bg-clay-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-clay-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="font-serif text-lg text-cream-50 mb-2">By Road</h3>
                <p className="text-cream-200/60 text-sm leading-relaxed">
                  Vedara is located in Ghiyagi, Jibhi — a 5–6 hr scenic drive from Chandigarh via NH-5. Regular HRTC buses run from Delhi and Chandigarh to Aut (30 km from Jibhi). We can arrange pickup upon request.
                </p>
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={0.2}>
            <div className="mt-8 text-center">
              <a
                href="https://maps.google.com/maps?q=Ghiyagi+Jibhi+Himachal+Pradesh"
                target="_blank"
                rel="noopener noreferrer"
                className="vintage-button bg-clay-500 hover:bg-clay-600 text-cream-50 px-8 py-3.5 inline-flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" /> Open in Google Maps
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section-padding bg-cream-50 dark:bg-earth-900">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Explore Nearby</p>
              <h2 className="section-title mb-6">Attractions Around The Vedara</h2>
              <p className="section-subtitle">Discover the raw beauty of Jibhi and beyond</p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attractions.map((place, i) => (
              <ScrollReveal key={place.name} delay={i * 0.1}>
                <div className="group vintage-card overflow-hidden">
                  <div className="aspect-[16/10] overflow-hidden">
                    <ImageReveal
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-serif text-lg text-foreground group-hover:text-forest-600 transition-colors">{place.name}</h3>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-clay-100 dark:bg-clay-900/30 text-clay-600 dark:text-clay-400 whitespace-nowrap">{place.distance}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{place.desc}</p>
                    <a
                      href={'https://www.google.com/maps/search/' + place.name.replace(/ /g, '+') + '+Himachal+Pradesh'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-forest-600 dark:text-forest-400 mt-3 font-medium hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> Explore
                    </a>
                  </div>
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
