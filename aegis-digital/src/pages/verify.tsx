// src/pages/Verify.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Search, CheckCircle, XCircle, Loader2, LayoutGrid, MessageSquare, Menu, X, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const API = '';

interface VerifyResult { name: string; program: string; internId: string; completionDate: string; certificateStatus: string; }

export default function Verify() {
  const { isLoggedIn, logout } = useAuth();
  const [, setLocation] = useLocation();

  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsLoading(true);
    setResult(null);
    setNotFound(false);
    try {
      const res = await fetch(`${API}/api/verify-search?query=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (data.success) setResult(data.data);
      else setNotFound(true);
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-card z-20">
        <a href="/" className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Penjaga Siber</span>
        </a>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 md:hidden flex flex-col p-6 justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Shield className="h-8 w-8 text-primary" />
                  <span className="text-xl font-bold">Penjaga Siber</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="space-y-3">
                <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted/10 font-medium">
                  <Shield className="h-5 w-5" /><span>Home</span>
                </a>
                <a href="/verify" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-accent text-sidebar-accent-foreground font-medium">
                  <Search className="h-5 w-5" /><span>Verify Certificate</span>
                </a>
                {isLoggedIn ? (
                  <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted/10 font-medium">
                    <LayoutGrid className="h-5 w-5" /><span>Dashboard</span>
                  </a>
                ) : (
                  <a href="/login" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted/10 font-medium">
                    <LogIn className="h-5 w-5" /><span>Login</span>
                  </a>
                )}
              </nav>
            </div>
            {isLoggedIn && (
              <button onClick={() => { logout(); setLocation('/login?logout=true'); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-destructive bg-destructive/10 font-medium w-full text-left">Logout</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border p-6 flex-col justify-between z-10">
        <div>
          <a href="/" className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Penjaga Siber</span>
          </a>
          <nav className="space-y-2">
            <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted/10 transition-colors font-medium">
              <Shield className="h-5 w-5" /><span>Home</span>
            </a>
            <a href="/verify" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground font-medium">
              <Search className="h-5 w-5" /><span>Verify Certificate</span>
            </a>
            {isLoggedIn ? (
              <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted/10 transition-colors font-medium">
                <LayoutGrid className="h-5 w-5" /><span>Dashboard</span>
              </a>
            ) : (
              <a href="/login" className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted/10 transition-colors font-medium">
                <LogIn className="h-5 w-5" /><span>Login</span>
              </a>
            )}
          </nav>
        </div>
        {isLoggedIn && (
          <button onClick={() => { logout(); setLocation('/login?logout=true'); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors w-full text-left font-medium mb-2">Logout</button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 p-4 sm:p-6 md:p-8 flex items-center justify-center min-h-[calc(100vh-4rem)] md:min-h-screen">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-lg">
          <Card className="w-full shadow-lg rounded-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2"><Shield className="h-6 w-6 text-primary" /></div>
              <CardTitle className="text-2xl font-bold">Certificate Verification</CardTitle>
              <p className="text-sm text-muted-foreground">Search by Certificate ID, Intern ID, or email</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input placeholder="e.g. SEC-2026-6041 or name@email.com" value={query} onChange={e => setQuery(e.target.value)} />
                <Button type="submit" disabled={isLoading} className="glow-blue rounded-xl">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </form>

              {result && (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
                  <p className="flex items-center gap-2 font-bold text-emerald-600"><CheckCircle className="h-5 w-5" /> Valid Certificate</p>
                  <p className="text-sm"><span className="text-muted-foreground">Name:</span> {result.name}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Program:</span> {result.program}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Intern ID:</span> <code className="bg-background px-1.5 py-0.5 rounded border text-primary font-bold">{result.internId}</code></p>
                  <p className="text-sm"><span className="text-muted-foreground">Completion Date:</span> {result.completionDate}</p>
                  <p className="text-sm"><span className="text-muted-foreground">Status:</span> {result.certificateStatus}</p>
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