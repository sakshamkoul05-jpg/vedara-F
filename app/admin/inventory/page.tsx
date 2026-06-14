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
import { ShoppingBag, Plus, Trash2, Edit, AlertTriangle, ArrowDownCircle, ArrowUpCircle, Package } from 'lucide-react';
import type { CafeInventoryItem } from '@/types';

type ToastState = { message: string; type: 'success' | 'error' } | null;

export default function InventoryPage() {
  const { token } = useAuthStore();
  const [toast, setToast] = useState<ToastState>(null);
  const [items, setItems] = useState<CafeInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', category: 'FOOD', quantity: 0, unit: 'kg', minStock: 10, costPrice: 0, supplier: '', expiryDate: '' });
  const [showRestock, setShowRestock] = useState(false);
  const [restockItem, setRestockItem] = useState<CafeInventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState(0);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type }); setTimeout(() => setToast(null), 3000);
  };

  const loadItems = useCallback(async () => {
    if (!token) return;
    try { const res = await endpoints.inventory.list(token); setItems(res.data || []); }
    catch (e: any) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadItems(); }, [loadItems]);

  const handleSave = async () => {
    if (!token || !form.name) return;
    try {
      if (editId) { await endpoints.inventory.update(editId, form, token); showToast('Updated'); }
      else { await endpoints.inventory.create(form, token); showToast('Created'); }
      setShowModal(false); setForm({ name: '', category: 'FOOD', quantity: 0, unit: 'kg', minStock: 10, costPrice: 0, supplier: '', expiryDate: '' }); setEditId(null); loadItems();
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!token || !confirm('Delete?')) return;
    try { await endpoints.inventory.delete(id, token); showToast('Deleted'); loadItems(); }
    catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleRestock = async () => {
    if (!token || !restockItem || !restockQty) return;
    try { await endpoints.inventory.restock(restockItem.id, { quantity: restockQty }, token); showToast('Restocked'); setShowRestock(false); loadItems(); }
    catch (e: any) { showToast(e.message, 'error'); }
  };

  const openEdit = (item: CafeInventoryItem) => {
    setForm({ name: item.name, category: item.category, quantity: item.quantity, unit: item.unit, minStock: item.minStock, costPrice: item.costPrice, supplier: item.supplier || '', expiryDate: item.expiryDate?.slice(0, 10) || '' });
    setEditId(item.id); setShowModal(true);
  };

  const filtered = items.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()));
  const lowStock = items.filter(i => i.quantity <= i.minStock);

  return (
    <div className="min-h-screen bg-alabaster pt-20">
      <div className="vintage-container py-8">
        {toast && <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-forest-50 text-forest-700'}`}>{toast.message}</div>}

        <ScrollReveal>
          <div className="flex items-center justify-between mb-8">
            <div><h1 className="font-serif text-3xl font-bold">Cafe Inventory</h1><p className="text-muted-foreground mt-1">Track stock levels and manage supplies</p></div>
            <Button onClick={() => { setForm({ name: '', category: 'FOOD', quantity: 0, unit: 'kg', minStock: 10, costPrice: 0, supplier: '', expiryDate: '' }); setEditId(null); setShowModal(true); }} className="bg-gold-600 hover:bg-gold-700"><Plus className="w-4 h-4 mr-2" /> Add Item</Button>
          </div>
        </ScrollReveal>

        {lowStock.length > 0 && (
          <ScrollReveal>
            <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-700"><strong>{lowStock.length} items</strong> are low on stock</p>
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal>
          <div className="vintage-card p-4 mb-6">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)} className="border-0 bg-transparent" />
            </div>
          </div>
        </ScrollReveal>

        {loading ? <div className="vintage-card p-6 animate-pulse h-48" /> : filtered.length === 0 ? (
          <div className="vintage-card p-12 text-center"><Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No inventory items</p></div>
        ) : (
          <ScrollReveal>
            <div className="vintage-card overflow-hidden">
              <table className="w-full">
                <thead><tr className="border-b border-earth-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Item</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Stock</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Min</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Cost</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Supplier</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                </tr></thead>
                <tbody>
                  {filtered.map(item => (
                    <tr key={item.id} className="border-b border-earth-50 hover:bg-earth-50/50">
                      <td className="px-4 py-3 font-medium text-sm">{item.name}</td>
                      <td className="px-4 py-3"><Badge className="bg-earth-100 text-earth-700">{item.category}</Badge></td>
                      <td className="px-4 py-3 text-sm">
                        <span className={item.quantity <= item.minStock ? 'text-red-600 font-semibold' : ''}>{item.quantity} {item.unit}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{item.minStock} {item.unit}</td>
                      <td className="px-4 py-3 text-sm">₹{item.costPrice}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{item.supplier || '—'}</td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => { setRestockItem(item); setRestockQty(0); setShowRestock(true); }}><ArrowUpCircle className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
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
            <DialogHeader><DialogTitle>{editId ? 'Edit Item' : 'Add Item'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Item name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="FOOD">Food</SelectItem>
                  <SelectItem value="BEVERAGE">Beverage</SelectItem>
                  <SelectItem value="SUPPLY">Supply</SelectItem>
                  <SelectItem value="CLEANING">Cleaning</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" placeholder="Quantity" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} />
                <Input placeholder="Unit (kg, pcs, L)" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input type="number" placeholder="Min stock" value={form.minStock} onChange={e => setForm({ ...form, minStock: Number(e.target.value) })} />
                <Input type="number" placeholder="Cost price (₹)" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: Number(e.target.value) })} />
              </div>
              <Input placeholder="Supplier (optional)" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-gold-600 hover:bg-gold-700">{editId ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showRestock} onOpenChange={setShowRestock}>
          <DialogContent>
            <DialogHeader><DialogTitle>Restock — {restockItem?.name}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Current stock: {restockItem?.quantity} {restockItem?.unit}</p>
              <Input type="number" placeholder="Quantity to add" value={restockQty || ''} onChange={e => setRestockQty(Number(e.target.value))} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRestock(false)}>Cancel</Button>
              <Button onClick={handleRestock} className="bg-gold-600 hover:bg-gold-700">Restock</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
