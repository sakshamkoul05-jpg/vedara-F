'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { endpoints } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { FileText, Plus, Trash2, Edit, AlertTriangle, ExternalLink, FolderOpen } from 'lucide-react';
import type { DocumentItem } from '@/types';

type ToastState = { message: string; type: 'success' | 'error' } | null;

export default function DocumentsPage() {
  const { token } = useAuthStore();
  const [toast, setToast] = useState<ToastState>(null);
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', category: 'POLICY', description: '', fileUrl: '', expiryDate: '' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type }); setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    if (!token) return;
    try { const res = await endpoints.documents.list(token); setDocs(res.data || []); }
    catch (e: any) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    if (!token || !form.name) return;
    try {
      if (editId) { await endpoints.documents.update(editId, form, token); showToast('Updated'); }
      else { await endpoints.documents.create(form, token); showToast('Created'); }
      setShowModal(false); setForm({ name: '', category: 'POLICY', description: '', fileUrl: '', expiryDate: '' }); setEditId(null); loadData();
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Delete?')) return;
    try { await endpoints.documents.delete(id, token); showToast('Deleted'); loadData(); }
    catch (e: any) { showToast(e.message, 'error'); }
  };

  const openEdit = (doc: DocumentItem) => {
    setForm({ name: doc.name, category: doc.category, description: doc.description || '', fileUrl: doc.fileUrl || '', expiryDate: doc.expiryDate?.slice(0, 10) || '' });
    setEditId(doc.id); setShowModal(true);
  };

  const filtered = docs.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase()));
  const expiringSoon = docs.filter(d => d.expiryDate && new Date(d.expiryDate) < new Date(Date.now() + 30 * 86400000));

  return (
    <div className="min-h-screen bg-alabaster pt-20">
      <div className="vintage-container py-8">
        {toast && <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-forest-50 text-forest-700'}`}>{toast.message}</div>}

        <ScrollReveal>
          <div className="flex items-center justify-between mb-8">
            <div><h1 className="font-serif text-3xl font-bold">Documents</h1><p className="text-muted-foreground mt-1">Manage policies, certificates, and files</p></div>
            <Button onClick={() => { setForm({ name: '', category: 'POLICY', description: '', fileUrl: '', expiryDate: '' }); setEditId(null); setShowModal(true); }} className="bg-gold-600 hover:bg-gold-700"><Plus className="w-4 h-4 mr-2" /> Add Document</Button>
          </div>
        </ScrollReveal>

        {expiringSoon.length > 0 && (
          <ScrollReveal>
            <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-700"><strong>{expiringSoon.length} documents</strong> expiring within 30 days</p>
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal>
          <div className="vintage-card p-4 mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)} className="border-0 bg-transparent" />
            </div>
          </div>
        </ScrollReveal>

        {loading ? <div className="vintage-card p-6 animate-pulse h-48" /> : filtered.length === 0 ? (
          <div className="vintage-card p-12 text-center"><FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No documents</p></div>
        ) : (
          <ScrollReveal>
            <div className="vintage-card overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b border-earth-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Expiry</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map(doc => {
                    const isExpiring = doc.expiryDate && new Date(doc.expiryDate) < new Date(Date.now() + 30 * 86400000);
                    return (
                      <tr key={doc.id} className="border-b border-earth-50 hover:bg-earth-50/50">
                        <td className="px-4 py-3 font-medium text-sm">{doc.name}</td>
                        <td className="px-4 py-3"><Badge className="bg-blue-100 text-blue-700">{doc.category}</Badge></td>
                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{doc.description || '—'}</td>
                        <td className="px-4 py-3">
                          {doc.expiryDate ? (
                            <span className={`text-sm ${isExpiring ? 'text-red-600 font-semibold' : ''}`}>
                              {new Date(doc.expiryDate).toLocaleDateString()}
                              {isExpiring && ' ⚠️'}
                            </span>
                          ) : <span className="text-sm text-muted-foreground">—</span>}
                        </td>
                        <td className="px-4 py-3 text-right space-x-1">
                          {doc.fileUrl && <Button variant="ghost" size="sm" asChild><a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a></Button>}
                          <Button variant="ghost" size="sm" onClick={() => openEdit(doc)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(doc.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        )}

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? 'Edit Document' : 'Add Document'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Document name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="POLICY">Policy</SelectItem>
                  <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="LICENSE">License</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <Input placeholder="File URL" value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })} />
              <Input type="date" placeholder="Expiry date (optional)" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-gold-600 hover:bg-gold-700">{editId ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
