'use client';

import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { ImageReveal } from '@/components/animations/ImageReveal';
import { Mountain, Heart, Shield, Leaf, Home, Coffee, MapPin, Users, Wifi, Car, Flame, TreePine, UtensilsCrossed, ExternalLink, Music, Star, Compass, Gamepad2, Quote } from 'lucide-react';

const values = [
  { icon: Leaf, title: 'Slow Living', desc: 'A retreat for those who seek more than just a getaway – to slow down, breathe deeply, and reconnect with what truly matters in the Himalayas.' },
  { icon: Heart, title: 'Soulful Hospitality', desc: 'Every detail reflects a balance between refined comfort and the raw beauty of the mountains, creating experiences that feel deeply personal.' },
  { icon: Shield, title: 'Intimate by Design', desc: 'With just seven cozy cottages and one alpine studio, we offer privacy, exclusivity, and a deeply personal boutique resort in Jibhi experience.' },
  { icon: Coffee, title: 'Café + Stay Experience', desc: 'Anchored by a curated in-house café that creates a social yet serene atmosphere where conversations, coffee, and calm coexist.' },
];

const highlights = [
  { icon: Home, label: '7 Cottages + 1 Alpine Studio', desc: 'Intimate and exclusive mountain retreat' },
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
  { name: 'Jibhi Waterfall', distance: '4 km', image: '/images/jibhi-waterfall.avif', desc: 'A cascading gem hidden in the forest – a perfect spot for a peaceful afternoon.' },
  { name: 'Mini Thailand', distance: '1.2 km', image: '/images/mini-thailand.jpg', desc: 'Serene river bend with turquoise pools, known as a boutique stay in Jibhi highlight.' },
  { name: 'Jalori Pass', distance: '10 km', image: '/images/jalori-pass.jpg', desc: 'High-altitude pass with sweeping views – a must for any nature retreat Himachal visit.' },
  { name: 'Serolsar Lake', distance: '10 km + trek', image: '/images/seroslar-lake.webp', desc: 'Crystal-clear lake surrounded by ancient oaks – a luxury stay in Tirthan Valley experience.' },
  { name: 'Chehni Kothi', distance: '10 km', image: '/images/chehni-kothi.jpg', desc: 'Centuries-old medieval tower fortress offering a glimpse into local history.' },
  { name: 'Tirthan Valley', distance: '26 km', image: '/images/tirthan-valley.jpg', desc: 'Pristine valley famous for trout fishing – ideal for luxury cottages Jibhi explorers.' },
  { name: 'Lambhari Top', distance: '8 km', image: 'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=800&q=80', desc: 'A breathtaking trek to the summit with panoramic Himalayan views. Our guided excursions make for an unforgettable mountain adventure.' },
  { name: 'Great Himalayan National Park', distance: '30 km', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80', desc: 'A UNESCO World Heritage site with pristine alpine meadows, dense forests, and rich wildlife. Perfect for a day trek from The Vedara.' },
];

const activities = [
  { icon: Flame, title: 'Bonfire Nights', desc: 'Evening bonfires under the starlit Himalayan sky.' },
  { icon: Music, title: 'Music Nights', desc: 'Live acoustic sessions featuring local artists.' },
  { icon: TreePine, title: 'Nature Walks', desc: 'Guided walks through cedar and pine forests.' },
  { icon: Star, title: 'Star Gazing', desc: 'Unpolluted night skies perfect for astronomy.' },
  { icon: Coffee, title: 'Café Evenings', desc: 'Warm beverages and conversations by the stream.' },
  { icon: Mountain, title: 'Lambhari Top Trek', desc: 'Guided sunrise trek to panoramic summit views.' },
  { icon: Compass, title: 'Great Himalayan NP', desc: 'Day trek to the UNESCO World Heritage site.' },
  { icon: Gamepad2, title: 'Kids Arena', desc: 'Dedicated play zone with nature crafts, outdoor games, and supervised adventures for young explorers.' },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero Hook */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-[#1C2B3A] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1C2B3A]/60 via-[#1C2B3A]/40 to-[#1C2B3A]/80" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <ScrollReveal>
            <p className="text-gold-400 text-sm tracking-[0.25em] uppercase mb-6 font-sans">The Vedara – Himalayan Boutique Retreat</p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <TextReveal as="h1" className="font-serif text-4xl md:text-6xl lg:text-7xl text-white leading-tight mb-8">
              Where the peaks meet peace of mind.
            </TextReveal>
          </ScrollReveal>
          <ScrollReveal delay={0.4}>
            <p className="text-white/80 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto">
              Welcome to slow living in the heart of the Himalayas.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Quotation under Hero */}
      <section className="py-20 md:py-28 bg-slate-50 dark:bg-vedara-950/50">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <Quote className="w-10 h-10 text-primary mx-auto mb-6" />
              <p className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground leading-relaxed italic">
                "Where the peaks meet peace of mind. Welcome to slow living in the heart of the Himalayas."
              </p>
              <div className="mt-8 w-16 h-px bg-primary mx-auto" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="bg-background">
        {/* Origin Story */}
        <section className="section-padding">
          <div className="vintage-container">
            <div className="max-w-3xl mx-auto text-center">
              <ScrollReveal>
                <p className="text-primary text-sm tracking-[0.2em] uppercase mb-4 font-sans">Our Story</p>
                <TextReveal as="h2" className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-8">
                  A Sanctuary in the Himalayas
                </TextReveal>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div className="space-y-6 text-muted-foreground leading-relaxed text-base md:text-lg">
                  <p>
                    Vedara was born out of a simple, intentional desire: to create a sanctuary where time slows down. In a world that demands constant momentum, we invite you to pause. Tucked away in the pristine embrace of the Himalayas, Vedara is not just a place to stay—it is a conscious return to nature, architecture, and quiet luxury.
                  </p>
                  <p>
                    Here, luxury isn't loud. It is found in the scent of local cedarwood, the touch of native hand-hewn stone, the sound of the wind through the pines, and the unfiltered panoramic vistas that greet you at every sunrise. We intentionally chose to remain an intimate boutique retreat, swapping the crowds of commercial hospitality for personalized care, quiet corners, and deep, restorative stillness.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* The Three Pillars */}
        <section className="section-padding bg-slate-50 dark:bg-vedara-950/30">
          <div className="vintage-container">
            <ScrollReveal>
              <div className="text-center max-w-3xl mx-auto mb-16">
                <p className="text-gold-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">The Vedara Philosophy</p>
                <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">
                  Built on Three Pillars
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <ScrollReveal delay={0.1} direction="up">
                <article className="group glass-card-light rounded-2xl p-8 md:p-10 hover:border-primary/30 transition-smooth h-full flex flex-col">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-smooth">
                    <Home className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl text-foreground mb-4">The Sanctuary</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    Our spaces are designed in harmony with the terrain. Utilizing locally sourced materials and traditional mountain craftsmanship, our architecture honors the land it rests upon. Every room acts as a private viewing deck to the grand Himalayan canvas, offering sophisticated comfort without distracting from the natural majesty outside.
                  </p>
                </article>
              </ScrollReveal>

              <ScrollReveal delay={0.2} direction="up">
                <article className="group glass-card-light rounded-2xl p-8 md:p-10 hover:border-primary/30 transition-smooth h-full flex flex-col">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-smooth">
                    <UtensilsCrossed className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl text-foreground mb-4">The Gastronomy</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    Food at Café Charade is a celebration of time and tradition. We lean into the philosophy of slow food – where meals are crafted from scratch using farm-to-table ingredients and local mountain produce. From slow-simmered regional Himachali heritage delicacies to comforting artisan barista brews and wild herbal infusions, every plate tells the story of the valley.
                  </p>
                </article>
              </ScrollReveal>

              <ScrollReveal delay={0.3} direction="up">
                <article className="group glass-card-light rounded-2xl p-8 md:p-10 hover:border-primary/30 transition-smooth h-full flex flex-col">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-smooth">
                    <Compass className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl text-foreground mb-4">The Mindfulness</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    Mindfulness is woven into the fabric of your day. Whether you spend your morning breathing in the crisp, high-altitude air with a hot cup of saffron milk, reading by a crackling fire, or wandering through nearby village trails, Vedara is a space designed to help you reconnect with yourself.
                  </p>
                </article>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </div>

      {/* Highlights */}
      <section className="section-padding bg-background">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-primary text-sm tracking-[0.2em] uppercase mb-4 font-sans">About the Property</p>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">The Vedara – Himalayan Boutique Retreat</h2>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">7 cottages + 1 alpine studio | 18–22 guests | Launch 2026 | A nature retreat Himachal</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {highlights.map((h, i) => (
              <ScrollReveal key={h.label} delay={i * 0.1}>
                <article className="glass-card-light rounded-2xl p-6 text-center transition-smooth h-full flex flex-col justify-center">
                  <h.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h3 className="font-serif text-lg text-foreground mb-1">{h.label}</h3>
                  <p className="text-muted-foreground text-sm">{h.desc}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Experiences */}
      <section className="section-padding bg-slate-50 dark:bg-vedara-950/30">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-primary text-sm tracking-[0.2em] uppercase mb-4 font-sans">Experiences</p>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">Moments That Stay With You</h2>
              <p className="text-muted-foreground text-base md:text-lg">Beyond the cottages, a world of experiences awaits</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {activities.map((act, i) => (
              <ScrollReveal key={act.title} delay={i * 0.1}>
                <article className="group glass-card-light rounded-2xl p-6 text-center transition-smooth h-full flex flex-col justify-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-smooth">
                    <act.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-serif text-lg text-foreground mb-2">{act.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{act.desc}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="section-padding bg-background">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-primary text-sm tracking-[0.2em] uppercase mb-4 font-sans">Amenities</p>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">Facilities</h2>
              <p className="text-muted-foreground text-base md:text-lg">Every comfort thoughtfully curated for your mountain stay</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {amenities.map((a, i) => (
              <ScrollReveal key={a.label} delay={i * 0.08}>
                <article className="glass-card-light rounded-2xl p-5 flex items-start gap-4 transition-smooth">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <a.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm">{a.label}</h3>
                    <p className="text-muted-foreground text-xs mt-0.5">{a.desc}</p>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal delay={0.2}>
            <div className="mt-8 glass-card-light rounded-2xl p-5 inline-flex items-center gap-3 mx-auto transition-smooth">
              <Wifi className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground"><strong>High-speed WiFi</strong> available throughout the property</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Getting Here */}
      <section className="section-padding bg-[#1C2B3A]">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-gold-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Getting Here</p>
              <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">How to Reach The Vedara</h2>
              <p className="text-white/60 text-lg">Your journey to the mountains, simplified.</p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6">
            <ScrollReveal delay={0.1}>
              <div className="rounded-2xl p-6 text-center font-sans border border-white/8 transition-smooth" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-500/25 to-gold-500/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 7v4l2 2" /></svg>
                </div>
                <h3 className="font-serif text-lg text-white mb-2">By Air</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Nearest airport: <strong className="text-white">Kullu-Bhuntar Airport</strong> (70 km, ~2.5 hr drive). Taxis and private cabs available from the airport. Delhi to Kullu flights operate daily.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="rounded-2xl p-6 text-center font-sans border border-white/8 transition-smooth" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-500/25 to-gold-500/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="font-serif text-lg text-white mb-2">By Train</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Nearest railway station: <strong className="text-white">Joginder Nagar Railway Station</strong> (80 km). For broader connectivity, <strong className="text-white">Chandigarh</strong> (280 km) and <strong className="text-white">Pathankot</strong> (200 km) are major railheads with taxi services to Jibhi.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="rounded-2xl p-6 text-center font-sans border border-white/8 transition-smooth" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-500/25 to-gold-500/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="font-serif text-lg text-white mb-2">By Road</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  Vedara is located in Ghiyagi, Jibhi – a 5–6 hr scenic drive from Chandigarh via NH-5. Regular HRTC buses run from Delhi and Chandigarh to Aut (30 km from Jibhi). We can arrange pickup upon request.
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
                className="vintage-button bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3.5 inline-flex items-center gap-2 shadow-lg"
              >
                <MapPin className="w-4 h-4" /> Open in Google Maps
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Attractions */}
      <section className="section-padding bg-slate-50 dark:bg-vedara-950/30">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-primary text-sm tracking-[0.2em] uppercase mb-4 font-sans">Nearby Attractions</p>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground mb-6">Attractions Around The Vedara</h2>
              <p className="text-muted-foreground text-base md:text-lg">Discover the raw beauty of Jibhi and beyond</p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {attractions.map((place, i) => (
              <ScrollReveal key={place.name} delay={i * 0.1}>
                <div className="group glass-card-light rounded-2xl overflow-hidden transition-smooth">
                  <div className="aspect-[16/10] overflow-hidden">
                    <ImageReveal
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-smooth">{place.name}</h3>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary whitespace-nowrap">{place.distance}</span>
                    </div>
                    <p className="text-muted-foreground text-sm">{place.desc}</p>
                    <a
                      href={'https://www.google.com/maps/search/' + place.name.replace(/ /g, '+') + '+Himachal+Pradesh'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-foreground mt-3 font-medium hover:text-primary transition-smooth"
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

      {/* Philosophy */}
      <section className="section-padding bg-[#1C2B3A]">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-gold-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Philosophy</p>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-6">What We Stand For</h2>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <ScrollReveal key={v.title} delay={i * 0.1}>
                <article className="rounded-2xl p-6 text-center border border-white/8 transition-smooth" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/25 to-primary/10 flex items-center justify-center mx-auto mb-4">
                    <v.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-lg text-white mb-2">{v.title}</h3>
                  <p className="text-white/60 text-sm">{v.desc}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
