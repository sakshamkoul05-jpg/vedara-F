'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Facebook, Instagram, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1C2B3A] text-white border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 liquid-gradient opacity-10" />
      <div className="vintage-container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image src="/images/vedara-logo.jpeg" alt="The Vedara" width={80} height={80} className="w-full h-full object-cover" />
              </div>
              <span className="font-serif text-xl font-bold text-white">The Vedara – Himalayan Boutique Retreat</span>
            </Link>

            <div className="space-y-3 text-sm">
              <a href="mailto:vedararetreat@gmail.com" className="flex items-center gap-2 text-white/70 hover:text-gold-400 transition-colors duration-500">
                <Mail className="w-4 h-4" /> vedararetreat@gmail.com
              </a>
              <a href="tel:+919118882242" className="flex items-center gap-2 text-white/70 hover:text-gold-400 transition-colors duration-500">
                <Phone className="w-4 h-4" /> +91-91188-82242
              </a>
              <span className="flex items-start gap-2 text-white/70">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /> Ghiyagi, Jibhi, Himachal Pradesh – 175123
              </span>
            </div>

            <div className="mt-6 rounded-xl overflow-hidden border border-white/10 w-full max-w-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3397.5!2d77.35!3d31.55!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zQ2hpYmFqIEhpYWNoYWwgUHJhZGVzaA!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="160"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="The Vedara Retreat location on Google Maps"
              />
              <div className="flex gap-2 p-3 bg-white/5">
                <a
                  href="https://maps.google.com/maps?q=Ghiyagi+Jibhi+Himachal+Pradesh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs text-white/70 hover:text-gold-400 transition-colors py-1.5 rounded-lg bg-white/5 hover:bg-white/10"
                >
                  <ExternalLink className="w-3 h-3" /> Open in Maps
                </a>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Ghiyagi+Jibhi+Himachal+Pradesh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 text-xs text-white/70 hover:text-gold-400 transition-colors py-1.5 rounded-lg bg-white/5 hover:bg-white/10"
                >
                  <MapPin className="w-3 h-3" /> Directions
                </a>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-gold-400 font-semibold mb-4">Explore</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-white/70 hover:text-white transition-colors duration-500">About Us</Link></li>
              <li><Link href="/cottages" className="text-sm text-white/70 hover:text-white transition-colors duration-500">Our Stays</Link></li>
              <li><Link href="/cafe" className="text-sm text-white/70 hover:text-white transition-colors duration-500">Café Charade</Link></li>
              <li><Link href="/gallery" className="text-sm text-white/70 hover:text-white transition-colors duration-500">Gallery</Link></li>
              <li><Link href="/#how-to-reach" className="text-sm text-white/70 hover:text-white transition-colors duration-500">How to Reach</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-gold-400 font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li><Link href="/contact" className="text-sm text-white/70 hover:text-white transition-colors duration-500">Contact Us</Link></li>
              <li><Link href="/my-bookings" className="text-sm text-white/70 hover:text-white transition-colors duration-500">My Bookings</Link></li>
              <li><Link href="/policies" className="text-sm text-white/70 hover:text-white transition-colors duration-500">Policies, FAQs & Cancellation</Link></li>
            </ul>
            <div className="flex gap-3 mt-6">
              <a href="https://facebook.com/vedararetreat" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold-500 transition-all duration-500" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com/vedararetreat" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold-500 transition-all duration-500" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
            <Link href="/booking" className="vintage-button-secondary text-xs px-5 py-2.5 w-full text-center block mt-4">
              Book Your Stay
            </Link>
            <Link href="/admin/login" className="text-xs text-white/40 hover:text-white/60 transition-colors mt-3 block text-center">
              Staff Login
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>&copy; {new Date().getFullYear()} The Vedara. All rights reserved.</p>
          <p>Ghiyagi, Jibhi, Himachal Pradesh – 175123</p>
        </div>
      </div>
    </footer>
  );
}
