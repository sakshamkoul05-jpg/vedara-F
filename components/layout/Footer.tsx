'use client';

import Link from 'next/link';
import { Mountain, Mail, Phone, MapPin, Instagram, Facebook, Twitter, LogIn } from 'lucide-react';

const footerLinks = {
  explore: [
    { href: '/cottages', label: 'Cottages' },
    { href: '/cafe', label: 'Our Cafe' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/about', label: 'About Us' },
  ],
  support: [
    { href: '/contact', label: 'Contact' },
    { href: '/policies', label: 'Policies' },
    { href: '/policies', label: 'FAQs' },
    { href: '/policies', label: 'Cancellation' },
  ],
  legal: [
    { href: '/policies', label: 'Terms & Conditions' },
    { href: '/policies', label: 'Privacy Policy' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-earth-900 text-cream-200">
      <div className="vintage-container py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Mountain className="w-6 h-6 text-cream-100" />
              <span className="font-serif text-xl font-bold text-cream-50">Vedara Retreat</span>
            </Link>
            <p className="text-cream-300 text-sm leading-relaxed max-w-sm mb-6">
              Where mountains tell stories. A handcrafted escape nestled in the heart of nature,
              offering six unique cottages and a cozy mountain cafe.
            </p>
            <div className="space-y-3 text-sm">
              <a href="mailto:vedararetreat@gmail.com" className="flex items-center gap-2 text-cream-300 hover:text-cream-50 transition-colors">
                <Mail className="w-4 h-4" /> vedararetreat@gmail.com
              </a>
              <a href="tel:+919118882242" className="flex items-center gap-2 text-cream-300 hover:text-cream-50 transition-colors">
                <Phone className="w-4 h-4" /> +91-91188-82242
              </a>
              <span className="flex items-center gap-2 text-cream-300">
                <MapPin className="w-4 h-4" /> Ghiyagi, Jibhi, Manali
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-serif text-cream-50 font-semibold mb-4">Explore</h4>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-cream-300 hover:text-cream-50 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-cream-50 font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-cream-300 hover:text-cream-50 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-cream-50 font-semibold mb-4">Connect</h4>
            <div className="flex gap-3 mb-6">
              <a href="#" className="w-9 h-9 rounded-full bg-earth-800 flex items-center justify-center hover:bg-forest-600 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-earth-800 flex items-center justify-center hover:bg-forest-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-earth-800 flex items-center justify-center hover:bg-forest-600 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
            <Link href="/booking" className="vintage-button-primary text-xs px-5 py-2.5 w-full text-center block">
              Book Your Stay
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-earth-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-cream-400">
          <p>&copy; {new Date().getFullYear()} Vedara Retreat Hotels. All rights reserved.</p>
          <p>Crafted with care in the mountains</p>
        </div>
      </div>
    </footer>
  );
}
