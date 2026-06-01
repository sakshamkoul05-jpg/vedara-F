'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Coffee, Plus, X, Check, Search, TrendingUp, ToggleLeft, ToggleRight, Save, Edit3, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function EmployeeCafePage() {
  const { user, token, logout, hydrated, hydrate } = useAuthStore();
  const router = useRouter();
  const [menu, setMenu] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState('orders');
  const [search, setSearch] = useState('');
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', categoryId: '', isVegetarian: true });

  // Analytics state
  const [dailySales, setDailySales] = useState<any>(null);
  const [monthlySales, setMonthlySales] = useState<any>(null);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [salesChart, setSalesChart] = useState<any[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

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
      } else if (tab === 'menu') {
        const res = await api.get('/cafe/menu?staff=true');
        setMenu(res.data || []);
      } else if (tab === 'analytics') {
        setAnalyticsLoading(true);
        const [dailyRes, monthlyRes, topRes, chartRes] = await Promise.all([
          api.get('/cafe/analytics/daily', token),
          api.get('/cafe/analytics/monthly', token),
          api.get('/cafe/analytics/top-items?limit=10', token),
          api.get('/cafe/analytics/sales-chart?days=7', token),
        ]);
        setDailySales(dailyRes.data);
        setMonthlySales(monthlyRes.data);
        setTopItems(topRes.data || []);
        setSalesChart(chartRes.data || []);
        setAnalyticsLoading(false);
      }
    } catch {}
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      await api.put(`/cafe/orders/${orderId}/status`, { status }, token);
      loadData();
    } catch {}
  };

  const handleToggleAvailability = async (itemId: string, current: boolean) => {
    setTogglingId(itemId);
    try {
      await api.put(`/cafe/items/${itemId}`, { isAvailable: !current }, token);
      setMenu(prev => prev.map(cat => ({
        ...cat,
        items: cat.items.map((i: any) => i.id === itemId ? { ...i, isAvailable: !current } : i),
      })));
    } catch {}
    setTogglingId(null);
  };

  const handleSavePrice = async (itemId: string) => {
    const price = parseFloat(priceInput);
    if (isNaN(price) || price <= 0) return;
    try {
      await api.put(`/cafe/items/${itemId}`, { price }, token);
      setMenu(prev => prev.map(cat => ({
        ...cat,
        items: cat.items.map((i: any) => i.id === itemId ? { ...i, price } : i),
      })));
    } catch {}
    setEditingPrice(null);
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
          {[
            { id: 'orders', label: 'Live Orders', icon: Coffee },
            { id: 'menu', label: 'Menu Editor', icon: Edit3 },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                tab === t.id ? 'bg-forest-600 text-cream-50' : 'bg-earth-100 dark:bg-earth-800 text-earth-600'
              }`}
            >
              <t.icon className="w-4 h-4 inline mr-1.5" /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'orders' && (
          <div className="space-y-4">
            <h2 className="font-serif text-lg text-foreground mb-4">Kitchen Display – Pending Orders</h2>
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
                <h3 className="font-serif text-lg text-foreground mb-4">Menu Inventory</h3>
                {menu.map((cat: any) => (
                  <div key={cat.id} className="mb-6">
                    <h4 className="font-medium text-forest-600 dark:text-forest-400 text-sm uppercase tracking-wide mb-2">{cat.name}</h4>
                    {cat.items
                      .filter((i: any) => !search || i.name.toLowerCase().includes(search.toLowerCase()))
                      .map((item: any) => (
                        <div key={item.id} className="flex items-center gap-2 py-2 border-b border-border/50">
                          <button
                            onClick={() => handleToggleAvailability(item.id, item.isAvailable)}
                            disabled={togglingId === item.id}
                            className={`flex-shrink-0 p-1 rounded transition-colors ${
                              item.isAvailable ? 'text-forest-600 hover:text-forest-500' : 'text-red-400 hover:text-red-500'
                            }`}
                            title={item.isAvailable ? 'Mark out of stock' : 'Mark in stock'}
                          >
                            {togglingId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : item.isAvailable ? (
                              <ToggleRight className="w-5 h-5" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${item.isAvailable ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                              {item.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {editingPrice === item.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={priceInput}
                                  onChange={(e) => setPriceInput(e.target.value)}
                                  className="w-20 px-2 py-1 text-xs rounded border border-border bg-background"
                                  autoFocus
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleSavePrice(item.id); if (e.key === 'Escape') setEditingPrice(null); }}
                                />
                                <button onClick={() => handleSavePrice(item.id)} className="p-1 text-forest-600 hover:text-forest-500">
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setEditingPrice(null)} className="p-1 text-muted-foreground hover:text-foreground">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className={`text-xs font-medium ${item.isAvailable ? 'text-foreground' : 'text-muted-foreground'}`}>
                                  {formatPrice(item.price)}
                                </span>
                                <button onClick={() => { setEditingPrice(item.id); setPriceInput(String(item.price)); }} className="p-1 text-muted-foreground hover:text-forest-600">
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
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

        {tab === 'analytics' && (
          <div>
            {analyticsLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-forest-600 animate-spin" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="vintage-card p-6">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Today's Sales</p>
                    <p className="text-3xl font-bold text-foreground">
                      {dailySales ? formatPrice(dailySales.total) : '₹0'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{dailySales?.count || 0} orders completed</p>
                  </div>
                  <div className="vintage-card p-6">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">This Month</p>
                    <p className="text-3xl font-bold text-foreground">
                      {monthlySales ? formatPrice(monthlySales.total) : '₹0'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{monthlySales?.count || 0} orders</p>
                  </div>
                </div>

                {/* Sales Chart */}
                {salesChart.length > 0 && (
                  <div className="vintage-card p-6">
                    <h3 className="font-serif text-lg text-foreground mb-4">Last 7 Days</h3>
                    <div className="flex items-end gap-2 h-32">
                      {salesChart.map((day: any) => {
                        const max = Math.max(...salesChart.map(d => d.total), 1);
                        const height = (day.total / max) * 100;
                        return (
                          <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[10px] text-muted-foreground">{formatPrice(day.total)}</span>
                            <div
                              className="w-full rounded-t bg-forest-500/70 hover:bg-forest-500 transition-all"
                              style={{ height: `${Math.max(height, 4)}%` }}
                            />
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Top Selling Items */}
                <div className="vintage-card p-6">
                  <h3 className="font-serif text-lg text-foreground mb-4">Top 10 Selling Items</h3>
                  {topItems.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No sales data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {topItems.map((item: any, i: number) => (
                        <div key={item.itemId} className="flex items-center gap-4">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            i < 3 ? 'bg-amber-100 text-amber-700' : 'bg-earth-100 text-earth-600'
                          }`}>{i + 1}</span>
                          <div className="flex-1">
                            <p className="text-sm text-foreground">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{formatPrice(item.price)} each</p>
                          </div>
                          <span className="text-sm font-semibold text-forest-600">{item.totalSold} sold</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
