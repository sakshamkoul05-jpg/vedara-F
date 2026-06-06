'use client';

import Link from 'next/link';
import { Mountain, Mail, Phone, MapPin, Facebook, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-earth-900 text-cream-200">
      <div className="vintage-container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Mountain className="w-6 h-6 text-cream-100" />
              <span className="font-serif text-xl font-bold text-cream-50">The Vedara – Himalayan Boutique Retreat</span>
            </Link>

            <div className="space-y-3 text-sm">
              <a href="mailto:vedararetreat@gmail.com" className="flex items-center gap-2 text-cream-300 hover:text-cream-50 transition-colors">
                <Mail className="w-4 h-4" /> vedararetreat@gmail.com
              </a>
              <a href="tel:+919118882242" className="flex items-center gap-2 text-cream-300 hover:text-cream-50 transition-colors">
                <Phone className="w-4 h-4" /> +91-91188-82242
              </a>
              <span className="flex items-start gap-2 text-cream-300">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /> Ghiyagi, Jibhi, Himachal Pradesh – 175123
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-cream-50 font-semibold mb-4">Explore</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-cream-300 hover:text-cream-50 transition-colors">About Us</Link></li>
              <li><Link href="/cottages" className="text-sm text-cream-300 hover:text-cream-50 transition-colors">Our Stays</Link></li>
              <li><Link href="/cafe" className="text-sm text-cream-300 hover:text-cream-50 transition-colors">Café Charade</Link></li>
              <li><Link href="/gallery" className="text-sm text-cream-300 hover:text-cream-50 transition-colors">Gallery</Link></li>
              <li><Link href="/#how-to-reach" className="text-sm text-cream-300 hover:text-cream-50 transition-colors">How to Reach</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-cream-50 font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              <li><Link href="/contact" className="text-sm text-cream-300 hover:text-cream-50 transition-colors">Contact Us</Link></li>
              <li><Link href="/policies" className="text-sm text-cream-300 hover:text-cream-50 transition-colors">Policies</Link></li>
              <li><Link href="/policies#faqs" className="text-sm text-cream-300 hover:text-cream-50 transition-colors">FAQs</Link></li>
              <li><Link href="/policies#cancellation" className="text-sm text-cream-300 hover:text-cream-50 transition-colors">Cancellation</Link></li>
            </ul>
            <div className="flex gap-3 mt-6">
              <a href="https://facebook.com/vedararetreat" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-earth-800 flex items-center justify-center hover:bg-forest-600 transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com/vedararetreat" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-earth-800 flex items-center justify-center hover:bg-forest-600 transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
            <Link href="/booking" className="vintage-button-primary text-xs px-5 py-2.5 w-full text-center block mt-4">
              Book Your Stay
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-earth-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-cream-400">
          <p>&copy; {new Date().getFullYear()} The Vedara Retreat. All rights reserved.</p>
          <p>Ghiyagi, Jibhi, Himachal Pradesh – 175123</p>
        </div>
      </div>
    </footer>
  );
}
