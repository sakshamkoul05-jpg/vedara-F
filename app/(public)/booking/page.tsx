'use client';

import { useState, useEffect, useRef } from 'react';
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
import { formatPrice, calculateNights, getToday, parseDate, isPastDate } from '@/lib/utils';
import { useCouponStore } from '@/store/coupon';
import {
  Calendar, Home, User, Check, ArrowRight, ArrowLeft,
  Percent, Tag, Loader2, CreditCard, Sparkles, Gift, ChevronDown, Users,
  Copy, CheckCheck, LifeBuoy
} from 'lucide-react';
import { countries } from '@/lib/countries';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { DatePicker } from '@/components/ui/DatePicker';
import { fetchPublicPricing, type PublicPricing } from '@/lib/from-rates';
import { childBreakfastBeddingCopy, PRICING_DISCLAIMER, RATE_FOOTNOTE } from '@/lib/pricing/customer-copy';

const FALLBACK_COTTAGES: Cottage[] = [
  { id: '1', slug: 'monal-haven', name: 'Monal Haven', description: 'Premium Duplex Family Suite', shortDesc: 'Premium Duplex Family Suite', category: 'Premium Duplex Family Suite', pricePerNight: 12000, heaterCharge: 600, capacity: 4, bedrooms: 2, bathrooms: 2, size: 850, amenities: ['wifi', 'fireplace', 'mountain view', 'balcony'], images: [], isActive: true, sortOrder: 1, isAvailable: true } as any,
  { id: '2', slug: 'koklass-cove', name: 'Koklass Cove', description: 'Premium Duplex Family Suite', shortDesc: 'Largest duplex with two viewing balconies', category: 'Premium Duplex Family Suite', pricePerNight: 12500, heaterCharge: 600, capacity: 5, bedrooms: 2, bathrooms: 2, size: 950, amenities: ['wifi', 'fireplace', 'mountain view', 'balcony'], images: [], isActive: true, sortOrder: 2, isAvailable: true } as any,
  { id: '3', slug: 'magpie-retreat', name: 'Magpie Retreat', description: 'Intimate Mountain View Suite — a sanctuary for couples and solo seekers, with a plush king-size bed and a private panoramic balcony.', shortDesc: 'Intimate Mountain View Suite — where serenity meets soul', category: 'Intimate Mountain View Suite', pricePerNight: 4500, heaterCharge: 600, capacity: 3, bedrooms: 1, bathrooms: 1, size: 270, amenities: ['wifi', 'fireplace', 'mountain view', 'balcony'], images: [], isActive: true, sortOrder: 3, isAvailable: true } as any,
  { id: '4', slug: 'whistling-thrush', name: 'Whistling Thrush', description: 'Charming duplex with a deep-soak bath tub, structural attic and dual-balcony setup. A perfect blend of rustic charm and modern comfort.', shortDesc: 'Charming duplex with deep-soak bath tub and dual balconies', category: 'Premium Duplex Family Suite', pricePerNight: 6500, heaterCharge: 600, capacity: 5, bedrooms: 2, bathrooms: 1, size: 556, amenities: ['wifi', 'fireplace', 'mountain view', 'coffee maker'], images: [], isActive: true, sortOrder: 4, isAvailable: true } as any,
  { id: '5', slug: 'flycatcher-nook', name: 'Flycatcher Nook', description: 'Intimate Mountain View Suite', shortDesc: 'Intimate Mountain View Suite', category: 'Intimate Mountain View Suite', pricePerNight: 7500, heaterCharge: 600, capacity: 2, bedrooms: 1, bathrooms: 1, size: 270, amenities: ['wifi', 'fireplace', 'mountain view', 'coffee maker'], images: [], isActive: true, sortOrder: 5, isAvailable: true } as any,
  { id: '6', slug: 'bulbul-nest', name: 'Bulbul Nest', description: 'Intimate Mountain View Suite', shortDesc: 'Intimate Mountain View Suite with workstation', category: 'Intimate Mountain View Suite', pricePerNight: 7500, heaterCharge: 600, capacity: 2, bedrooms: 1, bathrooms: 1, size: 270, amenities: ['wifi', 'fireplace', 'mountain view', 'coffee maker'], images: [], isActive: true, sortOrder: 6, isAvailable: true } as any,
  { id: '7', slug: 'the-finch-nook', name: 'The Finch Nook', description: 'Cozy Alpine Studio', shortDesc: 'Cozy Alpine Studio', category: 'Cozy Alpine Studio', pricePerNight: 5000, heaterCharge: 600, capacity: 1, bedrooms: 1, bathrooms: 1, size: 180, amenities: ['wifi', 'fireplace', 'mountain view'], images: [], isActive: true, sortOrder: 7, isAvailable: true } as any,
];

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

