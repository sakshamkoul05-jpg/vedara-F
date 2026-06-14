'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/auth';
import { endpoints } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Star, MessageSquare, Eye, EyeOff, TrendingUp } from 'lucide-react';
import type { Review } from '@/types';

type ToastState = { message: string; type: 'success' | 'error' } | null;

export default function ReviewsPage() {
  const { token } = useAuthStore();
  const [toast, setToast] = useState<ToastState>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyModal, setReplyModal] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type }); setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        endpoints.reviews.list(token),
        endpoints.reviews.stats(token)
      ]);
      setReviews(reviewsRes.data || []);
      setStats(statsRes.data);
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleReply = async () => {
    if (!token || !replyModal || !replyText) return;
    try { await endpoints.reviews.reply(replyModal.id, { reply: replyText }, token); showToast('Reply sent'); setReplyModal(null); setReplyText(''); loadData(); }
    catch (e: any) { showToast(e.message, 'error'); }
  };

  const handleToggleVisibility = async (id: string) => {
    if (!token) return;
    try { await endpoints.reviews.toggleVisibility(id, token); loadData(); }
    catch (e: any) { showToast(e.message, 'error'); }
  };

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}</div>
  );

  return (
    <div className="min-h-screen bg-alabaster pt-20">
      <div className="vintage-container py-8">
        {toast && <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${toast.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-forest-50 text-forest-700'}`}>{toast.message}</div>}

        <ScrollReveal>
          <div className="mb-8"><h1 className="font-serif text-3xl font-bold">Guest Reviews</h1><p className="text-muted-foreground mt-1">Manage feedback and replies</p></div>
        </ScrollReveal>

        {stats && (
          <ScrollReveal>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="vintage-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center"><Star className="w-5 h-5 text-yellow-600" /></div>
                  <div><p className="text-2xl font-bold">{stats.averageRating?.toFixed(1) || '0'}</p><p className="text-xs text-muted-foreground">Avg Rating</p></div>
                </div>
              </div>
              <div className="vintage-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center"><MessageSquare className="w-5 h-5 text-gold-600" /></div>
                  <div><p className="text-2xl font-bold">{stats.totalReviews || 0}</p><p className="text-xs text-muted-foreground">Total Reviews</p></div>
                </div>
              </div>
              <div className="vintage-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-green-600" /></div>
                  <div><p className="text-2xl font-bold">{stats.ratingDistribution?.[5] || 0}</p><p className="text-xs text-muted-foreground">5-Star Reviews</p></div>
                </div>
              </div>
              <div className="vintage-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><Star className="w-5 h-5 text-red-600" /></div>
                  <div><p className="text-2xl font-bold">{stats.ratingDistribution?.[1] || 0}</p><p className="text-xs text-muted-foreground">1-Star Reviews</p></div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}

        {loading ? <div className="vintage-card p-6 animate-pulse h-48" /> : reviews.length === 0 ? (
          <div className="vintage-card p-12 text-center"><Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">No reviews yet</p></div>
        ) : (
          <ScrollReveal>
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="vintage-card p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <StarRating rating={review.rating} />
                        <Badge className={review.isPublic ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                          {review.isPublic ? 'Public' : 'Hidden'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      {review.title && <h3 className="font-medium mb-1">{review.title}</h3>}
                      <p className="text-sm text-muted-foreground mb-2">{review.content}</p>
                      {review.pros && <p className="text-xs text-green-600">Pros: {review.pros}</p>}
                      {review.cons && <p className="text-xs text-red-600">Cons: {review.cons}</p>}
                      <p className="text-xs text-muted-foreground mt-1">By: {review.guest?.name || 'Anonymous'} | Source: {review.source}</p>
                      {review.reply && (
                        <div className="mt-3 p-3 rounded-lg bg-gold-50 border border-gold-100">
                          <p className="text-xs font-medium text-gold-700 mb-1">Reply:</p>
                          <p className="text-sm">{review.reply}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 ml-4">
                      {!review.reply && <Button variant="ghost" size="sm" onClick={() => { setReplyModal(review); setReplyText(''); }}><MessageSquare className="w-4 h-4" /></Button>}
                      <Button variant="ghost" size="sm" onClick={() => handleToggleVisibility(review.id)}>
                        {review.isPublic ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        )}

        <Dialog open={!!replyModal} onOpenChange={() => setReplyModal(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Reply to Review</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-earth-50">
                <StarRating rating={replyModal?.rating || 0} />
                <p className="text-sm mt-2">{replyModal?.content}</p>
              </div>
              <textarea className="w-full p-3 rounded-lg border border-earth-200 text-sm min-h-[100px]" placeholder="Write your reply..." value={replyText} onChange={e => setReplyText(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReplyModal(null)}>Cancel</Button>
              <Button onClick={handleReply} className="bg-gold-600 hover:bg-gold-700">Send Reply</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
