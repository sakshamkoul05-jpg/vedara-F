'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogIn, Mail, Phone, Facebook, Instagram } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/theme';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/cottages', label: 'Stays' },
  { href: '/cafe', label: 'Café' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact Us' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggle } = useThemeStore();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const isTransparent = !isScrolled && pathname === '/';

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-alabaster/95 backdrop-blur-md shadow-sm'
          : isTransparent
            ? 'bg-transparent'
            : 'bg-alabaster'
      )}
    >
      <div className="vintage-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className={cn(
              'w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden flex-shrink-0 transition-all',
              isTransparent ? 'ring-2 ring-white/20' : 'ring-1 ring-gold-200'
            )}>
              <Image
                src="/images/vedara-logo.jpeg"
                alt="The Vedara"
                width={80}
                height={80}
                className="w-full h-full object-contain"
                priority
              />
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-[13px] font-medium tracking-wide transition-all duration-500 relative py-1',
                  isTransparent
                    ? 'text-alabaster/80 hover:text-alabaster'
                    : 'text-vedara-900/70 hover:text-vedara-900',
                  pathname === link.href && (isTransparent ? 'text-alabaster' : 'text-gold-600')
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.span
                    layoutId="nav-indicator"
                    className={cn(
                      'absolute -bottom-1 left-0 right-0 h-0.5 rounded-full',
                      isTransparent ? 'bg-alabaster' : 'bg-gold-500'
                    )}
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="mailto:vedararetreat@gmail.com"
              className={cn(
                'p-1.5 rounded-full transition-all duration-500',
                isTransparent
                  ? 'text-alabaster/60 hover:text-alabaster'
                  : 'text-vedara-900/40 hover:text-gold-500'
              )}
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
            <a
              href="https://facebook.com/vedararetreat"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'p-1.5 rounded-full transition-all duration-500',
                isTransparent
                  ? 'text-alabaster/60 hover:text-alabaster'
                  : 'text-vedara-900/40 hover:text-gold-500'
              )}
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com/vedararetreat"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'p-1.5 rounded-full transition-all duration-500',
                isTransparent
                  ? 'text-alabaster/60 hover:text-alabaster'
                  : 'text-vedara-900/40 hover:text-gold-500'
              )}
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>

            <div className={cn('h-5 w-px mx-1', isTransparent ? 'bg-white/20' : 'bg-gold-200')} />

            <Link
              href="/admin/login"
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border duration-500',
                isTransparent
                  ? 'border-white/20 text-alabaster/80 hover:text-alabaster hover:bg-white/10'
                  : 'border-gold-200 text-vedara-900/60 hover:border-gold-500 hover:text-gold-600'
              )}
            >
              <LogIn className="w-3.5 h-3.5" /> Login
            </Link>

            <Link href="/booking" className="vintage-button-primary text-xs px-5 py-2.5">
              Book Stay
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-1">
            <a href="mailto:vedararetreat@gmail.com" className={cn('p-1.5', isTransparent ? 'text-alabaster/80' : 'text-vedara-900/40')} aria-label="Email">
              <Mail className="w-4 h-4" />
            </a>
            <a href="https://facebook.com/vedararetreat" target="_blank" rel="noopener noreferrer" className={cn('p-1.5', isTransparent ? 'text-alabaster/80' : 'text-vedara-900/40')} aria-label="Facebook">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://instagram.com/vedararetreat" target="_blank" rel="noopener noreferrer" className={cn('p-1.5', isTransparent ? 'text-alabaster/80' : 'text-vedara-900/40')} aria-label="Instagram">
              <Instagram className="w-4 h-4" />
            </a>
            <Link
              href="/admin/login"
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border',
                isTransparent
                  ? 'border-white/20 text-alabaster/80'
                  : 'border-gold-200 text-vedara-900/60'
              )}
            >
              <LogIn className="w-3 h-3" /> Login
            </Link>
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className={cn('p-2', isTransparent ? 'text-alabaster' : 'text-vedara-900')}
              aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-alabaster border-t border-gold-200"
          >
            <nav className="vintage-container py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'block text-base font-medium transition-colors duration-500',
                    pathname === link.href
                      ? 'text-gold-600'
                      : 'text-vedara-900/70'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/booking" className="vintage-button-primary w-full text-center">
                Book Your Stay
              </Link>
              <div className="flex items-center justify-center gap-6 pt-4 border-t border-gold-200">
                <a href="mailto:vedararetreat@gmail.com" className="text-vedara-900/40 hover:text-gold-500 transition-colors duration-500" aria-label="Email">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="tel:+919118882242" className="text-vedara-900/40 hover:text-gold-500 transition-colors duration-500" aria-label="Phone">
                  <Phone className="w-5 h-5" />
                </a>
                <a href="https://facebook.com/vedararetreat" target="_blank" rel="noopener noreferrer" className="text-vedara-900/40 hover:text-gold-500 transition-colors duration-500" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://instagram.com/vedararetreat" target="_blank" rel="noopener noreferrer" className="text-vedara-900/40 hover:text-gold-500 transition-colors duration-500" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
