// src/pages/Verify.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Search, CheckCircle, XCircle, Loader2, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const API = '';

interface VerifyResult {
  name: string;
  program: string;
  internId: string;
  completionDate: string;
  certificateStatus: string;
}

function LocalNavbar() {
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

          {/* Desktop Navigation Links */}
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

          {/* Desktop Auth Button */}
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

          {/* Mobile Menu Toggle Button */}
          <button
            className="md:hidden text-foreground p-2 rounded-lg hover:bg-muted/10 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border shadow-xl">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block text-sm font-medium transition-colors hover:text-primary py-1 ${
                  location === link.href ? 'text-primary' : 'text-muted-foreground'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-border">
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
        </div>
      )}
    </nav>
  );
}

export default function Verify() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    setResult(null);
    setNotFound(false);
    try {
      const res = await fetch(`${API}/api/verify-search?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Verification search error:', error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LocalNavbar />

      <div className="flex-1 flex items-center justify-center px-4 pt-28 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <Card className="w-full shadow-lg rounded-2xl border">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Certificate Verification</CardTitle>
              <p className="text-sm text-muted-foreground">Search by Certificate ID, Intern ID, or email</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="e.g. SEC-2026-6041 or name@email.com"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <Button type="submit" disabled={isLoading} className="glow-blue rounded-xl shrink-0">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </form>

              {result && (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                  <p className="flex items-center gap-2 font-bold text-emerald-600">
                    <CheckCircle className="h-5 w-5" /> Valid Certificate
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Name:</span> {result.name}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Program:</span> {result.program}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Intern ID:</span>{' '}
                    <code className="bg-background px-1.5 py-0.5 rounded border text-primary font-bold">
                      {result.internId}
                    </code>
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Completion Date:</span> {result.completionDate}
                  </p>
                  <p className="text-sm">
                    <span className="text-muted-foreground">Status:</span> {result.certificateStatus}
                  </p>
                </div>
              )}

              {notFound && (
                <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 flex items-center gap-2 text-destructive">
                  <XCircle className="h-5 w-5 shrink-0" /> No valid certificate found for that query.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}