import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Trash2, Edit3, Plus, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API = 'https://aegis-api.rafiuraza474.workers.dev';

interface Announcement { id: string; title: string; body: string; created_at: string; }

export default function AdminAnnouncements() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const { toast } = useToast();

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/api/announcements`);
      const data = await res.json();
      if (data.success) setItems(data.announcements);
    } catch {
      toast({ variant: 'destructive', title: 'Fetch error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newBody.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch(`${API}/api/admin/announcements`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), body: newBody.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Announcement posted' });
        setNewTitle(''); setNewBody('');
        load();
      } else {
        toast({ variant: 'destructive', title: 'Failed to post', description: data.message });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const startEdit = (a: Announcement) => { setEditingId(a.id); setEditTitle(a.title); setEditBody(a.body); };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    try {
      const res = await fetch(`${API}/api/admin/announcements/${editingId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim(), body: editBody.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: 'Updated' });
        setEditingId(null);
        load();
      } else {
        toast({ variant: 'destructive', title: 'Update failed', description: data.message });
      }
    } catch {
      toast({ variant: 'destructive', title: 'Network error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const res = await fetch(`${API}/api/admin/announcements/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) { setItems(prev => prev.filter(a => a.id !== id)); toast({ title: 'Deleted' }); }
    } catch {
      toast({ variant: 'destructive', title: 'Network error' });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> New Announcement</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} disabled={isCreating} />
          <Textarea placeholder="Message body" value={newBody} onChange={e => setNewBody(e.target.value)} disabled={isCreating} />
          <Button onClick={handleCreate} disabled={isCreating || !newTitle.trim() || !newBody.trim()}>
            {isCreating ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Plus className="h-4 w-4 mr-1.5" />} Post Announcement
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Announcements</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 gap-2"><Loader2 className="h-6 w-6 animate-spin" /> Loading...</div>
          ) : items.length === 0 ? (
            <p className="text-muted-foreground italic">No announcements posted yet.</p>
          ) : items.map(a => (
            <div key={a.id} className="p-4 border rounded-lg bg-card">
              {editingId === a.id ? (
                <div className="space-y-2">
                  <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                  <Textarea value={editBody} onChange={e => setEditBody(e.target.value)} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveEdit}><Save className="h-3.5 w-3.5 mr-1" /> Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="h-3.5 w-3.5 mr-1" /> Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="font-bold">{a.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{a.body}</p>
                    <p className="text-[11px] text-muted-foreground mt-2">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(a)}><Edit3 className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}