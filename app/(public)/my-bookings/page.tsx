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
import { api, endpoints } from '@/lib/api';
import { Search, Calendar, Users, Home, Mail, Phone, Loader2 } from 'lucide-react';

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

export default function MyBookingsPage() {
  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState<'email' | 'phone'>('email');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState<string | undefined>();
  const [dialCode, setDialCode] = useState('91');

  // The lookup runs against whatever is typed, so the input is validated before
  // a request is made rather than after an empty result comes back.
  const validateQuery = () =>
    queryType === 'email'
      ? validateEmail(query)
      : validatePhone(query, { dialCode });

  const handleSearch = async () => {
    const invalid = validateQuery();
    setValidationError(invalid);
    if (invalid) return;

    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const res = queryType === 'email'
        ? await endpoints.bookings.myBookings(undefined, query.trim())
        : await endpoints.bookings.myBookings(query.trim());
      setBookings(res.data || []);
    } catch {
      setError('Unable to fetch bookings. Please try again.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-padding bg-background min-h-screen">
      <div className="vintage-container max-w-3xl">
        <ScrollReveal>
          <div className="text-center mb-12">
            <p className="text-primary text-sm tracking-[0.2em] uppercase mb-4 font-sans">Guest Portal</p>
            <TextReveal as="h1" className="font-serif text-3xl md:text-5xl text-foreground mb-4">
              My Bookings
            </TextReveal>
            <p className="text-muted-foreground text-base md:text-lg">
              Enter your email or phone number to view your reservations.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="glass-card-light rounded-2xl p-6 md:p-8">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setQueryType('email'); setQuery(''); setValidationError(undefined); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  queryType === 'email'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-earth-100 text-muted-foreground hover:bg-earth-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5 mr-1.5 inline" />
                Email
              </button>
              <button
                onClick={() => { setQueryType('phone'); setQuery(''); setValidationError(undefined); }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  queryType === 'phone'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-earth-100 text-muted-foreground hover:bg-earth-200'
                }`}
              >
                <Phone className="w-3.5 h-3.5 mr-1.5 inline" />
                Phone
              </button>
            </div>

            <div className="flex gap-3">
              {queryType === 'email' ? (
                <Input
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (validationError) setValidationError(undefined);
                  }}
                  onBlur={() => setValidationError(validateEmail(query, { required: false }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className={`flex-1 ${validationError ? 'border-red-500' : ''}`}
                  aria-invalid={Boolean(validationError)}
                />
              ) : (
                <div className="flex-1">
                  <PhoneInput
                    country="in"
                    preferredCountries={['in', 'gb', 'us', 'ae', 'au', 'sg']}
                    enableSearch
                    value={query}
                    onChange={(value, country: any) => {
                      setDialCode(country?.dialCode || '');
                      setQuery(value);
                      if (validationError) setValidationError(undefined);
                    }}
                    onBlur={() =>
                      setValidationError(validatePhone(query, { required: false, dialCode }))
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
                disabled={loading || !query.trim() || Boolean(validationError)}
                className="px-6"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {validationError && (
              <p className="text-red-500 text-sm mt-3">{validationError}</p>
            )}

            {error && (
              <p className="text-red-500 text-sm mt-3">{error}</p>
            )}
          </div>
        </ScrollReveal>

        {searched && !loading && (
          <ScrollReveal delay={0.15}>
            <div className="mt-8 space-y-4">
              {bookings.length === 0 ? (
                <div className="glass-card-light rounded-2xl p-8 text-center">
                  <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-1">No bookings found</p>
                  <p className="text-muted-foreground text-sm">
                    We couldn&apos;t find any reservations matching your details. Please check and try again.
                  </p>
                </div>
              ) : (
                bookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card-light rounded-2xl p-5 md:p-6"
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
                        <p className="font-medium text-foreground">
                          {new Date(booking.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Check-out
                        </p>
                        <p className="font-medium text-foreground">
                          {new Date(booking.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
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
                ))
              )}
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
