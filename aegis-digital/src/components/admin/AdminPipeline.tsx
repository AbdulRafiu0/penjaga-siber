import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Download, Archive, Users, Award, Clock, CheckCircle2, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API = 'https://aegis-api.rafiuraza474.workers.dev';

interface PipelineRow {
  id: string; programName: string; applicationStatus: string; studentName: string; studentEmail: string;
  internId: string; certificateIssued: boolean;
  tasksAssigned: number; tasksSubmitted: number; tasksApproved: number; tasksRejected: number;
  completionPercent: number; pipelineStatus: string;
  payment_requested: number; payment_uploaded: number; payment_verified: number;
}

interface Analytics {
  totalApplicants: number; approvedApplicants: number; activeInterns: number; completedInterns: number;
  certifiedInterns: number; pendingPayments: number; verifiedPayments: number;
  tasksAssigned: number; tasksCompleted: number; announcements: number;
}

const FILTERS = ['ALL', 'READY_FOR_CERTIFICATE', 'INCOMPLETE', 'CERTIFIED', 'PAYMENT_PENDING', 'PAYMENT_VERIFIED'] as const;

const FILTER_LABELS: Record<string, string> = {
  ALL: 'All', READY_FOR_CERTIFICATE: 'Ready for Certificate', INCOMPLETE: 'Incomplete',
  CERTIFIED: 'Certified', PAYMENT_PENDING: 'Payment Pending', PAYMENT_VERIFIED: 'Payment Verified',
};

export default function AdminPipeline() {
  const [rows, setRows] = useState<PipelineRow[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [filter, setFilter] = useState<typeof FILTERS[number]>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isArchiving, setIsArchiving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setIsLoading(true);
    try {
      const [pipeRes, analyticsRes] = await Promise.all([
        fetch(`${API}/api/admin/pipeline`),
        fetch(`${API}/api/admin/analytics`),
      ]);
      const pipeData = await pipeRes.json();
      const analyticsData = await analyticsRes.json();
      if (pipeData.success) setRows(pipeData.pipeline);
      if (analyticsData.success) setAnalytics(analyticsData.analytics);
    } catch {
      toast({ variant: 'destructive', title: 'Fetch error', description: 'Could not load pipeline data.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'ALL' ? rows : rows.filter(r => r.pipelineStatus === filter);

  const handleExport = () => {
    window.open(`${API}/api/admin/export`, '_blank');
  };

  const handleArchive = async () => {
    if (!window.confirm('Archive the entire current batch? Records stay searchable but the dashboard resets for a new intake.')) return;
    setIsArchiving(true);
    try {
      const res = await fetch(`${API}/api/admin/archive-batch`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Batch Archived', description: data.message });
        load();
      } else {
        toast({ variant: 'destructive', title: 'Archive failed', description: data.message });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Network error' });
    } finally {
      setIsArchiving(false);
    }
  };

  const statusBadgeVariant = (status: string) => {
    if (status === 'CERTIFIED' || status === 'PAYMENT_VERIFIED') return 'default';
    if (status === 'READY_FOR_CERTIFICATE') return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card><CardContent className="p-4"><Users className="h-5 w-5 text-primary mb-1" /><p className="text-xs text-muted-foreground">Total Applicants</p><p className="text-2xl font-bold">{analytics.totalApplicants}</p></CardContent></Card>
          <Card><CardContent className="p-4"><CheckCircle2 className="h-5 w-5 text-emerald-500 mb-1" /><p className="text-xs text-muted-foreground">Active Interns</p><p className="text-2xl font-bold">{analytics.activeInterns}</p></CardContent></Card>
          <Card><CardContent className="p-4"><Award className="h-5 w-5 text-indigo-500 mb-1" /><p className="text-xs text-muted-foreground">Certified</p><p className="text-2xl font-bold">{analytics.certifiedInterns}</p></CardContent></Card>
          <Card><CardContent className="p-4"><Clock className="h-5 w-5 text-amber-500 mb-1" /><p className="text-xs text-muted-foreground">Pending Payments</p><p className="text-2xl font-bold">{analytics.pendingPayments}</p></CardContent></Card>
          <Card><CardContent className="p-4"><CreditCard className="h-5 w-5 text-emerald-500 mb-1" /><p className="text-xs text-muted-foreground">Verified Payments</p><p className="text-2xl font-bold">{analytics.verifiedPayments}</p></CardContent></Card>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(f => {
            const count = f === 'ALL' ? rows.length : rows.filter(r => r.pipelineStatus === f).length;
            return (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                {FILTER_LABELS[f]} ({count})
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleExport}><Download className="h-4 w-4 mr-1.5" /> Export Report</Button>
          <Button size="sm" variant="outline" className="text-destructive border-destructive/30" disabled={isArchiving} onClick={handleArchive}>
            {isArchiving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Archive className="h-4 w-4 mr-1.5" />} Archive Batch
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Student Progress</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 gap-2"><Loader2 className="h-6 w-6 animate-spin" /> Loading pipeline...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Pipeline Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">No students match this filter.</TableCell></TableRow>
                ) : filtered.map(r => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <span className="font-semibold block">{r.studentName}</span>
                      <code className="text-xs text-muted-foreground">{r.internId}</code>
                    </TableCell>
                    <TableCell className="text-sm">{r.programName}</TableCell>
                    <TableCell className="min-w-[180px]">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${r.completionPercent}%` }} />
                        </div>
                        <span className="text-xs font-semibold w-10 text-right">{r.completionPercent}%</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {r.tasksApproved}/{r.tasksAssigned} approved · {r.tasksSubmitted} submitted · {r.tasksRejected} rejected
                      </p>
                    </TableCell>
                    <TableCell><Badge variant={statusBadgeVariant(r.pipelineStatus)}>{FILTER_LABELS[r.pipelineStatus] || r.pipelineStatus}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}