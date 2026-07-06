'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogIn, Mail, Phone, Facebook, Instagram, Sun, Moon, Monitor } from 'lucide-react';
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
  const { theme, resolvedTheme, setTheme } = useThemeStore();

  const cycleTheme = () => {
    const order: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  };

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
          ? 'bg-white/95 dark:bg-[#0F1115]/95 border-b border-border/50 shadow-[0_1px_3px_rgba(28,43,58,0.03)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]'
          : isTransparent
            ? 'bg-transparent'
            : 'bg-[#F5F2EE] dark:bg-[#0F1115]'
      )}
    >
      <div className="vintage-container">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 -ml-2 md:ml-0">
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

          <nav className="hidden lg:flex items-center gap-7" aria-label="Main navigation">
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
                      isTransparent             ? 'bg-[#F5F2EE]' : 'bg-primary'
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
                'p-1.5 rounded-lg transition-all duration-500',
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
                'p-1.5 rounded-lg transition-all duration-500',
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
                'p-1.5 rounded-lg transition-all duration-500',
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
              onClick={cycleTheme}
              className={cn(
                'p-1.5 rounded-lg transition-all duration-500',
                isTransparent
                  ? 'text-white/60 hover:text-white'
                  : 'text-muted-foreground hover:text-primary'
              )}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} mode`}
              title={`Theme: ${theme}`}
            >
              {resolvedTheme === 'dark' ? <Moon className="w-4 h-4" /> : theme === 'system' ? <Monitor className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <Link
              href="/admin/login"
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border duration-500',
                isTransparent
                  ? 'border-white/20 text-white/80 hover:text-white hover:bg-white/10'
                  : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
              )}
            >
              <LogIn className="w-3.5 h-3.5" /> Login
            </Link>

            <Link href="/booking" className="vintage-button-primary text-xs px-5 py-2.5">
              Book Stay
            </Link>
          </div>

          <div className="flex md:hidden items-center gap-1">
            <a
              href="mailto:vedararetreat@gmail.com"
              className={cn('p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center', isTransparent ? 'text-white/80' : 'text-foreground/60 hover:text-primary')}
              aria-label="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
            <a
              href="https://facebook.com/vedararetreat"
              target="_blank"
              rel="noopener noreferrer"
              className={cn('p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center', isTransparent ? 'text-white/80' : 'text-foreground/60 hover:text-primary')}
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com/vedararetreat"
              target="_blank"
              rel="noopener noreferrer"
              className={cn('p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center', isTransparent ? 'text-white/80' : 'text-foreground/60 hover:text-primary')}
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <Link
              href="/admin/login"
              className={cn(
                'inline-flex items-center gap-1 px-3 py-2.5 min-h-[44px] rounded-full text-xs font-medium border',
                isTransparent
                  ? 'border-white/20 text-white/80 hover:bg-white/10'
                  : 'border-border text-foreground/60 hover:border-primary hover:text-primary'
              )}
            >
              <LogIn className="w-3 h-3" /> <span className="hidden [380px]:inline">Login</span>
            </Link>
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className={cn('p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center', isTransparent ? 'text-white' : 'text-foreground')}
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
              className="md:hidden bg-[#F5F2EE] dark:bg-[#0F1115] border-t border-border relative z-50"
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
                  <button
                    onClick={cycleTheme}
                    className="text-muted-foreground hover:text-primary transition-colors duration-500"
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} mode`}
                  >
                    {resolvedTheme === 'dark' ? <Moon className="w-5 h-5" /> : theme === 'system' ? <Monitor className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </button>
                </div>
            </nav>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
