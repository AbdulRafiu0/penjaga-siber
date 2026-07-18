import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Shield, BookOpen, Calendar, Download, Bell, CheckCircle, Clock, AlertCircle, FileText, Loader2, Award, Lock, ExternalLink, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import SubmitTaskModal from '@/components/SubmitTaskModal';

interface DBApplication {
  id: string; programName: string; status: string; createdAt: string; internId?: string; certificateIssued?: boolean | number;
}

export default function Dashboard() {
  const { isLoggedIn, internName, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [applications, setApplications] = useState<DBApplication[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoggedIn) setLocation('/login');
    else syncStudentPipeline();
  }, [isLoggedIn]);

  const syncStudentPipeline = async () => {
    setIsLoadingApps(true);
    try {
      const userId = localStorage.getItem('aegis_userId');
      if (!userId) {
        setApplications([]);
        return;
      }

      // Fetch only this student's own application(s) by ID - scoped server-side,
      // rather than pulling the full applications list (every applicant's
      // name, email, phone, and quiz score) down to the browser and filtering
      // by name client-side.
      const response = await fetch(`https://aegis-api.rafiuraza474.workers.dev/api/applications/student/${userId}`);
      const data = await response.json();
      if (data.success) {
        setApplications(data.applications);
        if (data.applications.length > 0) {
          fetchMySubmissions(data.applications[0].id);
          fetchAssignedTasks(data.applications[0].id);
        }
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Sync Warning', description: 'Could not map records.' });
    } finally { setIsLoadingApps(false); }
  };

  const fetchAssignedTasks = async (appId: string) => {
    try {
      const res = await fetch(`https://aegis-api.rafiuraza474.workers.dev/api/tasks?applicationId=${appId}`);
      const data = await res.json();
      if (data.success) setAssignedTasks(data.tasks);
    } catch (e) { console.error(e); }
  };

  const fetchMySubmissions = async (appId: string) => {
    try {
      const res = await fetch(`https://aegis-api.rafiuraza474.workers.dev/api/submissions/student/${appId}?t=${Date.now()}`);
      const data = await res.json();
      if (data.success) setMySubmissions(data.submissions);
    } catch (e) { console.error(e); }
  };

  if (!isLoggedIn) return null;

  const primaryApp = applications[0];
  const applicationStatus = primaryApp?.status?.toLowerCase();
  const isApproved = applicationStatus === 'approved';
  const isRejected = applicationStatus === 'rejected';
  const hasNoApplication = !isLoadingApps && !primaryApp;
  const displayInternId = primaryApp?.internId || 'Generating...';
  const isCertificateUnlocked = primaryApp?.certificateIssued === true || Number(primaryApp?.certificateIssued) === 1;

  const resources = [
    { title: 'Security Best Practices Guide', type: 'PDF' },
    { title: 'Network Analysis Tools Tutorial', type: 'Video' },
    { title: 'Project Requirements Document', type: 'Doc' },
    { title: 'Mentor Office Hours Schedule', type: 'Calendar' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8"><Shield className="h-8 w-8 text-primary" /><span className="text-xl font-bold">Aegis Digital</span></div>
          <nav className="space-y-2"><a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground font-medium"><BookOpen className="h-5 w-5" /><span>Dashboard</span></a></nav>
        </div>
        <button onClick={() => { logout(); setLocation('/login?logout=true'); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors w-full text-left font-medium mb-2">Logout</button>
      </div>

      <div className="ml-64 p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Welcome back, {internName || "Student"}</h1>
              {!hasNoApplication && (
                <p className="text-muted-foreground">Intern ID: <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded text-primary font-bold">{displayInternId}</code></p>
              )}
            </div>
          </div>

          {isLoadingApps ? (
            <Card className="p-8 text-center rounded-2xl">
              <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Loading your application status...</p>
            </Card>
          ) : hasNoApplication ? (
            <Card className="border border-border bg-card p-8 text-center rounded-2xl">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold tracking-tight mb-1">No Application Found</h3>
              <p className="text-sm text-muted-foreground mb-4">We couldn't find an application linked to your account.</p>
              <a href="/register">
                <Button size="sm">Start an Application</Button>
              </a>
            </Card>
          ) : isRejected ? (
            <Card className="border border-destructive/20 bg-destructive/5 p-8 text-center rounded-2xl">
              <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-xl font-bold tracking-tight text-destructive mb-1">Application Not Approved</h3>
              <p className="text-sm text-muted-foreground">Your application wasn't approved this cycle. Reach out to us if you have questions.</p>
            </Card>
          ) : !isApproved ? (
            <Card className="border border-amber-500/20 bg-amber-500/5 p-8 text-center rounded-2xl">
              <Clock className="h-12 w-12 mx-auto text-amber-500 animate-pulse mb-4" />
              <h3 className="text-xl font-bold tracking-tight text-amber-500 mb-1">Application Pending Review</h3>
              <p className="text-sm text-muted-foreground">
                You're logged in and your application has been received. Your training track unlocks as soon as an admin approves it.
              </p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-6 mb-8">
                <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Assigned Tasks</p><p className="text-3xl font-bold">{assignedTasks.length}</p></CardContent></Card>
                <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Completed</p><p className="text-3xl font-bold text-primary">{mySubmissions.filter(s => s.status === 'approved').length}</p></CardContent></Card>
                <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Pending</p><p className="text-3xl font-bold text-amber-500">{assignedTasks.length - mySubmissions.filter(s => s.status === 'approved').length}</p></CardContent></Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Upcoming Tasks</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {assignedTasks.map((task) => {
                      const hasSubmitted = mySubmissions.find(s => s.task_id === task.title);
                      return (
                        <details key={task.id} className="group border rounded-lg p-3 hover:border-primary transition-all">
                          <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                            {task.title}
                            {hasSubmitted ? <Badge variant="secondary" className="text-[10px]">Submitted</Badge> : <span className="text-[10px] bg-muted px-2 py-1 rounded">Expand</span>}
                          </summary>
                          <div className="mt-3 pt-3 border-t space-y-3">
                            <a href={task.drive_link} target="_blank" rel="noopener noreferrer" className="text-primary text-sm flex items-center gap-1 hover:underline"><ExternalLink className="h-4 w-4" /> Open Task Resources</a>
                            <Button 
                              size="sm" 
                              className="w-full" 
                              disabled={!!hasSubmitted}
                              onClick={() => { setSelectedTaskId(task.title); setIsSubmitModalOpen(true); }}
                            >
                              {hasSubmitted ? "Already Submitted" : "Submit Task"}
                            </Button>
                          </div>
                        </details>
                      );
                    })}
                  </CardContent>
                </Card>
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Learning Resources</CardTitle></CardHeader><CardContent className="space-y-3">{resources.map((r, i) => <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary transition-colors"><div><p className="font-semibold">{r.title}</p><p className="text-sm text-muted-foreground">{r.type}</p></div><Button variant="ghost" size="sm">View</Button></div>)}</CardContent></Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border border-primary/20 bg-card shadow-md overflow-hidden relative group"><div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors" /><CardHeader><CardTitle className="text-xl flex items-center gap-2"><Award className="h-5 w-5 text-primary" /> Verification & Placement Package</CardTitle></CardHeader><CardContent className="space-y-4"><div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><div className="space-y-1"><p className="font-semibold text-sm flex items-center gap-1.5"><FileText className="h-4 w-4 text-primary" /> Appointment & Offer Letter</p></div><Button size="sm" className="w-full sm:w-auto glow-blue" onClick={() => window.print()}><Download className="mr-2 h-4 w-4" /> Print Document</Button></div><div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><div className="space-y-1"><p className="font-semibold text-sm flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" /> Corporate Network Clearance Token</p><p className="text-xs text-muted-foreground">ID: <code className="bg-background px-1.5 py-0.5 rounded text-primary border font-bold font-mono text-[11px]">{displayInternId}</code></p></div><Button size="sm" variant="outline" className="w-full sm:w-auto text-xs" onClick={() => { navigator.clipboard.writeText(displayInternId); toast({ title: "Copied Token", description: "ID token copied." }); }}>Copy ID Token</Button></div></CardContent></Card>
                <Card className={`border shadow-sm flex flex-col justify-between transition-all duration-300 ${isCertificateUnlocked ? 'border-primary bg-card glow-blue' : 'border-border bg-card'}`}><CardHeader><CardTitle className="text-base font-bold flex items-center gap-1.5"><CheckCircle className={`h-4 w-4 ${isCertificateUnlocked ? 'text-primary' : 'text-muted-foreground'}`} /> Program Verification</CardTitle></CardHeader><CardContent className="pb-6 flex-1 flex flex-col justify-between">{isCertificateUnlocked ? <><div className="text-center py-4 border border-primary/20 rounded-xl bg-primary/5"><Award className="h-10 w-10 mx-auto text-primary animate-bounce mb-2" /><p className="text-xs font-bold text-foreground">Certificate Unlocked!</p></div><Button className="w-full mt-4 text-xs h-9 glow-blue" onClick={() => window.print()}><Download className="mr-1.5 h-3.5 w-3.5" /> Download Certificate</Button></> : <><div className="text-center py-4 border border-dashed rounded-xl bg-muted/20"><Lock className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" /><p className="text-xs font-semibold text-muted-foreground">Locked Pending Track Completion</p></div><Button disabled className="w-full mt-4 text-xs h-9">Certificate Unavailable</Button></>}</CardContent></Card>
              </div>
            </>
          )}
        </motion.div>
      </div>
      <SubmitTaskModal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} applicationId={primaryApp?.id} taskId={selectedTaskId} onSubmitted={() => { setIsSubmitModalOpen(false); if(primaryApp) { fetchMySubmissions(primaryApp.id); } }} />
    </div>
  );
}