'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';

const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/collections', label: 'Collections' },
  { href: '/story', label: 'Our Story' },
  { href: '/sustainability', label: 'Sustainability' },
  { href: '/journal', label: 'Journal' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.getItemCount());
  const openCart = useCartStore((s) => s.openCart);
  const user = useAuthStore((s) => s.user);
  const isHome = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const transparent = isHome && !scrolled && !mobileOpen;

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          transparent
            ? 'bg-transparent'
            : 'bg-cream/95 backdrop-blur-md border-b border-soft-border/50 shadow-soft'
        )}
      >
        <div className="container-luxury">
          <div
            className={cn(
              'flex items-center justify-between transition-all duration-500',
              scrolled ? 'h-16' : 'h-20 md:h-24'
            )}
          >
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 -ml-2 text-forest"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Desktop nav left */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm tracking-wide transition-colors duration-300',
                    transparent ? 'text-cream/90 hover:text-cream' : 'text-forest hover:text-gold',
                    pathname === link.href && (transparent ? 'text-cream' : 'text-gold')
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Logo */}
            <Link
              href="/"
              className={cn(
                'absolute left-1/2 -translate-x-1/2 font-serif text-xl md:text-2xl tracking-[0.15em] transition-colors duration-300',
                transparent ? 'text-cream' : 'text-forest'
              )}
            >
              GLOWTEVA
            </Link>

            {/* Desktop nav right + icons */}
            <div className="flex items-center gap-1 md:gap-2">
              <nav className="hidden lg:flex items-center gap-8 mr-4">
                {navLinks.slice(3).map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'text-sm tracking-wide transition-colors duration-300',
                      transparent ? 'text-cream/90 hover:text-cream' : 'text-forest hover:text-gold',
                      pathname === link.href && (transparent ? 'text-cream' : 'text-gold')
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <button
                className={cn('p-2 transition-colors', transparent ? 'text-cream' : 'text-forest hover:text-gold')}
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              <Link
                href={user ? '/account' : '/login'}
                className={cn('p-2 transition-colors', transparent ? 'text-cream' : 'text-forest hover:text-gold')}
                aria-label="Account"
              >
                <User size={18} />
              </Link>

              <Link
                href="/account?tab=wishlist"
                className={cn('relative hidden sm:block p-2 transition-colors', transparent ? 'text-cream' : 'text-forest hover:text-gold')}
                aria-label="Wishlist"
              >
                <Heart size={18} />
                {(user?.wishlist?.length || 0) > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-forest text-[10px] font-medium rounded-full flex items-center justify-center">{user?.wishlist?.length}</span>}
              </Link>

              <button
                className={cn('relative p-2 transition-colors', transparent ? 'text-cream' : 'text-forest hover:text-gold')}
                onClick={openCart}
                aria-label="Cart"
              >
                <ShoppingBag size={18} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-forest text-[10px] font-medium rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-40 bg-cream pt-24 lg:hidden"
          >
            <nav className="container-luxury flex flex-col gap-6 py-8">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="font-serif text-2xl text-forest hover:text-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="gold-line my-4" />
              <Link href={user ? '/account' : '/login'} className="text-soft-green text-sm tracking-wide">
                {user ? 'My Account' : 'Sign In'}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-cream/98 backdrop-blur-sm flex items-start justify-center pt-32"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl px-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-soft-green" size={20} />
                <input
                  type="search"
                  placeholder="Search products, ingredients, rituals..."
                  className="w-full pl-12 pr-12 py-4 bg-white border border-soft-border text-forest text-lg focus:outline-none focus:border-gold"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setSearchOpen(false);
                    if (e.key === 'Enter') {
                      const q = (e.target as HTMLInputElement).value;
                      if (q.trim()) {
                        window.location.href = `/shop?search=${encodeURIComponent(q.trim())}`;
                      }
                    }
                  }}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-soft-green hover:text-forest"
                  onClick={() => setSearchOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <p className="mt-4 text-sm text-soft-green text-center">
                Press Enter to search · Esc to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
