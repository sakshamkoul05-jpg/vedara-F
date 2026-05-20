'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import { api } from '@/services/api'
import {
  Coffee, Plus, Edit, Trash2, Check, X,
  ClipboardList, TrendingUp, DollarSign, Users, Package, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollReveal } from '@/components/animations/ScrollReveal'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'

const TABS = ['Overview', 'Menu Management', 'Orders', 'Inventory', 'Staff'] as const
type Tab = typeof TABS[number]

const ORDER_STATUSES = ['PENDING', 'PREPARING', 'READY', 'DELIVERED'] as const
const STATUS_FLOW: Record<string, string> = {
  PENDING: 'PREPARING',
  PREPARING: 'READY',
  READY: 'DELIVERED',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PREPARING: 'bg-blue-100 text-blue-700',
  READY: 'bg-green-100 text-green-700',
  DELIVERED: 'bg-gray-100 text-gray-500',
}

interface MenuItem {
  _id: string
  name: string
  price: number
  image?: string
  available?: boolean
  vegetarian?: boolean
  categoryId?: string
}

interface Category {
  _id: string
  name: string
  description?: string
  items?: MenuItem[]
}

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface Order {
  _id: string
  items: OrderItem[]
  total: number
  status: string
  createdAt: string
  customerName?: string
}

interface InventoryItem {
  _id: string
  name: string
  stock: number
  unit: string
  threshold: number
}

interface StaffMember {
  _id: string
  name: string
  role: string
  present: boolean
  task?: string
}

