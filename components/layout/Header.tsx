'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, LogIn, Mail, Phone, Facebook, Instagram } from 'lucide-react';
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
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className={cn(
              'w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden flex-shrink-0 transition-all',
              isTransparent ? 'ring-2 ring-white/20' : 'ring-1 ring-earth-200 dark:ring-earth-700'
            )}>
              <Image
                src="/images/vedara-logo.jpeg"
                alt="The Vedara"
                width={80}
                height={80}
                className="w-full h-full object-cover"
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
                  'text-[13px] font-medium tracking-wide transition-colors relative py-1',
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
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="mailto:vedararetreat@gmail.com"
              className={cn(
                'p-1.5 rounded-full transition-colors',
                isTransparent
                  ? 'text-cream-100/60 hover:text-cream-50'
                  : 'text-earth-500 dark:text-cream-400 hover:text-forest-600 dark:hover:text-cream-50'
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
                'p-1.5 rounded-full transition-colors',
                isTransparent
                  ? 'text-cream-100/60 hover:text-cream-50'
                  : 'text-earth-500 dark:text-cream-400 hover:text-forest-600 dark:hover:text-cream-50'
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
                'p-1.5 rounded-full transition-colors',
                isTransparent
                  ? 'text-cream-100/60 hover:text-cream-50'
                  : 'text-earth-500 dark:text-cream-400 hover:text-forest-600 dark:hover:text-cream-50'
              )}
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>

            <div className={cn('h-5 w-px mx-1', isTransparent ? 'bg-white/20' : 'bg-earth-300 dark:bg-earth-600')} />

            <Link
              href="/admin/login"
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                isTransparent
                  ? 'border-white/20 text-cream-100/80 hover:text-cream-50 hover:bg-white/10'
                  : 'border-earth-300 dark:border-earth-600 text-earth-600 dark:text-cream-300 hover:border-forest-500 hover:text-forest-600 dark:hover:text-cream-50'
              )}
            >
              <LogIn className="w-3.5 h-3.5" /> Login
            </Link>

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
          </div>

          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/admin/login"
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border',
                isTransparent
                  ? 'border-white/20 text-cream-100/80'
                  : 'border-earth-300 dark:border-earth-600 text-earth-600 dark:text-cream-300'
              )}
            >
              <LogIn className="w-3 h-3" /> Login
            </Link>
            <button
              onClick={toggle}
              className={cn('p-2 rounded-full', isTransparent ? 'text-cream-100' : 'text-earth-600 dark:text-cream-200')}
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
              <div className="flex items-center justify-center gap-6 pt-4 border-t border-earth-200 dark:border-earth-700">
                <a href="mailto:vedararetreat@gmail.com" className="text-earth-500 dark:text-cream-400 hover:text-forest-600 dark:hover:text-cream-50 transition-colors" aria-label="Email">
                  <Mail className="w-5 h-5" />
                </a>
                <a href="tel:+919118882242" className="text-earth-500 dark:text-cream-400 hover:text-forest-600 dark:hover:text-cream-50 transition-colors" aria-label="Phone">
                  <Phone className="w-5 h-5" />
                </a>
                <a href="https://facebook.com/vedararetreat" target="_blank" rel="noopener noreferrer" className="text-earth-500 dark:text-cream-400 hover:text-forest-600 dark:hover:text-cream-50 transition-colors" aria-label="Facebook">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://instagram.com/vedararetreat" target="_blank" rel="noopener noreferrer" className="text-earth-500 dark:text-cream-400 hover:text-forest-600 dark:hover:text-cream-50 transition-colors" aria-label="Instagram">
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
