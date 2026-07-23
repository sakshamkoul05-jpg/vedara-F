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
import { formatPrice, calculateNights, getToday, parseDate } from '@/lib/utils';
import { useCouponStore } from '@/store/coupon';
import {
  Calendar, Home, User, Check, ArrowRight, ArrowLeft,
  Percent, Tag, Loader2, CreditCard, Sparkles, Gift, ChevronDown, Users
} from 'lucide-react';
import { countries } from '@/lib/countries';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const indianIdProofTypes = ['Aadhaar Card', 'Passport', 'Driving License'];
const foreignIdProofTypes = ['Passport'];

const idProofValidation: Record<string, { pattern: RegExp; message: string; maxLength: number }> = {
  'Aadhaar Card': { pattern: /^\d{12}$/, message: 'Aadhaar must be exactly 12 digits', maxLength: 12 },
  'Passport': { pattern: /^[A-Z]\d{7,8}$/i, message: 'Passport must be 1 letter + 7-8 digits (e.g., A1234567)', maxLength: 9 },
  'Driving License': { pattern: /^[A-Z]{2}\d{2}[\s-]?\d{4}[\s-]?\d{7}$/i, message: 'Invalid Driving License format', maxLength: 16 },
};

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
  const [nationality, setNationality] = useState(
    (() => {
      const n = searchParams.get('nationality');
      return n && /^[A-Z]{2}$/.test(n) ? n : 'IN';
    })()
  );
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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    if (checkIn && value && parseDate(value) <= parseDate(checkIn)) {
      setDateError('Check-out date must be after check-in date');
      setCheckOut('');
    }
  };

  const handleAvailabilityCheck = async () => {
    if (!checkIn || !checkOut) return;
    if (parseDate(checkOut) <= parseDate(checkIn)) {
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
      setFormErrors({ general: `Failed to check availability: ${err?.message || 'Unknown error'}` });
    } finally {
      setStepLoading(false);
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existing) {
        existing.addEventListener('load', () => resolve(true));
        existing.addEventListener('error', () => resolve(false));
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  };

  const handleCreateBooking = async () => {
    const errors: Record<string, string> = {};
    if (!guestName.trim()) errors.guestName = 'Name is required';
    else if (guestName.trim().length < 2) errors.guestName = 'Name must be at least 2 characters';
    else if (/\d/.test(guestName)) errors.guestName = 'Name should not contain numbers';
    if (!guestPhone) errors.guestPhone = 'Phone is required';
    if (guestEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) errors.guestEmail = 'Invalid email address';
    if (!idProofType) errors.idProofType = 'ID type is required';
    if (!idProofNumber.trim()) errors.idProofNumber = 'ID number is required';
    else {
      const idValidation = idProofValidation[idProofType];
      if (idValidation && !idValidation.pattern.test(idProofNumber.trim())) {
        errors.idProofNumber = idValidation.message;
      }
    }
    if (!address.trim()) errors.address = 'Address is required';
    if (!city.trim()) errors.city = 'City is required';
    if (!state.trim()) errors.state = 'State is required';
    if (!pincode.trim()) errors.pincode = 'Pincode is required';
    else if (nationality === 'IN' && !/^\d{6}$/.test(pincode)) errors.pincode = 'Pincode must be 6 digits';

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
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

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error('Payment configuration is missing. Please contact support.');
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Payment gateway failed to load. Please check your internet connection and try again.');
      }

      const options = {
        key: razorpayKey,
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
            setFormErrors({ general: 'Payment verification failed. Please contact support at +91-91188-82242.' });
          }
        },
        prefill: { name: guestName, email: guestEmail, contact: guestPhone },
        theme: { color: '#2d5536' },
        modal: {
          ondismiss: () => setPaymentLoading(false),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setFormErrors({ general: `Payment failed: ${response?.error?.description || 'Unknown error'}. Please try again.` });
        setPaymentLoading(false);
      });
      rzp.open();
      setPaymentLoading(false);
    } catch (err: any) {
      setFormErrors({ general: err.message || 'Booking failed. Please try again.' });
      setPaymentLoading(false);
    }
  };

  const parseField = (v: any): string[] => {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string' && v.trim().length > 0) {
      try {
        const parsed = JSON.parse(v);
        return Array.isArray(parsed) ? parsed : [v];
      } catch {
        return [v];
      }
    }
    return [];
  };

  const selectedCottageData = cottages.find((c) => c.id === selectedCottage);
  const nights = checkIn && checkOut ? calculateNights(parseDate(checkIn), parseDate(checkOut)) : 0;
  const subtotal = selectedCottageData ? selectedCottageData.pricePerNight * nights : 0;
  const cottageCapacity = selectedCottageData?.capacity ?? 2;
  const extraGuests = Math.max(0, adults + children - cottageCapacity);
  const cottageExtraGuestCharge = selectedCottageData?.extraGuestCharge ?? 1500;
  const extraGuestCharges = extraGuests * cottageExtraGuestCharge * nights;
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
                    step > s ? 'bg-gold-600' : step === s ? 'bg-gold-400' : 'bg-gold-100 dark:bg-gold-800/30'
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
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400 pointer-events-none" />
                              <Input type="date" value={checkIn} onChange={(e) => { setCheckIn(e.target.value); setDateError(''); if (checkOut && parseDate(checkOut) <= parseDate(e.target.value)) { setCheckOut(''); setDateError('Check-out must be after check-in'); } }} min={getToday()} className="pl-10" />
                            </div>
                          </div>
                          <div>
                            <label className="vintage-label">Check-out Date *</label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400 pointer-events-none" />
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
                        const imgs = parseField(cottage.images);
                        const img = imgs[0] || '';
                        const amenities = parseField(cottage.amenities);
                        return (
                          <motion.button
                            key={cottage.id}
                            onClick={() => { setSelectedCottage(cottage.id); setStep(3); }}
                            disabled={!isAvailable}
                            className={`vintage-card p-6 overflow-hidden text-left transition-all ${
                              !isAvailable ? 'opacity-40 cursor-not-allowed' : 'hover:border-gold-400 cursor-pointer'
                            } ${selectedCottage === cottage.id ? 'border-gold-500 ring-2 ring-gold-500/20' : ''}`}
                            whileHover={isAvailable ? { y: -2 } : {}}
                          >
                            {img && (
                              <div className="relative h-44 rounded-lg overflow-hidden mb-4">
                                <img src={img} alt={`${cottage.name} cottage at The Vedara`} className="w-full h-full object-cover" />
                                {cottage.category && (
                                  <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/90 text-[10px] font-sans uppercase tracking-wider text-gold-600">
                                    {cottage.category}
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="flex items-start justify-between gap-3 mb-1">
                              <h3 className="font-serif text-lg text-foreground">{cottage.name}</h3>
                              <span className="text-gold-600 font-semibold whitespace-nowrap">{formatPrice(cottage.pricePerNight)}<span className="text-gold-400 font-normal text-xs">/night</span></span>
                            </div>
                            {(cottage.capacity || cottage.bedrooms || cottage.bathrooms || cottage.size) && (
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
                                {cottage.capacity ? <span>{cottage.capacity} Guests</span> : null}
                                {cottage.bedrooms ? <span>{cottage.bedrooms} {cottage.bedrooms > 1 ? 'Bedrooms' : 'Bedroom'}</span> : null}
                                {cottage.bathrooms ? <span>{cottage.bathrooms} {cottage.bathrooms > 1 ? 'Bathrooms' : 'Bathroom'}</span> : null}
                                {cottage.size ? <span>{cottage.size} sqft</span> : null}
                              </div>
                            )}
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{cottage.shortDesc || cottage.description}</p>
                            {amenities.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {amenities.slice(0, 4).map((a: string, i: number) => (
                                  <span key={i} className="px-2 py-0.5 rounded-full bg-gold-50 text-gold-600 text-[10px] font-medium">{a}</span>
                                ))}
                                {amenities.length > 4 && <span className="px-2 py-0.5 text-[10px] text-muted-foreground">+{amenities.length - 4} more</span>}
                              </div>
                            )}
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

                        {formErrors.general && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
                            {formErrors.general}
                          </div>
                        )}

                        {selectedCottageData && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gold-50 dark:bg-gold-900/20 rounded-xl p-4 mb-6"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <Home className="w-4 h-4 text-gold-500" />
                              <p className="font-medium text-foreground">{selectedCottageData.name}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">{parseDate(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → {parseDate(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ({nights} {nights === 1 ? 'night' : 'nights'})</p>
                          </motion.div>
                        )}

                        <div className="space-y-4">
                          <div>
                            <label className="vintage-label">Full Name *</label>
                            <Input value={guestName} onChange={(e) => {
                              const val = e.target.value;
                              if (!/\d/.test(val)) setGuestName(val);
                              if (formErrors.guestName) setFormErrors(prev => { const n = { ...prev }; delete n.guestName; return n; });
                            }} placeholder="As on ID proof" className={formErrors.guestName ? 'border-red-500' : ''} />
                            {formErrors.guestName && <p className="text-red-500 text-xs mt-1">{formErrors.guestName}</p>}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="vintage-label">Email</label>
                              <Input type="email" value={guestEmail} onChange={(e) => {
                                setGuestEmail(e.target.value);
                                if (formErrors.guestEmail) setFormErrors(prev => { const n = { ...prev }; delete n.guestEmail; return n; });
                              }} placeholder="email@example.com" className={formErrors.guestEmail ? 'border-red-500' : ''} />
                              {formErrors.guestEmail && <p className="text-red-500 text-xs mt-1">{formErrors.guestEmail}</p>}
                            </div>
                            <div>
                              <label className="vintage-label">Phone *</label>
                              <PhoneInput
                                country={nationality.toLowerCase()}
                                value={guestPhone}
                                onChange={(phone) => {
                                  setGuestPhone(phone);
                                  if (formErrors.guestPhone) setFormErrors(prev => { const n = { ...prev }; delete n.guestPhone; return n; });
                                }}
                                inputProps={{ className: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2' }}
                                containerClass="!w-full"
                                inputClass={`!w-full !h-10 !text-sm ${formErrors.guestPhone ? '!border-red-500' : ''}`}
                                buttonClass="!border-input !bg-background"
                              />
                              {formErrors.guestPhone && <p className="text-red-500 text-xs mt-1">{formErrors.guestPhone}</p>}
                            </div>
                          </div>
                          <div>
                            <label className="vintage-label">Country *</label>
                            <div className="relative">
                              <select
                                value={nationality}
                                onChange={(e) => {
                                  setNationality(e.target.value);
                                  if (e.target.value !== 'IN') {
                                    setIdProofType('Passport');
                                  } else {
                                    setIdProofType('');
                                  }
                                }}
                                className="vintage-input appearance-none pr-10"
                              >
                                {countries.map((c) => (
                                  <option key={c.code} value={c.code}>{c.flag} {c.name}</option>
                                ))}
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
                                    onChange={(e) => {
                                      setIdProofType(e.target.value);
                                      if (formErrors.idProofType) setFormErrors(prev => { const n = { ...prev }; delete n.idProofType; return n; });
                                    }}
                                    className={`vintage-input appearance-none pr-10 ${formErrors.idProofType ? 'border-red-500' : ''}`}
                                    disabled={nationality !== 'IN'}
                                  >
                                    <option value="">Select ID type</option>
                                    {(nationality === 'IN' ? indianIdProofTypes : foreignIdProofTypes).map((type) => (
                                      <option key={type} value={type}>{type}</option>
                                    ))}
                                  </select>
                                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400 pointer-events-none" />
                                </div>
                                {formErrors.idProofType && <p className="text-red-500 text-xs mt-1">{formErrors.idProofType}</p>}
                              </div>
                              <div>
                                <label className="vintage-label">ID Number</label>
                                <Input
                                  value={idProofNumber}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    const rules = idProofValidation[idProofType];
                                    if (idProofType === 'Aadhaar Card') {
                                      setIdProofNumber(val.replace(/\D/g, '').slice(0, 12));
                                    } else if (idProofType === 'Passport') {
                                      setIdProofNumber(val.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 9));
                                    } else if (idProofType === 'Driving License') {
                                      setIdProofNumber(val.replace(/[^A-Za-z0-9\s-]/g, '').toUpperCase().slice(0, 16));
                                    } else if (rules) {
                                      setIdProofNumber(val.toUpperCase().slice(0, rules.maxLength));
                                    } else {
                                      setIdProofNumber(val);
                                    }
                                    if (formErrors.idProofNumber) setFormErrors(prev => { const n = { ...prev }; delete n.idProofNumber; return n; });
                                  }}
                                  placeholder={idProofValidation[idProofType]?.message || 'Enter ID number'}
                                  maxLength={idProofValidation[idProofType]?.maxLength || 20}
                                  disabled={!idProofType}
                                  className={formErrors.idProofNumber ? 'border-red-500' : ''}
                                />
                                {formErrors.idProofNumber && <p className="text-red-500 text-xs mt-1">{formErrors.idProofNumber}</p>}
                              </div>
                            </div>
                          </div>

                          <div className="border-t border-border pt-4">
                            <h3 className="font-medium text-foreground mb-3 text-sm">Address *</h3>
                            <div className="space-y-3">
                              <div>
                                <label className="vintage-label">Street Address</label>
                                <Input value={address} onChange={(e) => {
                                  setAddress(e.target.value);
                                  if (formErrors.address) setFormErrors(prev => { const n = { ...prev }; delete n.address; return n; });
                                }} placeholder="House/Flat no, Street, Locality" className={formErrors.address ? 'border-red-500' : ''} />
                                {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="vintage-label">City</label>
                                  <Input value={city} onChange={(e) => {
                                    setCity(e.target.value);
                                    if (formErrors.city) setFormErrors(prev => { const n = { ...prev }; delete n.city; return n; });
                                  }} placeholder="City" className={formErrors.city ? 'border-red-500' : ''} />
                                  {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
                                </div>
                                <div>
                                  <label className="vintage-label">{nationality === 'IN' ? 'State' : 'State / Region'}</label>
                                  {nationality === 'IN' ? (
                                    <div className="relative">
                                      <select
                                        value={state}
                                        onChange={(e) => {
                                          setState(e.target.value);
                                          if (formErrors.state) setFormErrors(prev => { const n = { ...prev }; delete n.state; return n; });
                                        }}
                                        className={`vintage-input appearance-none pr-10 ${formErrors.state ? 'border-red-500' : ''}`}
                                      >
                                        <option value="">Select State</option>
                                        {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                                      </select>
                                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gold-400 pointer-events-none" />
                                    </div>
                                  ) : (
                                    <Input value={state} onChange={(e) => {
                                      setState(e.target.value);
                                      if (formErrors.state) setFormErrors(prev => { const n = { ...prev }; delete n.state; return n; });
                                    }} placeholder="State or region" className={formErrors.state ? 'border-red-500' : ''} />
                                  )}
                                  {formErrors.state && <p className="text-red-500 text-xs mt-1">{formErrors.state}</p>}
                                </div>
                                <div>
                                  <label className="vintage-label">{nationality === 'IN' ? 'Pincode' : 'Postal Code'}</label>
                                  <Input value={pincode} onChange={(e) => {
                                    if (nationality === 'IN') {
                                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                      setPincode(val);
                                    } else {
                                      setPincode(e.target.value);
                                    }
                                    if (formErrors.pincode) setFormErrors(prev => { const n = { ...prev }; delete n.pincode; return n; });
                                  }} placeholder={nationality === 'IN' ? '6-digit pincode' : 'Postal code'} maxLength={nationality === 'IN' ? 6 : 20} className={formErrors.pincode ? 'border-red-500' : ''} />
                                  {formErrors.pincode && <p className="text-red-500 text-xs mt-1">{formErrors.pincode}</p>}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="vintage-label">
                                Adults
                                {selectedCottageData && (
                                  <span className="font-normal normal-case text-muted-foreground">
                                    {' '}(base {selectedCottageData.capacity}, extra guests +{formatPrice(cottageExtraGuestCharge)}/night each)
                                  </span>
                                )}
                              </label>
                              <select
                                value={adults}
                                onChange={(e) => setAdults(parseInt(e.target.value))}
                                className="vintage-input"
                              >
                                {Array.from({ length: (selectedCottageData?.capacity || 4) + 4 }, (_, i) => i + 1).map(n => (
                                  <option key={n} value={n}>{n}{n > (selectedCottageData?.capacity || 4) ? ' (extra)' : ''}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="vintage-label">Children</label>
                              <select
                                value={children}
                                onChange={(e) => setChildren(parseInt(e.target.value))}
                                className="vintage-input"
                              >
                                {[0, 1, 2, 3, 4].map(n => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
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
                          className="w-16 h-16 rounded-full bg-gold-100 dark:bg-gold-800/30 flex items-center justify-center mx-auto mb-6"
                        >
                          <Check className="w-8 h-8 text-gold-600" />
                        </motion.div>
                        <h2 className="font-serif text-3xl text-foreground mb-4">Booking Confirmed!</h2>
                        <p className="text-muted-foreground mb-6">
                          Thank you! Your booking has been confirmed. A confirmation email has been sent to {guestEmail || 'your email'}.
                        </p>
                        <div className="bg-gold-50 dark:bg-gold-900/20 rounded-xl p-6 mb-8 text-left">
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
                            <div className="w-10 h-10 rounded-lg bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center">
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
                            <div className="w-10 h-10 rounded-lg bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-gold-500" />
                            </div>
                            <div>
                              <p className="text-foreground">{parseDate(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → {parseDate(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
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
                                  <Users className="w-3 h-3" /> Extra Guest ({extraGuests} × {formatPrice(cottageExtraGuestCharge)} × {nights} {nights === 1 ? 'night' : 'nights'})
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
                            <p className="text-[10px] text-muted-foreground text-right">All rates are exclusive of applicable taxes (12% GST added at checkout)</p>
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
