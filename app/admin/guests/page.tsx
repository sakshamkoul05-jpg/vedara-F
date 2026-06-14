'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { api, endpoints } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Users, Search, Star, Award, TrendingUp, Plus, ExternalLink } from 'lucide-react';
import type { GuestProfile } from '@/types';

type ToastState = { message: string; type: 'success' | 'error' } | null;

export default function GuestsPage() {
  const { token } = useAuthStore();
  const [toast, setToast] = useState<ToastState>(null);
  const [profiles, setProfiles] = useState<GuestProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<GuestProfile | null>(null);
  const [loyaltyHistory, setLoyaltyHistory] = useState<any[]>([]);
  const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);
  const [awardPoints, setAwardPoints] = useState(0);
  const [awardDesc, setAwardDesc] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadProfiles = useCallback(async () => {
    if (!token) return;
    try {
      const res = await endpoints.guests.profiles(token);
      setProfiles(res.data || []);
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadProfiles(); }, [loadProfiles]);

  const loadLoyalty = async (profile: GuestProfile) => {
    setSelectedProfile(profile);
    if (!token) return;
    try {
      const res = await endpoints.guests.loyalty.history(profile.guestId, token);
      setLoyaltyHistory(res.data || []);
    } catch { setLoyaltyHistory([]); }
    setShowLoyaltyModal(true);
  };

  const handleAward = async () => {
    if (!token || !selectedProfile || !awardPoints) return;
    try {
      await endpoints.guests.loyalty.award(selectedProfile.guestId, { points: awardPoints, description: awardDesc }, token);
      showToast(`${awardPoints} points awarded`);
      setShowLoyaltyModal(false);
      setAwardPoints(0);
      setAwardDesc('');
      loadProfiles();
    } catch (e: any) { showToast(e.message, 'error'); }
  };

  const filtered = profiles.filter(p =>
    !search || p.guest?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.guest?.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.referralCode?.toLowerCase().includes(search.toLowerCase())
  );

  const tierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return 'bg-purple-100 text-purple-700';
      case 'GOLD': return 'bg-yellow-100 text-yellow-700';
      case 'SILVER': return 'bg-gray-100 text-gray-600';
      default: return 'bg-earth-100 text-earth-600';
    }
  };

  return (
    <div className="min-h-screen bg-alabaster pt-20">
      <div className="vintage-container py-8">
        {toast && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-forest-50 text-forest-700'}`}>
            {toast.message}
          </div>
        )}

        <ScrollReveal>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl font-bold text-foreground">Guest CRM</h1>
              <p className="text-muted-foreground mt-1">Manage guest profiles, loyalty points, and referrals</p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="vintage-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center"><Users className="w-5 h-5 text-gold-600" /></div>
                <div><p className="text-2xl font-bold">{profiles.length}</p><p className="text-xs text-muted-foreground">Total Guests</p></div>
              </div>
            </div>
            <div className="vintage-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center"><Star className="w-5 h-5 text-purple-600" /></div>
                <div><p className="text-2xl font-bold">{profiles.filter(p => p.tier === 'PLATINUM' || p.tier === 'GOLD').length}</p><p className="text-xs text-muted-foreground">Loyalty Members</p></div>
              </div>
            </div>
            <div className="vintage-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-forest-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-forest-600" /></div>
                <div><p className="text-2xl font-bold">{profiles.reduce((s, p) => s + p.loyaltyPoints, 0)}</p><p className="text-xs text-muted-foreground">Total Points</p></div>
              </div>
            </div>
            <div className="vintage-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Award className="w-5 h-5 text-blue-600" /></div>
                <div><p className="text-2xl font-bold">{profiles.reduce((s, p) => s + p.totalStays, 0)}</p><p className="text-xs text-muted-foreground">Total Stays</p></div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <div className="vintage-card p-4 mb-6">
            <div className="flex items-center gap-3">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name, email, or referral code..." value={search} onChange={e => setSearch(e.target.value)} className="border-0 bg-transparent" />
            </div>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="vintage-card p-6 animate-pulse h-48" />
        ) : filtered.length === 0 ? (
          <div className="vintage-card p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No guest profiles found</p>
          </div>
        ) : (
          <ScrollReveal>
            <div className="vintage-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-earth-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Guest</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Tier</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Points</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Stays</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Total Spent</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Referral Code</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(profile => (
                    <tr key={profile.id} className="border-b border-earth-50 hover:bg-earth-50/50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-sm">{profile.guest?.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{profile.guest?.email}</p>
                      </td>
                      <td className="px-4 py-3"><Badge className={tierColor(profile.tier)}>{profile.tier}</Badge></td>
                      <td className="px-4 py-3 text-sm font-medium">{profile.loyaltyPoints}</td>
                      <td className="px-4 py-3 text-sm">{profile.totalStays}</td>
                      <td className="px-4 py-3 text-sm">₹{profile.totalSpent.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{profile.referralCode || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => loadLoyalty(profile)}>
                          <Award className="w-4 h-4 mr-1" /> Loyalty
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        )}

        <Dialog open={showLoyaltyModal} onOpenChange={setShowLoyaltyModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Loyalty — {selectedProfile?.guest?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-earth-50"><p className="text-xl font-bold">{selectedProfile?.loyaltyPoints || 0}</p><p className="text-xs text-muted-foreground">Points</p></div>
                <div className="p-3 rounded-lg bg-earth-50"><p className="text-xl font-bold">{selectedProfile?.totalStays || 0}</p><p className="text-xs text-muted-foreground">Stays</p></div>
                <div className="p-3 rounded-lg bg-earth-50"><p className="text-xl font-bold">₹{(selectedProfile?.totalSpent || 0).toLocaleString()}</p><p className="text-xs text-muted-foreground">Spent</p></div>
              </div>
              <div className="flex gap-2">
                <Input type="number" placeholder="Points" value={awardPoints || ''} onChange={e => setAwardPoints(Number(e.target.value))} />
                <Input placeholder="Description" value={awardDesc} onChange={e => setAwardDesc(e.target.value)} />
                <Button onClick={handleAward} className="bg-gold-600 hover:bg-gold-700"><Plus className="w-4 h-4 mr-1" /> Award</Button>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {loyaltyHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4 text-sm">No loyalty history</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead><tr className="border-b"><th className="text-left py-2 text-xs">Date</th><th className="text-left py-2 text-xs">Type</th><th className="text-right py-2 text-xs">Points</th><th className="text-left py-2 text-xs">Description</th></tr></thead>
                    <tbody>
                      {loyaltyHistory.map((t: any) => (
                        <tr key={t.id} className="border-b border-earth-50">
                          <td className="py-2">{new Date(t.createdAt).toLocaleDateString()}</td>
                          <td className="py-2"><Badge className={t.type === 'EARNED' ? 'bg-green-100 text-green-700' : t.type === 'REDEEMED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}>{t.type}</Badge></td>
                          <td className="py-2 text-right font-medium">{t.points > 0 ? '+' : ''}{t.points}</td>
                          <td className="py-2 text-muted-foreground">{t.description || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
