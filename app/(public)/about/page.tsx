'use client';

import { BackButton } from '@/components/layout/BackButton';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { ImageReveal } from '@/components/animations/ImageReveal';
import { Mountain, Heart, Shield, Leaf, Home, Coffee, MapPin, Users, Wifi, Car, Flame, TreePine, UtensilsCrossed, ExternalLink, Music, Star, Compass, Gamepad2 } from 'lucide-react';

const values = [
  { icon: Leaf, title: 'Slow Living', desc: 'A retreat for those who seek more than just a getaway – to slow down, breathe deeply, and reconnect with what truly matters in the Himalayas.' },
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
    desc: 'Food at Café Charade is a celebration of time and tradition. We lean into the philosophy of slow food – where meals are crafted from scratch using farm-to-table ingredients and local mountain produce. From slow-simmered regional Himachali heritage delicacies like Dham and Pahadi specialties to comforting artisan barista brews and wild herbal infusions, every plate tells the story of the valley.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
  },
  {
    icon: Leaf,
    title: 'The Slow Living Philosophy',
    desc: 'Mindfulness is woven into the fabric of your day. Whether you spend your morning breathing in the crisp, high-altitude air with a hot cup of saffron milk, reading by a crackling fire, or wandering through nearby village trails, Vedara is a space designed to help you reconnect with yourself.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  },
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
      {/* Hero */}
      <section className="pt-32 pb-20 bg-cream-100 dark:bg-earth-900">
        <div className="vintage-container">
          <BackButton />
          <ScrollReveal>
            <p className="text-clay-600 dark:text-clay-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Our Story</p>
            <TextReveal as="h1" className="section-title max-w-4xl">
              The Vedara – A Haven of Wisdom, Wilderness, and Quiet Luxury
            </TextReveal>
          </ScrollReveal>
        </div>
      </section>

      {/* Intro — centered elegant block */}
      <section className="py-16 md:py-24">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-earth-700 dark:text-cream-200 text-lg md:text-xl leading-relaxed mb-6">
                Vedara was born out of a simple, intentional desire: to create a sanctuary where time slows down. In a world that demands constant momentum, we invite you to pause. Tucked away in the pristine embrace of the Himalayas, Vedara is not just a place to stay — it is a conscious return to nature, architecture, and quiet luxury.
              </p>
              <p className="text-earth-600 dark:text-cream-300 leading-relaxed mb-8">
                Here, luxury isn&apos;t loud. It is found in the scent of local cedarwood, the touch of native hand-hewn stone, the sound of the wind through the pines, and the unfiltered panoramic vistas that greet you at every sunrise. We intentionally chose to remain an intimate boutique retreat, swapping the crowds of commercial hospitality for personalized care, quiet corners, and deep, restorative stillness.
              </p>
              <div className="w-16 h-px bg-clay-400 mx-auto" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Our Story — original detailed content */}
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
                <p className="text-lg text-earth-700 dark:text-cream-200 leading-relaxed mb-6 text-justify hyphens-auto">
                  Nestled in the serene village of <strong>Ghiyagi</strong>, within the untouched landscapes of Jibhi, where cedar forests whisper through the mountains and time moves with quiet grace, The Vedara was envisioned as a <strong>boutique stay in Jibhi</strong> for those who seek more than just a getaway.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed mb-6 text-justify hyphens-auto">
                  Inspired by the essence of wisdom, reflection, and the soul of the forest, The Vedara is a space that invites you to slow down, breathe deeply, and reconnect with what truly matters.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed mb-6 text-justify hyphens-auto">
                  Thoughtfully designed to feel intimate yet refined, every corner blends seamlessly with nature – warm wooden textures, open skies, mountain air, and soulful hospitality – creating an experience that feels both luxurious and deeply personal.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed mb-6 text-justify hyphens-auto">
                  Mornings begin with golden light through the pines, bird song echoing through the mountains, and the aroma of freshly brewed coffee rising through the valley. Afternoons unfold slowly beside flowing rivers and quiet conversations, while evenings are filled with starlit skies, the gentle sound of the flowing river, and a rare sense of calm.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed mb-6 text-justify hyphens-auto">
                  Intentionally intimate and away from the rush of crowded resorts, The Vedara adapts effortlessly to every guest – whether you are a traveller seeking stillness or a family longing to reconnect.
                </p>
                <p className="text-forest-600 dark:text-forest-400 font-medium italic text-justify hyphens-auto">
                  A <strong>luxury stay in Tirthan Valley</strong> where true luxury is not excess. It is stillness, connection, warmth, and unforgettable moments.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Three Pillars — new user-provided content */}
      <section className="py-16 bg-cream-100 dark:bg-earth-900">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-clay-600 dark:text-clay-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">The Vedara Experience</p>
              <h2 className="section-title mb-6">Our Pillars</h2>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {pillars.map((pillar, i) => (
              <ScrollReveal key={pillar.title} delay={i * 0.15}>
                <div className="group flex flex-col h-full">
                  <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-6">
                    <img
                      src={pillar.image}
                      alt={pillar.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-forest-100 dark:bg-forest-900/50 flex items-center justify-center flex-shrink-0">
                      <pillar.icon className="w-5 h-5 text-forest-600 dark:text-forest-400" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl text-foreground">{pillar.title}</h3>
                      {pillar.subtitle && (
                        <p className="text-clay-600 dark:text-clay-400 text-xs font-sans">{pillar.subtitle}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-earth-600 dark:text-cream-300 leading-relaxed text-sm flex-1">{pillar.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* About the Property */}
      <section className="py-16">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-12">
              <p className="text-clay-600 dark:text-clay-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">About the Property</p>
              <h2 className="section-title mb-6">The Vedara – Himalayan Boutique Retreat</h2>
              <p className="section-subtitle">7 luxury cottages Jibhi | 18–22 guests | Launch 2026 | A nature retreat Himachal</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {highlights.map((h, i) => (
              <ScrollReveal key={h.label} delay={i * 0.1}>
                <div className="vintage-card p-6 text-center flex flex-col h-full">
                  <h.icon className="w-8 h-8 text-forest-500 mx-auto mb-3" />
                  <h3 className="font-serif text-lg text-foreground mb-1">{h.label}</h3>
                  <p className="text-earth-500 dark:text-cream-400 text-sm flex-1">{h.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Your Host */}
      <section className="py-16 bg-cream-100 dark:bg-earth-900">
        <div className="vintage-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ScrollReveal direction="left">
              <div className="prose prose-earth dark:prose-invert max-w-none">
                <p className="text-clay-600 dark:text-clay-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Your Host</p>
                <h2 className="font-serif text-3xl text-foreground mb-6">From Boardrooms to Mountain Horizons</h2>
                <p className="text-earth-700 dark:text-cream-200 leading-relaxed mb-6 text-justify hyphens-auto">
                  After years of navigating boardrooms, deadlines, and the fast-moving corporate world, the founder of The Vedara made an unexpected choice – to trade city skylines for mountain horizons.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed mb-6 text-justify hyphens-auto">
                  Drawn to the untouched beauty and slower rhythm of Ghiyagi, what started as a search for peace soon became a deeper calling: to build a space where people could pause, reconnect, and experience the kind of calm modern life often forgets.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed mb-6 text-justify hyphens-auto">
                  That vision became The Vedara – a boutique mountain retreat shaped by nature, thoughtful living, and soulful hospitality. Every detail reflects a balance between refined comfort and the raw beauty of the Himalayas, creating experiences that feel intimate, grounding, and deeply personal.
                </p>
                <p className="text-earth-600 dark:text-cream-300 leading-relaxed text-justify hyphens-auto">
                  More than a host, the founder is a traveler at heart – someone who believes that the most memorable stays are not just about luxury, but about how a place makes you feel long after you leave.
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

      {/* What Makes Us Unique */}
      <section className="section-padding">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-clay-600 dark:text-clay-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">What Makes The Vedara Unique</p>
              <h2 className="section-title mb-6">Intentionally Different</h2>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
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
                <div className="vintage-card p-8 text-center flex flex-col h-full">
                  <div className="w-14 h-14 rounded-full bg-forest-100 dark:bg-forest-900/50 flex items-center justify-center mx-auto mb-5">
                    <item.icon className="w-7 h-7 text-forest-600 dark:text-forest-400" />
                  </div>
                  <h3 className="font-serif text-xl text-foreground mb-3">{item.title}</h3>
                  <p className="text-earth-500 dark:text-cream-400 text-sm leading-relaxed flex-1">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Experiences */}
      <section className="section-padding bg-cream-100 dark:bg-earth-900">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-clay-600 dark:text-clay-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Experiences</p>
              <h2 className="section-title mb-6">Moments That Stay With You</h2>
              <p className="section-subtitle">Beyond the cottages, a world of experiences awaits</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
            {activities.map((act, i) => (
              <ScrollReveal key={act.title} delay={i * 0.1}>
                <div className="group vintage-card p-6 text-center hover:bg-earth-100 dark:hover:bg-earth-800 transition-all duration-500 flex flex-col h-full">
                  <div className="w-14 h-14 rounded-full bg-forest-100 dark:bg-forest-900/50 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-500">
                    <act.icon className="w-7 h-7 text-forest-600 dark:text-forest-400" />
                  </div>
                  <h3 className="font-serif text-lg text-foreground mb-2">{act.title}</h3>
                  <p className="text-earth-500 dark:text-cream-400 text-sm leading-relaxed flex-1">{act.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="section-padding">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-clay-600 dark:text-clay-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Amenities</p>
              <h2 className="section-title mb-6">Facilities & Experiences</h2>
              <p className="section-subtitle">Every comfort thoughtfully curated for your mountain stay</p>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {amenities.map((a, i) => (
              <ScrollReveal key={a.label} delay={i * 0.08}>
                <div className="vintage-card p-6 flex items-start gap-4 h-full">
                  <div className="w-11 h-11 rounded-xl bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center flex-shrink-0">
                    <a.icon className="w-5 h-5 text-forest-600 dark:text-forest-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground text-sm">{a.label}</h3>
                    <p className="text-earth-500 dark:text-cream-400 text-xs mt-0.5">{a.desc}</p>
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
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            <ScrollReveal delay={0.1}>
              <div className="vintage-card bg-cream-50/10 backdrop-blur-sm border-cream-200/10 p-6 text-center font-sans flex flex-col h-full">
                <div className="w-14 h-14 rounded-full bg-clay-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-clay-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 100-18 9 9 0 000 18z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 7v4l2 2" /></svg>
                </div>
                <h3 className="font-serif text-lg text-cream-50 mb-2">By Air</h3>
                <p className="text-cream-200/60 text-sm leading-relaxed flex-1">
                  Nearest airport: <strong className="text-cream-200">Kullu-Bhuntar Airport</strong> (70 km, ~2.5 hr drive). Taxis and private cabs available from the airport. Delhi to Kullu flights operate daily.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.2}>
              <div className="vintage-card bg-cream-50/10 backdrop-blur-sm border-cream-200/10 p-6 text-center font-sans flex flex-col h-full">
                <div className="w-14 h-14 rounded-full bg-clay-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-clay-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="font-serif text-lg text-cream-50 mb-2">By Train</h3>
                <p className="text-cream-200/60 text-sm leading-relaxed flex-1">
                  Nearest railway station: <strong className="text-cream-200">Joginder Nagar Railway Station</strong> (80 km). For broader connectivity, <strong className="text-cream-200">Chandigarh</strong> (280 km) and <strong className="text-cream-200">Pathankot</strong> (200 km) are major railheads with taxi services to Jibhi.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={0.3}>
              <div className="vintage-card bg-cream-50/10 backdrop-blur-sm border-cream-200/10 p-6 text-center font-sans flex flex-col h-full">
                <div className="w-14 h-14 rounded-full bg-clay-500/20 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-clay-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h3 className="font-serif text-lg text-cream-50 mb-2">By Road</h3>
                <p className="text-cream-200/60 text-sm leading-relaxed flex-1">
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
                className="vintage-button bg-clay-500 hover:bg-clay-600 text-cream-50 px-8 py-3.5 inline-flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" /> Open in Google Maps
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Attractions */}
      <section className="section-padding bg-cream-100 dark:bg-earth-900">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-clay-600 dark:text-clay-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Explore Nearby</p>
              <h2 className="section-title mb-6">Attractions Around The Vedara</h2>
              <p className="section-subtitle">Discover the raw beauty of Jibhi and beyond</p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {attractions.map((place, i) => (
              <ScrollReveal key={place.name} delay={i * 0.1}>
                <div className="group vintage-card overflow-hidden flex flex-col h-full">
                  <div className="aspect-[16/10] overflow-hidden">
                    <ImageReveal
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-serif text-lg text-foreground group-hover:text-forest-600 transition-colors">{place.name}</h3>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-clay-100 dark:bg-clay-900/30 text-clay-600 dark:text-clay-400 whitespace-nowrap ml-2">{place.distance}</span>
                    </div>
                    <p className="text-earth-500 dark:text-cream-400 text-sm flex-1">{place.desc}</p>
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

      {/* Philosophy */}
      <section className="section-padding">
        <div className="vintage-container">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <p className="text-clay-600 dark:text-clay-400 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Philosophy</p>
              <h2 className="section-title mb-6">What We Stand For</h2>
            </div>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
            {values.map((v, i) => (
              <ScrollReveal key={v.title} delay={i * 0.1}>
                <div className="vintage-card p-6 text-center flex flex-col h-full">
                  <div className="w-12 h-12 rounded-full bg-forest-100 dark:bg-forest-900/50 flex items-center justify-center mx-auto mb-4">
                    <v.icon className="w-6 h-6 text-forest-600 dark:text-forest-400" />
                  </div>
                  <h3 className="font-serif text-lg text-foreground mb-2">{v.title}</h3>
                  <p className="text-earth-500 dark:text-cream-400 text-sm flex-1">{v.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