/**
 * The booking reference is the only credential a guest has for coming back to
 * their reservation, so the confirmation screen makes it easy to keep rather
 * than leaving them to transcribe it.
 */
function BookingReference({ reference }: { reference: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard is blocked in some embedded browsers; the text is on screen
      // either way, so there is nothing useful to tell the guest here.
    }
  };

  return (
    <div className="flex items-center gap-3">
      <p className="font-mono font-bold text-foreground text-lg tracking-wide">{reference}</p>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Booking reference copied' : 'Copy booking reference'}
        className="text-muted-foreground hover:text-primary transition-colors shrink-0"
      >
        {copied ? <CheckCheck className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function BookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [selectedCottage, setSelectedCottage] = useState<string>(searchParams.get('cottageId') || '');
  const [adults, setAdults] = useState(parseInt(searchParams.get('adults') || '2'));
  /**
   * One entry per child, holding that child's age. The age drives the child
   * policy, breakfast band and whether the guest counts as an adult (spec §4),
   * so it is collected up front rather than a bare child count.
   */
  const [childAges, setChildAges] = useState<number[]>(() => {
    const raw = searchParams.get('childAges');
    if (raw) {
      const parsed = raw
        .split(',')
        .map((v) => parseInt(v, 10))
        .filter((v) => Number.isInteger(v) && v >= 0 && v <= 17);
      if (parsed.length > 0) return parsed;
    }
    const count = parseInt(searchParams.get('children') || '0');
    return Number.isInteger(count) && count > 0 ? Array(Math.min(count, 6)).fill(-1) : [];
  });
  const [ratePlan, setRatePlan] = useState<'ROOM_ONLY' | 'BREAKFAST_INCLUDED'>('ROOM_ONLY');
  const [extraMattresses, setExtraMattresses] = useState(0);
  const [quote, setQuote] = useState<any>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState('');

  const children = childAges.length;
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
  // Result of the availability search (spec §11): only cottages that suit the
  // party, each priced under both rate plans.
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [incompatibleCount, setIncompatibleCount] = useState(0);
  const [searchError, setSearchError] = useState('');
  // Shown on the cottage step when a cottage chosen elsewhere could not be
  // carried through — it is full, or too small for the party.
  const [selectionNotice, setSelectionNotice] = useState('');
  // A cottage the guest already picked elsewhere (the Stays list or a cottage
  // page). Held as state, not read inside the search callback, so the decision
  // is made by whichever component instance is actually mounted.
  const [pendingPreselect, setPendingPreselect] = useState<string | null>(
    () => searchParams.get('cottageId') || null
  );
  const [publicPricing, setPublicPricing] = useState<PublicPricing>({ cottages: [], policy: null });

  const { code, discount, discountType, isValid, error, loading: couponLoading, setCode, validateCoupon, removeCoupon } = useCouponStore();

  useEffect(() => {
    api.get('/cottages').then((res: any) => {
      const data = Array.isArray(res.data) ? res.data.map((c: any) => ({
        ...c,
        pricePerNight: c.pricePerNight || FALLBACK_COTTAGES.find((f) => f.slug === c.slug)?.pricePerNight || 0,
        extraGuestCharge: c.extraGuestCharge || 1500,
        capacity: c.capacity || 2,
      })) : FALLBACK_COTTAGES;
      setCottages(data);
    }).catch(() => setCottages(FALLBACK_COTTAGES));
    fetchPublicPricing().then(setPublicPricing);
  }, []);

  // Arriving from a cottage or the Stays page with dates: run the search at
  // once so the guest lands on the priced cottage list. The occupancy check
  // (spec §11) still applies, so a cottage is never skipped straight to.
  const autoSearched = useRef(false);
  useEffect(() => {
    if (autoSearched.current) return;
    if (searchParams.get('checkIn') && searchParams.get('checkOut') && childAges.every((a) => a >= 0)) {
      autoSearched.current = true;
      handleAvailabilityCheck();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /**
   * Honour a cottage the guest already chose, once the search has confirmed it
   * suits the party and is free (spec §11), so they are not asked to pick a
   * cottage twice. Runs off `searchResults` rather than inside the fetch, so it
   * always acts on the mounted component.
   */
  useEffect(() => {
    if (!pendingPreselect || !searchResults) return;
    const chosen = searchResults.find((c) => c.cottageId === pendingPreselect);
    setPendingPreselect(null);

    if (chosen?.available) {
      setSelectedCottage(chosen.cottageId);
      setStep(3);
      return;
    }

    // Not usable: show the list instead, and say why.
    setSelectedCottage('');
    setSelectionNotice(
      chosen
        ? `${chosen.name} is already booked for these dates. Here are the cottages that are free.`
        : 'The cottage you picked cannot accommodate your party. Here are the ones that can.'
    );
  }, [pendingPreselect, searchResults]);

  /**
   * Re-prices the stay whenever anything that affects the tariff changes.
   * The quote is the single source of truth for every amount displayed.
   */
  useEffect(() => {
    const ready =
      selectedCottage && checkIn && checkOut && adults > 0 && childAges.every((a) => a >= 0);
    if (!ready) {
      setQuote(null);
      setQuoteError('');
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    setQuoteLoading(true);
    setQuoteError('');

    fetch('/api/pricing/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        cottageId: selectedCottage,
        checkIn,
        checkOut,
        adults,
        childAges,
        ratePlan,
        extraMattresses,
        couponCode: isValid ? code : null,
      }),
    })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setQuote(null);
          setQuoteError(json.error || 'Could not calculate the price for this stay.');
          return;
        }
        setQuote(json.data);
      })
      .catch((err) => {
        if (cancelled || err.name === 'AbortError') return;
        setQuote(null);
        setQuoteError('Could not calculate the price. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [selectedCottage, checkIn, checkOut, adults, childAges, ratePlan, extraMattresses, isValid, code]);

  // A mattress chosen for one cottage must not carry over to a cottage that
  // has none (spec §5.1).
  useEffect(() => {
    const cottage = cottages.find((c) => c.id === selectedCottage);
    if (cottage && !cottage.allowsExtraMattress && extraMattresses > 0) setExtraMattresses(0);
  }, [selectedCottage, cottages, extraMattresses]);

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
    if (isPastDate(value)) { setDateError('Check-out date cannot be in the past'); setCheckOut(''); return; }
    setCheckOut(value);
    setDateError('');
    if (checkIn && value && parseDate(value) <= parseDate(checkIn)) {
      setDateError('Check-out date must be after check-in date');
      setCheckOut('');
    }
  };

  const handleAvailabilityCheck = async () => {
    if (!checkIn || !checkOut) return;
    if (isPastDate(checkIn)) { setDateError('Check-in date cannot be in the past'); return; }
    if (isPastDate(checkOut)) { setDateError('Check-out date cannot be in the past'); return; }
    if (parseDate(checkOut) <= parseDate(checkIn)) {
      setDateError('Check-out date must be after check-in date');
      return;
    }
    if (childAges.some((a) => a < 0)) {
      setSearchError('Please select an age for every child.');
      return;
    }
    setStepLoading(true);
    setSearchError('');
    setSelectionNotice('');
    try {
      const res = await fetch('/api/pricing/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ checkIn, checkOut, adults, childAges }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        // e.g. a minimum-stay rule for these dates — shown, never papered over.
        setSearchError(json.error || 'We could not check availability. Please try again.');
        return;
      }
      setSearchResults((json.data.cottages ?? []) as any[]);
      setIncompatibleCount(json.data.incompatibleCount ?? 0);
      setStep(2);
    } catch (err: any) {
      console.error('Availability search failed:', err);
      setSearchError('We could not check availability. Please try again.');
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

      // The server prices the stay and stores the payable amount; nothing
      // about the total is sent from here.
      const res = await api.post('/bookings', {
        guestName, guestEmail, guestPhone,
        cottageId: selectedCottage,
        checkIn, checkOut,
        adults,
        childAges,
        ratePlan,
        extraMattresses,
        specialRequests,
        couponCode: isValid ? code : null,
        idProof: `${idProofType}: ${idProofNumber}`,
        address: fullAddress,
      });

      const { booking } = res.data;

      let razorpayOrder: any = null;
      try {
        const orderRes = await api.post('/bookings/create-payment-order', { bookingId: booking.id });
        razorpayOrder = orderRes.data;
      } catch (orderErr: any) {
        // The reservation is held either way, so fall through to the
        // pay-later confirmation rather than losing the booking.
        console.error('Could not start payment:', orderErr?.message);
      }

      if (!razorpayOrder || !razorpayOrder.id) {
        setBookingData({ ...booking, confirmed: false, pendingPayment: true });
        setStep(4);
        setPaymentLoading(false);
        return;
      }

      const razorpayKey = razorpayOrder.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
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
        currency: razorpayOrder.currency || 'INR',
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

  const maxAdults = selectedCottageData?.maxAdults ?? selectedCottageData?.capacity ?? 2;
  const maxOccupancy = selectedCottageData?.maxOccupancy ?? maxAdults + 1;
  const allowsMattress = Boolean(selectedCottageData?.allowsExtraMattress);
  const maxMattresses = selectedCottageData?.maxExtraMattresses ?? 0;

  // Every amount shown comes from the server quote. Nothing is priced here.
  const subtotal = quote?.subtotal ?? 0;
  const taxes = quote?.taxTotal ?? 0;
  const totalAmount = quote?.total ?? 0;
  const discountAmount = quote?.couponDiscount ?? 0;
  const allAgesEntered = childAges.every((a) => a >= 0);

  const adultAge = publicPricing.policy?.adultAgeThreshold ?? 12;
  // Largest party any cottage can take; the search then filters per cottage.
  const maxAdultsAny = Math.max(4, ...publicPricing.cottages.map((c) => c.maxAdults));
  const policyCopy = childBreakfastBeddingCopy(publicPricing.cottages, publicPricing.policy);
  const partyLabel = [
    `${adults} ${adults === 1 ? 'adult' : 'adults'}`,
    childAges.length > 0
      ? `${childAges.length} ${childAges.length === 1 ? 'child' : 'children'} (age ${childAges
          .map((a) => (a < 0 ? '?' : a))
          .join(', ')})`
      : null,
  ]
    .filter(Boolean)
    .join(', ');

  const stepLabels = ['Stay', 'Cottage', 'Details', 'Confirmation'];

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
                      <div className="max-w-xl">
                        <h2 className="font-serif text-2xl text-foreground mb-2">Your Stay</h2>
                        <p className="text-sm text-muted-foreground mb-6">
                          Tell us your dates and who is travelling. We will show only the cottages that suit your party, with both rate plans priced.
                        </p>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="vintage-label">Check-in Date *</label>
                              <DatePicker value={checkIn} onChange={(v) => { setCheckIn(v); setDateError(''); if (checkOut && parseDate(checkOut) <= parseDate(v)) { setCheckOut(''); setDateError('Check-out must be after check-in'); } }} min={getToday()} />
                            </div>
                            <div>
                              <label className="vintage-label">Check-out Date *</label>
                              <DatePicker value={checkOut} onChange={(v) => { handleCheckOutChange(v); }} min={checkIn || getToday()} />
                            </div>
                          </div>
                          {dateError && <p className="text-red-500 text-xs">{dateError}</p>}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="vintage-label" htmlFor="adults-select">
                                Adults <span aria-hidden="true" className="text-red-500">*</span>
                              </label>
                              <select
                                id="adults-select"
                                required
                                value={adults}
                                onChange={(e) => setAdults(parseInt(e.target.value))}
                                className="vintage-input"
                              >
                                {Array.from({ length: maxAdultsAny }, (_, i) => i + 1).map((n) => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="vintage-label" htmlFor="children-select">
                                Children <span aria-hidden="true" className="text-red-500">*</span>
                                <span className="font-normal normal-case text-muted-foreground"> (under {adultAge})</span>
                              </label>
                              <select
                                id="children-select"
                                required
                                value={childAges.length}
                                onChange={(e) => {
                                  const next = parseInt(e.target.value);
                                  setChildAges((prev) =>
                                    next > prev.length
                                      ? [...prev, ...Array(next - prev.length).fill(-1)]
                                      : prev.slice(0, next)
                                  );
                                }}
                                className="vintage-input"
                              >
                                {[0, 1, 2, 3, 4].map((n) => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* An age is required for every child: it decides the child
                              policy, the breakfast band and whether the guest counts
                              as an adult (spec §4, §11). */}
                          {childAges.length > 0 && (
                            <div>
                              <label className="vintage-label">
                                Age of each child <span aria-hidden="true" className="text-red-500">*</span>
                              </label>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {childAges.map((age, i) => (
                                  <select
                                    key={i}
                                    required
                                    aria-label={`Age of child ${i + 1}`}
                                    value={age < 0 ? '' : age}
                                    onChange={(e) => {
                                      const v = parseInt(e.target.value);
                                      setChildAges((prev) => prev.map((a, idx) => (idx === i ? v : a)));
                                    }}
                                    className={`vintage-input ${age < 0 ? 'border-amber-500' : ''}`}
                                  >
                                    <option value="" disabled>Child {i + 1}</option>
                                    {Array.from({ length: 18 }, (_, n) => n).map((n) => (
                                      <option key={n} value={n}>
                                        {n === 0 ? 'Under 1' : `${n} year${n === 1 ? '' : 's'}`}
                                      </option>
                                    ))}
                                  </select>
                                ))}
                              </div>
                            </div>
                          )}

                          {searchError && <p className="text-red-500 text-sm">{searchError}</p>}

                          <Button
                            variant="primary"
                            size="lg"
                            onClick={() => handleAvailabilityCheck()}
                            disabled={!checkIn || !checkOut || stepLoading || !allAgesEntered}
                            className="w-full mt-2"
                          >
                            {stepLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking...</> : 'Check Availability'}
                          </Button>

                          {/* Spec §13 customer copy, generated from live rates. */}
                          {policyCopy.length > 0 && (
                            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
                              {policyCopy.map((para, i) => (
                                <p key={i} className="text-xs text-muted-foreground leading-relaxed">{para}</p>
                              ))}
                            </div>
                          )}
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
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                      <h2 className="font-serif text-2xl text-foreground">Choose a Cottage &amp; Rate Plan</h2>
                      <button type="button" onClick={() => setStep(1)} className="text-sm text-gold-600 dark:text-gold-400 hover:underline">
                        Change dates or guests
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      {nights} {nights === 1 ? 'night' : 'nights'} · {partyLabel}. Showing the cottages that suit your party.
                    </p>

                    {selectionNotice && (
                      <p className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm text-amber-900 dark:text-amber-200 mb-5">
                        {selectionNotice}
                      </p>
                    )}

                    {searchResults && searchResults.length === 0 && (
                      <div className="vintage-card p-6 text-sm text-muted-foreground">
                        No cottage can accommodate {partyLabel} for these dates. Try fewer guests, or two cottages — we are happy to help at +91-91188-82242.
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      {(searchResults ?? []).map((r: any) => {
                        const info = cottages.find((c) => c.id === r.cottageId);
                        const img = parseField(info?.images)[0] || '';
                        return (
                          <div
                            key={r.cottageId}
                            className={`vintage-card p-6 overflow-hidden transition-all ${
                              !r.available ? 'opacity-50' : ''
                            } ${selectedCottage === r.cottageId ? 'border-gold-500 ring-2 ring-gold-500/20' : ''}`}
                          >
                            {img && (
                              <div className="relative h-44 rounded-lg overflow-hidden mb-4">
                                <img src={img} alt={`${r.name} cottage at The Vedara`} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <h3 className="font-serif text-lg text-foreground">{r.name}</h3>
                            {r.publicDescriptor && (
                              <p className="text-[11px] uppercase tracking-wider text-gold-600 dark:text-gold-400 mb-2">{r.publicDescriptor}</p>
                            )}
                            {info && (
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{info.shortDesc || info.description}</p>
                            )}

                            <div className="flex flex-wrap gap-2 mb-1">
                              {/* Spec §11: clearly identify whether Stay 4 Pay 3 applies. */}
                              {r.longStayApplied && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-[11px] font-medium">
                                  <Gift className="w-3 h-3" /> {r.longStayRuleName} applied
                                </span>
                              )}
                              {r.lastMinuteOffer && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-[11px] font-medium">
                                  <Sparkles className="w-3 h-3" /> {r.lastMinuteOffer.name}
                                </span>
                              )}
                            </div>

                            {r.available ? (
                              <div className="grid gap-2 mt-4">
                                {(['ROOM_ONLY', 'BREAKFAST_INCLUDED'] as const).map((planCode) => {
                                  const plan = r.plans[planCode];
                                  return (
                                    <button
                                      key={planCode}
                                      type="button"
                                      onClick={() => {
                                        setSelectedCottage(r.cottageId);
                                        setRatePlan(planCode);
                                        setExtraMattresses(0);
                                        setStep(3);
                                      }}
                                      className="flex items-center justify-between gap-3 rounded-lg border border-border hover:border-gold-500 hover:bg-gold-50/50 dark:hover:bg-white/5 px-4 py-3 text-left transition-colors"
                                    >
                                      <span>
                                        <span className="block text-sm font-medium text-foreground">
                                          {planCode === 'ROOM_ONLY' ? 'Room Only' : 'Breakfast Included'}
                                        </span>
                                        <span className="block text-[11px] text-muted-foreground">
                                          {formatPrice(plan.total)} total incl. GST
                                        </span>
                                      </span>
                                      <span className="text-gold-600 dark:text-gold-400 font-semibold whitespace-nowrap">
                                        {formatPrice(plan.perNight)}
                                        <span className="text-xs font-normal text-muted-foreground">/night</span>
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-red-500 text-xs mt-3">Not available for these dates</p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {incompatibleCount > 0 && (
                      <p className="text-xs text-muted-foreground mt-4">
                        {incompatibleCount} {incompatibleCount === 1 ? 'cottage is' : 'cottages are'} not shown because {incompatibleCount === 1 ? 'it cannot' : 'they cannot'} accommodate your party.
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Per-night prices are averages before GST for your party. {RATE_FOOTNOTE}
                    </p>
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

                          {/* Guests were chosen before the cottage (spec §11); changing
                              them re-runs the search so only suitable cottages show. */}
                          <div className="rounded-xl border border-border p-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="vintage-label mb-1">Guests</p>
                              <p className="text-sm text-foreground">{partyLabel}</p>
                            </div>
                            <button type="button" onClick={() => setStep(1)} className="text-sm text-gold-600 dark:text-gold-400 hover:underline">
                              Change
                            </button>
                          </div>

                          {/* Rate plan choice, offered once a cottage is selected (spec §11). */}
                          {selectedCottageData && (
                            <div>
                              <label className="vintage-label">Rate Plan</label>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {([
                                  { code: 'ROOM_ONLY', title: 'Room Only', desc: 'Accommodation only' },
                                  { code: 'BREAKFAST_INCLUDED', title: 'Breakfast Included', desc: '₹400 per adult, per night' },
                                ] as const).map((plan) => (
                                  <button
                                    key={plan.code}
                                    type="button"
                                    onClick={() => setRatePlan(plan.code)}
                                    aria-pressed={ratePlan === plan.code}
                                    className={`text-left rounded-lg border p-3 transition-colors ${
                                      ratePlan === plan.code
                                        ? 'border-gold-600 bg-gold-600/10'
                                        : 'border-border hover:border-gold-600/50'
                                    }`}
                                  >
                                    <span className="block text-sm font-medium text-foreground">{plan.title}</span>
                                    <span className="block text-xs text-muted-foreground">{plan.desc}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Never offered for cottages without an extra-mattress
                              option (spec 5.1). */}
                          {allowsMattress && (
                            <div>
                              <label className="vintage-label" htmlFor="mattress-select">
                                Extra Mattress
                                <span className="font-normal normal-case text-muted-foreground"> (₹1,250 per night)</span>
                              </label>
                              <select
                                id="mattress-select"
                                value={extraMattresses}
                                onChange={(e) => setExtraMattresses(parseInt(e.target.value))}
                                className="vintage-input"
                              >
                                {Array.from({ length: maxMattresses + 1 }, (_, i) => i).map((n) => (
                                  <option key={n} value={n}>{n === 0 ? 'Not required' : n}</option>
                                ))}
                              </select>
                              <p className="text-[11px] text-muted-foreground mt-2">
                                The extra bedding provided is a mattress only, not a separate bed or cot.
                              </p>
                            </div>
                          )}

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
                        <h2 className="font-serif text-3xl text-foreground mb-4">
                          {bookingData?.confirmed ? 'Booking Confirmed!' : 'Booking Created!'}
                        </h2>
                        <p className="text-muted-foreground mb-6">
                          {bookingData?.confirmed
                            ? `Thank you! Your booking has been confirmed. A confirmation email has been sent to ${guestEmail || 'your email'}.`
                            : 'Your booking has been created. Please complete the payment to confirm your reservation.'}
                        </p>
                        <div className="bg-gold-50 dark:bg-gold-900/20 rounded-xl p-6 mb-8 text-left">
                          <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
                          <BookingReference reference={bookingData?.bookingRef ?? ''} />
                          <div className="border-t border-border mt-4 pt-4 space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Status</span>
                              <Badge variant={bookingData?.confirmed ? 'success' : 'warning'} size="sm">
                                {bookingData?.confirmed ? 'Confirmed' : 'Pending Payment'}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Amount</span>
                              <span className="font-medium text-foreground">{formatPrice(totalAmount)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-earth-50 dark:bg-earth-900/20 rounded-xl p-4 mb-6 text-left flex gap-3">
                          <LifeBuoy className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Keep this reference safe — it is what you will need to pull up your
                            booking, request housekeeping or reach us about your stay. Our team has
                            your details and will be in touch on{' '}
                            <span className="text-foreground">{guestEmail || 'your email'}</span>.
                            Any questions in the meantime, call{' '}
                            <a href="tel:+919118882242" className="text-primary hover:underline whitespace-nowrap">
                              +91-91188-82242
                            </a>.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-center">
                          <Button variant="primary" onClick={() => router.push('/my-bookings')}>
                            Manage Your Booking
                          </Button>
                          <Button variant="outline" onClick={() => router.push('/')}>Back to Home</Button>
                        </div>
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

                        {/* The full tariff, taxes and final payable amount are
                            shown before payment (spec 18). Every figure comes
                            from the server quote. */}
                        {nights > 0 && selectedCottageData && quoteLoading && !quote && (
                          <p className="text-xs text-muted-foreground text-center py-4 flex items-center justify-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" /> Calculating your price...
                          </p>
                        )}

                        {quoteError && (
                          <p className="text-xs text-red-500 py-3">{quoteError}</p>
                        )}

                        {nights > 0 && selectedCottageData && quote && (
                          <div className="space-y-2 pt-1">
                            {/* Per-night breakdown for mixed weekday/weekend and
                                cross-season stays (spec 16). */}
                            <details className="group">
                              <summary className="flex justify-between cursor-pointer list-none">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180" />
                                  Accommodation ({quote.nights} {quote.nights === 1 ? 'night' : 'nights'})
                                </span>
                                <span className="text-foreground">{formatPrice(quote.accommodationBeforeBenefit)}</span>
                              </summary>
                              <div className="mt-2 space-y-1 pl-4 border-l border-border">
                                {quote.perNight.map((n: any) => (
                                  <div key={n.date} className="flex justify-between text-[11px]">
                                    <span className="text-muted-foreground">
                                      {parseDate(n.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                      <span className="opacity-60"> · {n.seasonName}{n.isWeekend ? ' · weekend' : ''}</span>
                                    </span>
                                    <span className={n.isComplimentary ? 'text-green-600 line-through' : 'text-foreground'}>
                                      {formatPrice(n.roomRate)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </details>

                            {quote.longStayApplied && (
                              <div className="flex justify-between text-green-600">
                                <span className="flex items-center gap-1">
                                  <Gift className="w-3 h-3" /> {quote.longStayRuleName}
                                </span>
                                <span>-{formatPrice(quote.longStayDiscount)}</span>
                              </div>
                            )}

                            {quote.breakfastTotal > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Breakfast ({quote.billableAdults} {quote.billableAdults === 1 ? 'adult' : 'adults'}
                                  {quote.childAges.filter((a: number) => a >= 6 && a < 12).length > 0
                                    ? ` + ${quote.childAges.filter((a: number) => a >= 6 && a < 12).length} child`
                                    : ''} x {quote.nights} {quote.nights === 1 ? 'night' : 'nights'})
                                </span>
                                <span className="text-foreground">{formatPrice(quote.breakfastTotal)}</span>
                              </div>
                            )}

                            {quote.mattressTotal > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Extra mattress ({quote.extraMattresses} x {quote.nights} {quote.nights === 1 ? 'night' : 'nights'})
                                </span>
                                <span className="text-foreground">{formatPrice(quote.mattressTotal)}</span>
                              </div>
                            )}

                            {quote.couponDiscount > 0 && (
                              <div className="flex justify-between text-gold-600">
                                <span className="flex items-center gap-1">
                                  <Percent className="w-3 h-3" /> Coupon {quote.couponCode}
                                </span>
                                <span>-{formatPrice(quote.couponDiscount)}</span>
                              </div>
                            )}

                            <div className="flex justify-between border-t border-border pt-2">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span className="text-foreground">{formatPrice(quote.subtotal)}</span>
                            </div>

                            {quote.taxBreakdown.map((t: any) => (
                              <div key={t.slabName} className="flex justify-between">
                                <span className="text-muted-foreground">{t.slabName}</span>
                                <span className="text-foreground">{formatPrice(t.tax)}</span>
                              </div>
                            ))}

                            <div className="border-t border-border pt-2 flex justify-between">
                              <span className="font-serif text-lg text-foreground">Total Payable</span>
                              <span className="font-bold text-lg text-gold-600">{formatPrice(quote.total)}</span>
                            </div>

                            {quote.notes.length > 0 && (
                              <ul className="pt-1 space-y-1">
                                {quote.notes.map((note: string, i: number) => (
                                  <li key={i} className="text-[10px] text-muted-foreground leading-snug">{note}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}

                        {quote && (
                          <div className="mt-4 pt-3 border-t border-border space-y-1.5">
                            {PRICING_DISCLAIMER.map((line, i) => (
                              <p key={i} className="text-[10px] text-muted-foreground leading-snug">{line}</p>
                            ))}
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