export default function CafeAdminPage() {
  const { token } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('Overview')

  const [orders, setOrders] = useState<Order[]>([])
  const [menuData, setMenuData] = useState<Category[]>([])
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)

  const [newCategory, setNewCategory] = useState({ name: '', description: '' })
  const [newItem, setNewItem] = useState({ name: '', price: 0, categoryId: '', available: true, vegetarian: false })
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [showAddItem, setShowAddItem] = useState(false)

  useEffect(() => {
    fetchData()
  }, [token])

  async function fetchData() {
    if (!token) return
    setLoading(true)
    try {
      const [ordersRes, menuRes] = await Promise.all([
        api.get('/cafe/orders', token),
        api.get('/cafe/menu'),
      ])
      setOrders(ordersRes.data.orders || [])
      setMenuData(menuRes.data.data || [])

      try {
        const invRes = await api.get('/cafe/kitchen', token)
        const invData = invRes.data.data || []
        setInventory(invData.filter((i: any) => i.stock !== undefined))
        setStaff(invData.filter((i: any) => i.role !== undefined))
      } catch {
        setInventory([])
        setStaff([])
      }
    } catch (err) {
      console.error('Failed to fetch cafe data', err)
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(id: string, currentStatus: string) {
    const nextStatus = STATUS_FLOW[currentStatus]
    if (!nextStatus) return
    try {
      await api.put(`/cafe/orders/${id}/status`, { status: nextStatus }, token)
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: nextStatus } : o))
    } catch (err) {
      console.error('Failed to update order', err)
    }
  }

  async function handleAddCategory() {
    if (!newCategory.name.trim()) return
    try {
      await api.post('/cafe/categories', newCategory, token)
      setNewCategory({ name: '', description: '' })
      setShowAddCategory(false)
      await fetchData()
    } catch (err) {
      console.error('Failed to add category', err)
    }
  }

  async function handleAddItem() {
    if (!newItem.name.trim() || !newItem.categoryId) return
    try {
      await api.post('/cafe/items', newItem, token)
      setNewItem({ name: '', price: 0, categoryId: '', available: true, vegetarian: false })
      setShowAddItem(false)
      await fetchData()
    } catch (err) {
      console.error('Failed to add item', err)
    }
  }

  async function handleUpdateItem(item: MenuItem) {
    try {
      await api.put(`/cafe/items/${item._id}`, item, token)
      setEditingItem(null)
      await fetchData()
    } catch (err) {
      console.error('Failed to update item', err)
    }
  }

  function todayRevenue() {
    return orders
      .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, o) => sum + o.total, 0)
  }

  function pendingCount() {
    return orders.filter(o => o.status !== 'DELIVERED').length
  }

  function popularItems() {
    const count: Record<string, number> = {}
    orders.forEach(o => o.items?.forEach(i => { count[i.name] = (count[i.name] || 0) + i.quantity }))
    return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }

  function lowStockItems() {
    return inventory.filter(i => i.stock <= i.threshold)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream-50 dark:bg-earth-900">
        <Coffee className="w-8 h-8 text-forest-600 animate-pulse" />
      </div>
    )
  }

  const renderOverview = () => (
    <ScrollReveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="vintage-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList className="w-5 h-5 text-forest-600" />
          <span className="text-sm text-earth-500 font-manrope">Today&apos;s Orders</span>
        </div>
        <p className="text-3xl font-libre-caslon font-bold text-forest-700">
          {orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length}
        </p>
      </div>
      <div className="vintage-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign className="w-5 h-5 text-forest-600" />
          <span className="text-sm text-earth-500 font-manrope">Today&apos;s Revenue</span>
        </div>
        <p className="text-3xl font-libre-caslon font-bold text-forest-700">{formatPrice(todayRevenue())}</p>
      </div>
      <div className="vintage-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-5 h-5 text-forest-600" />
          <span className="text-sm text-earth-500 font-manrope">Popular Items</span>
        </div>
        <ul className="text-sm text-earth-600 font-manrope">
          {popularItems().slice(0, 3).map(([name, count]) => (
            <li key={name} className="truncate">{name} ({count})</li>
          ))}
        </ul>
      </div>
      <div className="vintage-card p-6">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-5 h-5 text-forest-600" />
          <span className="text-sm text-earth-500 font-manrope">Pending Orders</span>
        </div>
        <p className="text-3xl font-libre-caslon font-bold text-amber-600">{pendingCount()}</p>
      </div>
    </ScrollReveal>
  )

  const renderMenuManagement = () => (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button onClick={() => setShowAddCategory(!showAddCategory)} className="bg-forest-600 text-cream-50">
          <Plus className="w-4 h-4 mr-1" /> Category
        </Button>
        <Button onClick={() => setShowAddItem(!showAddItem)} className="bg-forest-600 text-cream-50">
          <Plus className="w-4 h-4 mr-1" /> Item
        </Button>
      </div>

      {showAddCategory && (
        <div className="vintage-card p-4 flex gap-3 items-end">
          <div>
            <label className="block text-xs text-earth-500 mb-1 font-manrope">Name</label>
            <input className="vintage-input" value={newCategory.name} onChange={e => setNewCategory(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs text-earth-500 mb-1 font-manrope">Description</label>
            <input className="vintage-input" value={newCategory.description} onChange={e => setNewCategory(p => ({ ...p, description: e.target.value }))} />
          </div>
          <Button onClick={handleAddCategory} className="bg-forest-600 text-cream-50"><Check className="w-4 h-4" /></Button>
          <Button onClick={() => setShowAddCategory(false)} className="bg-earth-200 text-earth-600"><X className="w-4 h-4" /></Button>
        </div>
      )}

      {showAddItem && (
        <div className="vintage-card p-4 grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs text-earth-500 mb-1 font-manrope">Name</label>
            <input className="vintage-input" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs text-earth-500 mb-1 font-manrope">Price</label>
            <input type="number" step="0.01" className="vintage-input" value={newItem.price || ''} onChange={e => setNewItem(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} />
          </div>
          <div>
            <label className="block text-xs text-earth-500 mb-1 font-manrope">Category</label>
            <select className="vintage-input" value={newItem.categoryId} onChange={e => setNewItem(p => ({ ...p, categoryId: e.target.value }))}>
              <option value="">Select...</option>
              {menuData.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <label className="flex items-center gap-1 text-xs text-earth-600">
              <input type="checkbox" checked={newItem.available} onChange={e => setNewItem(p => ({ ...p, available: e.target.checked }))} /> Available
            </label>
            <label className="flex items-center gap-1 text-xs text-earth-600">
              <input type="checkbox" checked={newItem.vegetarian} onChange={e => setNewItem(p => ({ ...p, vegetarian: e.target.checked }))} /> Veg
            </label>
          </div>
          <Button onClick={handleAddItem} className="bg-forest-600 text-cream-50 col-span-full md:col-span-1"><Check className="w-4 h-4 mr-1" /> Add</Button>
        </div>
      )}

      <div className="space-y-4">
        {menuData.map(category => (
          <ScrollReveal key={category._id} className="vintage-card p-4">
            <h3 className="text-lg font-libre-caslon font-bold text-forest-700 mb-3">{category.name}</h3>
            {category.description && <p className="text-sm text-earth-500 mb-3 font-manrope">{category.description}</p>}
            <div className="space-y-2">
              {(category.items || []).map(item => (
                <div key={item._id} className="flex items-center justify-between py-2 border-b border-earth-100 last:border-0">
                  {editingItem?._id === item._id ? (
                    <div className="flex gap-2 items-center w-full">
                      <input className="vintage-input flex-1" value={editingItem.name} onChange={e => setEditingItem(p => ({ ...p!, name: e.target.value }))} />
                      <input type="number" step="0.01" className="vintage-input w-20" value={editingItem.price} onChange={e => setEditingItem(p => ({ ...p!, price: parseFloat(e.target.value) || 0 }))} />
                      <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={editingItem.available ?? true} onChange={e => setEditingItem(p => ({ ...p!, available: e.target.checked }))} /> Avail</label>
                      <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={editingItem.vegetarian ?? false} onChange={e => setEditingItem(p => ({ ...p!, vegetarian: e.target.checked }))} /> Veg</label>
                      <Button onClick={() => handleUpdateItem(editingItem)} className="bg-forest-600 text-cream-50 p-1"><Check className="w-4 h-4" /></Button>
                      <Button onClick={() => setEditingItem(null)} className="bg-earth-200 text-earth-600 p-1"><X className="w-4 h-4" /></Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <Image src={item.image} alt={item.name} width={36} height={36} className="rounded object-cover" />
                        )}
                        <div>
                          <span className="font-manrope text-earth-800">{item.name}</span>
                          <div className="flex gap-2 mt-1">
                            {item.vegetarian && <Badge className="bg-green-100 text-green-700 text-xs">Veg</Badge>}
                            {item.available === false && <Badge className="bg-red-100 text-red-700 text-xs">Unavailable</Badge>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-manrope font-semibold text-forest-600">{formatPrice(item.price)}</span>
                        <button onClick={() => setEditingItem({ ...item })} className="text-earth-400 hover:text-forest-600"><Edit className="w-4 h-4" /></button>
                        <button className="text-earth-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  )

  const renderOrders = () => (
    <ScrollReveal className="space-y-4">
      {[...orders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map(order => (
          <div key={order._id} className="vintage-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-manrope font-semibold ${STATUS_COLORS[order.status] || ''}`}>{order.status}</span>
                <span className="text-xs text-earth-400 font-manrope">{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <p className="font-manrope text-earth-700 text-sm">
                {order.items?.map(i => `${i.name} x${i.quantity}`).join(', ')}
              </p>
              <p className="font-manrope font-semibold text-forest-600 mt-1">{formatPrice(order.total)}</p>
            </div>
            <div className="flex gap-2">
              {STATUS_FLOW[order.status] && (
                <Button onClick={() => updateOrderStatus(order._id, order.status)} className="bg-forest-600 text-cream-50 text-sm">
                  <Check className="w-4 h-4 mr-1" /> {STATUS_FLOW[order.status]}
                </Button>
              )}
            </div>
          </div>
        ))}
    </ScrollReveal>
  )

  const renderInventory = () => (
    <ScrollReveal className="space-y-4">
      {lowStockItems().length > 0 && (
        <div className="vintage-card p-4 border-l-4 border-amber-500 bg-amber-50/50">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span className="font-manrope font-semibold text-amber-700">Low Stock Alerts</span>
          </div>
          {lowStockItems().map(i => (
            <p key={i._id} className="text-sm text-amber-600 font-manrope">{i.name}: {i.stock} {i.unit} (threshold: {i.threshold})</p>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.map(item => {
          const isLow = item.stock <= item.threshold
          return (
            <div key={item._id} className="vintage-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-manrope font-medium text-earth-800">{item.name}</span>
                <Package className={`w-4 h-4 ${isLow ? 'text-amber-500' : 'text-forest-500'}`} />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-earth-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${isLow ? 'bg-amber-500' : 'bg-forest-500'}`} style={{ width: `${Math.min((item.stock / (item.threshold * 3)) * 100, 100)}%` }} />
                </div>
                <span className={`text-sm font-manrope font-semibold ${isLow ? 'text-amber-600' : 'text-earth-600'}`}>{item.stock} {item.unit}</span>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollReveal>
  )

  const renderStaff = () => (
    <ScrollReveal className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map(member => (
          <div key={member._id} className="vintage-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-manrope font-semibold text-earth-800">{member.name}</h4>
                <p className="text-xs text-earth-500 font-manrope">{member.role}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${member.present ? 'bg-green-500' : 'bg-gray-300'}`} />
            </div>
            {member.task && (
              <div className="bg-earth-50 rounded p-2 mt-2">
                <p className="text-xs text-earth-600 font-manrope">Task: {member.task}</p>
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <Button className="text-xs bg-forest-600 text-cream-50 py-1 px-3">
                <ClipboardList className="w-3 h-3 mr-1" /> Assign Task
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollReveal>
  )

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-earth-900">
      <div className="vintage-container py-8">
        <ScrollReveal className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Coffee className="w-8 h-8 text-forest-600" />
            <h1 className="text-3xl font-libre-caslon font-bold text-forest-800">Cafe Admin</h1>
          </div>
          <p className="text-earth-500 font-manrope">Manage your cafe operations</p>
        </ScrollReveal>

        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-manrope font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-forest-600 text-cream-50'
                  : 'bg-earth-100 text-earth-600 hover:bg-earth-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Overview' && renderOverview()}
        {activeTab === 'Menu Management' && renderMenuManagement()}
        {activeTab === 'Orders' && renderOrders()}
        {activeTab === 'Inventory' && renderInventory()}
        {activeTab === 'Staff' && renderStaff()}
      </div>
    </div>
  )
}
