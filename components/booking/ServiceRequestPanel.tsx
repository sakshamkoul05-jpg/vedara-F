'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { endpoints } from '@/lib/api';
import {
  Sparkles, Wrench, PackagePlus, UtensilsCrossed, HelpCircle,
  Plus, Loader2, Check, Clock,
} from 'lucide-react';

/**
 * Housekeeping and maintenance requests on a booking the guest has already
 * looked up.
 *
 * The reference and contact detail are passed back on submit because the API
 * re-proves ownership on every call — there is no session, so a successful
 * lookup a moment ago does not by itself authorise writing a request.
 */

type ServiceRequest = {
  id: string;
  category: string;
  priority: string;
  subject: string;
  description: string;
  preferredTime: string | null;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
};

const CATEGORIES = [
  { value: 'HOUSEKEEPING', label: 'Housekeeping', icon: Sparkles, hint: 'Cleaning, fresh towels, linen change' },
  { value: 'MAINTENANCE', label: 'Maintenance', icon: Wrench, hint: 'Heating, hot water, electrics, plumbing' },
  { value: 'AMENITIES', label: 'Amenities', icon: PackagePlus, hint: 'Extra blankets, toiletries, kettle' },
  { value: 'FOOD_BEVERAGE', label: 'Food & Drink', icon: UtensilsCrossed, hint: 'In-room dining, café orders' },
  { value: 'OTHER', label: 'Something else', icon: HelpCircle, hint: 'Anything we have not listed' },
] as const;

const PRIORITIES = [
  { value: 'LOW', label: 'Whenever suits' },
  { value: 'NORMAL', label: 'Today' },
  { value: 'URGENT', label: 'Urgent' },
] as const;

const TIME_SLOTS = ['Any time', 'Morning (8–11 AM)', 'Midday (11 AM–2 PM)', 'Afternoon (2–5 PM)', 'Evening (5–8 PM)'];

const statusVariant: Record<string, 'success' | 'warning' | 'secondary' | 'danger'> = {
  OPEN: 'warning',
  ACKNOWLEDGED: 'secondary',
  IN_PROGRESS: 'secondary',
  RESOLVED: 'success',
  CANCELLED: 'danger',
};

const statusLabel: Record<string, string> = {
  OPEN: 'Received',
  ACKNOWLEDGED: 'Seen by our team',
  IN_PROGRESS: 'On the way',
  RESOLVED: 'Done',
  CANCELLED: 'Cancelled',
};

const categoryLabel = (value: string) =>
  CATEGORIES.find((c) => c.value === value)?.label ?? 'Request';

export function ServiceRequestPanel({
  reference,
  contact,
  initialRequests,
  closedReason,
}: {
  reference: string;
  contact: string;
  initialRequests: ServiceRequest[];
  closedReason: string | null;
}) {
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string>('HOUSEKEEPING');
  const [priority, setPriority] = useState<string>('NORMAL');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [preferredTime, setPreferredTime] = useState(TIME_SLOTS[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [justSent, setJustSent] = useState(false);

  const reset = () => {
    setCategory('HOUSEKEEPING');
    setPriority('NORMAL');
    setSubject('');
    setDescription('');
    setPreferredTime(TIME_SLOTS[0]);
    setError('');
  };

  const submit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await endpoints.serviceRequests.create({
        reference,
        contact,
        category,
        priority,
        subject: subject.trim(),
        description: description.trim(),
        preferredTime,
      });
      setRequests((prev) => [res.data, ...prev]);
      setOpen(false);
      reset();
      setJustSent(true);
      setTimeout(() => setJustSent(false), 5000);
    } catch (err: any) {
      setError(err?.message || 'Could not submit your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = subject.trim().length >= 3 && description.trim().length >= 5 && !submitting;

  return (
    <div className="glass-card-light rounded-2xl p-5 md:p-6 mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <h2 className="font-serif text-xl text-foreground">Housekeeping &amp; Maintenance</h2>
        {!closedReason && !open && (
          <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            New request
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        {closedReason ?? 'Tell us what you need and our team will take it from here.'}
      </p>

      {justSent && (
        <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 rounded-lg px-3 py-2 mb-4">
          <Check className="w-4 h-4 shrink-0" />
          Request sent. Our team has it and will be with you shortly.
        </div>
      )}

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border border-border rounded-xl p-4 mb-5 space-y-4">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">What do you need?</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map(({ value, label, icon: Icon, hint }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setCategory(value)}
                      title={hint}
                      aria-pressed={category === value}
                      className={`text-left rounded-lg border px-3 py-2.5 transition-colors ${
                        category === value
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="block text-xs font-medium leading-tight">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="sr-subject">
                  In a few words
                </label>
                <Input
                  id="sr-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={120}
                  placeholder="Room heater is not warming up"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="sr-description">
                  Any detail that would help
                </label>
                <textarea
                  id="sr-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="It runs but stays cold. We are out walking until about 4 PM."
                  className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-y"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="sr-time">
                    Best time for us to come
                  </label>
                  <select
                    id="sr-time"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full h-11 rounded-lg border border-border bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot} className="bg-background">{slot}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="sr-priority">
                    How soon
                  </label>
                  <select
                    id="sr-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full h-11 rounded-lg border border-border bg-transparent px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {PRIORITIES.map(({ value, label }) => (
                      <option key={value} value={value} className="bg-background">{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <div className="flex flex-wrap gap-3">
                <Button variant="primary" onClick={submit} disabled={!canSubmit}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send request'}
                </Button>
                <Button variant="outline" onClick={() => { setOpen(false); reset(); }} disabled={submitting}>
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Something urgent — a leak, no heating on a cold night, anything to do with safety — is
                always faster by phone:{' '}
                <a href="tel:+918091921222" className="text-primary hover:underline whitespace-nowrap">
                  +91-80919-21222
                </a>.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {requests.length > 0 ? (
        <ul className="space-y-3">
          {requests.map((req) => (
            <li key={req.id} className="border border-border rounded-xl p-3.5">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{categoryLabel(req.category)}</p>
                  <p className="font-medium text-foreground text-sm">{req.subject}</p>
                </div>
                <Badge variant={statusVariant[req.status] || 'secondary'} size="sm">
                  {statusLabel[req.status] || req.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{req.description}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                {req.preferredTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {req.preferredTime}
                  </span>
                )}
                <span>
                  Raised{' '}
                  {new Date(req.createdAt).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
                  })}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        !open && !closedReason && (
          <p className="text-sm text-muted-foreground">You have not raised any requests for this stay.</p>
        )
      )}
    </div>
  );
}
