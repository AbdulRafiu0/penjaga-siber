import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/MainLayout';

// TODO: Replace this with a real API call to your backend once it's set up,
// e.g. `const letter = await fetch(`/api/letters/${searchId}`).then(r => r.json())`.
// This placeholder intentionally contains no records — every lookup will
// correctly report "not found" until real, issued letters are wired in.
type LetterRecord = {
  recipientName: string;
  letterType: string;
  program: string;
  issueDate: string;
  validUntil: string;
  status: string;
};

const mockLetters: Record<string, LetterRecord> = {};

export default function VerifyLetter() {
  const [searchId, setSearchId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    setSearched(true);
    const letter = mockLetters[searchId as keyof typeof mockLetters];
    setResult(letter || null);
  };

  return (
    <MainLayout>
      <div className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-12">
              <FileText className="h-16 w-16 text-primary mx-auto mb-6 glow-blue" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Letter Verification</h1>
              <p className="text-xl text-muted-foreground">
                Verify the authenticity of Aegis Digital offer and completion letters
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Enter Letter ID</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-6">
                  <Input
                    placeholder="e.g., AEG-LTR-2024-001"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="font-mono"
                    data-testid="input-letter-id"
                  />
                  <Button onClick={handleSearch} data-testid="button-verify-letter">
                    <Search className="h-4 w-4 mr-2" />
                    Verify
                  </Button>
                </div>

                {searched && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {result ? (
                      <Card className="border-primary glow-blue">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-6">
                            <CheckCircle className="h-12 w-12 text-primary flex-shrink-0" />
                            <div>
                              <h3 className="text-2xl font-bold mb-2">Letter Verified</h3>
                              <p className="text-muted-foreground">
                                This is a valid Aegis Digital letter
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Letter ID</p>
                                <p className="font-mono font-semibold text-sm" data-testid="text-letter-id">{searchId}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Status</p>
                                <Badge variant="default" data-testid="badge-letter-status">{result.status}</Badge>
                              </div>
                            </div>

                            <div>
                              <p className="text-sm text-muted-foreground">Recipient Name</p>
                              <p className="font-semibold text-lg">{result.recipientName}</p>
                            </div>

                            <div>
                              <p className="text-sm text-muted-foreground">Letter Type</p>
                              <p className="font-semibold text-primary">{result.letterType}</p>
                            </div>

                            <div>
                              <p className="text-sm text-muted-foreground">Program</p>
                              <p className="font-semibold">{result.program}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Issue Date</p>
                                <p className="font-semibold">{result.issueDate}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Valid Until</p>
                                <p className="font-semibold">{result.validUntil}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="border-destructive">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <XCircle className="h-12 w-12 text-destructive flex-shrink-0" />
                            <div>
                              <h3 className="text-2xl font-bold mb-2">Letter Not Found</h3>
                              <p className="text-muted-foreground">
                                No letter found with ID: <span className="font-mono font-semibold">{searchId}</span>
                              </p>
                              <p className="text-sm text-muted-foreground mt-2">
                                Please check the ID and try again, or contact us if you believe this is an error.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                )}

                {!searched && (
                  <div className="bg-muted p-6 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      Enter the letter ID printed on an Aegis Digital offer or completion letter to verify it.
                      {/* TODO: Once your backend is live, real issued letter IDs will resolve here. */}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
}
