'use client';

import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FAQ } from '@/types';
import { ChevronDown } from 'lucide-react';

const policies = [
  {
    title: 'Booking, Payment & Check-In',
    content: `
      <p class="mb-3"><strong>Guarantee Policy:</strong> A 100% advance payment (or a designated deposit specified at booking) is required to secure your stay.</p>
      <p class="mb-3"><strong>Identification:</strong> In accordance with local government regulations, all guests must present a valid government-issued photo ID (Aadhaar, Passport, or Driving License) upon check-in. Foreign nationals must present a valid Passport and Visa/e-Visa.</p>
      <p><strong>Timings:</strong> Check-In is at 2:00 PM and Check-Out is at 11:00 AM. Early check-in or late check-out is strictly subject to availability and may incur additional charges.</p>
    `
  },
  {
    title: 'Rescheduling & Date Change Policy',
    content: `
      <p class="mb-3">We understand that travel plans can shift. We offer flexibility under the following conditions:</p>
      <ul class="list-disc pl-5 mb-3 space-y-1">
        <li>One complimentary date change may be permitted if the request is made at least <strong>10 days</strong> prior to the original arrival date.</li>
        <li>All rescheduling is strictly subject to availability.</li>
        <li>If the revised dates fall into a higher price bracket (e.g., peak season, holidays, or weekend rates), the tariff difference will apply and must be cleared to secure the new dates.</li>
      </ul>
    `
  },
  {
    title: 'Cancellation Policy',
    content: `
      <p class="mb-3">Because we are an exclusive boutique property with a limited number of cottages, cancellations impact us significantly. Our cancellation policies are split by travel period:</p>

      <p class="font-semibold mb-2">A. Standard Cancellation</p>
      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead><tr class="bg-earth-100 dark:bg-earth-800"><th class="p-2 text-left border border-earth-200">Cancellation Timeline</th><th class="p-2 text-left border border-earth-200">Refund Applicable</th></tr></thead>
          <tbody>
            <tr><td class="p-2 border border-earth-200">More than 15 days before check-in</td><td class="p-2 border border-earth-200">90% refund of the total booking amount</td></tr>
            <tr><td class="p-2 border border-earth-200">8 to 15 days before check-in</td><td class="p-2 border border-earth-200">50% refund of the total booking amount</td></tr>
            <tr><td class="p-2 border border-earth-200">Less than 7 days before check-in</td><td class="p-2 border border-earth-200">No refund</td></tr>
          </tbody>
        </table>
      </div>

      <p class="font-semibold mb-2">B. Peak Season Cancellation (Christmas, New Year, long weekends, and peak public holiday periods)</p>
      <div class="overflow-x-auto mb-4">
        <table class="w-full text-sm border-collapse">
          <thead><tr class="bg-earth-100 dark:bg-earth-800"><th class="p-2 text-left border border-earth-200">Cancellation Timeline</th><th class="p-2 text-left border border-earth-200">Refund Applicable</th></tr></thead>
          <tbody>
            <tr><td class="p-2 border border-earth-200">More than 21 days before check-in</td><td class="p-2 border border-earth-200">50% refund of the total booking amount</td></tr>
            <tr><td class="p-2 border border-earth-200">Less than 21 days before check-in</td><td class="p-2 border border-earth-200">No refund</td></tr>
          </tbody>
        </table>
      </div>

      <ul class="list-disc pl-5 mb-3 space-y-1">
        <li><strong>No-Shows & Early Departures:</strong> 100% of the booking amount will be forfeited in the event of a no-show or an early check-out.</li>
        <li><strong>Processing Time:</strong> Eligible refunds will be processed within 7–14 business days.</li>
        <li><strong>Channel:</strong> Refunds will be credited back through the original payment method wherever possible.</li>
      </ul>

      <p><strong>Force Majeure:</strong> The Vedara is located in a high-altitude Himalayan terrain. In the rare event of severe weather, landslides, or official road closures that physically prevent travel, refunds are not issued. Instead, we will issue a credit voucher for a future stay (subject to availability and seasonal tariff differences).</p>
    `
  },
  {
    title: 'Smoking & Fire Safety Policy',
    content: `
      <ul class="list-disc pl-5 space-y-2">
        <li><strong>Strictly Non-Smoking Rooms:</strong> To maintain our pristine Himalayan indoor environment and ensure guest safety, all cottages are strictly non-smoking. This includes cigarettes, e-cigarettes, vapes, cigars, and sheesha/hookah.</li>
        <li><strong>Balconies & Cafe:</strong> While you can smoke in the balconies and cafe, we have designated smoking areas for wider safety.</li>
        <li><strong>Hazardous Items:</strong> Due to the timber and stone architecture of our cottages, the use of candles, incense sticks (agarbatti), personal room heaters, or cooking appliances inside the rooms is strictly prohibited.</li>
      </ul>
    `
  },
  {
    title: 'Pet Policy',
    content: `
      <p><strong>Pet-Free Property:</strong> To maintain an allergen-free environment and ensure the comfort of all visitors, The Vedara is currently a pet-free property. We are unable to accommodate pets of any size.</p>
    `
  },
  {
    title: 'Property Care & Quiet Hours',
    content: `
      <ul class="list-disc pl-5 space-y-2">
        <li><strong>Damages:</strong> Guests are liable for any physical damage caused to the cottage structures, furniture, custom linens, or decor items during their stay. Damages will be assessed by management and settled prior to check-out.</li>
        <li><strong>Quiet Hours:</strong> To honor the peaceful tranquility of the Ghiyagi valley, Quiet Hours are observed from 11:00 PM to 7:00 AM. Loud music or disruptive outdoor gatherings are prohibited during these hours.</li>
      </ul>
    `
  },
];

