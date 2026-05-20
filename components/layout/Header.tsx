'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Moon, Sun, LogIn } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/theme';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/cottages', label: 'Cottages' },
  { href: '/cafe', label: 'Cafe' },
  { href: '/about', label: 'About' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/contact', label: 'Contact' },
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
          <Link href="/" className="flex items-center gap-2 group">
            <span className={cn(
              'inline-flex rounded-lg px-2 py-1 transition-colors',
              isTransparent ? 'bg-white/10 backdrop-blur-sm' : ''
            )}>
              <Image
                src="/images/vedara-logo.jpeg"
                alt="Vedara Retreat"
                width={120}
                height={36}
                className={cn(
                  'h-8 md:h-9 w-auto transition-all',
                  isTransparent ? 'brightness-0 invert' : ''
                )}
                priority
              />
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
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
            <Link href="/booking" className="vintage-button-primary text-xs px-5 py-2.5">
              Book Now
            </Link>
            <Link
              href="/admin/login"
              className={cn(
                'flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-all',
                isTransparent
                  ? 'text-cream-100/80 hover:text-cream-50 border border-white/20 hover:border-white/40'
                  : 'text-earth-600 dark:text-cream-300 hover:text-forest-600 dark:hover:text-cream-50 border border-earth-300 dark:border-earth-600 hover:border-forest-400'
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
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </nav>

          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={toggle}
              className={cn('p-2 rounded-full', isTransparent ? 'text-cream-100' : 'text-earth-600')}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className={cn('p-2', isTransparent ? 'text-cream-100' : 'text-earth-800')}
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
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
