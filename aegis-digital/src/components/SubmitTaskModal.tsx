import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubmitTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId?: string;
  taskId: string | null;
  onSubmitted: () => void;
}

const ALLOWED_EXT = ['pdf', 'docx', 'zip'];

export default function SubmitTaskModal({ isOpen, onClose, applicationId, taskId, onSubmitted }: SubmitTaskModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    if (selected) {
      const ext = selected.name.split('.').pop()?.toLowerCase() || '';
      if (!ALLOWED_EXT.includes(ext)) {
        toast({ variant: 'destructive', title: 'Unsupported file type', description: 'Only PDF, DOCX, or ZIP files are accepted.' });
        e.target.value = '';
        return;
      }
    }
    setFile(selected);
  };

  const handleSubmit = async () => {
    if (!applicationId || !taskId || !file) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('applicationId', applicationId);
      formData.append('taskId', taskId);
      formData.append('notes', notes);

      const response = await fetch('https://aegis-api.rafiuraza474.workers.dev/api/submissions', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        toast({ title: 'Submitted', description: 'Your task submission has been uploaded for review.' });
        setFile(null);
        setNotes('');
        onSubmitted();
      } else {
        toast({ variant: 'destructive', title: 'Submission failed', description: data.message || 'Please try again.' });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Upload failed', description: 'Could not reach the server.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Deliverable File (PDF, DOCX, or ZIP)</label>
            <Input type="file" accept=".pdf,.docx,.zip" onChange={handleFileChange} disabled={isSubmitting} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Notes (optional)</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything the reviewer should know" disabled={isSubmitting} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSubmit} disabled={!file || isSubmitting} className="flex-1">
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Uploading...</> : <><Upload className="h-4 w-4 mr-1.5" /> Submit</>}
            </Button>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}