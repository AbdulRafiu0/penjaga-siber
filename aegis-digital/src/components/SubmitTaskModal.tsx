import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function SubmitTaskModal({ isOpen, onClose, applicationId, taskId, onSubmitted }: any) {
  const [repoUrl, setRepoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!repoUrl.trim()) {
      toast({ variant: 'destructive', title: "Missing Link", description: "Please provide a submission link." });
      return;
    }

    setLoading(true);
    try {
      // These keys match your index.js validation:
      // if (!applicationId || !taskId || !repoUrl)
      const payload = {
        applicationId: applicationId,
        taskId: taskId,
        repoUrl: repoUrl,
        notes: notes
      };

      const res = await fetch(`https://aegis-api.rafiuraza474.workers.dev/api/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();

      if (res.ok) {
        toast({ title: "Submitted", description: "Your artifact has been sent for review." });
        onSubmitted(); 
      } else {
        console.error("Backend rejection:", data);
        throw new Error(data.message || "Server rejected submission");
      }
    } catch (e: any) {
      console.error("DEBUG ERROR:", e);
      toast({ 
        variant: 'destructive', 
        title: "Submission Failed", 
        description: e.message || "Check browser console for details." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Submit Project Artifact</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <Input 
            placeholder="Google Drive / GitHub Link" 
            value={repoUrl} 
            onChange={e => setRepoUrl(e.target.value)} 
          />
          <Textarea 
            placeholder="Optional notes for the admin..." 
            value={notes} 
            onChange={e => setNotes(e.target.value)} 
          />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Submitting...' : 'Confirm Submission'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}