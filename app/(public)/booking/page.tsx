'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Cottage } from '@/types';
import { formatPrice, calculateNights } from '@/lib/utils';

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [selectedCottage, setSelectedCottage] = useState<string>(searchParams.get('cottageId') || '');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [cottages, setCottages] = useState<Cottage[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    api.cottages.list().then((res: any) => setCottages(res.data)).catch(() => {});
  }, []);

  const handleAvailabilityCheck = async () => {
    if (!checkIn || !checkOut) return;
    setLoading(true);
    try {
      const res = await api.get(`/bookings/available-cottages?checkIn=${checkIn}&checkOut=${checkOut}`);
      setCottages(res.data);
      setStep(2);
    } catch (err) {
      alert('Failed to check availability');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedCottage || !guestName || !guestPhone) {
      alert('Please fill in all required fields');
      return;
    }
    setPaymentLoading(true);
    try {
      const res = await api.post('/bookings', {
        guestName, guestEmail, guestPhone,
        cottageId: selectedCottage,
        checkIn, checkOut,
        adults, children,
        specialRequests,
      });

      const { booking, razorpayOrder } = res.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Vedara Retreat',
        description: `Booking ${booking.bookingRef}`,
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          try {
            await api.post('/bookings/confirm-payment', {
              bookingId: booking.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            setBookingData({ ...booking, confirmed: true });
            setStep(4);
          } catch {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: { name: guestName, email: guestEmail, contact: guestPhone },
        theme: { color: '#2d5536' },
        modal: {
          ondismiss: () => setPaymentLoading(false),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message || 'Booking failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const selectedCottageData = cottages.find((c) => c.id === selectedCottage);
  const nights = checkIn && checkOut ? calculateNights(new Date(checkIn), new Date(checkOut)) : 0;
  const totalAmount = selectedCottageData ? selectedCottageData.pricePerNight * nights : 0;

  return (
    <>
      <section className="pt-32 pb-12 bg-cream-50 dark:bg-earth-900">
        <div className="vintage-container">
          <ScrollReveal>
            <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Reservations</p>
            <TextReveal as="h1" className="section-title max-w-3xl">
              Book Your Mountain Escape
            </TextReveal>
          </ScrollReveal>

          <div className="flex gap-2 mt-10 mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${step >= s ? 'bg-forest-600' : 'bg-earth-200 dark:bg-earth-700'}`} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground -mt-6 mb-8">
            <span className={step >= 1 ? 'text-forest-600 font-medium' : ''}>Dates</span>
            <span className={step >= 2 ? 'text-forest-600 font-medium' : ''}>Cottage</span>
            <span className={step >= 3 ? 'text-forest-600 font-medium' : ''}>Details</span>
            <span className={step >= 4 ? 'text-forest-600 font-medium' : ''}>Confirmation</span>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="vintage-container">
          {step === 1 && (
            <ScrollReveal>
              <div className="max-w-lg mx-auto">
                <h2 className="font-serif text-2xl text-foreground mb-6">Choose Your Dates</h2>
                <div className="space-y-4">
                  <div>
                    <label className="vintage-label">Check-in Date</label>
                    <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div>
                    <label className="vintage-label">Check-out Date</label>
                    <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} min={checkIn || new Date().toISOString().split('T')[0]} />
                  </div>
                  <Button variant="primary" size="lg" onClick={handleAvailabilityCheck} disabled={!checkIn || !checkOut || loading} className="w-full mt-4">
                    {loading ? 'Checking...' : 'Check Availability'}
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-serif text-2xl text-foreground mb-6">Select a Cottage</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cottages.map((cottage) => {
                  const isAvailable = (cottage as any).isAvailable !== false;
                  return (
                    <button
                      key={cottage.id}
                      onClick={() => { setSelectedCottage(cottage.id); setStep(3); }}
                      disabled={!isAvailable}
                      className={`vintage-card p-6 text-left transition-all ${
                        !isAvailable ? 'opacity-40 cursor-not-allowed' : 'hover:border-forest-400 cursor-pointer'
                      }`}
                    >
                      <h3 className="font-serif text-lg text-foreground mb-1">{cottage.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{cottage.shortDesc || cottage.description}</p>
                      <span className="text-forest-600 dark:text-forest-400 font-semibold">{formatPrice(cottage.pricePerNight)}<span className="text-earth-400 font-normal text-xs">/night</span></span>
                      {!isAvailable && <span className="block text-red-500 text-xs mt-2">Not available</span>}
                    </button>
                  );
                })}
              </div>
              <Button variant="secondary" onClick={() => setStep(1)} className="mt-6">Back</Button>
            </div>
          )}

          {step === 3 && (
            <ScrollReveal>
              <div className="max-w-lg mx-auto">
                <h2 className="font-serif text-2xl text-foreground mb-6">Guest Details</h2>
                {selectedCottageData && (
                  <div className="bg-earth-50 dark:bg-earth-800 rounded-xl p-4 mb-6">
                    <p className="font-medium text-foreground">{selectedCottageData.name}</p>
                    <p className="text-sm text-muted-foreground">{checkIn} → {checkOut} ({nights} nights)</p>
                    <p className="text-forest-600 font-semibold mt-1">{formatPrice(selectedCottageData.pricePerNight)} × {nights} = {formatPrice(totalAmount)}</p>
                  </div>
                )}
                <div className="space-y-4">
                  <div>
                    <label className="vintage-label">Full Name *</label>
                    <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="vintage-label">Email</label>
                      <Input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="email@example.com" />
                    </div>
                    <div>
                      <label className="vintage-label">Phone *</label>
                      <Input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="+91-99999-99999" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="vintage-label">Adults</label>
                      <Input type="number" min={1} max={10} value={adults} onChange={(e) => setAdults(parseInt(e.target.value) || 1)} />
                    </div>
                    <div>
                      <label className="vintage-label">Children</label>
                      <Input type="number" min={0} max={10} value={children} onChange={(e) => setChildren(parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                  <div>
                    <label className="vintage-label">Special Requests</label>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Any special requests?"
                      className="vintage-input min-h-[80px] resize-none"
                    />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">Back</Button>
                    <Button variant="primary" onClick={handleCreateBooking} disabled={paymentLoading} className="flex-1">
                      {paymentLoading ? 'Processing...' : `Pay ${formatPrice(totalAmount)}`}
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          )}

          {step === 4 && (
            <ScrollReveal>
              <div className="max-w-lg mx-auto text-center">
                <div className="w-16 h-16 rounded-full bg-forest-100 dark:bg-forest-900/50 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-forest-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="font-serif text-3xl text-foreground mb-4">Booking Confirmed!</h2>
                <p className="text-muted-foreground mb-6">
                  Thank you! Your booking has been confirmed. A confirmation email has been sent.
                </p>
                <div className="bg-earth-50 dark:bg-earth-800 rounded-xl p-6 mb-8 text-left">
                  <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
                  <p className="font-mono font-bold text-foreground text-lg">{bookingData?.bookingRef}</p>
                </div>
                <Button variant="primary" onClick={() => router.push('/')}>Back to Home</Button>
              </div>
            </ScrollReveal>
          )}
        </div>
      </section>
    </>
  );
}
