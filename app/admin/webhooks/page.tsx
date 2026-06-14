'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { endpoints } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Webhook, Plus, Trash2, Edit, Send, CheckCircle, XCircle, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Webhook as WebhookType, WebhookDelivery } from '@/types';

type ToastState = { message: string; type: 'success' | 'error' } | null;

const EVENTS = ['booking.created', 'booking.confirmed', 'booking.cancelled', 'payment.received', 'cafe.order.created', 'review.created', 'guest.registered'];

export default function WebhooksPage() {
  const { token } = useAuthStore();
  const [toast, setToast] = useState<ToastState>(null);
  const [webhooks, setWebhooks] = useState<WebhookType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', url: '', events: [] as string[], secret: '' });
  const [showDeliveries, setShowDeliveries] = useState<WebhookType | null>(null);
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type }); setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    if (!token) return;
    try { const res = await endpoints.webhooks.list(token); setWebhooks(res.data || []); }
    catch (e: any) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async () => {
    if (!token || !form.name || !form.url) return;
    try {
      if (editId) { await endpoints.webhooks.update(editId, form, token); showToast('Updated'); }
      else { await endpoints.webhooks.create(form, token); showToast('Created'); }
      setShowModal(false); setForm({ name: '', url: '', events: [], secret: '' }); setEditId(null); loadData();
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Delete?')) return;
    try { await endpoints.webhooks.delete(id, token); showToast('Deleted'); loadData(); }
    catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleTest = async (id: string) => {
    if (!token) return;
    try { await endpoints.webhooks.testTrigger(id, token); showToast('Test event sent'); }
    catch (e: any) { showToast(e.message, 'error'); }
  };

  const loadDeliveries = async (webhook: WebhookType) => {
    setShowDeliveries(webhook);
    if (!token) return;
    try { const res = await endpoints.webhooks.deliveries(webhook.id, token); setDeliveries(res.data || []); }
    catch { setDeliveries([]); }
  };

  const toggleEvent = (event: string) => {
    setForm(f => ({ ...f, events: f.events.includes(event) ? f.events.filter(e => e !== event) : [...f.events, event] }));
  };

  return (
    <div className="min-h-screen bg-alabaster pt-20">
      <div className="vintage-container py-8">
        {toast && <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-forest-50 text-forest-700'}`}>{toast.message}</div>}

        <ScrollReveal>
          <div className="flex items-center justify-between mb-8">
            <div><h1 className="font-serif text-3xl font-bold">Webhooks</h1><p className="text-muted-foreground mt-1">Configure event triggers and endpoints</p></div>
            <Button onClick={() => { setForm({ name: '', url: '', events: [], secret: '' }); setEditId(null); setShowModal(true); }} className="bg-gold-600 hover:bg-gold-700"><Plus className="w-4 h-4 mr-2" /> Add Webhook</Button>
          </div>
        </ScrollReveal>

        {loading ? <div className="vintage-card p-6 animate-pulse h-48" /> : webhooks.length === 0 ? (
          <div className="vintage-card p-12 text-center"><Webhook className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No webhooks configured</p></div>
        ) : (
          <ScrollReveal>
            <div className="space-y-4">
              {webhooks.map(wh => (
                <div key={wh.id} className="vintage-card p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{wh.name}</h3>
                        <Badge className={wh.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>{wh.isActive ? 'Active' : 'Inactive'}</Badge>
                        {wh.failCount > 0 && <Badge className="bg-red-100 text-red-700">{wh.failCount} failures</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground font-mono mb-2">{wh.url}</p>
                      <div className="flex flex-wrap gap-1">{wh.events.map(e => <Badge key={e} className="bg-earth-100 text-earth-700 text-xs">{e}</Badge>)}</div>
                      {wh.lastTriggeredAt && <p className="text-xs text-muted-foreground mt-2">Last triggered: {new Date(wh.lastTriggeredAt).toLocaleString()}</p>}
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Button variant="ghost" size="sm" onClick={() => handleTest(wh.id)}><Send className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => loadDeliveries(wh)}><Clock className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { setForm({ name: wh.name, url: wh.url, events: wh.events, secret: wh.secret || '' }); setEditId(wh.id); setShowModal(true); }}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(wh.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        )}

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? 'Edit Webhook' : 'New Webhook'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Webhook name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Endpoint URL" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} />
              <Input placeholder="Secret (optional)" value={form.secret} onChange={e => setForm({ ...form, secret: e.target.value })} />
              <div>
                <p className="text-sm font-medium mb-2">Events</p>
                <div className="flex flex-wrap gap-2">{EVENTS.map(e => (
                  <button key={e} onClick={() => toggleEvent(e)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${form.events.includes(e) ? 'bg-gold-600 text-white border-gold-600' : 'bg-white text-muted-foreground border-earth-200 hover:border-gold-300'}`}>{e}</button>
                ))}</div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-gold-600 hover:bg-gold-700">{editId ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={!!showDeliveries} onOpenChange={() => setShowDeliveries(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Deliveries — {showDeliveries?.name}</DialogTitle></DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              {deliveries.length === 0 ? <p className="text-center text-muted-foreground py-4 text-sm">No deliveries yet</p> : (
                <table className="w-full text-sm">
                  <thead><tr className="border-b"><th className="text-left py-2 text-xs">Event</th><th className="text-left py-2 text-xs">Status</th><th className="text-right py-2 text-xs">Code</th><th className="text-right py-2 text-xs">Duration</th></tr></thead>
                  <tbody>
                    {deliveries.map(d => (
                      <tr key={d.id} className="border-b border-earth-50">
                        <td className="py-2 font-mono text-xs">{d.event}</td>
                        <td className="py-2">{d.status === 'SUCCESS' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}</td>
                        <td className="py-2 text-right">{d.statusCode || '—'}</td>
                        <td className="py-2 text-right text-muted-foreground">{d.duration ? `${d.duration}ms` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
