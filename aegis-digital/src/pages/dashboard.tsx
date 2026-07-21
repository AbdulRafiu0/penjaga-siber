import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { generateOfferLetter } from "@/lib/pdf/offerLetter";
import { generateCertificate } from "@/lib/pdf/certificate";
import { generateRecommendation } from "@/lib/pdf/recommendation";
import { Shield, BookOpen, Calendar, Download, CheckCircle, Clock, AlertCircle, FileText, Loader2, Award, Lock, ExternalLink, XCircle, Megaphone, CreditCard, UploadCloud, ImageIcon, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import SubmitTaskModal from '@/components/SubmitTaskModal';

interface DBApplication {
  id: string; programName: string; status: string; createdAt: string; internId?: string; certificateIssued?: boolean | number; details?: string;
  payment_requested?: number | boolean; payment_uploaded?: number | boolean; payment_verified?: number | boolean;
  payment_rejected?: number | boolean; payment_screenshot_key?: string | null;
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function deriveOfferFields(app: DBApplication) {
  let parsed: any = {};
  try { parsed = JSON.parse(app.details || '{}'); } catch { parsed = {}; }

  const start = app.createdAt ? new Date(app.createdAt) : new Date();
  const durationMonths = Number(parsed.durationMonths) || 3;
  const end = new Date(start);
  end.setMonth(end.getMonth() + durationMonths);

  return {
    department: parsed.department || app.programName,
    startDate: formatDate(start),
    endDate: formatDate(end),
    duration: parsed.duration || `${durationMonths} Months`,
    mode: parsed.mode || 'Remote / Online',
    internshipMode: parsed.internshipMode || 'Unpaid Internship',
    supervisor: parsed.supervisor || 'Program Mentor',
  };
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
  const [isGeneratingOffer, setIsGeneratingOffer] = useState(false);
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);
  const [isGeneratingLOR, setIsGeneratingLOR] = useState(false);

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [progress, setProgress] = useState({ assigned: 0, submitted: 0, approved: 0, rejected: 0, completionPercent: 0 });
  const [isRequestingPayment, setIsRequestingPayment] = useState(false);
  const [paymentFile, setPaymentFile] = useState<File | null>(null);
  const [isUploadingPayment, setIsUploadingPayment] = useState(false);
  const [isDraggingPayment, setIsDraggingPayment] = useState(false);

  const PAYMENT_ALLOWED_EXT = ['png', 'jpg', 'jpeg', 'pdf'];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const selectPaymentFile = (selected: File | null) => {
    if (!selected) { setPaymentFile(null); return; }
    const ext = selected.name.split('.').pop()?.toLowerCase() || '';
    if (!PAYMENT_ALLOWED_EXT.includes(ext)) {
      toast({ variant: 'destructive', title: 'Unsupported file type', description: 'Only PNG, JPG, JPEG, or PDF files are accepted.' });
      return;
    }
    setPaymentFile(selected);
  };

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

      const response = await fetch(`https://aegis-api.rafiuraza474.workers.dev/api/applications/student/${userId}`);
      const data = await response.json();
      if (data.success) {
        setApplications(data.applications);
        if (data.applications.length > 0) {
          fetchMySubmissions(data.applications[0].id);
          fetchAssignedTasks(data.applications[0].id);
          fetchProgress(data.applications[0].id);
          fetchAnnouncements();
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

  const fetchProgress = async (appId: string) => {
    try {
      const res = await fetch(`https://aegis-api.rafiuraza474.workers.dev/api/progress/${appId}`);
      const data = await res.json();
      if (data.success) setProgress(data.progress);
    } catch (e) { console.error(e); }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('https://aegis-api.rafiuraza474.workers.dev/api/announcements');
      const data = await res.json();
      if (data.success) setAnnouncements(data.announcements);
    } catch (e) { console.error(e); }
  };

  const primaryApp = applications.length > 0 ? applications[0] : null;
  const hasNoApplication = !primaryApp;

  const isApproved = primaryApp?.status === "approved";
  const isRejected = primaryApp?.status === "rejected";
  const displayInternId = primaryApp?.internId || "Pending";
  const isCertificateUnlocked = Boolean(primaryApp?.certificateIssued);

  const handleDownloadOfferLetter = async () => {
    if (!primaryApp) return;
    try {
      setIsGeneratingOffer(true);
      await generateOfferLetter({
        application: primaryApp,
        internName: internName || "Student",
        offerFields: deriveOfferFields(primaryApp),
      });
    } catch (e) {
      toast({ variant: 'destructive', title: 'PDF Error', description: 'Could not generate offer letter.' });
    } finally {
      setIsGeneratingOffer(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!primaryApp) return;
    try {
      setIsGeneratingCert(true);
      await generateCertificate({
        application: primaryApp,
        internName: internName || "Student",
        offerFields: deriveOfferFields(primaryApp),
      });
    } catch (e) {
      toast({ variant: 'destructive', title: 'PDF Error', description: 'Could not generate certificate.' });
    } finally {
      setIsGeneratingCert(false);
    }
  };

  const handleDownloadLetterOfRecommendation = async () => {
    if (!primaryApp) return;
    try {
      setIsGeneratingLOR(true);
      await generateRecommendation({
        application: primaryApp,
        internName: internName || "Student",
        offerFields: deriveOfferFields(primaryApp),
      });
    } catch (e) {
      toast({ variant: 'destructive', title: 'PDF Error', description: 'Could not generate recommendation letter.' });
    } finally {
      setIsGeneratingLOR(false);
    }
  };

  const handleRequestPayment = async () => {
    if (!primaryApp) return;
    setIsRequestingPayment(true);
    try {
      const res = await fetch(`https://aegis-api.rafiuraza474.workers.dev/api/applications/${primaryApp.id}/request-payment`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast({ title: data.alreadyRequested ? 'Already requested' : 'Payment requested', description: data.message });
        syncStudentPipeline();
      } else {
        toast({ variant: 'destructive', title: 'Not eligible yet', description: data.message });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Network error' });
    } finally {
      setIsRequestingPayment(false);
    }
  };

  const handleUploadPaymentScreenshot = async () => {
    if (!primaryApp || !paymentFile) return;
    setIsUploadingPayment(true);
    try {
      const formData = new FormData();
      formData.append('file', paymentFile);
      const res = await fetch(`https://aegis-api.rafiuraza474.workers.dev/api/applications/${primaryApp.id}/payment-screenshot`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Screenshot uploaded', description: 'Awaiting admin verification.' });
        setPaymentFile(null);
        syncStudentPipeline();
      } else {
        toast({ variant: 'destructive', title: 'Upload failed', description: data.message });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Network error' });
    } finally {
      setIsUploadingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8"><Shield className="h-8 w-8 text-primary" /><span className="text-xl font-bold">Penjaga Siber</span></div>
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
              {progress.assigned > 0 && progress.approved === progress.assigned && !isCertificateUnlocked && (() => {
                const isVerified = Boolean(primaryApp?.payment_verified);
                const isRejectedPayment = Boolean(primaryApp?.payment_rejected);
                const isUploaded = Boolean(primaryApp?.payment_uploaded);
                const isRequested = Boolean(primaryApp?.payment_requested);
                const isPdf = paymentFile?.name.toLowerCase().endsWith('.pdf');

                const statusConfig = isVerified
                  ? { label: 'Verified', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' }
                  : isRejectedPayment
                  ? { label: 'Rejected — please resubmit', className: 'bg-destructive/10 text-destructive border-destructive/30' }
                  : isUploaded
                  ? { label: 'Pending Review', className: 'bg-amber-500/10 text-amber-600 border-amber-500/30' }
                  : isRequested
                  ? { label: 'Awaiting Screenshot', className: 'bg-blue-500/10 text-blue-600 border-blue-500/30' }
                  : { label: 'Not Requested', className: 'bg-muted text-muted-foreground border-border' };

                return (
                  <Card className="mb-8 border-primary/20 bg-card shadow-md overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12" />
                    <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                      <CardTitle className="text-xl flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Certificate Payment</CardTitle>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusConfig.className}`}>{statusConfig.label}</span>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!isVerified && (
                        <>
                          {!isRequested ? (
                            <div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <p className="font-semibold text-sm">All tasks approved — you're eligible for your certificate</p>
                                <p className="text-xs text-muted-foreground">Request payment instructions to get started.</p>
                              </div>
                              <Button size="sm" className="w-full sm:w-auto glow-blue" disabled={isRequestingPayment} onClick={handleRequestPayment}>
                                {isRequestingPayment ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <CreditCard className="h-4 w-4 mr-1.5" />} Request Certificate Payment
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {isRejectedPayment && (
                                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-sm text-destructive">
                                  <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                  <span>Your last screenshot couldn't be verified. Please upload a clear proof of payment.</span>
                                </div>
                              )}
                              {isUploaded && !isRejectedPayment ? (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-sm text-amber-700">
                                  <Clock className="h-4 w-4 shrink-0" />
                                  <span>Your screenshot was uploaded and is awaiting admin review.</span>
                                </div>
                              ) : null}

                              <label
                                htmlFor="payment-screenshot-input"
                                onDragOver={(e) => { e.preventDefault(); setIsDraggingPayment(true); }}
                                onDragLeave={() => setIsDraggingPayment(false)}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  setIsDraggingPayment(false);
                                  selectPaymentFile(e.dataTransfer.files?.[0] || null);
                                }}
                                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                                  isDraggingPayment ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
                                }`}
                              >
                                <UploadCloud className={`h-8 w-8 ${isDraggingPayment ? 'text-primary' : 'text-muted-foreground/50'}`} />
                                <p className="text-sm font-medium">Drag & drop your payment screenshot here</p>
                                <p className="text-xs text-muted-foreground">or click to browse — PNG, JPG, JPEG, or PDF</p>
                                <input
                                  id="payment-screenshot-input"
                                  type="file"
                                  accept=".png,.jpg,.jpeg,.pdf"
                                  className="hidden"
                                  onChange={(e) => selectPaymentFile(e.target.files?.[0] || null)}
                                  disabled={isUploadingPayment}
                                />
                              </label>

                              {paymentFile && (
                                <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-muted/30">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                      {isPdf ? <FileText className="h-4.5 w-4.5 text-primary" /> : <ImageIcon className="h-4.5 w-4.5 text-primary" />}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium truncate">{paymentFile.name}</p>
                                      <p className="text-xs text-muted-foreground">{formatFileSize(paymentFile.size)}</p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setPaymentFile(null)}
                                    disabled={isUploadingPayment}
                                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                                    aria-label="Remove file"
                                  >
                                    <XCircle className="h-4.5 w-4.5" />
                                  </button>
                                </div>
                              )}

                              <Button size="sm" className="w-full sm:w-auto glow-blue" disabled={!paymentFile || isUploadingPayment} onClick={handleUploadPaymentScreenshot}>
                                {isUploadingPayment ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Uploading...</> : <>{isRejectedPayment ? <RefreshCw className="h-4 w-4 mr-1.5" /> : <UploadCloud className="h-4 w-4 mr-1.5" />} {isRejectedPayment ? 'Resubmit Screenshot' : 'Upload Screenshot'}</>}
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                      {isVerified && (
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-sm text-emerald-700">
                          <CheckCircle className="h-4 w-4 shrink-0" />
                          <span>Payment verified — your certificate is ready below.</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })()}

              <div className="grid grid-cols-3 gap-6 mb-8">
                <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Assigned</p><p className="text-3xl font-bold">{progress.assigned}</p></CardContent></Card>
                <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Approved</p><p className="text-3xl font-bold text-primary">{progress.approved}</p></CardContent></Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Completion</p>
                    <p className="text-3xl font-bold">{progress.completionPercent}%</p>
                    <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${progress.completionPercent}%` }} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Upcoming Tasks</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {assignedTasks.map((task) => {
                      const hasSubmitted = mySubmissions.find(s => s.task_id === task.title);
                      const isOverdue = task.due_date && !hasSubmitted && new Date(task.due_date) < new Date(new Date().toDateString());
                      return (
                        <details key={task.id} className="group border rounded-lg p-3 hover:border-primary transition-all">
                          <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                            <span>
                              {task.title}
                              {task.due_date && (
                                <span className={`block text-[11px] font-normal mt-0.5 flex items-center gap-1 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                                  <Calendar className="h-3 w-3" /> Due {new Date(task.due_date).toLocaleDateString()}{isOverdue ? ' — overdue' : ''}
                                </span>
                              )}
                            </span>
                            {hasSubmitted ? <Badge variant="secondary" className="text-[10px]">Submitted</Badge> : <span className="text-[10px] bg-muted px-2 py-1 rounded">Expand</span>}
                          </summary>
                          <div className="mt-3 pt-3 border-t space-y-3">
                            <a href={`https://aegis-api.rafiuraza474.workers.dev/api/files/${encodeURIComponent(task.file_key)}`} target="_blank" rel="noopener noreferrer" className="text-primary text-sm flex items-center gap-1 hover:underline"><ExternalLink className="h-4 w-4" /> Open Task Resources</a>
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
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary" /> Announcements</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {announcements.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">No announcements yet.</p>
                    ) : announcements.map((a: any) => (
                      <div key={a.id} className="p-3 rounded-lg border border-border">
                        <p className="font-semibold text-sm">{a.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{a.body}</p>
                        <p className="text-[11px] text-muted-foreground mt-2">{new Date(a.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border border-primary/20 bg-card shadow-md overflow-hidden relative group"><div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors" /><CardHeader><CardTitle className="text-xl flex items-center gap-2"><Award className="h-5 w-5 text-primary" /> Verification & Placement Package</CardTitle></CardHeader><CardContent className="space-y-4"><div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><div className="space-y-1"><p className="font-semibold text-sm flex items-center gap-1.5"><FileText className="h-4 w-4 text-primary" /> Appointment & Offer Letter</p></div><Button size="sm" className="w-full sm:w-auto glow-blue" disabled={isGeneratingOffer} onClick={handleDownloadOfferLetter}>{isGeneratingOffer ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Download className="mr-2 h-4 w-4" /> Download Offer Letter</>}</Button></div><div className="p-4 rounded-xl bg-muted/40 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><div className="space-y-1"><p className="font-semibold text-sm flex items-center gap-1.5"><Shield className="h-4 w-4 text-primary" /> Corporate Network Clearance Token</p><p className="text-xs text-muted-foreground">ID: <code className="bg-background px-1.5 py-0.5 rounded text-primary border font-bold font-mono text-[11px]">{displayInternId}</code></p></div><Button size="sm" variant="outline" className="w-full sm:w-auto text-xs" onClick={() => { navigator.clipboard.writeText(displayInternId); toast({ title: "Copied Token", description: "ID token copied." }); }}>Copy ID Token</Button></div></CardContent></Card>
                <Card className={`border shadow-sm flex flex-col justify-between transition-all duration-300 ${isCertificateUnlocked ? 'border-primary bg-card glow-blue' : 'border-border bg-card'}`}><CardHeader><CardTitle className="text-base font-bold flex items-center gap-1.5"><CheckCircle className={`h-4 w-4 ${isCertificateUnlocked ? 'text-primary' : 'text-muted-foreground'}`} /> Program Verification</CardTitle></CardHeader><CardContent className="pb-6 flex-1 flex flex-col justify-between">{isCertificateUnlocked ? <><div className="text-center py-4 border border-primary/20 rounded-xl bg-primary/5"><Award className="h-10 w-10 mx-auto text-primary animate-bounce mb-2" /><p className="text-xs font-bold text-foreground">Certificate Unlocked!</p></div><Button className="w-full mt-4 text-xs h-9 glow-blue" disabled={isGeneratingCert} onClick={handleDownloadCertificate}>{isGeneratingCert ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Generating...</> : <><Download className="mr-1.5 h-3.5 w-3.5" /> Download Certificate</>}</Button><Button variant="outline" className="w-full mt-2 text-xs h-9" disabled={isGeneratingLOR} onClick={handleDownloadLetterOfRecommendation}>{isGeneratingLOR ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Generating...</> : <><FileText className="mr-1.5 h-3.5 w-3.5" /> Download Recommendation Letter</>}</Button></> : <><div className="text-center py-4 border border-dashed rounded-xl bg-muted/20"><Lock className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" /><p className="text-xs font-semibold text-muted-foreground">Locked Pending Track Completion</p></div><Button disabled className="w-full mt-4 text-xs h-9">Certificate Unavailable</Button></>}</CardContent></Card>
              </div>

            </>
          )}
        </motion.div>
      </div>
      <SubmitTaskModal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} applicationId={primaryApp?.id} taskId={selectedTaskId} onSubmitted={() => { setIsSubmitModalOpen(false); if(primaryApp) { fetchMySubmissions(primaryApp.id); fetchProgress(primaryApp.id); } }} />
    </div>
  );
}