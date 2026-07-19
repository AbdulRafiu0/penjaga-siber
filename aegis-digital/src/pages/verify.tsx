import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/MainLayout';

export default function Verify() {
  const [searchId, setSearchId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchId.trim()) return;
    
    setLoading(true);
    setSearched(true);
    
    try {
      // Calls the new verification endpoint we added to your worker
      const response = await fetch(`https://aegis-api.rafiuraza474.workers.dev/api/verify/${searchId}`);
      const data = await response.json();
      
      if (data.success) {
        setResult(data.data);
      } else {
        setResult(null);
      }
    } catch (error) {
      console.error("Verification error:", error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <Shield className="h-16 w-16 text-primary mx-auto mb-6 glow-blue" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Certificate Verification</h1>
              <p className="text-xl text-muted-foreground">Verify the authenticity of Penjaga Siber certificates</p>
            </div>

            <Card>
              <CardHeader><CardTitle>Enter Certificate ID</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-6">
                  <Input
                    placeholder="domin-year-XXXX"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="font-mono"
                  />
                  <Button onClick={handleSearch} disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                    {loading ? "Verifying..." : "Verify"}
                  </Button>
                </div>

                {searched && !loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {result ? (
                      <Card className="border-primary glow-blue">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-6">
                            <CheckCircle className="h-12 w-12 text-primary flex-shrink-0" />
                            <div>
                              <h3 className="text-2xl font-bold mb-2">Certificate Verified</h3>
                              <p className="text-muted-foreground">This is a valid Penjaga Siber certificate</p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div><p className="text-sm text-muted-foreground">Certificate ID</p><p className="font-mono font-semibold">{result.internId}</p></div>
                              <div><p className="text-sm text-muted-foreground">Status</p><Badge>Verified</Badge></div>
                            </div>
                            <div><p className="text-sm text-muted-foreground">Intern Name</p><p className="font-semibold text-lg">{result.name}</p></div>
                            <div><p className="text-sm text-muted-foreground">Program</p><p className="font-semibold text-primary">{result.program}</p></div>
                            <div><p className="text-sm text-muted-foreground">Issue Date</p><p className="font-semibold">{result.issuedDate}</p></div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="border-destructive">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <XCircle className="h-12 w-12 text-destructive flex-shrink-0" />
                            <div>
                              <h3 className="text-2xl font-bold mb-2">Certificate Not Found</h3>
                              <p className="text-muted-foreground">No certificate found with ID: <span className="font-mono font-semibold">{searchId}</span></p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}