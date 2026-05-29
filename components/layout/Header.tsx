'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, LogIn, Mail, Phone, Facebook, Instagram, Youtube } from 'lucide-react';
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
          ? 'bg-cream-50/95 dark:bg-earth-900/95 backdrop-blur-md shadow-sm'
          : isTransparent
            ? 'bg-transparent'
            : 'bg-cream-50 dark:bg-earth-900'
      )}
    >
      <div className="vintage-container">
        <div className={cn(
          'flex items-center justify-between',
          'h-16 md:h-20',
        )}>
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className={cn(
                'inline-flex rounded-lg px-2 py-1 transition-colors',
                isTransparent ? 'bg-white/10 backdrop-blur-sm' : ''
              )}>
                <Image
                  src="/images/vedara-logo.jpeg"
                  alt="The Vedara – A Himalayan Boutique Retreat"
                  width={200}
                  height={60}
                  className={cn(
                    'h-12 md:h-16 w-auto transition-all',
                  )}
                  priority
                />
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium tracking-wide transition-colors relative py-1',
                  isTransparent
                    ? 'text-cream-100/80 hover:text-cream-50'
                    : 'text-earth-700 dark:text-cream-200 hover:text-forest-600 dark:hover:text-cream-50',
                  pathname === link.href && (isTransparent ? 'text-cream-50' : 'text-forest-600 dark:text-cream-50')
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.span
                    layoutId="nav-indicator"
                    className={cn(
                      'absolute -bottom-1 left-0 right-0 h-0.5 rounded-full',
                      isTransparent ? 'bg-cream-50' : 'bg-forest-600 dark:bg-cream-50'
                    )}
                  />
                )}
              </Link>
            ))}
            <div className="flex items-center gap-2 pl-4 border-l border-earth-300 dark:border-earth-600">
              <Link
                href="/admin/login"
                className={cn(
                  'p-1.5 rounded-full transition-colors',
                  isTransparent
                    ? 'text-cream-100/60 hover:text-cream-50 hover:bg-white/10'
                    : 'text-earth-500 dark:text-cream-400 hover:text-forest-600 dark:hover:text-cream-50 hover:bg-earth-100 dark:hover:bg-earth-800'
                )}
                title="Admin & Staff Login"
                aria-label="Admin and Staff Login"
              >
                <LogIn className="w-3.5 h-3.5" />
              </Link>
              <a
                href="https://facebook.com/vedara"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'p-1.5 rounded-full transition-colors',
                  isTransparent
                    ? 'text-cream-100/60 hover:text-cream-50 hover:bg-white/10'
                    : 'text-earth-500 dark:text-cream-400 hover:text-forest-600 dark:hover:text-cream-50 hover:bg-earth-100 dark:hover:bg-earth-800'
                )}
                aria-label="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://instagram.com/vedara"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'p-1.5 rounded-full transition-colors',
                  isTransparent
                    ? 'text-cream-100/60 hover:text-cream-50 hover:bg-white/10'
                    : 'text-earth-500 dark:text-cream-400 hover:text-forest-600 dark:hover:text-cream-50 hover:bg-earth-100 dark:hover:bg-earth-800'
                )}
                aria-label="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://youtube.com/@vedara"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'p-1.5 rounded-full transition-colors',
                  isTransparent
                    ? 'text-cream-100/60 hover:text-cream-50 hover:bg-white/10'
                    : 'text-earth-500 dark:text-cream-400 hover:text-forest-600 dark:hover:text-cream-50 hover:bg-earth-100 dark:hover:bg-earth-800'
                )}
                aria-label="YouTube"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>
            <button
              onClick={toggle}
              className={cn(
                'p-2 rounded-full transition-colors',
                isTransparent
                  ? 'text-cream-100 hover:text-cream-50 hover:bg-white/10'
                  : 'text-earth-600 dark:text-cream-200 hover:bg-earth-100 dark:hover:bg-earth-800'
              )}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link href="/booking" className="vintage-button-primary text-xs px-5 py-2.5">
              Book Stay
            </Link>
          </nav>

          <div className="flex md:hidden items-center gap-3">
            <Link
              href="/admin/login"
              className={cn('p-2 rounded-full', isTransparent ? 'text-cream-100' : 'text-earth-600 dark:text-cream-200')}
              aria-label="Admin Login"
            >
              <LogIn className="w-4 h-4" />
            </Link>
            <button
              onClick={toggle}
              className={cn('p-2 rounded-full', isTransparent ? 'text-cream-100' : 'text-earth-600 dark:text-cream-200')}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className={cn('p-2', isTransparent ? 'text-cream-100' : 'text-earth-800 dark:text-cream-200')}
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
            className="md:hidden bg-cream-50 dark:bg-earth-900 border-t border-earth-200 dark:border-earth-700"
          >
            <nav className="vintage-container py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'block text-base font-medium transition-colors',
                    pathname === link.href
                      ? 'text-forest-600 dark:text-cream-50'
                      : 'text-earth-700 dark:text-cream-200'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/booking" className="vintage-button-primary w-full text-center">
                Book Your Stay
              </Link>
              <div className="flex items-center justify-center gap-4 pt-4 border-t border-earth-200 dark:border-earth-700">
                <a href="mailto:vedararetreat@gmail.com" className="text-earth-500 dark:text-cream-400 hover:text-forest-600 dark:hover:text-cream-50 text-xs flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Email
                </a>
                <a href="tel:+919118882242" className="text-earth-500 dark:text-cream-400 hover:text-forest-600 dark:hover:text-cream-50 text-xs flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Call
                </a>
                <a href="https://facebook.com/vedara" target="_blank" rel="noopener noreferrer" className="text-earth-500 dark:text-cream-400 hover:text-forest-600 dark:hover:text-cream-50" aria-label="Facebook">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://instagram.com/vedara" target="_blank" rel="noopener noreferrer" className="text-earth-500 dark:text-cream-400 hover:text-forest-600 dark:hover:text-cream-50" aria-label="Instagram">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
