'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { BackButton } from '@/components/layout/BackButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { Cottage } from '@/types';
import { formatPrice, calculateNights, getToday } from '@/lib/utils';
import { useCouponStore } from '@/store/coupon';
import {
  Calendar, Home, User, Check, ArrowRight, ArrowLeft,
  Percent, Tag, Loader2, CreditCard, Sparkles, Gift, ChevronDown, Users
} from 'lucide-react';

const idProofTypes = ['Aadhaar Card', 'PAN Card', 'Passport', 'Driving License'];

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
];

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [selectedCottage, setSelectedCottage] = useState<string>(searchParams.get('cottageId') || '');
  const [adults, setAdults] = useState(parseInt(searchParams.get('adults') || '2'));
  const [children, setChildren] = useState(parseInt(searchParams.get('children') || '0'));
  const [nationality, setNationality] = useState(searchParams.get('nationality') || 'Indian');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [idProofType, setIdProofType] = useState('');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [cottages, setCottages] = useState<Cottage[]>([]);
  const [loading, setLoading] = useState(false);
  const [stepLoading, setStepLoading] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [dateError, setDateError] = useState('');
  const [couponInput, setCouponInput] = useState('');

  const { code, discount, discountType, isValid, error, loading: couponLoading, setCode, validateCoupon, removeCoupon } = useCouponStore();

  useEffect(() => {
    api.get('/cottages').then((res: any) => setCottages(res.data)).catch((err) => console.error('Failed to load cottages:', err));
  }, []);

  useEffect(() => {
    if (searchParams.get('cottageId') && searchParams.get('checkIn') && searchParams.get('checkOut')) {
      setStep(3);
    }
  }, [searchParams]);

  useEffect(() => {
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      fetch(`https://api.postalpincode.in/pincode/${pincode}`)
        .then(res => res.json())
        .then(data => {
          if (data[0]?.Status === 'Success' && data[0].PostOffice?.length > 0) {
            const po = data[0].PostOffice[0];
            setCity(po.District || po.Name || '');
            setState(po.State || '');
          }
        })
        .catch(() => {});
    }
  }, [pincode]);

  const handleCheckOutChange = (value: string) => {
    setCheckOut(value);
    setDateError('');
    if (checkIn && value && new Date(value) <= new Date(checkIn)) {
      setDateError('Check-out date must be after check-in date');
      setCheckOut('');
    }
  };

  const handleAvailabilityCheck = async () => {
    if (!checkIn || !checkOut) return;
    if (new Date(checkOut) <= new Date(checkIn)) {
      setDateError('Check-out date must be after check-in date');
      return;
    }
    setStepLoading(true);
    try {
      const res = await api.get(`/bookings/available-cottages?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`);
      setCottages(res.data);
      setStep(2);
    } catch (err: any) {
      console.error('Availability check failed:', err);
      alert(`Failed to check availability: ${err?.message || 'Unknown error'}`);
    } finally {
      setStepLoading(false);
    }
  };

  const handleCreateBooking = async () => {
    if (!selectedCottage || !guestName || !guestPhone) {
      alert('Please fill in all required fields (Name and Phone)');
      return;
    }
    if (!idProofType || !idProofNumber) {
      alert('Please provide ID proof details');
      return;
    }
    if (!address || !city || !state || !pincode) {
      alert('Please provide your complete address');
      return;
    }
    setPaymentLoading(true);
    try {
      const fullAddress = `${address}, ${city}, ${state} - ${pincode}`;
      const res = await api.post('/bookings', {
        guestName, guestEmail, guestPhone, nationality,
        cottageId: selectedCottage,
        checkIn, checkOut,
        adults, children,
        specialRequests,
        couponCode: isValid ? code : null,
        idProof: `${idProofType}: ${idProofNumber}`,
        address: fullAddress,
      });

      const { booking, razorpayOrder } = res.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'The Vedara',
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
            alert('Payment verification failed. Please contact support at +91-91188-82242.');
          }
        },
        prefill: { name: guestName, email: guestEmail, contact: guestPhone },
        theme: { color: '#2d5536' },
        modal: {
          ondismiss: () => setPaymentLoading(false),
        },
      };

      if (typeof (window as any).Razorpay === 'undefined') {
        throw new Error('Payment gateway failed to load. Please refresh the page or try a different browser.');
      }
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      setPaymentLoading(false);
    } catch (err: any) {
      alert(err.message || 'Booking failed. Please try again.');
      setPaymentLoading(false);
    }
  };

  const selectedCottageData = cottages.find((c) => c.id === selectedCottage);
  const nights = checkIn && checkOut ? calculateNights(new Date(checkIn), new Date(checkOut)) : 0;
  const subtotal = selectedCottageData ? selectedCottageData.pricePerNight * nights : 0;
  const extraGuests = Math.max(0, adults + children - 2);
  const extraGuestCharges = extraGuests * 1500 * nights;
  const discountAmount = isValid ? Math.min(discountType === 'PERCENTAGE' ? Math.round(subtotal * discount / 100) : discount, subtotal + extraGuestCharges) : 0;
  const taxes = Math.round((subtotal + extraGuestCharges - discountAmount) * 0.12);
  const totalAmount = subtotal + extraGuestCharges - discountAmount + taxes;

  const stepLabels = ['Dates', 'Cottage', 'Details', 'Confirmation'];

  return (
    <>
      <section className="pt-32 pb-12 bg-alabaster">
        <div className="vintage-container">
          <BackButton />
          <ScrollReveal>
            <p className="text-gold-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Reservations</p>
            <TextReveal as="h1" className="section-title max-w-3xl">
              Book Your Mountain Escape
            </TextReveal>
          </ScrollReveal>

          <div className="mt-10 mb-8">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex-1 flex flex-col items-center">
                  <motion.div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                      step >= s ? 'bg-gold-600 text-alabaster' : 'bg-gold-100 text-gold-400'
                    }`}
                    animate={step === s ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.4 }}
                  >
                    {step > s ? <Check className="w-4 h-4" /> : s}
                  </motion.div>
                  <span className={`text-xs mt-1.5 hidden sm:block ${step >= s ? 'text-gold-600 font-medium' : 'text-muted-foreground'}`}>
                    {stepLabels[s - 1]}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                    step > s ? 'bg-gold-600' : step === s ? 'bg-gold-400' : 'bg-gold-100'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="vintage-container">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className={`${step === 4 ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <ScrollReveal>
                      <div className="max-w-lg">
                        <h2 className="font-serif text-2xl text-foreground mb-6">Choose Your Dates</h2>
                        <div className="space-y-4">
                          <div>
                            <label className="vintage-label">Check-in Date *</label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400" />
                              <Input type="date" value={checkIn} onChange={(e) => { setCheckIn(e.target.value); setDateError(''); if (checkOut && new Date(checkOut) <= new Date(e.target.value)) { setCheckOut(''); setDateError('Check-out must be after check-in'); } }} min={getToday()} className="pl-10" />
                            </div>
                          </div>
                          <div>
                            <label className="vintage-label">Check-out Date *</label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400" />
                              <Input type="date" value={checkOut} onChange={(e) => handleCheckOutChange(e.target.value)} min={checkIn || new Date().toISOString().split('T')[0]} className="pl-10" />
                          {dateError && <p className="text-red-500 text-xs mt-1">{dateError}</p>}
                            </div>
                          </div>
                          <Button variant="primary" size="lg" onClick={handleAvailabilityCheck} disabled={!checkIn || !checkOut || stepLoading} className="w-full mt-4">
                            {stepLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking...</> : 'Check Availability'}
                          </Button>
                        </div>
                      </div>
                    </ScrollReveal>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <h2 className="font-serif text-2xl text-foreground mb-6">Select a Cottage</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {cottages.map((cottage) => {
                        const isAvailable = (cottage as any).isAvailable !== false;
                        return (
                          <motion.button
                            key={cottage.id}
                            onClick={() => { setSelectedCottage(cottage.id); setStep(3); }}
                            disabled={!isAvailable}
                            className={`vintage-card p-6 text-left transition-all ${
                              !isAvailable ? 'opacity-40 cursor-not-allowed' : 'hover:border-gold-400 cursor-pointer'
                            } ${selectedCottage === cottage.id ? 'border-gold-500 ring-2 ring-gold-500/20' : ''}`}
                            whileHover={isAvailable ? { y: -2 } : {}}
                          >
                            <h3 className="font-serif text-lg text-foreground mb-1">{cottage.name}</h3>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{cottage.shortDesc || cottage.description}</p>
                            <span className="text-gold-600 font-semibold">{formatPrice(cottage.pricePerNight)}<span className="text-gold-400 font-normal text-xs">/night</span></span>
                            {!isAvailable && <span className="block text-red-500 text-xs mt-2">Not available for selected dates</span>}
                          </motion.button>
                        );
                      })}
                    </div>
                    <Button variant="secondary" onClick={() => setStep(1)} className="mt-6">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <ScrollReveal>
                      <div className="max-w-2xl">
                        <h2 className="font-serif text-2xl text-foreground mb-6">Guest Details</h2>

                        {selectedCottageData && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gold-50 rounded-xl p-4 mb-6"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <Home className="w-4 h-4 text-gold-500" />
                              <p className="font-medium text-foreground">{selectedCottageData.name}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">{new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → {new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ({nights} {nights === 1 ? 'night' : 'nights'})</p>
                          </motion.div>
                        )}

                        <div className="space-y-4">
                          <div>
                            <label className="vintage-label">Full Name *</label>
                            <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="As on ID proof" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="vintage-label">Email</label>
                              <Input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="email@example.com" />
                            </div>
                            <div>
                              <label className="vintage-label">Phone *</label>
                              <Input 
                                type="tel" 
                                value={guestPhone} 
                                onChange={(e) => {
                                  const value = e.target.value.replace(/[^\d+\-\s]/g, '');
                                  setGuestPhone(value);
                                }} 
                                placeholder="+91 99999 99999" 
                              />
                            </div>
                          </div>
                          <div>
                            <label className="vintage-label">Nationality *</label>
                            <div className="relative">
                              <select
                                value={nationality}
                                onChange={(e) => setNationality(e.target.value)}
                                className="vintage-input appearance-none pr-10"
                              >
                                <option value="Indian">Indian</option>
                                <option value="Foreign">Foreign National</option>
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400 pointer-events-none" />
                            </div>
                          </div>

                          <div className="border-t border-border pt-4">
                            <h3 className="font-medium text-foreground mb-3 text-sm">ID Proof *</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="vintage-label">ID Type</label>
                                <div className="relative">
                                  <select
                                    value={idProofType}
                                    onChange={(e) => setIdProofType(e.target.value)}
                                    className="vintage-input appearance-none pr-10"
                                  >
                                    <option value="">Select ID type</option>
                                    {idProofTypes.map((type) => (
                                      <option key={type} value={type}>{type}</option>
                                    ))}
                                  </select>
                                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400 pointer-events-none" />
                                </div>
                              </div>
                              <div>
                                <label className="vintage-label">ID Number</label>
                                <Input value={idProofNumber} onChange={(e) => setIdProofNumber(e.target.value)} placeholder="Enter ID number" />
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-border pt-4">
                            <h3 className="font-medium text-foreground mb-3 text-sm">Address *</h3>
                            <div className="space-y-3">
                              <div>
                                <label className="vintage-label">Street Address</label>
                                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House/Flat no, Street, Locality" />
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="vintage-label">City</label>
                                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
                                </div>
                                <div>
                                  <label className="vintage-label">State</label>
                                  <div className="relative">
                                    <select
                                      value={state}
                                      onChange={(e) => setState(e.target.value)}
                                      className="vintage-input appearance-none pr-10"
                                    >
                                      <option value="">Select State</option>
                                      {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400 pointer-events-none" />
                                  </div>
                                </div>
                                <div>
                                  <label className="vintage-label">Pincode</label>
                                  <Input value={pincode} onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setPincode(v); }} placeholder="000000" maxLength={6} />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="vintage-label">Adults (max {selectedCottageData?.capacity || 4})</label>
                              <Input type="number" min={1} max={selectedCottageData?.capacity || 4} value={adults} onChange={(e) => { const v = parseInt(e.target.value) || 1; setAdults(Math.min(v, selectedCottageData?.capacity || 4)); }} />
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
                              placeholder="Any special requests or preferences?"
                              className="vintage-input min-h-[80px] resize-none"
                            />
                          </div>

                          <div className="border-t border-border pt-6 mt-6">
                            <label className="vintage-label">Have a coupon code?</label>
                            <div className="flex gap-3">
                              <div className="relative flex-1">
                                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400" />
                                <Input
                                  value={couponInput}
                                  onChange={(e) => { setCouponInput(e.target.value); setCode(e.target.value); }}
                                  placeholder="Enter coupon code"
                                  className="pl-10"
                                  onKeyDown={(e) => { if (e.key === 'Enter') validateCoupon(couponInput, subtotal); }}
                                />
                              </div>
                              <Button
                                variant="secondary"
                                onClick={() => validateCoupon(couponInput, subtotal)}
                                disabled={couponLoading || !couponInput}
                              >
                                {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                              </Button>
                            </div>
                            <AnimatePresence>
                              {error && (
                                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-xs mt-2">
                                  {error}
                                </motion.p>
                              )}
                              {isValid && (
                                <motion.div
                                  initial={{ opacity: 0, y: -5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="flex items-center gap-2 mt-2 text-gold-600"
                                >
                                  <Gift className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    Coupon applied! {discountType === 'PERCENTAGE' ? `${discount}% off` : `${formatPrice(discount)} off`}
                                  </span>
                                  <button onClick={removeCoupon} className="text-xs text-red-400 hover:text-red-500 ml-2">Remove</button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <div className="flex gap-3 mt-8">
                            <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
                              <ArrowLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                            <Button variant="primary" onClick={handleCreateBooking} disabled={paymentLoading} className="flex-1">
                              {paymentLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : `Pay ${formatPrice(totalAmount)}`}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </ScrollReveal>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <ScrollReveal>
                      <div className="max-w-lg mx-auto text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                          className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-6"
                        >
                          <Check className="w-8 h-8 text-gold-600" />
                        </motion.div>
                        <h2 className="font-serif text-3xl text-foreground mb-4">Booking Confirmed!</h2>
                        <p className="text-muted-foreground mb-6">
                          Thank you! Your booking has been confirmed. A confirmation email has been sent to {guestEmail || 'your email'}.
                        </p>
                        <div className="bg-gold-50 rounded-xl p-6 mb-8 text-left">
                          <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
                          <p className="font-mono font-bold text-foreground text-lg">{bookingData?.bookingRef}</p>
                          <div className="border-t border-border mt-4 pt-4 space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Status</span>
                              <Badge variant="success" size="sm">Confirmed</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Amount Paid</span>
                              <span className="font-medium text-foreground">{formatPrice(totalAmount)}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-6">
                          WhatsApp confirmation sent to +91-91188-82242 and email to vedararetreat@gmail.com
                        </p>
                        <Button variant="primary" onClick={() => router.push('/')}>Back to Home</Button>
                      </div>
                    </ScrollReveal>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {step < 4 && (
              <div className="lg:col-span-1">
                <div className="sticky top-28">
                  <ScrollReveal direction="right">
                    <div className="vintage-card p-6">
                      <h3 className="font-serif text-lg text-foreground mb-4">Booking Summary</h3>
                      <div className="space-y-3 text-sm">
                        {selectedCottageData && (
                          <div className="flex items-center gap-3 pb-3 border-b border-border">
                            <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center">
                              <Home className="w-4 h-4 text-gold-500" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{selectedCottageData.name}</p>
                              <p className="text-xs text-muted-foreground">{formatPrice(selectedCottageData.pricePerNight)} / night</p>
                            </div>
                          </div>
                        )}
                        {checkIn && checkOut && (
                          <div className="flex items-center gap-3 pb-3 border-b border-border">
                            <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-gold-500" />
                            </div>
                            <div>
                              <p className="text-foreground">{new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → {new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                              <p className="text-xs text-muted-foreground">{nights} {nights === 1 ? 'night' : 'nights'}</p>
                            </div>
                          </div>
                        )}

                        {nights > 0 && selectedCottageData && (
                          <div className="space-y-2 pt-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Room Subtotal</span>
                              <span className="text-foreground">{formatPrice(subtotal)}</span>
                            </div>
                            {extraGuests > 0 && (
                              <div className="flex justify-between text-amber-600">
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" /> Extra Guest ({extraGuests} × ₹1,500 × {nights} {nights === 1 ? 'night' : 'nights'})
                                </span>
                                <span>+{formatPrice(extraGuestCharges)}</span>
                              </div>
                            )}
                            {isValid && (
                              <div className="flex justify-between text-gold-600">
                                <span className="flex items-center gap-1">
                                  <Percent className="w-3 h-3" /> Discount ({discountType === 'PERCENTAGE' ? `${discount}%` : 'Fixed'})
                                </span>
                                <span>-{formatPrice(discountAmount)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">GST (12%)</span>
                              <span className="text-foreground">{formatPrice(taxes)}</span>
                            </div>
                            <div className="border-t border-border pt-2 flex justify-between">
                              <span className="font-serif text-lg text-foreground">Total</span>
                              <span className="font-bold text-lg text-gold-600">{formatPrice(totalAmount)}</span>
                            </div>
                          </div>
                        )}

                        {!checkIn && (
                          <p className="text-xs text-muted-foreground text-center py-4">Select dates to see summary</p>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
