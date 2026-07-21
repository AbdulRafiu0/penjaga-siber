// src/pages/Verify.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const API = 'https://aegis-api.rafiuraza474.workers.dev';

interface VerifyResult { name: string; program: string; internId: string; completionDate: string; certificateStatus: string; }

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
      if (data.success) setResult(data.data);
      else setNotFound(true);
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2"><Shield className="h-6 w-6 text-primary" /></div>
          <CardTitle className="text-2xl font-bold">Certificate Verification</CardTitle>
          <p className="text-sm text-muted-foreground">Search by Certificate ID, Intern ID, or email</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input placeholder="e.g. SEC-2026-6041 or name@email.com" value={query} onChange={e => setQuery(e.target.value)} />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </form>

          {result && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2">
              <p className="flex items-center gap-2 font-bold text-emerald-600"><CheckCircle className="h-5 w-5" /> Valid Certificate</p>
              <p className="text-sm"><span className="text-muted-foreground">Name:</span> {result.name}</p>
              <p className="text-sm"><span className="text-muted-foreground">Program:</span> {result.program}</p>
              <p className="text-sm"><span className="text-muted-foreground">Intern ID:</span> <code>{result.internId}</code></p>
              <p className="text-sm"><span className="text-muted-foreground">Completion Date:</span> {result.completionDate}</p>
              <p className="text-sm"><span className="text-muted-foreground">Status:</span> {result.certificateStatus}</p>
            </div>
          )}

          {notFound && (
            <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" /> No valid certificate found for that query.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}