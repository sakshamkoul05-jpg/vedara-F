'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Coffee, TrendingUp, DollarSign, ClipboardList } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export function CafeManagementPage() {
  const { token } = useAuthStore();
  const [menu, setMenu] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState('overview');
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  useEffect(() => {
    if (!token) return;
    Promise.all([
      api.get('/cafe/menu').then((r: any) => setMenu(r.data || [])).catch(() => {}),
      api.get('/cafe/orders?limit=20', token).then((r: any) => setOrders(r.orders || [])).catch(() => {}),
    ]);
  }, [token]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingOrders = orders.filter((o) => o.status === 'PENDING' || o.status === 'PREPARING').length;

  const handleAddCategory = async () => {
    if (!newCategory.name) return;
    try {
      await api.post('/cafe/categories', newCategory, token);
      setNewCategory({ name: '', description: '' });
      const res = await api.get('/cafe/menu');
      setMenu(res.data || []);
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        {['overview', 'menu', 'orders'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
              tab === t ? 'bg-forest-600 text-cream-50' : 'bg-earth-100 dark:bg-earth-800 text-earth-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="vintage-card p-6">
            <ClipboardList className="w-8 h-8 text-clay-500 mb-3" />
            <p className="text-3xl font-bold text-foreground">{orders.length}</p>
            <p className="text-sm text-muted-foreground">Total Orders</p>
          </div>
          <div className="vintage-card p-6">
            <Coffee className="w-8 h-8 text-forest-500 mb-3" />
            <p className="text-3xl font-bold text-foreground">{pendingOrders}</p>
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <div className="vintage-card p-6">
            <DollarSign className="w-8 h-8 text-forest-500 mb-3" />
            <p className="text-3xl font-bold text-foreground">{formatPrice(totalRevenue)}</p>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </div>
        </div>
      )}

      {tab === 'menu' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-serif text-lg text-foreground mb-4">Menu Categories & Items</h3>
            {menu.map((cat: any) => (
              <div key={cat.id} className="mb-6">
                <h4 className="font-medium text-forest-600 text-sm uppercase tracking-wide mb-2">{cat.name}</h4>
                {cat.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-border/50">
                    <div>
                      <p className="text-sm text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(item.price)}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs ${item.isAvailable ? 'bg-forest-100 text-forest-700' : 'bg-red-100 text-red-600'}`}>
                      {item.isAvailable ? 'In Stock' : 'Out'}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div>
            <div className="vintage-card p-6">
              <h3 className="font-serif text-lg text-foreground mb-4">Add Category</h3>
              <div className="space-y-3">
                <div>
                  <label className="vintage-label">Category Name</label>
                  <Input value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} placeholder="e.g. Fresh Salads" />
                </div>
                <div>
                  <label className="vintage-label">Description</label>
                  <Input value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} placeholder="Category description" />
                </div>
                <Button variant="primary" onClick={handleAddCategory} className="w-full">
                  <Plus className="w-4 h-4 mr-2" /> Add Category
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No orders yet</p>
          ) : (
            orders.slice(0, 30).map((order: any) => (
              <div key={order.id} className="vintage-card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-foreground">Table {order.tableNumber} • {order.orderRef}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status] || ''}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-clay-100 text-clay-700',
  PREPARING: 'bg-blue-100 text-blue-700',
  READY: 'bg-forest-100 text-forest-700',
  DELIVERED: 'bg-earth-100 text-earth-600',
  CANCELLED: 'bg-red-100 text-red-700',
};
