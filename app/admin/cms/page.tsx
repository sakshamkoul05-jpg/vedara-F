'use client';

import { useState, useEffect, useCallback } from 'react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/auth';
import { api, endpoints } from '@/lib/api';
import { formatDateShort, formatPrice } from '@/lib/utils';
import {
  Save, Plus, Trash2, Edit, X, Check, Image as ImageIcon, Star, Tag,
  HelpCircle, MessageSquare, Home, Settings, ChevronUp, ChevronDown, Link as LinkIcon,
  ToggleLeft, ToggleRight
} from 'lucide-react';

type ToastState = { message: string; type: 'success' | 'error' } | null;

export default function CMSPage() {
  const { token } = useAuthStore();
  const [activeTab, setActiveTab] = useState('settings');
  const [toast, setToast] = useState<ToastState>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <div className="min-h-screen bg-alabaster pt-20">
      <div className="vintage-container py-8">
        <div className="mb-6">
          <h1 className="font-serif text-3xl text-foreground">Content Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage all site content, cottages, media, and more</p>
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

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 flex-wrap h-auto">
            <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-1.5" /> Settings</TabsTrigger>
            <TabsTrigger value="cottages"><Home className="w-4 h-4 mr-1.5" /> Cottages</TabsTrigger>
            <TabsTrigger value="gallery"><ImageIcon className="w-4 h-4 mr-1.5" /> Gallery</TabsTrigger>
            <TabsTrigger value="testimonials"><Star className="w-4 h-4 mr-1.5" /> Testimonials</TabsTrigger>
            <TabsTrigger value="coupons"><Tag className="w-4 h-4 mr-1.5" /> Coupons</TabsTrigger>
            <TabsTrigger value="faqs"><HelpCircle className="w-4 h-4 mr-1.5" /> FAQs</TabsTrigger>
            <TabsTrigger value="messages"><MessageSquare className="w-4 h-4 mr-1.5" /> Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <SettingsTab token={token} showToast={showToast} />
          </TabsContent>
          <TabsContent value="cottages">
            <CottagesTab token={token} showToast={showToast} />
          </TabsContent>
          <TabsContent value="gallery">
            <GalleryTab token={token} showToast={showToast} />
          </TabsContent>
          <TabsContent value="testimonials">
            <TestimonialsTab token={token} showToast={showToast} />
          </TabsContent>
          <TabsContent value="coupons">
            <CouponsTab token={token} showToast={showToast} />
          </TabsContent>
          <TabsContent value="faqs">
            <FaqsTab token={token} showToast={showToast} />
          </TabsContent>
          <TabsContent value="messages">
            <MessagesTab token={token} showToast={showToast} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function SettingsTab({ token, showToast }: { token: string | null; showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [newSocial, setNewSocial] = useState({ platform: '', url: '' });

  useEffect(() => {
    if (!token) return;
    api.get('/cms/settings', token).then((res: any) => {
      setSettings(res.data || {});
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const handleSave = async (key: string) => {
    if (!token) return;
    setSaving(key);
    try {
      await api.put('/cms/settings', { key, value: settings[key] }, token);
      showToast(`${key} saved successfully`);
    } catch {
      showToast('Failed to save', 'error');
    } finally {
      setSaving(null);
    }
  };

  const handleAddSocial = async () => {
    if (!newSocial.platform || !newSocial.url) return;
    const links = settings.socialLinks || [];
    const updated = [...links, newSocial];
    try {
      await api.put('/cms/settings', { key: 'socialLinks', value: updated }, token);
      setSettings({ ...settings, socialLinks: updated });
      setNewSocial({ platform: '', url: '' });
      showToast('Social link added');
    } catch {
      showToast('Failed to add social link', 'error');
    }
  };

  const handleRemoveSocial = async (idx: number) => {
    const links = settings.socialLinks || [];
    const updated = links.filter((_: any, i: number) => i !== idx);
    try {
      await api.put('/cms/settings', { key: 'socialLinks', value: updated }, token);
      setSettings({ ...settings, socialLinks: updated });
      showToast('Social link removed');
    } catch {
      showToast('Failed to remove social link', 'error');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gold-100 rounded w-1/3" />
        <div className="h-48 bg-gold-100 rounded-2xl" />
      </div>
    );
  }

  const settingFields = [
    { key: 'siteName', label: 'Site Name' },
    { key: 'siteDescription', label: 'Site Description' },
    { key: 'contactEmail', label: 'Contact Email' },
    { key: 'contactPhone', label: 'Contact Phone' },
    { key: 'address', label: 'Address' },
    { key: 'metaTitle', label: 'Meta Title' },
    { key: 'metaDescription', label: 'Meta Description' },
  ];

  return (
    <div className="space-y-6">
      <ScrollReveal>
        <div className="glass-card-light rounded-2xl p-6">
          <h2 className="font-serif text-xl text-foreground mb-6">Site Settings</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {settingFields.map(({ key, label }) => (
              <div key={key}>
                <label className="vintage-label">{label}</label>
                <div className="flex gap-2">
                  <Input
                    value={settings[key] || ''}
                    onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                  />
                  <Button variant="primary" size="sm" onClick={() => handleSave(key)} disabled={saving === key}>
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <div className="glass-card-light rounded-2xl p-6">
          <h2 className="font-serif text-xl text-foreground mb-6">Feature Toggles</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-earth-50 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">AI Trip Planner</p>
                <p className="text-xs text-muted-foreground">Show or hide the AI Trip Planner widget on the website</p>
              </div>
              <button
                onClick={async () => {
                  const newVal = !(settings.aiPlannerEnabled ?? true);
                  setSettings({ ...settings, aiPlannerEnabled: newVal });
                  try {
                    await api.put('/cms/settings', { key: 'aiPlannerEnabled', value: newVal }, token);
                    showToast(`AI Trip Planner ${newVal ? 'enabled' : 'disabled'}`);
                  } catch {
                    setSettings({ ...settings, aiPlannerEnabled: !newVal });
                    showToast('Failed to update', 'error');
                  }
                }}
                className="transition-colors"
              >
                {settings.aiPlannerEnabled ?? true ? (
                  <ToggleRight className="w-8 h-8 text-green-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.05}>
        <div className="glass-card-light rounded-2xl p-6">
          <h2 className="font-serif text-xl text-foreground mb-6">Social Links</h2>
          <div className="space-y-3 mb-4">
            {(settings.socialLinks || []).map((link: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between bg-earth-50 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground capitalize">{link.platform}</span>
                  <span className="text-xs text-muted-foreground">{link.url}</span>
                </div>
                <button onClick={() => handleRemoveSocial(idx)} className="text-red-500 hover:text-red-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Input
              value={newSocial.platform}
              onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
              placeholder="Platform (e.g. instagram)"
              className="flex-1"
            />
            <Input
              value={newSocial.url}
              onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
              placeholder="URL"
              className="flex-[2]"
            />
            <Button variant="primary" onClick={handleAddSocial}><Plus className="w-4 h-4" /></Button>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

function CottagesTab({ token, showToast }: { token: string | null; showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [cottages, setCottages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCottage, setEditingCottage] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCottage, setNewCottage] = useState({
    name: '', slug: '', description: '', shortDesc: '', pricePerNight: 0,
    capacity: 2, bedrooms: 1, bathrooms: 1, category: '', amenities: [] as string[],
    images: [] as string[], sortOrder: 0,
  });

  useEffect(() => {
    if (!token) return;
    loadCottages();
  }, [token]);

  const loadCottages = async () => {
    try {
      const res = await api.get('/cms/cottages', token);
      setCottages(Array.isArray(res) ? res : (res.data || []));
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleEdit = (cottage: any) => {
    setEditingCottage({ ...cottage });
    setDialogOpen(true);
  };

  const handleToggleActive = async (cottage: any) => {
    if (!token) return;
    try {
      await api.put(`/cms/cottages/${cottage.id}`, { isActive: !cottage.isActive }, token);
      setCottages(cottages.map(c => c.id === cottage.id ? { ...c, isActive: !c.isActive } : c));
    } catch {
      showToast('Failed to toggle availability', 'error');
    }
  };

  const handleSave = async () => {
    if (!token || !editingCottage) return;
    setSaving(true);
    try {
      await api.put(`/cms/cottages/${editingCottage.id}`, editingCottage, token);
      showToast('Cottage updated');
      setDialogOpen(false);
      setEditingCottage(null);
      loadCottages();
    } catch {
      showToast('Failed to update cottage', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!token || !newCottage.name || !newCottage.description) {
      showToast('Name and description are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const slug = newCottage.slug || newCottage.name.toLowerCase().replace(/\s+/g, '-');
      await api.post('/cms/cottages', { ...newCottage, slug }, token);
      showToast('Cottage created');
      setCreateDialogOpen(false);
      setNewCottage({
        name: '', slug: '', description: '', shortDesc: '', pricePerNight: 0,
        capacity: 2, bedrooms: 1, bathrooms: 1, category: '', amenities: [],
        images: [], sortOrder: 0,
      });
      loadCottages();
    } catch {
      showToast('Failed to create cottage', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cottage: any) => {
    if (!token) return;
    if (!confirm(`Are you sure you want to delete "${cottage.name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/cms/cottages/${cottage.id}`, token);
      showToast('Cottage deleted');
      loadCottages();
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete cottage', 'error');
    }
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card-light rounded-2xl p-6 h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{cottages.length} cottages</p>
        <Button variant="primary" size="sm" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Cottage
        </Button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {cottages.map((cottage, idx) => (
          <ScrollReveal key={cottage.id} delay={idx * 0.05}>
            <div className="glass-card-light rounded-2xl p-5">
                <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-lg text-foreground truncate">{cottage.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{cottage.shortDesc || cottage.description?.slice(0, 60)}</p>
                </div>
                <button
                  onClick={() => handleToggleActive(cottage)}
                  className={`shrink-0 transition-colors ${cottage.isActive ? 'text-green-600 hover:text-green-800' : 'text-muted-foreground hover:text-foreground'}`}
                  title={cottage.isActive ? 'Click to deactivate' : 'Click to activate'}
                >
                  {cottage.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>{formatPrice(cottage.pricePerNight)}/night</span>
                <span>Up to {cottage.capacity} guests</span>
                <span>{cottage.bedrooms} bed</span>
              </div>
              <div className="flex items-center gap-2">
                {cottage.amenities?.slice(0, 3).map((a: string) => (
                  <Badge key={a} variant="secondary" size="sm">{a}</Badge>
                ))}
                {(cottage.amenities?.length || 0) > 3 && (
                  <span className="text-xs text-muted-foreground">+{cottage.amenities.length - 3}</span>
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
                <Badge variant={cottage.isActive ? 'success' : 'secondary'} size="sm">
                  {cottage.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(cottage)}>
                    <Edit className="w-3.5 h-3.5 mr-1.5" /> Edit
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleDelete(cottage)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Cottage</DialogTitle>
            <DialogDescription>Update cottage details, pricing, and amenities</DialogDescription>
          </DialogHeader>
          {editingCottage && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2">
                <label className="vintage-label">Name</label>
                <Input value={editingCottage.name} onChange={(e) => setEditingCottage({ ...editingCottage, name: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="vintage-label">Short Description</label>
                <Input value={editingCottage.shortDesc || ''} onChange={(e) => setEditingCottage({ ...editingCottage, shortDesc: e.target.value })} />
              </div>
              <div className="col-span-2">
                <label className="vintage-label">Description</label>
                <textarea
                  value={editingCottage.description || ''}
                  onChange={(e) => setEditingCottage({ ...editingCottage, description: e.target.value })}
                  className="vintage-input min-h-[100px] resize-y"
                  rows={4}
                />
              </div>
              <div>
                <label className="vintage-label">Price per Night (₹)</label>
                <Input type="number" value={editingCottage.pricePerNight} onChange={(e) => setEditingCottage({ ...editingCottage, pricePerNight: Number(e.target.value) })} />
              </div>
              <div>
                <label className="vintage-label">Capacity</label>
                <Input type="number" value={editingCottage.capacity} onChange={(e) => setEditingCottage({ ...editingCottage, capacity: Number(e.target.value) })} />
              </div>
              <div>
                <label className="vintage-label">Bedrooms</label>
                <Input type="number" value={editingCottage.bedrooms} onChange={(e) => setEditingCottage({ ...editingCottage, bedrooms: Number(e.target.value) })} />
              </div>
              <div>
                <label className="vintage-label">Bathrooms</label>
                <Input type="number" value={editingCottage.bathrooms} onChange={(e) => setEditingCottage({ ...editingCottage, bathrooms: Number(e.target.value) })} />
              </div>
              <div className="col-span-2">
                <label className="vintage-label">Amenities (comma separated)</label>
                <Input
                  value={(editingCottage.amenities || []).join(', ')}
                  onChange={(e) => setEditingCottage({ ...editingCottage, amenities: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                />
              </div>
              <div className="col-span-2">
                <label className="vintage-label">Images (URLs, one per line)</label>
                <textarea
                  value={(editingCottage.images || []).join('\n')}
                  onChange={(e) => setEditingCottage({ ...editingCottage, images: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                  className="vintage-input min-h-[80px] resize-y"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCottage.isActive}
                    onChange={(e) => setEditingCottage({ ...editingCottage, isActive: e.target.checked })}
                    className="rounded"
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input
                    type="number"
                    value={editingCottage.sortOrder || 0}
                    onChange={(e) => setEditingCottage({ ...editingCottage, sortOrder: Number(e.target.value) })}
                    className="w-16 vintage-input text-center"
                    placeholder="Order"
                  />
                  Sort Order
                </label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Cottage</DialogTitle>
            <DialogDescription>Add a new cottage to the property</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <label className="vintage-label">Name *</label>
              <Input value={newCottage.name} onChange={(e) => setNewCottage({ ...newCottage, name: e.target.value })} placeholder="e.g. Monal Haven" />
            </div>
            <div className="col-span-2">
              <label className="vintage-label">Slug (auto-generated if empty)</label>
              <Input value={newCottage.slug} onChange={(e) => setNewCottage({ ...newCottage, slug: e.target.value })} placeholder="monal-haven" />
            </div>
            <div className="col-span-2">
              <label className="vintage-label">Short Description</label>
              <Input value={newCottage.shortDesc} onChange={(e) => setNewCottage({ ...newCottage, shortDesc: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="vintage-label">Description *</label>
              <textarea
                value={newCottage.description}
                onChange={(e) => setNewCottage({ ...newCottage, description: e.target.value })}
                className="vintage-input min-h-[100px] resize-y"
                rows={4}
              />
            </div>
            <div>
              <label className="vintage-label">Price per Night (₹)</label>
              <Input type="number" value={newCottage.pricePerNight || ''} onChange={(e) => setNewCottage({ ...newCottage, pricePerNight: Number(e.target.value) })} />
            </div>
            <div>
              <label className="vintage-label">Capacity</label>
              <Input type="number" value={newCottage.capacity} onChange={(e) => setNewCottage({ ...newCottage, capacity: Number(e.target.value) })} />
            </div>
            <div>
              <label className="vintage-label">Bedrooms</label>
              <Input type="number" value={newCottage.bedrooms} onChange={(e) => setNewCottage({ ...newCottage, bedrooms: Number(e.target.value) })} />
            </div>
            <div>
              <label className="vintage-label">Bathrooms</label>
              <Input type="number" value={newCottage.bathrooms} onChange={(e) => setNewCottage({ ...newCottage, bathrooms: Number(e.target.value) })} />
            </div>
            <div className="col-span-2">
              <label className="vintage-label">Category</label>
              <Input value={newCottage.category} onChange={(e) => setNewCottage({ ...newCottage, category: e.target.value })} placeholder="e.g. Premium Duplex" />
            </div>
            <div className="col-span-2">
              <label className="vintage-label">Amenities (comma separated)</label>
              <Input
                value={newCottage.amenities.join(', ')}
                onChange={(e) => setNewCottage({ ...newCottage, amenities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              />
            </div>
            <div className="col-span-2">
              <label className="vintage-label">Images (URLs, one per line)</label>
              <textarea
                value={newCottage.images.join('\n')}
                onChange={(e) => setNewCottage({ ...newCottage, images: e.target.value.split('\n').map(s => s.trim()).filter(Boolean) })}
                className="vintage-input min-h-[80px] resize-y"
                rows={3}
              />
            </div>
            <div>
              <label className="vintage-label">Sort Order</label>
              <Input type="number" value={newCottage.sortOrder} onChange={(e) => setNewCottage({ ...newCottage, sortOrder: Number(e.target.value) })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleCreate} disabled={saving}>
              {saving ? 'Creating...' : 'Create Cottage'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GalleryTab({ token, showToast }: { token: string | null; showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ image: '', caption: '', category: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!token) return;
    endpoints.cms.gallery(token).then((res: any) => {
      setItems(res.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  const handleAdd = async () => {
    if (!newItem.image || !token) return;
    setAdding(true);
    try {
      await endpoints.cms.addGalleryItem(newItem, token);
      setNewItem({ image: '', caption: '', category: '' });
      const res = await endpoints.cms.gallery(token);
      setItems(res.data || []);
      showToast('Gallery item added');
    } catch {
      showToast('Failed to add item', 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await endpoints.cms.deleteGalleryItem(id, token);
      setItems(items.filter((i) => i.id !== id));
      showToast('Item deleted');
    } catch {
      showToast('Failed to delete item', 'error');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card-light rounded-2xl aspect-square" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ScrollReveal>
        <div className="glass-card-light rounded-2xl p-6">
          <h2 className="font-serif text-lg text-foreground mb-4">Add Gallery Item</h2>
          <div className="grid md:grid-cols-4 gap-3">
            <Input value={newItem.image} onChange={(e) => setNewItem({ ...newItem, image: e.target.value })} placeholder="Image URL" className="md:col-span-2" />
            <Input value={newItem.caption} onChange={(e) => setNewItem({ ...newItem, caption: e.target.value })} placeholder="Caption" />
            <div className="flex gap-2">
              <Input value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} placeholder="Category" />
              <Button variant="primary" onClick={handleAdd} disabled={adding}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No gallery items yet</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item, idx) => (
            <ScrollReveal key={item.id} delay={idx * 0.03}>
              <div className="glass-card-light rounded-2xl overflow-hidden group">
                <div className="aspect-square relative bg-gold-50">
                  {item.image ? (
                    <img src={item.image} alt={item.caption || ''} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm text-foreground truncate">{item.caption || 'No caption'}</p>
                  {item.category && <Badge variant="secondary" size="sm">{item.category}</Badge>}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}

function TestimonialsTab({ token, showToast }: { token: string | null; showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [items, setItems] = useState<any[]>([]);
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
      const res = await endpoints.cms.testimonials(token);
      setItems(res.data || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token || !editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        await api.put(`/cms/testimonials/${editing.id}`, editing, token);
      } else {
        await endpoints.cms.createTestimonial(editing, token);
      }
      showToast(editing.id ? 'Testimonial updated' : 'Testimonial created');
      setDialogOpen(false);
      setEditing(null);
      loadData();
    } catch {
      showToast('Failed to save testimonial', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await api.delete(`/cms/testimonials/${id}`, token);
      setItems(items.filter((i) => i.id !== id));
      showToast('Testimonial deleted');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const openNew = () => {
    setEditing({ name: '', content: '', rating: 5, image: '' });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing({ ...item });
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="glass-card-light rounded-2xl p-6 animate-pulse h-32" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> Add Testimonial</Button>
      </div>
      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No testimonials yet</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((item, idx) => (
            <ScrollReveal key={item.id} delay={idx * 0.05}>
              <div className="glass-card-light rounded-2xl p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gold-100 flex items-center justify-center text-gold-600 font-bold text-sm">
                      {item.name?.charAt(0) || 'T'}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{item.name}</p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < (item.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-earth-200'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground italic">&ldquo;{item.content}&rdquo;</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
            <DialogDescription>Fill in the testimonial details below</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 py-4">
              <div>
                <label className="vintage-label">Name</label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Guest name" />
              </div>
              <div>
                <label className="vintage-label">Content</label>
                <textarea
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  className="vintage-input min-h-[100px] resize-y"
                  rows={4}
                  placeholder="Testimonial text"
                />
              </div>
              <div>
                <label className="vintage-label">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button key={r} type="button" onClick={() => setEditing({ ...editing, rating: r })}>
                      <Star className={`w-6 h-6 ${r <= (editing.rating || 0) ? 'text-yellow-500 fill-yellow-500' : 'text-earth-200'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="vintage-label">Image URL (optional)</label>
                <Input value={editing.image || ''} onChange={(e) => setEditing({ ...editing, image: e.target.value })} placeholder="https://..." />
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

function CouponsTab({ token, showToast }: { token: string | null; showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [items, setItems] = useState<any[]>([]);
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
      const res = await endpoints.cms.coupons(token);
      setItems(res.data || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token || !editing) return;
    if (!editing.code || !editing.discount) { showToast('Code and discount are required', 'error'); return; }
    setSaving(true);
    try {
      if (editing.id) {
        await api.put(`/cms/coupons/${editing.id}`, editing, token);
      } else {
        await endpoints.cms.createCoupon(editing, token);
      }
      showToast(editing.id ? 'Coupon updated' : 'Coupon created');
      setDialogOpen(false);
      setEditing(null);
      loadData();
    } catch {
      showToast('Failed to save coupon', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await api.delete(`/cms/coupons/${id}`, token);
      setItems(items.filter((i) => i.id !== id));
      showToast('Coupon deleted');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const openNew = () => {
    setEditing({ code: '', discount: '', discountType: 'PERCENTAGE', minAmount: 0, maxUses: 100, maxUsesPerUser: 1, isActive: true, expiresAt: '', description: '', voucherType: 'BOTH' });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing({ ...item });
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="glass-card-light rounded-2xl p-6 animate-pulse h-32" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> Add Coupon</Button>
      </div>
      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No coupons yet</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <ScrollReveal key={item.id} delay={idx * 0.03}>
              <div className="glass-card-light rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-gold-100 px-3 py-1.5">
                      <code className="text-sm font-mono font-bold text-forest-700">{item.code}</code>
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-foreground">
                        {item.discountType === 'PERCENTAGE' ? `${item.discount}% OFF` : `₹${item.discount} OFF`}
                      </span>
                      <span className="text-xs text-muted-foreground ml-3">
                        Min: {formatPrice(item.minAmount || 0)} • Used: {item.usedCount || 0}/{item.maxUses || '∞'}
                      </span>
                      {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.isActive ? 'success' : 'secondary'} size="sm">
                      {item.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {item.expiresAt && new Date(item.expiresAt) < new Date() && (
                      <Badge variant="danger" size="sm">Expired</Badge>
                    )}
                    {item.voucherType && item.voucherType !== 'BOTH' && (
                      <Badge variant="outline" size="sm">{item.voucherType}</Badge>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit Coupon' : 'Add Coupon'}</DialogTitle>
            <DialogDescription>Create or modify a discount coupon</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <label className="vintage-label">Code</label>
                <Input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} placeholder="SUMMER20" />
              </div>
              <div>
                <label className="vintage-label">Discount</label>
                <Input type="number" value={editing.discount} onChange={(e) => setEditing({ ...editing, discount: Number(e.target.value) })} />
              </div>
              <div>
                <label className="vintage-label">Type</label>
                <Select
                  value={editing.discountType}
                  onValueChange={(v) => setEditing({ ...editing, discountType: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="vintage-label">Description</label>
                <Input value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Seasonal discount for summer bookings" />
              </div>
              <div>
                <label className="vintage-label">Min Amount (₹)</label>
                <Input type="number" value={editing.minAmount || 0} onChange={(e) => setEditing({ ...editing, minAmount: Number(e.target.value) })} />
              </div>
              <div>
                <label className="vintage-label">Max Uses</label>
                <Input type="number" value={editing.maxUses || 100} onChange={(e) => setEditing({ ...editing, maxUses: Number(e.target.value) })} />
              </div>
              <div>
                <label className="vintage-label">Max Per User</label>
                <Input type="number" value={editing.maxUsesPerUser || 1} onChange={(e) => setEditing({ ...editing, maxUsesPerUser: Number(e.target.value) })} />
              </div>
              <div className="col-span-2">
                <label className="vintage-label">Expires At</label>
                <Input type="date" value={editing.expiresAt ? editing.expiresAt.slice(0, 10) : ''} onChange={(e) => setEditing({ ...editing, expiresAt: e.target.value || null })} />
              </div>
              <div className="col-span-2">
                <label className="vintage-label">Voucher Scope</label>
                <Select value={editing.voucherType || 'BOTH'} onValueChange={(v) => setEditing({ ...editing, voucherType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BOTH">All Orders (Booking + Cafe)</SelectItem>
                    <SelectItem value="BOOKING">Booking Only</SelectItem>
                    <SelectItem value="CAFE">Cafe Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input type="checkbox" checked={editing.isActive} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} className="rounded" />
                  Active
                </label>
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

function FaqsTab({ token, showToast }: { token: string | null; showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [items, setItems] = useState<any[]>([]);
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
      const res = await endpoints.cms.faqs(token);
      setItems(res.data || []);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token || !editing) return;
    if (!editing.question || !editing.answer) { showToast('Question and answer are required', 'error'); return; }
    setSaving(true);
    try {
      if (editing.id) {
        await api.put(`/cms/faqs/${editing.id}`, editing, token);
      } else {
        await endpoints.cms.createFAQ(editing, token);
      }
      showToast(editing.id ? 'FAQ updated' : 'FAQ created');
      setDialogOpen(false);
      setEditing(null);
      loadData();
    } catch {
      showToast('Failed to save FAQ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await api.delete(`/cms/faqs/${id}`, token);
      setItems(items.filter((i) => i.id !== id));
      showToast('FAQ deleted');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const openNew = () => {
    setEditing({ question: '', answer: '', category: '', sortOrder: 0 });
    setDialogOpen(true);
  };

  const openEdit = (item: any) => {
    setEditing({ ...item });
    setDialogOpen(true);
  };

  if (loading) {
    return <div className="glass-card-light rounded-2xl p-6 animate-pulse h-32" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="primary" onClick={openNew}><Plus className="w-4 h-4 mr-1.5" /> Add FAQ</Button>
      </div>
      {items.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">No FAQs yet</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <ScrollReveal key={item.id} delay={idx * 0.03}>
              <div className="glass-card-light rounded-2xl p-5">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <HelpCircle className="w-4 h-4 text-gold-600 shrink-0" />
                      <h3 className="font-medium text-foreground text-sm">{item.question}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">{item.answer}</p>
                    {item.category && (
                      <Badge variant="secondary" size="sm" className="mt-2 ml-6">{item.category}</Badge>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}><Edit className="w-3.5 h-3.5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
            <DialogDescription>Frequently asked question entry</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 py-4">
              <div>
                <label className="vintage-label">Question</label>
                <Input value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} placeholder="What is your check-in time?" />
              </div>
              <div>
                <label className="vintage-label">Answer</label>
                <textarea
                  value={editing.answer}
                  onChange={(e) => setEditing({ ...editing, answer: e.target.value })}
                  className="vintage-input min-h-[100px] resize-y"
                  rows={4}
                  placeholder="Full answer text"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="vintage-label">Category</label>
                  <Input value={editing.category || ''} onChange={(e) => setEditing({ ...editing, category: e.target.value })} placeholder="e.g. Booking" />
                </div>
                <div>
                  <label className="vintage-label">Sort Order</label>
                  <Input type="number" value={editing.sortOrder || 0} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} />
                </div>
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

function MessagesTab({ token, showToast }: { token: string | null; showToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<any | null>(null);

  useEffect(() => {
    if (!token) return;
    loadData();
  }, [token]);

  const loadData = async () => {
    try {
      const res = await api.get('/cms/messages', token);
      setMessages(Array.isArray(res) ? res : (res.data || []));
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    if (!token) return;
    try {
      await api.put(`/cms/messages/${id}/read`, {}, token);
      setMessages(messages.map((m) => m.id === id ? { ...m, isRead: true } : m));
      if (viewing?.id === id) setViewing({ ...viewing, isRead: true });
    } catch {
      showToast('Failed to mark as read', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try {
      await api.delete(`/contact/${id}`, token);
      setMessages(messages.filter((m) => m.id !== id));
      if (viewing?.id === id) setViewing(null);
      showToast('Message deleted');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  if (loading) {
    return <div className="glass-card-light rounded-2xl p-6 animate-pulse h-32" />;
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <h2 className="font-serif text-lg text-foreground mb-4">
          Messages
          <span className="ml-2 text-sm font-sans font-normal text-muted-foreground">({messages.length})</span>
        </h2>
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">No messages yet</p>
        ) : (
          messages.map((msg, idx) => (
            <ScrollReveal key={msg.id} delay={idx * 0.03}>
              <button
                onClick={() => { setViewing(msg); if (!msg.isRead) handleMarkRead(msg.id); }}
                className={`w-full text-left glass-card-light rounded-2xl p-4 transition-all hover:shadow-md ${
                  !msg.isRead ? 'border-l-4 border-l-forest-500 bg-gold-50/30' : ''
                } ${viewing?.id === msg.id ? 'ring-2 ring-forest-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium text-foreground text-sm">{msg.name}</p>
                  <div className="flex items-center gap-2">
                    {!msg.isRead && <span className="w-2 h-2 rounded-full bg-gold-500" />}
                    <span className="text-xs text-muted-foreground">{msg.createdAt ? formatDateShort(msg.createdAt) : ''}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground truncate">{msg.subject || msg.message?.slice(0, 80)}</p>
                <p className="text-xs text-earth-500 mt-1">{msg.email}</p>
              </button>
            </ScrollReveal>
          ))
        )}
      </div>

      <div>
        {viewing ? (
          <ScrollReveal>
            <div className="glass-card-light rounded-2xl p-6 sticky top-24">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-serif text-lg text-foreground">{viewing.name}</h3>
                  <p className="text-sm text-muted-foreground">{viewing.email}</p>
                  {viewing.phone && <p className="text-sm text-muted-foreground">{viewing.phone}</p>}
                </div>
                <Badge variant={viewing.isRead ? 'secondary' : 'success'} size="sm">
                  {viewing.isRead ? 'Read' : 'New'}
                </Badge>
              </div>
              {viewing.subject && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Subject</p>
                  <p className="text-sm font-medium text-foreground">{viewing.subject}</p>
                </div>
              )}
              <div className="mb-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Message</p>
                <div className="rounded-xl bg-earth-50 p-4">
                  <p className="text-sm text-foreground whitespace-pre-wrap">{viewing.message}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="danger" size="sm" onClick={() => handleDelete(viewing.id)}>
                  <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                </Button>
              </div>
            </div>
          </ScrollReveal>
        ) : (
          <div className="glass-card-light rounded-2xl p-6 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground text-sm">Select a message to view</p>
          </div>
        )}
      </div>
    </div>
  );
}
