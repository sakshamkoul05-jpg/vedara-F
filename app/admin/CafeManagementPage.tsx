'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Plus, Coffee, DollarSign, ClipboardList, Edit, Trash2, X, Check, Loader2, ChefHat } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

const statusColors: Record<string, string> = {
  PENDING: 'bg-gold-100 text-clay-700',
  PREPARING: 'bg-blue-100 text-blue-700',
  READY: 'bg-gold-100 text-forest-700',
  DELIVERED: 'bg-gold-50 text-charcoal/70',
  CANCELLED: 'bg-red-100 text-red-700',
};

export function CafeManagementPage() {
  const { token } = useAuthStore();
  const [menu, setMenu] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState('overview');
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [itemDialog, setItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  const loadData = async () => {
    Promise.all([
      api.get('/cafe/menu').then((r: any) => setMenu(r.data || [])).catch(() => {}),
      api.get('/cafe/orders?limit=50', token).then((r: any) => setOrders(r.orders || r.data || [])).catch(() => {}),
    ]);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
  const pendingOrders = orders.filter((o: any) => o.status === 'PENDING' || o.status === 'PREPARING').length;

  const handleAddCategory = async () => {
    if (!newCategory.name) return;
    try {
      await api.post('/cafe/categories', newCategory, token);
      setNewCategory({ name: '', description: '' });
      showToast('Category added');
      loadData();
    } catch {
      showToast('Failed to add category', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category and all its items?')) return;
    try {
      await api.delete(`/cafe/categories/${id}`, token);
      showToast('Category deleted');
      loadData();
    } catch {
      showToast('Failed to delete category', 'error');
    }
  };

  const openNewItem = (categoryId: string) => {
    setEditingItem({ name: '', description: '', price: 0, categoryId, isAvailable: true, isVeg: false });
    setItemDialog(true);
  };

  const openEditItem = (item: any) => {
    setEditingItem({ ...item });
    setItemDialog(true);
  };

  const handleSaveItem = async () => {
    if (!token || !editingItem) return;
    if (!editingItem.name || !editingItem.price) { showToast('Name and price are required', 'error'); return; }
    setSaving(true);
    try {
      if (editingItem.id) {
        await api.put(`/cafe/items/${editingItem.id}`, editingItem, token);
      } else {
        await api.post('/cafe/items', editingItem, token);
      }
      showToast(editingItem.id ? 'Item updated' : 'Item added');
      setItemDialog(false);
      setEditingItem(null);
      loadData();
    } catch {
      showToast('Failed to save item', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await api.delete(`/cafe/items/${id}`, token);
      showToast('Item deleted');
      loadData();
    } catch {
      showToast('Failed to delete item', 'error');
    }
  };

  const handleToggleItem = async (item: any) => {
    try {
      await api.put(`/cafe/items/${item.id}`, { isAvailable: !item.isAvailable }, token);
      loadData();
    } catch {
      showToast('Failed to toggle availability', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    setActionLoading(orderId);
    try {
      await api.put(`/cafe/orders/${orderId}/status`, { status }, token);
      setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status } : o));
      showToast(`Order marked as ${status.toLowerCase()}`);
    } catch {
      showToast('Failed to update order status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-24 right-6 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: ClipboardList },
          { id: 'menu', label: 'Menu', icon: Coffee },
          { id: 'orders', label: 'Orders', icon: ChefHat },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === t.id
                ? 'glass-card-light text-gold-700 shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-earth-50'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass-card-light rounded-2xl p-6">
            <ClipboardList className="w-8 h-8 text-gold-500 mb-3" />
            <p className="text-3xl font-bold text-foreground">{orders.length}</p>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </div>
          <div className="glass-card-light rounded-2xl p-6">
            <Coffee className="w-8 h-8 text-gold-500 mb-3" />
            <p className="text-3xl font-bold text-foreground">{pendingOrders}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <div className="glass-card-light rounded-2xl p-6">
            <DollarSign className="w-8 h-8 text-gold-500 mb-3" />
            <p className="text-3xl font-bold text-foreground">{formatPrice(totalRevenue)}</p>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </div>
        </div>
      )}

      {tab === 'menu' && (
        <div className="space-y-6">
          <div className="glass-card-light rounded-2xl p-5">
            <h3 className="font-serif text-lg text-foreground mb-4">Add Category</h3>
            <div className="flex gap-3">
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Category name (e.g. Fresh Salads)"
                className="flex-1"
              />
              <Input
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Description (optional)"
                className="flex-1"
              />
              <Button variant="primary" onClick={handleAddCategory}>
                <Plus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>
          </div>

          {menu.map((cat: any) => (
            <div key={cat.id} className="glass-card-light rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-serif text-lg text-foreground">{cat.name}</h4>
                  {cat.description && <p className="text-xs text-muted-foreground">{cat.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => openNewItem(cat.id)}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(cat.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {!cat.items || cat.items.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No items yet. Add your first item above.</p>
              ) : (
                <div className="space-y-1">
                  {cat.items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-earth-50 transition-colors group">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleToggleItem(item)} className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          item.isAvailable ? 'border-green-500 bg-green-500/10' : 'border-red-400 bg-red-500/10'
                        }`}>
                          {item.isAvailable && <Check className="w-3 h-3 text-green-600" />}
                          {!item.isAvailable && <X className="w-3 h-3 text-red-500" />}
                        </button>
                        <div>
                          <p className={`text-sm font-medium ${item.isAvailable ? 'text-foreground' : 'text-muted-foreground line-through'}`}>{item.name}</p>
                          {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {item.isVeg && <Badge variant="secondary" size="sm">Veg</Badge>}
                        <span className="text-sm font-semibold text-gold-600">{formatPrice(item.price)}</span>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditItem(item)}>
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteItem(item.id)} className="text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-3">
          <div className="flex gap-2 mb-4">
            {['', 'PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'].map((s) => (
              <button key={s} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${s === '' ? 'bg-earth-100 text-foreground' : statusColors[s] || 'bg-gold-50'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>
          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No orders yet</p>
          ) : (
            orders.slice(0, 50).map((order: any) => (
              <div key={order.id} className="glass-card-light rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground">Table {order.tableNumber || '-'}</p>
                      <Badge variant="secondary" size="sm">{order.orderRef}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                    {order.items && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || ''}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
                {(order.status === 'PENDING' || order.status === 'PREPARING') && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                        disabled={actionLoading === order.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChefHat className="w-3 h-3" />}
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => handleUpdateOrderStatus(order.id, 'READY')}
                        disabled={actionLoading === order.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                        Mark Ready
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                      disabled={actionLoading === order.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gold-500 text-white text-xs font-medium hover:bg-gold-600 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                      Delivered
                    </button>
                    <button
                      onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')}
                      disabled={actionLoading === order.id}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <Dialog open={itemDialog} onOpenChange={setItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
            <DialogDescription>{editingItem?.id ? 'Update item details' : 'Add a new item to the menu'}</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4 py-4">
              <div>
                <label className="vintage-label">Item Name *</label>
                <Input value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} placeholder="e.g. Masala Chai" />
              </div>
              <div>
                <label className="vintage-label">Description</label>
                <Input value={editingItem.description || ''} onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })} placeholder="Brief description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="vintage-label">Price (₹) *</label>
                  <Input type="number" value={editingItem.price || ''} onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="vintage-label">Category</label>
                  <Select value={editingItem.categoryId || ''} onValueChange={(v) => setEditingItem({ ...editingItem, categoryId: v })}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {menu.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" checked={editingItem.isAvailable} onChange={(e) => setEditingItem({ ...editingItem, isAvailable: e.target.checked })} className="rounded" />
                  Available
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" checked={editingItem.isVeg || false} onChange={(e) => setEditingItem({ ...editingItem, isVeg: e.target.checked })} className="rounded" />
                  Vegetarian
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setItemDialog(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveItem} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
