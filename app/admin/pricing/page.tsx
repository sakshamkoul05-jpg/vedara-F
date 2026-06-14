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
import { DollarSign, Plus, Trash2, Edit, Percent, Calendar, ToggleLeft, ToggleRight, Calculator } from 'lucide-react';
import type { PricingRule } from '@/types';

type ToastState = { message: string; type: 'success' | 'error' } | null;

const emptyRule = { name: '', type: 'WEEKEND', discountPercent: 10, minNights: 1, maxNights: null as number | null, startDate: '', endDate: '', daysOfWeek: '', isActive: true, priority: 0 };

export default function PricingPage() {
  const { token } = useAuthStore();
  const [toast, setToast] = useState<ToastState>(null);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyRule);
  const [showCalc, setShowCalc] = useState(false);
  const [calcForm, setCalcForm] = useState({ basePrice: 10000, nights: 2, checkIn: '' });
  const [calcResult, setCalcResult] = useState<any>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type }); setTimeout(() => setToast(null), 3000);
  };

  const loadRules = useCallback(async () => {
    if (!token) return;
    try { const res = await endpoints.pricing.list(token); setRules(res.data || []); }
    catch (e: any) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadRules(); }, [loadRules]);

  const handleSave = async () => {
    if (!token || !form.name) return;
    try {
      if (editId) { await endpoints.pricing.update(editId, form, token); showToast('Rule updated'); }
      else { await endpoints.pricing.create(form, token); showToast('Rule created'); }
      setShowModal(false); setForm(emptyRule); setEditId(null); loadRules();
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Delete this rule?')) return;
    try { await endpoints.pricing.delete(id, token); showToast('Rule deleted'); loadRules(); }
    catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleToggle = async (rule: PricingRule) => {
    if (!token) return;
    try { await endpoints.pricing.update(rule.id, { isActive: !rule.isActive }, token); loadRules(); }
    catch (e: any) { showToast(e.message, 'error'); }
  };

  const openEdit = (rule: PricingRule) => {
    setForm({ name: rule.name, type: rule.type, discountPercent: rule.discountPercent, minNights: rule.minNights, maxNights: rule.maxNights, startDate: rule.startDate?.slice(0, 10) || '', endDate: rule.endDate?.slice(0, 10) || '', daysOfWeek: rule.daysOfWeek || '', isActive: rule.isActive, priority: rule.priority });
    setEditId(rule.id); setShowModal(true);
  };

  const handleCalculate = async () => {
    if (!token) return;
    try {
      const res = await endpoints.pricing.calculate({ basePrice: calcForm.basePrice, nights: calcForm.nights, checkIn: calcForm.checkIn || undefined }, token);
      setCalcResult(res.data);
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  return (
    <div className="min-h-screen bg-alabaster pt-20">
      <div className="vintage-container py-8">
        {toast && <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-forest-50 text-forest-700'}`}>{toast.message}</div>}

        <ScrollReveal>
          <div className="flex items-center justify-between mb-8">
            <div><h1 className="font-serif text-3xl font-bold">Dynamic Pricing</h1><p className="text-muted-foreground mt-1">Configure pricing rules and discounts</p></div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setCalcResult(null); setShowCalc(true); }}><Calculator className="w-4 h-4 mr-2" /> Calculate</Button>
              <Button onClick={() => { setForm(emptyRule); setEditId(null); setShowModal(true); }} className="bg-gold-600 hover:bg-gold-700"><Plus className="w-4 h-4 mr-2" /> Add Rule</Button>
            </div>
          </div>
        </ScrollReveal>

        {loading ? <div className="vintage-card p-6 animate-pulse h-48" /> : rules.length === 0 ? (
          <div className="vintage-card p-12 text-center"><DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No pricing rules yet</p></div>
        ) : (
          <ScrollReveal>
            <div className="vintage-card overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b border-earth-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Rule</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Discount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Min Nights</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr></thead>
                <tbody>
                  {rules.map(rule => (
                    <tr key={rule.id} className="border-b border-earth-50 hover:bg-earth-50/50">
                      <td className="px-4 py-3 font-medium text-sm">{rule.name}</td>
                      <td className="px-4 py-3"><Badge className="bg-blue-100 text-blue-700">{rule.type}</Badge></td>
                      <td className="px-4 py-3 text-sm">{rule.discountPercent}%</td>
                      <td className="px-4 py-3 text-sm">{rule.minNights}</td>
                      <td className="px-4 py-3 text-sm">{rule.priority}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggle(rule)}>
                          {rule.isActive ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(rule)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(rule.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        )}

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? 'Edit Rule' : 'New Rule'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Rule name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKEND">Weekend</SelectItem>
                  <SelectItem value="SEASONAL">Seasonal</SelectItem>
                  <SelectItem value="HOLIDAY">Holiday</SelectItem>
                  <SelectItem value="LAST_MINUTE">Last Minute</SelectItem>
                  <SelectItem value="LONG_STAY">Long Stay</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" placeholder="Discount %" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: Number(e.target.value) })} />
                <Input type="number" placeholder="Min nights" value={form.minNights} onChange={e => setForm({ ...form, minNights: Number(e.target.value) })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="date" placeholder="Start date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                <Input type="date" placeholder="End date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" placeholder="Priority" value={form.priority} onChange={e => setForm({ ...form, priority: Number(e.target.value) })} />
                <Input placeholder="Days of week (e.g. MON,TUE)" value={form.daysOfWeek} onChange={e => setForm({ ...form, daysOfWeek: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-gold-600 hover:bg-gold-700">{editId ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showCalc} onOpenChange={setShowCalc}>
          <DialogContent>
            <DialogHeader><DialogTitle>Calculate Price</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input type="number" placeholder="Base price (₹)" value={calcForm.basePrice} onChange={e => setCalcForm({ ...calcForm, basePrice: Number(e.target.value) })} />
              <Input type="number" placeholder="Number of nights" value={calcForm.nights} onChange={e => setCalcForm({ ...calcForm, nights: Number(e.target.value) })} />
              <Input type="date" placeholder="Check-in date" value={calcForm.checkIn} onChange={e => setCalcForm({ ...calcForm, checkIn: e.target.value })} />
              <Button onClick={handleCalculate} className="w-full bg-gold-600 hover:bg-gold-700">Calculate</Button>
              {calcResult && (
                <div className="p-4 rounded-lg bg-earth-50 space-y-2">
                  <p className="text-sm">Base: ₹{calcResult.basePrice?.toLocaleString()}</p>
                  <p className="text-sm">Discount: ₹{calcResult.discountAmount?.toLocaleString()} ({calcResult.appliedRules?.map((r: any) => r.name).join(', ')})</p>
                  <p className="text-lg font-bold">Final: ₹{calcResult.finalPrice?.toLocaleString()}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
