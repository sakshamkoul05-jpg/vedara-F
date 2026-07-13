'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Mail, Phone, Facebook, Instagram, Sun, Moon, Monitor } from 'lucide-react';
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

  const themeIcon = theme === 'dark' ? <Sun className="w-4 h-4" /> : theme === 'system' ? <Monitor className="w-4 h-4" /> : <Moon className="w-4 h-4" />;
  const themeLabel = theme === 'dark' ? 'Switch to light mode' : theme === 'system' ? 'Switch to dark mode' : 'Switch to system mode';

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
          ? 'bg-white/95 dark:bg-charcoal/95 border-b border-border/50 shadow-[0_1px_3px_rgba(28,43,58,0.03)]'
          : isTransparent
            ? 'bg-transparent'
            : 'bg-alabaster dark:bg-charcoal'
      )}
    >
      <div className="vintage-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo — extreme left */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className={cn(
              'w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden flex-shrink-0 transition-all shadow-sm',
              isTransparent ? 'ring-2 ring-white/20' : 'ring-1 ring-border'
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

          {/* Nav — absolute center */}
          <nav className="hidden lg:flex items-center gap-7 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-[13px] font-medium tracking-wide transition-all duration-500 relative py-1',
                  isTransparent
                    ? 'text-white/80 hover:text-white'
                    : 'text-foreground/70 hover:text-foreground',
                  pathname === link.href && (isTransparent ? 'text-white' : 'text-primary')
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.span
                    layoutId="nav-indicator"
                    className={cn(
                      'absolute -bottom-1 left-0 right-0 h-0.5 rounded-full',
                      isTransparent             ? 'bg-alabaster' : 'bg-primary'
                    )}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Actions — extreme right */}
            <div className="hidden md:flex items-center gap-2">
            <a
              href="mailto:vedararetreat@gmail.com"
              className={cn(
                'p-2.5 rounded-lg transition-all duration-500 min-w-[44px] min-h-[44px] flex items-center justify-center',
                isTransparent
                  ? 'text-white/60 hover:text-white'
                  : 'text-muted-foreground hover:text-primary'
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
                'p-2.5 rounded-lg transition-all duration-500 min-w-[44px] min-h-[44px] flex items-center justify-center',
                isTransparent
                  ? 'text-white/60 hover:text-white'
                  : 'text-muted-foreground hover:text-primary'
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
                'p-2.5 rounded-lg transition-all duration-500 min-w-[44px] min-h-[44px] flex items-center justify-center',
                isTransparent
                  ? 'text-white/60 hover:text-white'
                  : 'text-muted-foreground hover:text-primary'
              )}
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>

            <div className={cn('h-5 w-px mx-1', isTransparent ? 'bg-white/20' : 'bg-border')} />

            <button
              onClick={toggle}
              className={cn(
                'p-2.5 rounded-lg transition-all duration-500 min-w-[44px] min-h-[44px] flex items-center justify-center',
                isTransparent
                  ? 'text-white/60 hover:text-white'
                  : 'text-muted-foreground hover:text-primary'
              )}
              aria-label={themeLabel}
              title={theme === 'dark' ? 'Dark mode' : theme === 'system' ? 'System theme' : 'Light mode'}
            >
              {themeIcon}
            </button>

            <Link href="/booking" className="vintage-button-primary text-xs px-5 py-2.5">
              Book Stay
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-1">
            <a href="mailto:vedararetreat@gmail.com" className={cn('p-1.5', isTransparent ? 'text-white/80' : 'text-vedara-900/40')} aria-label="Email">
              <Mail className="w-4 h-4" />
            </a>
            <a href="https://facebook.com/vedararetreat" target="_blank" rel="noopener noreferrer" className={cn('p-1.5', isTransparent ? 'text-white/80' : 'text-vedara-900/40')} aria-label="Facebook">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://instagram.com/vedararetreat" target="_blank" rel="noopener noreferrer" className={cn('p-1.5', isTransparent ? 'text-white/80' : 'text-vedara-900/40')} aria-label="Instagram">
              <Instagram className="w-4 h-4" />
            </a>
            <button
              onClick={toggle}
              className={cn(
                'p-1.5 rounded-lg transition-all duration-500',
                isTransparent
                  ? 'text-white/60 hover:text-white'
                  : 'text-vedara-900/40 hover:text-vedara-900'
              )}
              aria-label={themeLabel}
            >
              {themeIcon}
            </button>
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className={cn('p-3 min-w-[44px] min-h-[44px] flex items-center justify-center', isTransparent ? 'text-white' : 'text-vedara-900')}
              aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-alabaster dark:bg-charcoal border-t border-border relative z-50"
            >
              <nav className="vintage-container py-6 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'block text-base font-medium transition-colors duration-500',
                      pathname === link.href
                        ? 'text-primary'
                        : 'text-foreground/70'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/booking" className="vintage-button-primary w-full text-center">
                  Book Your Stay
                </Link>
                <div className="flex gap-2">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => useThemeStore.getState().setTheme(t)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors duration-500 ${
                        theme === t
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-foreground/70 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {t === 'light' && <Sun className="w-3.5 h-3.5" />}
                      {t === 'dark' && <Moon className="w-3.5 h-3.5" />}
                      {t === 'system' && <Monitor className="w-3.5 h-3.5" />}
                      <span className="capitalize">{t}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
                  <a href="mailto:vedararetreat@gmail.com" className="text-muted-foreground hover:text-primary transition-colors duration-500" aria-label="Email">
                    <Mail className="w-5 h-5" />
                  </a>
                  <a href="tel:+919118882242" className="text-muted-foreground hover:text-primary transition-colors duration-500" aria-label="Phone">
                    <Phone className="w-5 h-5" />
                  </a>
                  <a href="https://facebook.com/vedararetreat" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors duration-500" aria-label="Facebook">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="https://instagram.com/vedararetreat" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors duration-500" aria-label="Instagram">
                    <Instagram className="w-5 h-5" />
                  </a>
              </div>
            </nav>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
