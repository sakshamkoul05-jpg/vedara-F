'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { endpoints } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Bell, CheckCheck, Trash2, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { NotificationItem } from '@/types';

type ToastState = { message: string; type: 'success' | 'error' } | null;

export default function NotificationsPage() {
  const { token } = useAuthStore();
  const [toast, setToast] = useState<ToastState>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type }); setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [notifRes, countRes] = await Promise.all([
        endpoints.notifications.list(token, filter === 'unread'),
        endpoints.notifications.unreadCount(token)
      ]);
      setNotifications(notifRes.data || []);
      setUnreadCount(countRes.data?.count || 0);
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [token, filter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleMarkRead = async (id: string) => {
    if (!token) return;
    try { await endpoints.notifications.markRead(id, token); loadData(); }
    catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    try { await endpoints.notifications.markAllRead(token); showToast('All marked as read'); loadData(); }
    catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    try { await endpoints.notifications.delete(id, token); loadData(); }
    catch (e: any) { showToast(e.message, 'error'); }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'ERROR': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-alabaster pt-20">
      <div className="vintage-container py-8">
        {toast && <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-forest-50 text-forest-700'}`}>{toast.message}</div>}

        <ScrollReveal>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl font-bold">Notifications</h1>
              <p className="text-muted-foreground mt-1">{unreadCount} unread notifications</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setFilter(f => f === 'all' ? 'unread' : 'all')}>
                {filter === 'all' ? 'Show Unread' : 'Show All'}
              </Button>
              {unreadCount > 0 && (
                <Button onClick={handleMarkAllRead} className="bg-gold-600 hover:bg-gold-700"><CheckCheck className="w-4 h-4 mr-2" /> Mark All Read</Button>
              )}
            </div>
          </div>
        </ScrollReveal>

        {loading ? <div className="vintage-card p-6 animate-pulse h-48" /> : notifications.length === 0 ? (
          <div className="vintage-card p-12 text-center"><Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">{filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p></div>
        ) : (
          <ScrollReveal>
            <div className="space-y-2">
              {notifications.map(notif => (
                <div key={notif.id} className={`vintage-card p-4 flex items-start gap-4 ${!notif.isRead ? 'border-l-4 border-l-gold-500 bg-gold-50/30' : ''}`}>
                  <div className="mt-0.5">{typeIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm">{notif.title}</h3>
                      {!notif.isRead && <Badge className="bg-gold-100 text-gold-700 text-xs">New</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1">
                    {!notif.isRead && (
                      <Button variant="ghost" size="sm" onClick={() => handleMarkRead(notif.id)}>
                        <CheckCheck className="w-4 h-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(notif.id)} className="text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
