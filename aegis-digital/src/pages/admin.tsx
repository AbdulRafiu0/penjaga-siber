import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, FileText, Clock, Award, Trash2, Edit3, X, Save, CheckCircle, XCircle, Mail, Loader2, Lock, FileCheck, User, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface DBApplication {
  id: string; programName: string; status: string; createdAt: string; studentName: string; studentEmail: string; details: string; internId?: string; certificateIssued?: boolean;
}

export default function Admin() {
  const allowedAdmins = [
    { username: 'admin', password: 'admin' },
    { username: 'rafiu', password: 'admin' }
  ];

  const [activeTab, setActiveTab] = useState('overview');
  const [dbApplications, setDbApplications] = useState<DBApplication[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(true);
  
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loggedInAdmin, setLoggedInAdmin] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');

  const [editingApp, setEditingApp] = useState<DBApplication | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentEmail, setEditStudentEmail] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editProgramName, setEditProgramName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCountry, setEditCountry] = useState('');

  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [taskName, setTaskName] = useState('');
  const [driveLink, setDriveLink] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    const sessionAuth = sessionStorage.getItem('aegis_admin_session');
    const adminName = sessionStorage.getItem('aegis_admin_user');
    if (sessionAuth === 'true') {
      setIsAdminLoggedIn(true);
      setLoggedInAdmin(adminName || 'Administrator');
      fetchApplications();
      fetchSubmissions();
      fetchMessages();
    }
  }, []);

  const confirmAssignTask = async () => {
    if (!assigningId || !taskName.trim() || !driveLink.trim()) return;
    try {
      const response = await fetch('https://aegis-api.rafiuraza474.workers.dev/api/admin/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: assigningId, title: taskName.trim(), driveLink: driveLink.trim() }),
      });
      if (response.ok) {
        toast({ title: "Success", description: "Task assigned successfully." });
        setAssigningId(null); setTaskName(''); setDriveLink('');
      } else { toast({ variant: 'destructive', title: "Failed to assign task." }); }
    } catch (e) { toast({ variant: 'destructive', title: "Network error." }); }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!window.confirm("Delete this message permanently?")) return;
    try {
      const response = await fetch(`https://aegis-api.rafiuraza474.workers.dev/api/admin/messages/${msgId}`, { method: 'DELETE' });
      if (response.ok) {
        setMessages(prev => prev.filter(m => m.id !== msgId));
        toast({ title: "Message Deleted", description: "The message has been purged." });
      } else { toast({ variant: 'destructive', title: "Error", description: "Failed to delete message." }); }
    } catch (e) { toast({ variant: 'destructive', title: "Network error." }); }
  };

  const handleAdminLogin = (e: React.FormEvent) => { e.preventDefault(); const matches = allowedAdmins.find(acc => acc.username === inputUsername && acc.password === inputPassword); if (matches) { sessionStorage.setItem('aegis_admin_session', 'true'); sessionStorage.setItem('aegis_admin_user', inputUsername); setIsAdminLoggedIn(true); setLoggedInAdmin(inputUsername); fetchApplications(); fetchSubmissions(); fetchMessages(); toast({ title: "Access Granted", description: `Welcome back, ${inputUsername}!` }); } else { toast({ variant: 'destructive', title: "Authentication Failed", description: "Invalid admin credentials." }); } };
  const fetchApplications = async () => { setIsLoadingApps(true); try { const response = await fetch('https://aegis-api.rafiuraza474.workers.dev/api/applications'); const data = await response.json(); if (data.success) setDbApplications(data.applications); } catch (error: any) { toast({ variant: 'destructive', title: 'Fetch Error', description: 'Could not sync records.' }); } finally { setIsLoadingApps(false); } };
  const fetchSubmissions = async () => { try { const response = await fetch('https://aegis-api.rafiuraza474.workers.dev/api/admin/submissions'); const data = await response.json(); if (data.success) setSubmissions(data.submissions); } catch (error: any) { toast({ variant: 'destructive', title: 'Fetch Error', description: 'Could not sync submissions.' }); } };
  const fetchMessages = async () => { try { const response = await fetch('https://aegis-api.rafiuraza474.workers.dev/api/admin/messages'); const data = await response.json(); if (data.success) setMessages(data.messages); } catch (error: any) { toast({ variant: 'destructive', title: 'Fetch Error', description: 'Could not sync messages.' }); } };
  const handleUpdateStatus = async (appId: string, newStatus: string) => { try { const response = await fetch(`https://aegis-api.rafiuraza474.workers.dev/api/applications/${appId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus.toLowerCase() }), }); if (response.ok) { setDbApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus.toLowerCase() } : app)); toast({ title: `Status Updated`, description: `Application successfully ${newStatus.toLowerCase()}.` }); } } catch (e) { toast({ variant: 'destructive', title: 'Error', description: 'Failed to rewrite state.' }); } };
  const handleIssueCertificate = async (appId: string) => { if (!window.confirm("Issue certificate for this student?")) return; try { const response = await fetch(`https://aegis-api.rafiuraza474.workers.dev/api/applications/${appId}/issue-certificate`, { method: 'PUT' }); if (response.ok) { setDbApplications(prev => prev.map(app => app.id === appId ? { ...app, certificateIssued: true } : app)); toast({ title: "Certificate Issued", description: "The student has been marked as certified." }); } } catch (e) { toast({ variant: 'destructive', title: "Error", description: "Failed to issue certificate." }); } };
  const handleUpdateSubmissionStatus = async (subId: string, newStatus: string) => { try { const response = await fetch(`https://aegis-api.rafiuraza474.workers.dev/api/admin/submissions/${subId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus.toLowerCase(), feedback: "" }), }); if (response.ok) { setSubmissions(prev => prev.map(sub => sub.id === subId ? { ...sub, status: newStatus.toLowerCase() } : sub)); toast({ title: 'Status Updated', description: `Submission successfully marked as ${newStatus.toLowerCase()}.` }); } } catch (e) { toast({ variant: 'destructive', title: 'Error', description: 'Failed to update submission status.' }); } };
  const handleDeleteSubmission = async (subId: string) => { if (!window.confirm("Delete this submission permanently?")) return; try { const response = await fetch(`https://aegis-api.rafiuraza474.workers.dev/api/admin/submissions/${subId}`, { method: 'DELETE' }); if (response.ok) { setSubmissions(prev => prev.filter(s => s.id !== subId)); toast({ title: "Submission Deleted", description: "The assignment review row was purged." }); } } catch (e) { toast({ variant: 'destructive', title: 'Error', description: "Could not delete submission." }); } };
  const handleDeleteApplication = async (appId: string) => { if (!window.confirm("Are you absolutely sure you want to remove this student application from the system? This action is permanent.")) return; try { const response = await fetch(`https://aegis-api.rafiuraza474.workers.dev/api/applications/${appId}`, { method: 'DELETE', }); const data = await response.json(); if (data.success) { setDbApplications(prev => prev.filter(app => app.id !== appId)); toast({ title: "Student Removed", description: "The record has been permanently deleted from the database." }); } } catch (err) { toast({ variant: 'destructive', title: "Deletion Failed", description: "Could not purge database row." }); } };
  const startEditing = (app: DBApplication) => { setEditingApp(app); setEditStudentName(app.studentName || ''); setEditStudentEmail(app.studentEmail || ''); setEditNewPassword(''); setEditProgramName(app.programName); try { const parsed = JSON.parse(app.details); setEditPhone(parsed.phone || ''); setEditCountry(parsed.country || ''); } catch (e) { setEditPhone(''); setEditCountry(''); } };
  const handleSaveEdits = async (e: React.FormEvent) => { e.preventDefault(); if (!editingApp) return; try { let currentDetails: any = {}; try { currentDetails = JSON.parse(editingApp.details); } catch(e) {} const updatedDetails = JSON.stringify({ ...currentDetails, phone: editPhone, country: editCountry, studentEmail: editStudentEmail }); const response = await fetch(`https://aegis-api.rafiuraza474.workers.dev/api/applications/${editingApp.id}/edit`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentName: editStudentName, studentEmail: editStudentEmail, programName: editProgramName, details: updatedDetails }) }); const data = await response.json(); if (!data.success) { throw new Error(data.error || "Failed to update text records."); } if (editNewPassword.trim() !== '') { const passResponse = await fetch(`https://aegis-api.rafiuraza474.workers.dev/api/applications/${editingApp.id}/reset-password`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newPassword: editNewPassword }) }); const passData = await passResponse.json(); if (!passData.success) { throw new Error(passData.error || "Profile updated but password change failed."); } } setDbApplications(prev => prev.map(app => app.id === editingApp.id ? { ...app, studentName: editStudentName, studentEmail: editStudentEmail, programName: editProgramName, details: updatedDetails } : app)); setEditingApp(null); toast({ title: "Changes Saved", description: "Student dossier metrics and credentials updated successfully." }); } catch (err: any) { toast({ variant: 'destructive', title: "Update Error", description: err.message || "Failed to push modifications." }); } };

  if (!isAdminLoggedIn) { return ( <div className="min-h-screen flex items-center justify-center bg-background px-4"> <Card className="w-full max-w-md shadow-lg border border-border"> <CardHeader className="text-center"> <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2"><Lock className="h-6 w-6 text-primary" /></div> <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2"><Shield className="h-5 w-5 text-primary" /> Penjaga Siber Command Gate</CardTitle> </CardHeader> <CardContent> <form onSubmit={handleAdminLogin} className="space-y-4"> <Input type="text" placeholder="Admin Username" value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} required /> <Input type="password" placeholder="Master Password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} required /> <Button type="submit" className="w-full font-medium">Verify Credentials</Button> </form> </CardContent> </Card> </div> ); }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8"><Shield className="h-8 w-8 text-primary" /><span className="text-xl font-bold">Admin Panel</span></div>
          <nav className="space-y-2">
            {['overview', 'applications', 'submissions', 'messages'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left capitalize font-medium ${activeTab === tab ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent'}`}>
                {tab === 'submissions' ? 'Assignment Reviews' : tab}
              </button>
            ))}
          </nav>
        </div>
        <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                <User className="h-8 w-8 text-primary bg-primary/10 p-1.5 rounded-full" />
                <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Logged In</p>
                    <p className="text-sm font-semibold">{loggedInAdmin}</p>
                </div>
            </div>
            <Button size="sm" variant="outline" className="w-full text-destructive border-destructive/20" onClick={() => { sessionStorage.clear(); window.location.reload(); }}>Terminate Session</Button>
        </div>
      </div>

      <div className="ml-64 p-8">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
        {activeTab === 'overview' && ( <div className="grid grid-cols-1 md:grid-cols-3 gap-6"> <Card><CardContent className="p-6"><Users className="h-8 w-8 text-primary mb-2" /><p className="text-sm text-muted-foreground">Total Applicants</p><p className="text-3xl font-bold">{dbApplications.length}</p></CardContent></Card> <Card><CardContent className="p-6"><Clock className="h-8 w-8 text-amber-500 mb-2" /><p className="text-sm text-muted-foreground">Pending Action</p><p className="text-3xl font-bold">{dbApplications.filter(a => a.status === 'pending').length}</p></CardContent></Card> <Card><CardContent className="p-6"><Award className="h-8 w-8 text-emerald-500 mb-2" /><p className="text-sm text-muted-foreground">Approved Interns</p><p className="text-3xl font-bold">{dbApplications.filter(a => a.status === 'approved').length}</p></CardContent></Card> </div> )}
        {activeTab === 'applications' && ( <Card> <CardHeader><CardTitle>Application Management Pipeline</CardTitle></CardHeader> <CardContent> {isLoadingApps ? ( <div className="flex items-center justify-center py-12 gap-2"><Loader2 className="h-6 w-6 animate-spin" /> Querying Edge database...</div> ) : ( <Table> <TableHeader> <TableRow> <TableHead>Student Details</TableHead> <TableHead>Intern ID</TableHead> <TableHead>Task Assignment</TableHead> <TableHead>Program Track</TableHead> <TableHead>Status</TableHead> <TableHead className="text-right">Actions</TableHead> </TableRow> </TableHeader> <TableBody> {dbApplications.map((app) => ( <TableRow key={app.id}> <TableCell> <div> <span className="font-semibold block text-foreground">{app.studentName}</span> <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Mail className="h-3 w-3" /> {app.studentEmail}</span> </div> </TableCell> <TableCell><code className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded">{app.internId || '—'}</code></TableCell> <TableCell>
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setAssigningId(app.id)}><Plus className="h-3 w-3 mr-1" /> Assign Task</Button>
            </TableCell> <TableCell className="text-sm font-medium text-primary">{app.programName}</TableCell> <TableCell><Badge variant={app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}>{app.status}</Badge></TableCell> <TableCell className="text-right"> <div className="flex justify-end gap-1.5 items-center"> {app.status === 'pending' && ( <> <Button size="sm" variant="outline" className="h-8 text-emerald-600 hover:text-emerald-700" onClick={() => handleUpdateStatus(app.id, 'Approved')}>Approve</Button> <Button size="sm" variant="outline" className="h-8 text-destructive" onClick={() => handleUpdateStatus(app.id, 'Rejected')}>Reject</Button> </> )} {app.status === 'approved' && ( app.certificateIssued ? ( <Badge variant="secondary" className="h-8 bg-emerald-100 text-emerald-700 border-emerald-200"><CheckCircle className="h-3 w-3 mr-1" /> Issued</Badge> ) : ( <Button size="sm" variant="outline" className="h-8 text-indigo-600 border-indigo-200 hover:bg-indigo-50" onClick={() => handleIssueCertificate(app.id)}><FileCheck className="h-3 w-3 mr-1" /> Issue Cert</Button> ) )} <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500" onClick={() => startEditing(app)}><Edit3 className="h-4 w-4" /></Button> <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteApplication(app.id)}><Trash2 className="h-4 w-4" /></Button> </div> </TableCell> </TableRow> ))} </TableBody> </Table> )} </CardContent> </Card> )}
        {activeTab === 'submissions' && ( <Card> <CardHeader><CardTitle>Assignment Reviews</CardTitle></CardHeader> <CardContent> <div className="grid gap-4"> {submissions.length === 0 ? ( <p className="text-muted-foreground italic">No student submissions found.</p> ) : ( submissions.map((sub: any) => ( <div key={sub.id} className="flex justify-between items-center p-4 border rounded-lg bg-card"> <div> <p className="font-bold text-foreground">{sub.studentName}</p> <p className="text-sm text-muted-foreground">{sub.programName} | Status: <span className="font-semibold">{sub.status}</span></p> <a href={sub.repo_url} target="_blank" rel="noopener noreferrer" className="text-primary text-sm flex items-center gap-1 hover:underline mt-1"> <FileCheck className="h-3 w-3" /> View Google Drive Artifact </a> </div> <div className="flex gap-2"> {sub.status === 'pending' && ( <> <Button size="sm" variant="outline" className="text-emerald-600 hover:text-emerald-700" onClick={() => handleUpdateSubmissionStatus(sub.id, 'approved')}>Approve</Button> <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive" onClick={() => handleUpdateSubmissionStatus(sub.id, 'rejected')}>Reject</Button> </> )} <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSubmission(sub.id)}><Trash2 className="h-4 w-4" /></Button> </div> </div> )) )} </div> </CardContent> </Card> )}
        {activeTab === 'messages' && (
          <Card>
            <CardHeader><CardTitle>Message Inbox</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {messages.length === 0 ? (
                <p className="text-muted-foreground italic">No messages received.</p>
              ) : (
                messages.map((msg: any) => (
                  <div key={msg.id} className="p-4 border rounded-lg bg-card flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-lg">{msg.subject}</p>
                          <p className="text-sm text-primary font-medium">{msg.name} &lt;{msg.email}&gt;</p>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-nowrap ml-4">{new Date(msg.created_at).toLocaleString()}</p>
                      </div>
                      <p className="mt-3 text-sm text-foreground">{msg.message}</p>
                    </div>
                    <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10 shrink-0" onClick={() => handleDeleteMessage(msg.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
      
      <AnimatePresence> {editingApp && ( <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"> <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-card border shadow-xl rounded-xl p-6 relative"> <button className="absolute right-4 top-4 text-muted-foreground hover:text-foreground" onClick={() => setEditingApp(null)}><X className="h-5 w-5" /></button> <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><Edit3 className="h-5 w-5 text-primary" /> Modify Student Dossier</h3> <form onSubmit={handleSaveEdits} className="space-y-4"> <div className="space-y-1"> <label className="text-xs font-semibold text-muted-foreground uppercase">Student Full Name</label> <Input value={editStudentName} onChange={(e) => setEditStudentName(e.target.value)} required /> </div> <div className="space-y-1"> <label className="text-xs font-semibold text-muted-foreground uppercase">Email Address</label> <Input type="email" value={editStudentEmail} onChange={(e) => setEditStudentEmail(e.target.value)} required /> </div> <div className="space-y-1"> <label className="text-xs font-semibold text-amber-500 uppercase">Force Change Password (Leave blank to preserve)</label> <Input type="text" placeholder="Type new authentication passphrase" value={editNewPassword} onChange={(e) => setEditNewPassword(e.target.value)} /> </div> <div className="space-y-1"> <label className="text-xs font-semibold text-muted-foreground uppercase">Program Track Name</label> <Input value={editProgramName} onChange={(e) => setEditProgramName(e.target.value)} required /> </div> <div className="space-y-1"> <label className="text-xs font-semibold text-muted-foreground uppercase">Phone Number</label> <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} required /> </div> <div className="space-y-1"> <label className="text-xs font-semibold text-muted-foreground uppercase">Country Region</label> <Input value={editCountry} onChange={(e) => setEditCountry(e.target.value)} required /> </div> <div className="flex gap-2 pt-2"> <Button type="submit" className="w-full"><Save className="h-4 w-4 mr-1.5" /> Save Overwrites</Button> <Button type="button" variant="outline" onClick={() => setEditingApp(null)}>Cancel</Button> </div> </form> </motion.div> </div> )} </AnimatePresence>
      
      {assigningId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <Card className="w-full max-w-sm p-6 shadow-2xl">
            <h3 className="font-bold text-lg mb-4">Assign Task Details</h3>
            <div className="space-y-4">
              <Input value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="Task No & Name" />
              <Input value={driveLink} onChange={(e) => setDriveLink(e.target.value)} placeholder="Google Drive Link" />
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={confirmAssignTask} className="flex-1">Assign Task</Button>
              <Button variant="outline" onClick={() => setAssigningId(null)}>Cancel</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}