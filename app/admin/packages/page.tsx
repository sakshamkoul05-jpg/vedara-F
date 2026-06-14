'use client';

import { useState, useEffect, useCallback } from 'react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuthStore } from '@/store/auth';
import { api, endpoints } from '@/lib/api';
import { formatDateShort } from '@/lib/utils';
import { Package, Plus, Trash2, Edit, ToggleLeft, ToggleRight, Calendar } from 'lucide-react';

type ToastState = { message: string; type: 'success' | 'error' } | null;

export default function PackagesPage() {
  const { token } = useAuthStore();
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <div className="min-h-screen bg-alabaster pt-20">
      <div className="vintage-container py-8">
        <div className="mb-6">
          <h1 className="font-serif text-3xl text-foreground">Packages</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage promotional offers and banner packages</p>
        </div>

        {toast && (
          <div className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {toast.message}
          </div>
        )}

        <PackagesTable token={token} showToast={showToast} />
      </div>
    </div>
  );
}

function PackagesTable({ token, showToast }: { token: string | null; showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  const loadData = async () => {
    try {
      const res = await endpoints.cms.getPackages(token);
      setItems(res.data || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token || !editing) return;
    if (!editing.title) { showToast('Title is required', 'error'); return; }
    setSaving(true);
    try {
      if (editing.id) {
        await endpoints.cms.updatePackage(editing.id, editing, token);
      } else {
        await endpoints.cms.createPackage(editing, token);
      }
      showToast(editing.id ? 'Package updated' : 'Package created');
      setDialogOpen(false);
      setEditing(null);
      loadData();
    } catch {
      showToast('Failed to save package', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item: any) => {
    if (!token) return;
    try {
      await endpoints.cms.updatePackage(item.id, { isActive: !item.isActive }, token);
      setItems(items.map(i => i.id === item.id ? { ...i, isActive: !i.isActive } : i));
    } catch {
      showToast('Failed to toggle status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await endpoints.cms.deletePackage(id, token);
      setItems(items.filter(i => i.id !== id));
      showToast('Package deleted');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const openNew = () => {
    setEditing({ title: '', description: '', image: '', link: '', startDate: '', endDate: '', sortOrder: 0, isActive: true });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing({ ...item });
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="vintage-card p-6 animate-pulse h-32" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> Add Package</Button>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No packages yet</p>
      ) : (
        <ScrollReveal>
          <div className="vintage-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Title</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Description</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Status</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">Start Date</th>
                  <th className="text-left font-medium text-muted-foreground px-4 py-3">End Date</th>
                  <th className="text-center font-medium text-muted-foreground px-4 py-3">Sort Order</th>
                  <th className="text-right font-medium text-muted-foreground px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-earth-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{item.title}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                      {item.description || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={item.isActive ? 'success' : 'secondary'} size="sm">
                        {item.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {item.startDate ? formatDateShort(item.startDate) : '-'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {item.endDate ? formatDateShort(item.endDate) : '-'}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">
                      {item.sortOrder ?? '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(item)}
                          title={item.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {item.isActive ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-muted-foreground" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit Package' : 'Add Package'}</DialogTitle>
            <DialogDescription>Create or modify a promotional offer banner</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2">
                <label className="vintage-label">Title</label>
                <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Summer Special" />
              </div>
              <div className="col-span-2">
                <label className="vintage-label">Description</label>
                <textarea
                  value={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  className="vintage-input min-h-[80px] resize-y"
                  rows={3}
                  placeholder="Offer details and terms"
                />
              </div>
              <div className="col-span-2">
                <label className="vintage-label">Image URL</label>
                <Input value={editing.image || ''} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="https://..." />
              </div>
              <div className="col-span-2">
                <label className="vintage-label">Link URL</label>
                <Input value={editing.link || ''} onChange={(e) => setEditing({ ...editing, link: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="vintage-label">Start Date</label>
                <Input type="date" value={editing.startDate ? editing.startDate.slice(0, 10) : ''} onChange={(e) => setEditing({ ...editing, startDate: e.target.value || null })} />
              </div>
              <div>
                <label className="vintage-label">End Date</label>
                <Input type="date" value={editing.endDate ? editing.endDate.slice(0, 10) : ''} onChange={(e) => setEditing({ ...editing, endDate: e.target.value || null })} />
              </div>
              <div>
                <label className="vintage-label">Sort Order</label>
                <Input type="number" value={editing.sortOrder ?? 0} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} />
              </div>
              <div className="flex items-end pb-3">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} className="rounded" />
                  Active
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
