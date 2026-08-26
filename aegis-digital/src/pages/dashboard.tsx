import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { generateOfferLetter } from "@/lib/pdf/offerLetter";
import { generateCertificate } from "@/lib/pdf/certificate";
import { generateRecommendation } from "@/lib/pdf/recommendation";
import { Shield, BookOpen, Calendar, Download, CheckCircle, Clock, FileText, Loader2, Award, Lock, ExternalLink, XCircle, Megaphone, CreditCard, UploadCloud, ImageIcon, RefreshCw, PlusCircle, LayoutGrid, X, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import SubmitTaskModal from '@/components/SubmitTaskModal';
import { authFetch, safeJson, getStudentToken, API_BASE } from '@/lib/studentApi';

interface DBApplication {
  id: string; programName: string; status: string; createdAt: string; internId?: string; certificateIssued?: boolean | number; details?: string;
  payment_requested?: number | boolean; payment_uploaded?: number | boolean; payment_verified?: number | boolean;
  payment_rejected?: number | boolean; payment_screenshot_key?: string | null;
}

const PROGRAM_TRACKS = [
  'Cyber Security', 'Security Analysis', 'Software Development', 
  'Web Development', 'Artificial Intelligence', 'Python Programming', 
  'Java Programming', 'C++ Programming', 'JavaScript Programming', 
  'TypeScript Programming', 'UI/UX Design'
];

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
  const [activeAppId, setActiveAppId] = useState<string | null>(null);
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

  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [selectedNewTrack, setSelectedNewTrack] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Message States
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactTab, setContactTab] = useState<'compose' | 'history'>('compose');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageHistory, setMessageHistory] = useState<any[]>([]);

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
    else {
      syncStudentPipeline();
      fetchMessageHistory();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (activeAppId) {
      fetchMySubmissions(activeAppId);
      fetchAssignedTasks(activeAppId);
      fetchProgress(activeAppId);
    }
  }, [activeAppId]);

  const syncStudentPipeline = async () => {
    setIsLoadingApps(true);
    try {
      const userId = localStorage.getItem('aegis_userId');
      if (!userId) {
        setApplications([]);
        return;
      }

      const response = await authFetch(`/api/applications/student/${userId}`);
      const data = await safeJson(response);
      if (data.success) {
        setApplications(data.applications);
        if (data.applications.length > 0 && !activeAppId) {
          setActiveAppId(data.applications[0].id);
        }
        fetchAnnouncements();
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Sync Warning', description: 'Could not map records.' });
    } finally { setIsLoadingApps(false); }
  };

  const fetchMessageHistory = async () => {
    const userId = localStorage.getItem('aegis_userId');
    if (!userId) return;
    try {
      const res = await authFetch(`/api/messages/student/${userId}`);
      const data = await safeJson(res);
      if (data.success) setMessageHistory(data.messages);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAssignedTasks = async (appId: string) => {
    try {
      const res = await authFetch(`/api/tasks?applicationId=${appId}`);
      const data = await safeJson(res);
      if (data.success) setAssignedTasks(data.tasks);
    } catch (e) { console.error(e); }
  };

  const fetchMySubmissions = async (appId: string) => {
    try {
      const res = await authFetch(`/api/submissions/student/${appId}?t=${Date.now()}`);
      const data = await safeJson(res);
      if (data.success) setMySubmissions(data.submissions);
    } catch (e) { console.error(e); }
  };

  const fetchProgress = async (appId: string) => {
    try {
      const res = await authFetch(`/api/progress/${appId}`);
      const data = await safeJson(res);
      if (data.success) setProgress(data.progress);
    } catch (e) { console.error(e); }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await authFetch(`/api/announcements`);
      const data = await safeJson(res);
      if (data.success) setAnnouncements(data.announcements);
    } catch (e) { console.error(e); }
  };

  const handleOpenSecureFile = (fileKey: string) => {
    try {
      const token = getStudentToken();
      if (!token) throw new Error("No session token found");
      
      const safePath = fileKey.split('/').map(encodeURIComponent).join('/');
      
      // Clean relative path routed directly via Cloudflare Worker route mapping
      const url = `${API_BASE}/api/files/${safePath}?token=${token}`;
      
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not open file securely.' });
    }
  };

  const handleEnrollNewCourse = async () => {
    if (!selectedNewTrack) {
      toast({ variant: 'destructive', title: 'Selection Required', description: 'Please select a program track to enroll.' });
      return;
    }
    
    if (applications.some(app => app.programName === selectedNewTrack)) {
      toast({ variant: 'destructive', title: 'Already Enrolled', description: `You are already enrolled in ${selectedNewTrack}.` });
      return;
    }

    setIsEnrolling(true);
    try {
      const userId = localStorage.getItem('aegis_userId');
      const response = await authFetch(`/api/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          programName: selectedNewTrack,
          details: JSON.stringify({})
        })
      });
      const data = await safeJson(response);
      if (data.success) {
        toast({ title: 'Enrollment Successful', description: `Your application for ${selectedNewTrack} has been submitted.` });
        setIsAddCourseModalOpen(false);
        setSelectedNewTrack('');
        setActiveAppId(data.application.id);
        await syncStudentPipeline();
      } else {
        toast({ variant: 'destructive', title: 'Enrollment Failed', description: data.message });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Network Error', description: 'Failed to reach the enrollment server.' });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactSubject.trim() || !contactMessage.trim()) {
      toast({ variant: 'destructive', title: 'Required Fields', description: 'Subject and message are required.' });
      return;
    }
    setIsSendingMessage(true);
    try {
      let parsedEmail = "student@penjagasiber.com";
      if (activeApp?.details) {
        try {
          const details = JSON.parse(activeApp.details);
          if (details.studentEmail) parsedEmail = details.studentEmail;
        } catch(e) {}
      }

      const response = await authFetch(`/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('aegis_userId'),
          name: internName || 'Student',
          email: parsedEmail,
          subject: contactSubject,
          message: contactMessage
        })
      });
      const data = await safeJson(response);
      
      if (data.success) {
        toast({ title: 'Message Sent', description: 'Your message has been securely forwarded to the admin team.' });
        setContactSubject('');
        setContactMessage('');
        fetchMessageHistory();
        setContactTab('history');
      } else {
        toast({ variant: 'destructive', title: 'Failed to Send', description: data.message });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Network Error', description: 'Failed to send message. Please try again.' });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const activeApp = applications.find(a => a.id === activeAppId) || null;
  const hasNoApplication = !activeApp;

  const isApproved = activeApp?.status === "approved";
  const isRejected = activeApp?.status === "rejected";
  const displayInternId = activeApp?.internId || "Pending";
  const isCertificateUnlocked = Boolean(activeApp?.certificateIssued);

  const handleDownloadOfferLetter = async () => {
    if (!activeApp) return;
    try {
      setIsGeneratingOffer(true);
      await generateOfferLetter({ application: activeApp, internName: internName || "Student", offerFields: deriveOfferFields(activeApp) });
    } catch (e) {
      toast({ variant: 'destructive', title: 'PDF Error', description: 'Could not generate offer letter.' });
    } finally { setIsGeneratingOffer(false); }
  };

  const handleDownloadCertificate = async () => {
    if (!activeApp) return;
    try {
      setIsGeneratingCert(true);
      await generateCertificate({ application: activeApp, internName: internName || "Student", offerFields: deriveOfferFields(activeApp) });
    } catch (e) {
      toast({ variant: 'destructive', title: 'PDF Error', description: 'Could not generate certificate.' });
    } finally { setIsGeneratingCert(false); }
  };

  const handleDownloadLetterOfRecommendation = async () => {
    if (!activeApp) return;
    try {
      setIsGeneratingLOR(true);
      await generateRecommendation({ application: activeApp, internName: internName || "Student", offerFields: deriveOfferFields(activeApp) });
    } catch (e) {
      toast({ variant: 'destructive', title: 'PDF Error', description: 'Could not generate recommendation letter.' });
    } finally { setIsGeneratingLOR(false); }
  };

  const handleRequestPayment = async () => {
    if (!activeApp) return;
    setIsRequestingPayment(true);
    try {
      const res = await authFetch(`/api/applications/${activeApp.id}/request-payment`, { method: 'POST' });
      const data = await safeJson(res);
      if (data.success) {
        toast({ title: data.alreadyRequested ? 'Already requested' : 'Payment requested', description: data.message });
        syncStudentPipeline();
      } else {
        toast({ variant: 'destructive', title: 'Not eligible yet', description: data.message });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Network error' });
    } finally { setIsRequestingPayment(false); }
  };

  const handleUploadPaymentScreenshot = async () => {
    if (!activeApp || !paymentFile) return;
    setIsUploadingPayment(true);
    try {
      const formData = new FormData();
      formData.append('file', paymentFile);
      const res = await authFetch(`/api/applications/${activeApp.id}/payment-screenshot`, { method: 'POST', body: formData });
      const data = await safeJson(res);
      if (data.success) {
        toast({ title: 'Screenshot uploaded', description: 'Awaiting admin verification.' });
        setPaymentFile(null);
        syncStudentPipeline();
      } else {
        toast({ variant: 'destructive', title: 'Upload failed', description: data.message });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Network error' });
    } finally { setIsUploadingPayment(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col justify-between z-10">
        <div>
          <a href="/" className="flex items-center gap-2 mb-8 hover:opacity-80 transition-opacity">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Penjaga Siber</span>
          </a>
          <nav className="space-y-2">
            <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground font-medium">
              <LayoutGrid className="h-5 w-5" /><span>Dashboard</span>
            </a>
            <button onClick={() => { setIsContactModalOpen(true); fetchMessageHistory(); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted/10 transition-colors font-medium text-left">
              <MessageSquare className="h-5 w-5" /><span>Contact Admin</span>
            </button>
          </nav>
        </div>
        <button onClick={() => { logout(); setLocation('/login?logout=true'); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors w-full text-left font-medium mb-2">Logout</button>
      </div>

      <div className="ml-64 p-8 relative">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight">Welcome back, {internName || "Student"}</h1>
              {!hasNoApplication && (
                <p className="text-muted-foreground flex items-center gap-2">
                  Intern ID: <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-primary font-bold border">{displayInternId}</code>
                </p>
              )}
            </div>
          </div>

          {/* Professional Course Selector Tabs */}
          {applications.length > 0 && (
            <div className="flex items-center gap-2 mb-8 bg-muted/30 p-1.5 rounded-2xl border w-fit max-w-full overflow-x-auto scrollbar-hide">
              {applications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setActiveAppId(app.id)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 flex items-center gap-2 ${
                    activeAppId === app.id
                      ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <BookOpen className={`h-4 w-4 ${activeAppId === app.id ? 'text-primary' : 'opacity-70'}`} />
                  {app.programName}
                  <Badge variant={app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'} className="h-5 text-[10px] px-1.5 ml-1">
                    {app.status}
                  </Badge>
                </button>
              ))}
              
              <div className="w-px h-8 bg-border mx-1 shrink-0" />
              
              <button 
                onClick={() => setIsAddCourseModalOpen(true)}
                className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-primary hover:bg-primary/10 flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" /> Enroll New
              </button>
            </div>
          )}

          {/* Dashboard Content */}
          {isLoadingApps ? (
            <Card className="p-12 text-center rounded-2xl border-dashed">
              <Loader2 className="h-10 w-10 mx-auto text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Syncing your secure pipeline...</p>
            </Card>
          ) : hasNoApplication ? (
            <Card className="border border-border bg-card p-12 text-center rounded-2xl shadow-sm">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight mb-2">No Active Enrollments</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">You haven't enrolled in any specialized training tracks yet. Browse our programs to begin your journey.</p>
              <Button onClick={() => setIsAddCourseModalOpen(true)} size="lg" className="glow-blue rounded-xl">
                <PlusCircle className="h-5 w-5 mr-2" /> Explore Programs
              </Button>
            </Card>
          ) : isRejected ? (
            <Card className="border border-destructive/20 bg-destructive/5 p-8 text-center rounded-2xl">
              <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <h3 className="text-xl font-bold tracking-tight text-destructive mb-1">Application Not Approved</h3>
              <p className="text-sm text-muted-foreground">Your application for this track wasn't approved. You may enroll in a different track.</p>
            </Card>
          ) : !isApproved ? (
            <Card className="border border-amber-500/20 bg-amber-500/5 p-8 text-center rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
              <Clock className="h-12 w-12 mx-auto text-amber-500 animate-pulse mb-4" />
              <h3 className="text-xl font-bold tracking-tight text-amber-600 mb-1">Application Pending Review</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Your application for <strong>{activeApp.programName}</strong> has been received securely. Your training track resources will unlock here as soon as an admin approves your placement.
              </p>
            </Card>
          ) : (
            <>
              {progress.assigned > 0 && progress.approved === progress.assigned && !isCertificateUnlocked && (() => {
                const isVerified = Boolean(activeApp?.payment_verified);
                const isRejectedPayment = Boolean(activeApp?.payment_rejected);
                const isUploaded = Boolean(activeApp?.payment_uploaded);
                const isRequested = Boolean(activeApp?.payment_requested);
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
                    <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
                      <CardTitle className="text-xl flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Certificate Issuance</CardTitle>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusConfig.className}`}>{statusConfig.label}</span>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!isVerified && (
                        <>
                          {!isRequested ? (
                            <div className="p-5 rounded-xl bg-muted/40 border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                              <div className="space-y-1.5">
                                <p className="font-semibold text-foreground">Outstanding Achievement!</p>
                                <p className="text-sm text-muted-foreground">You have successfully completed all assigned tasks for <strong>{activeApp.programName}</strong>. Request payment instructions to generate your verified credentials.</p>
                              </div>
                              <Button className="w-full sm:w-auto glow-blue rounded-xl" disabled={isRequestingPayment} onClick={handleRequestPayment}>
                                {isRequestingPayment ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CreditCard className="h-4 w-4 mr-2" />} Request Instructions
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {isRejectedPayment && (
                                <div className="flex items-start gap-2 p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-sm text-destructive">
                                  <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                  <span>The admin could not verify your previous upload. Please ensure your transaction ID and amount are clearly visible in the new screenshot.</span>
                                </div>
                              )}
                              {isUploaded && !isRejectedPayment ? (
                                <div className="flex items-center gap-2 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-sm text-amber-700">
                                  <Clock className="h-4 w-4 shrink-0" />
                                  <span>Your proof of payment is securely uploaded. Please allow up to 24 hours for administrative review and certificate generation.</span>
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
                                className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                                  isDraggingPayment ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-border hover:border-primary/50 hover:bg-muted/30'
                                }`}
                              >
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-1 ${isDraggingPayment ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                  <UploadCloud className="h-6 w-6" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-foreground">Click to browse or drag & drop</p>
                                  <p className="text-xs text-muted-foreground mt-1">Supported formats: PNG, JPG, JPEG, or PDF</p>
                                </div>
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
                                <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-primary/20 bg-primary/5">
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="h-10 w-10 rounded-lg bg-background shadow-sm border flex items-center justify-center shrink-0">
                                      {isPdf ? <FileText className="h-5 w-5 text-primary" /> : <ImageIcon className="h-5 w-5 text-primary" />}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-semibold text-foreground truncate">{paymentFile.name}</p>
                                      <p className="text-xs text-muted-foreground">{formatFileSize(paymentFile.size)}</p>
                                    </div>
                                  </div>
                                  <button type="button" onClick={() => setPaymentFile(null)} disabled={isUploadingPayment} className="text-muted-foreground hover:text-destructive transition-colors shrink-0 p-2">
                                    <XCircle className="h-5 w-5" />
                                  </button>
                                </div>
                              )}

                              <div className="flex justify-end pt-2">
                                <Button className="w-full sm:w-auto glow-blue rounded-xl" disabled={!paymentFile || isUploadingPayment} onClick={handleUploadPaymentScreenshot}>
                                  {isUploadingPayment ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading to Secure Vault...</> : <>{isRejectedPayment ? <RefreshCw className="h-4 w-4 mr-2" /> : <UploadCloud className="h-4 w-4 mr-2" />} {isRejectedPayment ? 'Submit New Screenshot' : 'Confirm & Upload Screenshot'}</>}
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {isVerified && (
                        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-sm text-emerald-700 font-medium">
                          <CheckCircle className="h-5 w-5 shrink-0" />
                          <span>Payment verified. Your secure cryptographic credentials are now ready for download below.</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Analytics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="rounded-2xl border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Assigned Tasks</p>
                      <BookOpen className="h-4 w-4 text-muted-foreground/50" />
                    </div>
                    <p className="text-4xl font-bold tracking-tight">{progress.assigned}</p>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Approved Validations</p>
                      <CheckCircle className="h-4 w-4 text-emerald-500/70" />
                    </div>
                    <p className="text-4xl font-bold tracking-tight text-primary">{progress.approved}</p>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl border-none shadow-sm bg-card hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Track Completion</p>
                    <div className="flex items-end gap-2 mb-3">
                      <p className="text-4xl font-bold tracking-tight">{progress.completionPercent}</p>
                      <span className="text-muted-foreground font-medium pb-1">%</span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${progress.completionPercent}%` }} 
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-primary rounded-full relative"
                      >
                        <div className="absolute inset-0 bg-white/20 w-full" style={{ animation: 'shimmer 2s infinite' }} />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tasks and Announcements */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg"><Calendar className="h-5 w-5 text-primary" /> Active Assignments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {assignedTasks.length === 0 ? (
                      <div className="text-center py-6 border border-dashed rounded-xl bg-muted/10">
                        <p className="text-sm text-muted-foreground">No tasks assigned for this track yet.</p>
                      </div>
                    ) : assignedTasks.map((task) => {
                      const hasSubmitted = mySubmissions.find(s => s.task_id === task.title);
                      const isOverdue = task.due_date && !hasSubmitted && new Date(task.due_date) < new Date(new Date().toDateString());
                      return (
                        <details key={task.id} className="group border rounded-xl p-4 hover:border-primary/50 transition-all bg-card data-[open]:shadow-md">
                          <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                            <div>
                              <span className="text-foreground tracking-tight">{task.title}</span>
                              {task.due_date && (
                                <span className={`block text-[11px] font-medium mt-1 flex items-center gap-1.5 ${isOverdue ? 'text-destructive' : 'text-muted-foreground'}`}>
                                  <Calendar className="h-3 w-3" /> Due {new Date(task.due_date).toLocaleDateString()}{isOverdue ? ' (Overdue)' : ''}
                                </span>
                              )}
                            </div>
                            {hasSubmitted ? <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 rounded-full">Submitted</Badge> : <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center group-data-[open]:rotate-180 transition-transform"><PlusCircle className="h-4 w-4 text-muted-foreground" /></div>}
                          </summary>
                          <div className="mt-4 pt-4 border-t space-y-4">
                            <button 
                              type="button" 
                              onClick={() => handleOpenSecureFile(task.file_key)} 
                              className="w-full p-3 rounded-lg border bg-muted/30 text-primary text-sm font-medium flex items-center gap-2 hover:bg-muted/60 transition-colors text-left"
                            >
                              <ExternalLink className="h-4 w-4 shrink-0" /> Open Architecture / Requirements Document
                            </button>
                            <Button 
                              className="w-full rounded-xl" 
                              disabled={!!hasSubmitted}
                              onClick={() => { setSelectedTaskId(task.title); setIsSubmitModalOpen(true); }}
                            >
                              {hasSubmitted ? "Assignment under Review" : "Submit Final Build"}
                            </Button>
                          </div>
                        </details>
                      );
                    })}
                  </CardContent>
                </Card>
                
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg"><Megaphone className="h-5 w-5 text-primary" /> Security Bulletins</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {announcements.length === 0 ? (
                      <div className="text-center py-6 border border-dashed rounded-xl bg-muted/10">
                        <p className="text-sm text-muted-foreground">All systems nominal. No active broadcasts.</p>
                      </div>
                    ) : announcements.map((a: any) => (
                      <div key={a.id} className="p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
                        <p className="font-semibold text-foreground">{a.title}</p>
                        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{a.body}</p>
                        <p className="text-[11px] font-mono text-muted-foreground mt-3 uppercase tracking-wider">{new Date(a.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Placement Package Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 rounded-2xl border-none shadow-sm bg-card overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-700" />
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center gap-2 tracking-tight"><Award className="h-5 w-5 text-primary" /> Verification Package</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-5 rounded-xl bg-muted/30 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group/item hover:border-primary/30 transition-colors">
                      <div className="space-y-1">
                        <p className="font-semibold text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Digital Appointment Letter</p>
                        <p className="text-xs text-muted-foreground">Official onboarding documentation</p>
                      </div>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto rounded-lg hover:bg-primary hover:text-primary-foreground transition-all" disabled={isGeneratingOffer} onClick={handleDownloadOfferLetter}>
                        {isGeneratingOffer ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Download className="mr-2 h-4 w-4" /> Download PDF</>}
                      </Button>
                    </div>
                    
                    <div className="p-5 rounded-xl bg-muted/30 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group/item hover:border-primary/30 transition-colors">
                      <div className="space-y-1">
                        <p className="font-semibold text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Secure Identity Token</p>
                        <p className="text-xs text-muted-foreground">Authorization ID: <code className="bg-background px-1.5 py-0.5 rounded text-primary border font-bold font-mono text-[11px] ml-1">{displayInternId}</code></p>
                      </div>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto rounded-lg" onClick={() => { navigator.clipboard.writeText(displayInternId); toast({ title: "Token Copied", description: "Identity token copied to clipboard." }); }}>
                        Copy Token
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className={`rounded-2xl shadow-sm flex flex-col justify-between transition-all duration-500 overflow-hidden relative ${isCertificateUnlocked ? 'border-primary/50 bg-card' : 'border-border bg-muted/10'}`}>
                  {isCertificateUnlocked && <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-bold flex items-center gap-2 tracking-tight">
                      <CheckCircle className={`h-5 w-5 ${isCertificateUnlocked ? 'text-primary drop-shadow-sm' : 'text-muted-foreground/50'}`} /> 
                      Credential Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-6 flex-1 flex flex-col justify-end">
                    {isCertificateUnlocked ? (
                      <div className="space-y-3">
                        <div className="text-center py-6 mb-4">
                          <Award className="h-12 w-12 mx-auto text-primary mb-3 drop-shadow-md" />
                          <p className="text-sm font-bold text-foreground tracking-tight">Credentials Unlocked</p>
                          <p className="text-xs text-muted-foreground mt-1">Verified on edge network</p>
                        </div>
                        <Button className="w-full rounded-xl glow-blue font-medium" disabled={isGeneratingCert} onClick={handleDownloadCertificate}>
                          {isGeneratingCert ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Securing...</> : <><Download className="mr-2 h-4 w-4" /> Certificate</>}
                        </Button>
                        <Button variant="outline" className="w-full rounded-xl border-dashed hover:border-solid font-medium" disabled={isGeneratingLOR} onClick={handleDownloadLetterOfRecommendation}>
                          {isGeneratingLOR ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><FileText className="mr-2 h-4 w-4" /> Download LOR</>}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center py-8">
                          <Lock className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                          <p className="text-sm font-semibold text-muted-foreground">Credentials Locked</p>
                          <p className="text-xs text-muted-foreground/70 mt-1 max-w-[200px] mx-auto">Complete all active assignments to decrypt.</p>
                        </div>
                        <Button disabled variant="outline" className="w-full rounded-xl border-dashed opacity-50">Unavailable</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </motion.div>
      </div>
      
      {activeApp && (
        <SubmitTaskModal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} applicationId={activeApp.id} taskId={selectedTaskId} onSubmitted={() => { setIsSubmitModalOpen(false); fetchMySubmissions(activeApp.id); fetchProgress(activeApp.id); }} />
      )}

      {/* New Course Enrollment Modal */}
      <AnimatePresence>
        {isAddCourseModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} 
              className="w-full max-w-md bg-card border shadow-2xl rounded-2xl p-6 relative overflow-hidden"
            >
              <button onClick={() => setIsAddCourseModalOpen(false)} disabled={isEnrolling} className="absolute right-4 top-4 text-muted-foreground hover:bg-muted p-1.5 rounded-full"><X className="h-4 w-4" /></button>
              <div className="mb-6 pr-8">
                <h3 className="text-xl font-bold flex items-center gap-2"><PlusCircle className="h-5 w-5 text-primary" /> Enroll in New Track</h3>
                <p className="text-sm text-muted-foreground mt-1.5">You can instantly expand your expertise by enrolling in an additional specialized track.</p>
              </div>
              <div className="space-y-5">
                <select className="flex h-11 w-full rounded-xl border bg-background px-3 py-2 text-sm shadow-sm" value={selectedNewTrack} onChange={(e) => setSelectedNewTrack(e.target.value)} disabled={isEnrolling}>
                  <option value="" disabled>Choose a specialization...</option>
                  {PROGRAM_TRACKS.map(track => {
                    const isAlreadyEnrolled = applications.some(a => a.programName === track);
                    return <option key={track} value={track} disabled={isAlreadyEnrolled}>{track} {isAlreadyEnrolled ? '(Already Enrolled)' : ''}</option>;
                  })}
                </select>
                <Button className="w-full glow-blue rounded-xl" onClick={handleEnrollNewCourse} disabled={!selectedNewTrack || isEnrolling}>
                  {isEnrolling ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</> : 'Confirm Enrollment'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Admin Modal */}
      <AnimatePresence>
        {isContactModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} 
              className="w-full max-w-2xl bg-card border shadow-2xl rounded-2xl p-6 relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
              <button onClick={() => setIsContactModalOpen(false)} className="absolute right-4 top-4 text-muted-foreground hover:bg-muted p-1.5 rounded-full"><X className="h-4 w-4" /></button>
              
              <div className="mb-4 pr-8">
                <h3 className="text-xl font-bold flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> Contact Support</h3>
              </div>

              <div className="flex gap-6 border-b mb-6 shrink-0">
                <button 
                  onClick={() => setContactTab('compose')} 
                  className={`pb-3 text-sm font-semibold transition-colors ${contactTab === 'compose' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >Compose Message</button>
                <button 
                  onClick={() => setContactTab('history')} 
                  className={`pb-3 text-sm font-semibold transition-colors ${contactTab === 'history' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >Message History</button>
              </div>

              <div className="overflow-y-auto pr-2 scrollbar-hide">
                {contactTab === 'compose' ? (
                  <form onSubmit={handleSendMessage} className="space-y-5 pb-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Subject</label>
                      <input 
                        type="text"
                        className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="What is this regarding?"
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        disabled={isSendingMessage}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Message</label>
                      <textarea 
                        className="flex min-h-[140px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        placeholder="Describe your issue or question..."
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        disabled={isSendingMessage}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full glow-blue rounded-xl" disabled={!contactSubject.trim() || !contactMessage.trim() || isSendingMessage}>
                      {isSendingMessage ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending securely...</> : <><Send className="h-4 w-4 mr-2" /> Send Message</>}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4 pb-2">
                    {messageHistory.length === 0 ? (
                      <div className="text-center py-10 bg-muted/10 rounded-xl border border-dashed">
                        <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground font-medium">You haven't sent any messages yet.</p>
                      </div>
                    ) : (
                      messageHistory.map(msg => (
                        <div key={msg.id} className="p-5 border rounded-2xl bg-card shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                            <p className="font-bold text-foreground tracking-tight">{msg.subject}</p>
                            <p className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded-md w-fit shrink-0">{new Date(msg.created_at).toLocaleString()}</p>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{msg.message}</p>
                          
                          {msg.reply ? (
                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl relative">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl"></div>
                              <p className="text-xs font-bold text-primary mb-1.5 uppercase tracking-wider flex items-center gap-1.5"><Shield className="h-3 w-3" /> Admin Reply</p>
                              <p className="text-sm text-foreground leading-relaxed">{msg.reply}</p>
                            </div>
                          ) : (
                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20"><Clock className="h-3 w-3 mr-1" /> Awaiting Admin Review</Badge>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}