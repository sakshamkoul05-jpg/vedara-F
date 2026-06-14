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
import { CalendarClock, Plus, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import type { StaffShift } from '@/types';

type ToastState = { message: string; type: 'success' | 'error' } | null;

export default function SchedulePage() {
  const { token } = useAuthStore();
  const [toast, setToast] = useState<ToastState>(null);
  const [shifts, setShifts] = useState<StaffShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ staffId: '', date: new Date().toISOString().slice(0, 10), startTime: '09:00', endTime: '17:00', shiftType: 'MORNING', notes: '' });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type }); setTimeout(() => setToast(null), 3000);
  };

  const loadShifts = useCallback(async () => {
    if (!token) return;
    try { const res = await endpoints.staffSchedule.shifts(token, { date }); setShifts(res.data || []); }
    catch (e: any) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [token, date]);

  useEffect(() => { loadShifts(); }, [loadShifts]);

  const handleCreate = async () => {
    if (!token || !form.staffId) return;
    try { await endpoints.staffSchedule.createShift(form, token); showToast('Shift created'); setShowModal(false); loadShifts(); }
    catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleCheckIn = async (id: string) => {
    if (!token) return;
    try { await endpoints.staffSchedule.checkIn(id, token); showToast('Checked in'); loadShifts(); }
    catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleCheckOut = async (id: string) => {
    if (!token) return;
    try { await endpoints.staffSchedule.checkOut(id, token); showToast('Checked out'); loadShifts(); }
    catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Delete this shift?')) return;
    try { await endpoints.staffSchedule.deleteShift(id, token); showToast('Shift deleted'); loadShifts(); }
    catch (e: any) { showToast(e.message, 'error'); }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-700';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const shiftColor = (type: string) => {
    switch (type) {
      case 'MORNING': return 'bg-orange-100 text-orange-700';
      case 'AFTERNOON': return 'bg-blue-100 text-blue-700';
      case 'NIGHT': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-alabaster pt-20">
      <div className="vintage-container py-8">
        {toast && <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-forest-50 text-forest-700'}`}>{toast.message}</div>}

        <ScrollReveal>
          <div className="flex items-center justify-between mb-8">
            <div><h1 className="font-serif text-3xl font-bold">Staff Schedule</h1><p className="text-muted-foreground mt-1">Manage shifts and attendance</p></div>
            <div className="flex items-center gap-3">
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-40" />
              <Button onClick={() => setShowModal(true)} className="bg-gold-600 hover:bg-gold-700"><Plus className="w-4 h-4 mr-2" /> Add Shift</Button>
            </div>
          </div>
        </ScrollReveal>

        {loading ? <div className="vintage-card p-6 animate-pulse h-48" /> : shifts.length === 0 ? (
          <div className="vintage-card p-12 text-center"><CalendarClock className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No shifts for this date</p></div>
        ) : (
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shifts.map(shift => (
                <div key={shift.id} className="vintage-card p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium">{shift.staff?.name || shift.staffId}</p>
                      <p className="text-xs text-muted-foreground">{shift.staff?.role}</p>
                    </div>
                    <Badge className={statusColor(shift.status)}>{shift.status}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-muted-foreground" /><span>{shift.startTime} — {shift.endTime}</span></div>
                    <Badge className={shiftColor(shift.shiftType)}>{shift.shiftType}</Badge>
                    {shift.notes && <p className="text-xs text-muted-foreground">{shift.notes}</p>}
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-earth-50">
                    {shift.status === 'SCHEDULED' && <Button size="sm" variant="outline" onClick={() => handleCheckIn(shift.id)}><CheckCircle className="w-4 h-4 mr-1" /> Check In</Button>}
                    {shift.status === 'IN_PROGRESS' && <Button size="sm" variant="outline" onClick={() => handleCheckOut(shift.id)}><Clock className="w-4 h-4 mr-1" /> Check Out</Button>}
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(shift.id)} className="text-red-500 hover:text-red-700 ml-auto"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        )}

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader><DialogTitle>New Shift</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Staff ID" value={form.staffId} onChange={e => setForm({ ...form, staffId: e.target.value })} />
              <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                <Input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
              </div>
              <Select value={form.shiftType} onValueChange={v => setForm({ ...form, shiftType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MORNING">Morning</SelectItem>
                  <SelectItem value="AFTERNOON">Afternoon</SelectItem>
                  <SelectItem value="NIGHT">Night</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} className="bg-gold-600 hover:bg-gold-700">Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
