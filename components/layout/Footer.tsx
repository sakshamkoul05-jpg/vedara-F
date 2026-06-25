'use client';

import Link from 'next/link';
import { Mountain, Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1C2B3A] text-white border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 liquid-gradient opacity-10 pointer-events-none" />
      <div className="vintage-container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Mountain className="w-6 h-6 text-gold-400" />
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
          </div>

          <div>
            <h4 className="font-serif text-gold-400 font-semibold mb-4">Explore</h4>
            <ul className="space-y-3">
              <li><Link href="/about"  className="text-sm text-white/70 hover:text-white transition-colors duration-500">About Us</Link></li>
              <li><Link href="/cottages"  className="text-sm text-white/70 hover:text-white transition-colors duration-500">Our Stays</Link></li>
              <li><Link href="/cafe"  className="text-sm text-white/70 hover:text-white transition-colors duration-500">Café Charade</Link></li>
              <li><Link href="/gallery"  className="text-sm text-white/70 hover:text-white transition-colors duration-500">Gallery</Link></li>
              <li><Link href="/#how-to-reach"  className="text-sm text-white/70 hover:text-white transition-colors duration-500">How to Reach</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-gold-400 font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li><Link href="/contact"  className="text-sm text-white/70 hover:text-white transition-colors duration-500">Contact Us</Link></li>
              <li><Link href="/my-bookings"  className="text-sm text-white/70 hover:text-white transition-colors duration-500">My Bookings</Link></li>
              <li><Link href="/policies"  className="text-sm text-white/70 hover:text-white transition-colors duration-500">Policies</Link></li>
              <li><Link href="/policies#faqs"  className="text-sm text-white/70 hover:text-white transition-colors duration-500">FAQs</Link></li>
              <li><Link href="/policies#cancellation"  className="text-sm text-white/70 hover:text-white transition-colors duration-500">Cancellation</Link></li>
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
