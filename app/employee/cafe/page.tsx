'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Coffee, Plus, X, Check, Search } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function EmployeeCafePage() {
  const { user, token, logout, hydrated, hydrate } = useAuthStore();
  const router = useRouter();
  const [menu, setMenu] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState('orders');
  const [search, setSearch] = useState('');
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', categoryId: '', isVegetarian: true });

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) { router.push('/admin/login'); return; }
    loadData();
  }, [token, tab, hydrated]);

  const loadData = async () => {
    try {
      if (tab === 'orders') {
        const res = await api.get('/cafe/kitchen', token);
        setOrders(res.data || []);
      } else {
        const res = await api.get('/cafe/menu');
        setMenu(res.data || []);
      }
    } catch {}
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await api.put(`/cafe/orders/${orderId}/status`, { status }, token);
      loadData();
    } catch {}
  };

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price || !newItem.categoryId) return;
    try {
      await api.post('/cafe/items', {
        categoryId: newItem.categoryId,
        name: newItem.name,
        description: newItem.description,
        price: parseFloat(newItem.price),
        isVegetarian: newItem.isVegetarian,
      }, token);
      setNewItem({ name: '', description: '', price: '', categoryId: '', isVegetarian: true });
      loadData();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-earth-900 pt-20">
      <div className="vintage-container py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-serif text-2xl text-foreground">Cafe Management</h1>
            <p className="text-muted-foreground text-sm">{user?.name} • Cafe Staff</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" size="sm" onClick={() => router.push('/employee/dashboard')}>Dashboard</Button>
            <Button variant="ghost" size="icon" onClick={logout}><X className="w-4 h-4" /></Button>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          {['orders', 'menu'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium capitalize transition-all ${
                tab === t ? 'bg-forest-600 text-cream-50' : 'bg-earth-100 dark:bg-earth-800 text-earth-600'
              }`}
            >
              <Coffee className="w-4 h-4 inline mr-1.5" /> {t === 'orders' ? 'Live Orders' : 'Menu Editor'}
            </button>
          ))}
        </div>

        {tab === 'orders' && (
          <div className="space-y-4">
            <h2 className="font-serif text-lg text-foreground mb-4">Kitchen Display — Pending Orders</h2>
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No pending orders</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {orders.map((order: any) => (
                  <ScrollReveal key={order.id}>
                    <div className="vintage-card p-5 border-l-4 border-l-clay-500">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-xs text-muted-foreground">Order #{order.orderRef}</span>
                          <h3 className="font-medium text-foreground">Table {order.tableNumber}</h3>
                          {order.guestName && <p className="text-xs text-muted-foreground">{order.guestName}</p>}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'PENDING' ? 'bg-clay-100 text-clay-700 animate-pulse' : 'bg-forest-100 text-forest-700'
                        }`}>{order.status}</span>
                      </div>
                      <div className="space-y-1 mb-4 bg-earth-50 dark:bg-earth-800 rounded-xl p-3">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-foreground">{item.quantity}x {item.item?.name}</span>
                            <span className="text-muted-foreground">{formatPrice(item.totalPrice)}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-lg font-bold text-foreground mb-3">Total: {formatPrice(order.totalAmount)}</p>
                      <div className="flex gap-2">
                        {order.status === 'PENDING' && (
                          <Button variant="primary" size="sm" onClick={() => handleStatusUpdate(order.id, 'PREPARING')}>
                            Start Preparing
                          </Button>
                        )}
                        {order.status === 'PREPARING' && (
                          <Button variant="primary" size="sm" onClick={() => handleStatusUpdate(order.id, 'READY')}>
                            <Check className="w-4 h-4 mr-1" /> Mark Ready
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}>
                          Cancel
                        </Button>
                      </div>
                      {order.notes && (
                        <p className="text-xs text-muted-foreground mt-2 italic">Note: {order.notes}</p>
                      )}
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'menu' && (
          <div>
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search menu items..."
                  className="vintage-input pl-10"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-serif text-lg text-foreground mb-4">Current Menu</h3>
                {menu.map((cat: any) => (
                  <div key={cat.id} className="mb-6">
                    <h4 className="font-medium text-forest-600 dark:text-forest-400 text-sm uppercase tracking-wide mb-2">{cat.name}</h4>
                    {cat.items
                      .filter((i: any) => !search || i.name.toLowerCase().includes(search.toLowerCase()))
                      .map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-border/50">
                          <div>
                            <p className="text-sm text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{formatPrice(item.price)}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-xs ${item.isAvailable ? 'bg-forest-100 text-forest-700' : 'bg-red-100 text-red-600'}`}>
                            {item.isAvailable ? 'Available' : 'Unavailable'}
                          </span>
                        </div>
                      ))}
                  </div>
                ))}
              </div>

              <div>
                <div className="vintage-card p-6 sticky top-24">
                  <h3 className="font-serif text-lg text-foreground mb-4">Add Menu Item</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="vintage-label">Category</label>
                      <select
                        value={newItem.categoryId}
                        onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
                        className="vintage-input"
                      >
                        <option value="">Select category</option>
                        {menu.map((cat: any) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="vintage-label">Item Name</label>
                      <Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder="Item name" />
                    </div>
                    <div>
                      <label className="vintage-label">Description</label>
                      <Input value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} placeholder="Brief description" />
                    </div>
                    <div>
                      <label className="vintage-label">Price (₹)</label>
                      <Input type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} placeholder="299" />
                    </div>
                    <label className="flex items-center gap-2 text-sm text-foreground">
                      <input type="checkbox" checked={newItem.isVegetarian} onChange={(e) => setNewItem({ ...newItem, isVegetarian: e.target.checked })} className="rounded" />
                      Vegetarian
                    </label>
                    <Button variant="primary" onClick={handleAddItem} className="w-full">
                      <Plus className="w-4 h-4 mr-2" /> Add to Menu
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