export default function PoliciesPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [openPolicy, setOpenPolicy] = useState<string | null>(null);

  useEffect(() => {
    api.get('/cms/faqs').then((res: any) => setFaqs(res.data)).catch(() => {});
  }, []);

  return (
    <>
      <section className="pt-32 pb-20 bg-cream-50 dark:bg-earth-900">
        <div className="vintage-container">
          <ScrollReveal>
            <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Information</p>
            <TextReveal as="h1" className="section-title max-w-3xl">
              Policies & Terms of Stay
            </TextReveal>
            <p className="text-muted-foreground text-base md:text-lg max-w-3xl mt-6 leading-relaxed">
              Thank you for choosing The Vedara. To ensure a serene, safe, and exceptional experience for all our guests, please review our house policies and terms of stay below. Confirming a reservation implies full acceptance of these terms.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-20">
        <div className="vintage-container">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-serif text-2xl text-foreground mb-8">Hotel Policies</h2>
              <div className="space-y-3">
                {policies.map((policy, i) => (
                  <ScrollReveal key={policy.title} delay={i * 0.05}>
                    <div className="vintage-card overflow-hidden">
                      <button
                        onClick={() => setOpenPolicy(openPolicy === policy.title ? null : policy.title)}
                        className="w-full p-5 flex items-center justify-between text-left"
                      >
                        <span className="font-medium text-foreground text-sm pr-4">{policy.title}</span>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${openPolicy === policy.title ? 'rotate-180' : ''}`} />
                      </button>
                      {openPolicy === policy.title && (
                        <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed space-y-2" dangerouslySetInnerHTML={{ __html: policy.content }} />
                      )}
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-foreground mb-8">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {(faqs.length > 0 ? faqs : [
                  { id: '1', question: 'What is the check-in and check-out time?', answer: 'Check-in is at 2:00 PM and check-out is at 11:00 AM.', category: null, sortOrder: 1 },
                  { id: '2', question: 'Is breakfast included?', answer: 'A complimentary farm-style breakfast is served daily from 7:30 AM to 10:00 AM at our cafe.', category: null, sortOrder: 2 },
                  { id: '3', question: 'Is there WiFi available?', answer: 'Yes, all cottages and common areas have complimentary high-speed WiFi.', category: null, sortOrder: 3 },
                  { id: '4', question: 'What payment methods do you accept?', answer: 'We accept all major credit/debit cards, UPI, and net banking via Razorpay.', category: null, sortOrder: 4 },
                  { id: '5', question: 'Is the cafe open to outside visitors?', answer: 'Absolutely! Our cafe is open to all from 7:00 AM to 9:00 PM. Non-guests are welcome.', category: null, sortOrder: 5 },
                ]).map((faq, i) => (
                  <ScrollReveal key={faq.id} delay={i * 0.05}>
                    <div className="vintage-card overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                        className="w-full p-5 flex items-center justify-between text-left"
                      >
                        <span className="font-medium text-foreground text-sm pr-4">{faq.question}</span>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${openFaq === faq.id ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaq === faq.id && (
                        <div className="px-5 pb-5">
                          <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
