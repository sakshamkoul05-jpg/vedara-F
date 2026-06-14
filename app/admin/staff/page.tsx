'use client';

import { useState, useEffect, useCallback } from 'react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuthStore } from '@/store/auth';
import { endpoints } from '@/lib/api';
import { formatDateShort } from '@/lib/utils';
import {
  UserPlus, Trash2, Edit, UserX, UserCheck, BadgeCheck, X
} from 'lucide-react';

type ToastState = { message: string; type: 'success' | 'error' } | null;

export default function StaffPage() {
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
          <h1 className="font-serif text-3xl text-foreground">Staff Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage employees, roles, and employment status</p>
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

        <StaffTable token={token} showToast={showToast} />
      </div>
    </div>
  );
}

function StaffTable({ token, showToast }: { token: string | null; showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [staff, setStaff] = useState<any[]>([]);
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
      const res = await endpoints.cms.getStaff(token);
      setStaff(res.data || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditing({ name: '', phone: '', employeeId: '', role: 'STAFF', salary: 0, address: '' });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing({ ...item });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!token || !editing) return;
    if (!editing.name || !editing.employeeId) { showToast('Name and Employee ID are required', 'error'); return; }
    setSaving(true);
    try {
      if (editing.id) {
        await endpoints.cms.updateStaff(editing.id, editing, token);
      } else {
        await endpoints.cms.createStaff(editing, token);
      }
      showToast(editing.id ? 'Staff updated' : 'Staff created');
      setDialogOpen(false);
      setEditing(null);
      loadData();
    } catch {
      showToast('Failed to save staff', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFire = async (id: string) => {
    if (!token) return;
    try {
      await endpoints.cms.fireStaff(id, token);
      showToast('Staff fired');
      loadData();
    } catch {
      showToast('Failed to fire staff', 'error');
    }
  };

  const handleHire = async (id: string) => {
    if (!token) return;
    try {
      await endpoints.cms.hireStaff(id, token);
      showToast('Staff rehired');
      loadData();
    } catch {
      showToast('Failed to hire staff', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await endpoints.cms.deleteStaff(id, token);
      setStaff(staff.filter((s) => s.id !== id));
      showToast('Staff deleted');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  if (loading) {
    return <div className="vintage-card p-6 animate-pulse h-48" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{staff.length} staff members</p>
        <Button variant="primary" onClick={openNew}><UserPlus className="w-4 h-4 mr-1.5" /> Add Staff</Button>
      </div>

      {staff.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No staff members yet</p>
      ) : (
        <div className="vintage-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-earth-50">
                  <th className="text-left py-3 px-4 font-medium text-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Employee ID</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-foreground">Hired Date</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member, idx) => {
                  const isFired = member.status === 'FIRED';
                  return (
                    <tr key={member.id} className={`border-b border-border transition-colors hover:bg-earth-50/50 ${
                        isFired ? 'opacity-50' : ''
                      }`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-600 font-bold text-xs">
                              {member.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{member.name}</p>
                              {isFired && member.firedAt && (
                                <p className="text-xs text-red-500">Fired: {formatDateShort(member.firedAt)}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{member.phone || '-'}</td>
                        <td className="py-3 px-4">
                          <code className="text-xs font-mono bg-gold-50 px-2 py-0.5 rounded">
                            {member.employeeId}
                          </code>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" size="sm">{member.role || 'STAFF'}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={isFired ? 'danger' : 'success'} size="sm">
                            {isFired ? 'FIRED' : 'ACTIVE'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {member.hiredAt ? formatDateShort(member.hiredAt) : '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {isFired ? (
                              <Button variant="ghost" size="icon" onClick={() => handleHire(member.id)} title="Rehire">
                                <UserCheck className="w-3.5 h-3.5 text-green-600" />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="icon" onClick={() => handleFire(member.id)} title="Fire">
                                <UserX className="w-3.5 h-3.5 text-red-500" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => openEdit(member)} title="Edit">
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(member.id)} className="text-red-500" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit Staff' : 'Add Staff'}</DialogTitle>
            <DialogDescription>{editing?.id ? 'Update employee details' : 'Enter new employee details'}</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2">
                <label className="vintage-label">Name</label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Full name" />
              </div>
              <div>
                <label className="vintage-label">Phone</label>
                <Input value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} placeholder="Phone number" />
              </div>
              <div>
                <label className="vintage-label">Employee ID</label>
                <Input value={editing.employeeId} onChange={(e) => setEditing({ ...editing, employeeId: e.target.value })} placeholder="EMP001" />
              </div>
              <div>
                <label className="vintage-label">Role</label>
                <Select value={editing.role || 'STAFF'} onValueChange={(v) => setEditing({ ...editing, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="MANAGER">Manager</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="CHEF">Chef</SelectItem>
                    <SelectItem value="HOUSEKEEPING">Housekeeping</SelectItem>
                    <SelectItem value="SECURITY">Security</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="vintage-label">Salary (₹)</label>
                <Input type="number" value={editing.salary || 0} onChange={(e) => setEditing({ ...editing, salary: Number(e.target.value) })} />
              </div>
              <div className="col-span-2">
                <label className="vintage-label">Address</label>
                <textarea
                  value={editing.address || ''}
                  onChange={(e) => setEditing({ ...editing, address: e.target.value })}
                  className="vintage-input min-h-[80px] resize-y"
                  rows={3}
                  placeholder="Full address"
                />
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
