'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { validateEmail, validatePhone } from '@/lib/validation';
import { Badge } from '@/components/ui/badge';
import { endpoints } from '@/lib/api';
import { Search, Calendar, Users, Mail, Phone, Loader2, KeyRound, ShieldCheck } from 'lucide-react';
import { ServiceRequestPanel } from '@/components/booking/ServiceRequestPanel';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
  CONFIRMED: 'success',
  PENDING: 'warning',
  CANCELLED: 'danger',
  COMPLETED: 'success',
  HOLD: 'warning',
  RESERVED: 'warning',
  EXPIRED: 'danger',
  CHECKED_IN: 'success',
  CHECKED_OUT: 'success',
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export default function MyBookingsPage() {
  const [reference, setReference] = useState('');
  const [contact, setContact] = useState('');
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [booking, setBooking] = useState<any>(null);
  /** The reference and contact that this booking was found with. Kept apart
   *  from the inputs so editing the form does not invalidate the panel. */
  const [credential, setCredential] = useState<{ reference: string; contact: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState<string | undefined>();
  const [dialCode, setDialCode] = useState('91');

  const validateContact = () =>
    contactType === 'email' ? validateEmail(contact) : validatePhone(contact, { dialCode });

  const handleSearch = async () => {
    const invalid = validateContact();
    setValidationError(invalid);
    if (invalid || !reference.trim()) return;

    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const res = await endpoints.bookings.lookup(reference.trim(), contact.trim());
      setBooking(res.data || null);
      setCredential(res.data ? { reference: reference.trim(), contact: contact.trim() } : null);
    } catch (err: any) {
      // The route answers the same way for an unknown reference and for a
      // reference that is not yours, so its message is shown as-is.
      setError(err?.message || 'Unable to fetch your booking. Please try again.');
      setBooking(null);
      setCredential(null);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = reference.trim().length >= 4 && contact.trim().length > 0 && !validationError;

  return (
    <section className="section-padding bg-background min-h-screen">
      <div className="vintage-container max-w-3xl">
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="text-primary text-sm tracking-[0.2em] uppercase mb-4 font-sans">Guest Portal</p>
            <TextReveal as="h1" className="font-serif text-3xl md:text-5xl text-foreground mb-4">
              Manage Your Booking
            </TextReveal>
            <p className="text-muted-foreground text-base md:text-lg">
              Enter your booking reference along with the email or phone number you booked with.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="glass-card-light rounded-2xl p-6 md:p-8">
            <label className="block text-sm font-medium text-foreground mb-2" htmlFor="booking-reference">
              Booking reference
            </label>
            <div className="relative mb-1">
              <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                id="booking-reference"
                placeholder="VD1A2B3C4D5E"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                value={reference}
                onChange={(e) => setReference(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleSearch()}
                className="pl-9 font-mono tracking-wide"
              />
            </div>
            <p className="text-xs text-muted-foreground mb-5">
              It starts with <span className="font-mono">VD</span> and is on your confirmation email and WhatsApp message.
            </p>

            <p className="block text-sm font-medium text-foreground mb-2">Booked with</p>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => { setContactType('email'); setContact(''); setValidationError(undefined); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  contactType === 'email'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-earth-100 text-muted-foreground hover:bg-earth-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5 mr-1.5 inline" />
                Email
              </button>
              <button
                type="button"
                onClick={() => { setContactType('phone'); setContact(''); setValidationError(undefined); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  contactType === 'phone'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-earth-100 text-muted-foreground hover:bg-earth-200'
                }`}
              >
                <Phone className="w-3.5 h-3.5 mr-1.5 inline" />
                Phone
              </button>
            </div>

            <div className="flex gap-3">
              {contactType === 'email' ? (
                <Input
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  value={contact}
                  onChange={(e) => {
                    setContact(e.target.value);
                    if (validationError) setValidationError(undefined);
                  }}
                  onBlur={() => setValidationError(validateEmail(contact, { required: false }))}
                  onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleSearch()}
                  className={`flex-1 ${validationError ? 'border-red-500' : ''}`}
                  aria-invalid={Boolean(validationError)}
                />
              ) : (
                <div className="flex-1">
                  <PhoneInput
                    country="in"
                    preferredCountries={['in', 'gb', 'us', 'ae', 'au', 'sg']}
                    enableSearch
                    value={contact}
                    onChange={(value, country: any) => {
                      setDialCode(country?.dialCode || '');
                      setContact(value);
                      if (validationError) setValidationError(undefined);
                    }}
                    onBlur={() =>
                      setValidationError(validatePhone(contact, { required: false, dialCode }))
                    }
                    inputProps={{ name: 'phone', autoComplete: 'tel' }}
                    containerClass="vedara-phone-input"
                    inputClass={`!w-full !h-11 !bg-transparent !text-foreground ${validationError ? '!border-red-500' : '!border-border'}`}
                    buttonClass="!bg-transparent !border-border"
                    dropdownClass="!bg-background !text-foreground"
                  />
                </div>
              )}
              <Button
                variant="primary"
                onClick={handleSearch}
                disabled={loading || !canSubmit}
                className="px-6"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Find
                  </>
                )}
              </Button>
            </div>

            {validationError && <p className="text-red-500 text-sm mt-3">{validationError}</p>}
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

            <p className="text-xs text-muted-foreground mt-5 flex items-start gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
              Both details are needed so that nobody else can pull up your reservation.
              Lost your reference? Call us on{' '}
              <a href="tel:+918091921222" className="text-primary hover:underline whitespace-nowrap">+91-80919-21222</a>.
            </p>
          </div>
        </ScrollReveal>

        {searched && !loading && booking && (
          <ScrollReveal delay={0.15}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-light rounded-2xl p-5 md:p-6 mt-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Booking Reference</p>
                  <p className="font-mono font-semibold text-foreground">{booking.bookingRef}</p>
                </div>
                <Badge variant={statusVariant[booking.status] || 'secondary'} size="sm">
                  {booking.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Cottage</p>
                  <p className="font-medium text-foreground">{booking.cottage?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Check-in
                  </p>
                  <p className="font-medium text-foreground">{formatDate(booking.checkIn)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Check-out
                  </p>
                  <p className="font-medium text-foreground">{formatDate(booking.checkOut)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Guests
                  </p>
                  <p className="font-medium text-foreground">
                    {booking.adults} adult{booking.adults !== 1 ? 's' : ''}
                    {booking.children > 0 ? `, ${booking.children} child${booking.children !== 1 ? 'ren' : ''}` : ''}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Total: </span>
                  <span className="font-semibold text-foreground">
                    ₹{booking.finalAmount?.toLocaleString('en-IN')}
                  </span>
                  {booking.paymentStatus && (
                    <Badge
                      variant={booking.paymentStatus === 'PAID' ? 'success' : 'warning'}
                      size="sm"
                      className="ml-2"
                    >
                      {booking.paymentStatus}
                    </Badge>
                  )}
                </div>
                {booking.cottage?.slug && (
                  <a
                    href={`/cottages/slug/${booking.cottage.slug}`}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    View Cottage →
                  </a>
                )}
              </div>
            </motion.div>

            {credential && (
              <ServiceRequestPanel
                reference={credential.reference}
                contact={credential.contact}
                initialRequests={booking.serviceRequests ?? []}
                closedReason={booking.serviceRequestsClosed ?? null}
              />
            )}
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
