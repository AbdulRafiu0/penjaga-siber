import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Shield, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const [location] = useLocation();
  const { isLoggedIn } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/programs', label: 'Programs' },
    // Updated Apply link to /register
    { href: '/register', label: 'Apply' },
    { href: '/verify', label: 'Verify' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-background/80 backdrop-blur-lg border-b border-border' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <Shield className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold tracking-tight">Penjaga Siber</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.href ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button data-testid="button-dashboard">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button data-testid="button-login">Login</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block text-sm font-medium transition-colors hover:text-primary ${
                  location === link.href ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Dashboard</Button>
              </Link>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Login</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}