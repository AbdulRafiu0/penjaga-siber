import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, ExternalLink, CheckCircle, XCircle, FileText, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API = 'https://aegis-api.rafiuraza474.workers.dev';

interface PaymentRow {
  id: string; programName: string; studentName: string; internId: string;
  createdAt: string; payment_screenshot_key: string | null; verificationStatus: string;
}

export default function AdminPayments() {
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/payments`);
      const data = await res.json();
      if (data.success) setRows(data.payments);
    } catch {
      toast({ variant: 'destructive', title: 'Fetch error', description: 'Could not load payments.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const act = async (id: string, action: 'verify' | 'reject') => {
    setActingId(id);
    try {
      const res = await fetch(`${API}/api/admin/payments/${id}/${action}`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        toast({ title: action === 'verify' ? 'Payment Verified' : 'Payment Rejected' });
        load();
      } else {
        toast({ variant: 'destructive', title: 'Action failed', description: data.message });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Network error' });
    } finally {
      setActingId(null);
    }
  };

  const badgeVariant = (status: string) =>
    status === 'Verified' ? 'default' : status === 'Rejected' ? 'destructive' : 'secondary';

  const screenshotUrl = (key: string) => `${API}/api/files/${encodeURIComponent(key)}`;

  return (
    <Card>
      <CardHeader><CardTitle>Certificate Payments</CardTitle></CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12 gap-2"><Loader2 className="h-6 w-6 animate-spin" /> Loading payments...</div>
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground italic">No payment requests yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Screenshot</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell><span className="font-semibold block">{r.studentName}</span><code className="text-xs text-muted-foreground">{r.internId}</code></TableCell>
                  <TableCell className="text-sm">{r.programName}</TableCell>
                  <TableCell>
                    {r.payment_screenshot_key ? (
                      r.payment_screenshot_key.toLowerCase().endsWith('.pdf') ? (
                        <a href={screenshotUrl(r.payment_screenshot_key)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-primary hover:underline">
                          <FileText className="h-4 w-4" /> Open PDF
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPreviewKey(r.payment_screenshot_key)}
                          className="group flex items-center gap-2"
                        >
                          <img
                            src={screenshotUrl(r.payment_screenshot_key)}
                            alt="Payment screenshot thumbnail"
                            className="h-12 w-12 rounded-md object-cover border border-border group-hover:border-primary transition-colors"
                          />
                          <span className="text-xs text-primary flex items-center gap-1 group-hover:underline">
                            <ExternalLink className="h-3 w-3" /> View
                          </span>
                        </button>
                      )
                    ) : <span className="text-xs text-muted-foreground italic">Not uploaded</span>}
                  </TableCell>
                  <TableCell><Badge variant={badgeVariant(r.verificationStatus)}>{r.verificationStatus}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button size="sm" variant="outline" className="h-8 text-emerald-600" disabled={actingId === r.id || !r.payment_screenshot_key} onClick={() => act(r.id, 'verify')}>
                        <CheckCircle className="h-3.5 w-3.5 mr-1" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-destructive" disabled={actingId === r.id || !r.payment_screenshot_key} onClick={() => act(r.id, 'reject')}>
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {previewKey && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={() => setPreviewKey(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewKey(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white"
            aria-label="Close preview"
          >
            <X className="h-7 w-7" />
          </button>
          <img
            src={screenshotUrl(previewKey)}
            alt="Payment screenshot"
            className="max-h-[85vh] max-w-[90vw] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </Card>
  );
}