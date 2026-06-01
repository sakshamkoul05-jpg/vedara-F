'use client';

import { useState, useEffect } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { BackButton } from '@/components/layout/BackButton';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { api } from '@/lib/api';
import { FormattedText } from '@/components/ui/formatted-text';
import { FAQ } from '@/types';

const policySections = [
  {
    value: 'cancellation',
    title: 'Cancellation Policy',
    content: (
      <div className="space-y-4 text-sm leading-relaxed">
        <p className="text-muted-foreground">Because we are an exclusive boutique property with a limited number of cottages, cancellations impact us significantly. Our cancellation policies are split by travel period:</p>
        <div>
          <p className="font-semibold text-foreground mb-2">A. Standard Cancellation</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-earth-100 dark:bg-earth-800">
                  <th className="p-2.5 text-left border border-border text-muted-foreground font-medium">Cancellation Timeline</th>
                  <th className="p-2.5 text-left border border-border text-muted-foreground font-medium">Refund Applicable</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="p-2.5 border border-border text-muted-foreground">More than 15 days before check-in</td><td className="p-2.5 border border-border text-muted-foreground">90% refund of the total booking amount</td></tr>
                <tr><td className="p-2.5 border border-border text-muted-foreground">8 to 15 days before check-in</td><td className="p-2.5 border border-border text-muted-foreground">50% refund of the total booking amount</td></tr>
                <tr><td className="p-2.5 border border-border text-muted-foreground">Less than 7 days before check-in</td><td className="p-2.5 border border-border text-muted-foreground">No refund</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <p className="font-semibold text-foreground mb-2">B. Peak Season Cancellation (Christmas, New Year, long weekends, and peak public holiday periods)</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-earth-100 dark:bg-earth-800">
                  <th className="p-2.5 text-left border border-border text-muted-foreground font-medium">Cancellation Timeline</th>
                  <th className="p-2.5 text-left border border-border text-muted-foreground font-medium">Refund Applicable</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="p-2.5 border border-border text-muted-foreground">More than 21 days before check-in</td><td className="p-2.5 border border-border text-muted-foreground">50% refund of the total booking amount</td></tr>
                <tr><td className="p-2.5 border border-border text-muted-foreground">Less than 21 days before check-in</td><td className="p-2.5 border border-border text-muted-foreground">No refund</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          <li><strong className="text-foreground">No-Shows & Early Departures:</strong> 100% of the booking amount will be forfeited in the event of a no-show or an early check-out.</li>
          <li><strong className="text-foreground">Processing Time:</strong> Eligible refunds will be processed within 7–14 business days.</li>
          <li><strong className="text-foreground">Channel:</strong> Refunds will be credited back through the original payment method wherever possible.</li>
        </ul>
        <p className="text-muted-foreground"><strong className="text-foreground">Force Majeure:</strong> The Vedara is located in a high-altitude Himalayan terrain. In the rare event of severe weather, landslides, or official road closures that physically prevent travel, refunds are not issued. Instead, we will issue a credit voucher for a future stay (subject to availability and seasonal tariff differences).</p>
      </div>
    ),
  },
  {
    value: 'rescheduling',
    title: 'Rescheduling & Date Change Policy',
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p>We understand that travel plans can shift. We offer flexibility under the following conditions:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>One complimentary date change may be permitted if the request is made at least <strong className="text-foreground">10 days</strong> prior to the original arrival date.</li>
          <li>All rescheduling is strictly subject to availability.</li>
          <li>If the revised dates fall into a higher price bracket (e.g., peak season, holidays, or weekend rates), the tariff difference will apply and must be cleared to secure the new dates.</li>
        </ul>
      </div>
    ),
  },
  {
    value: 'checkin-checkout',
    title: 'Check-in / Check-out',
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p><strong className="text-foreground">Check-In Time:</strong> 1:00 PM</p>
        <p><strong className="text-foreground">Check-Out Time:</strong> 11:00 AM</p>
        <p>Early check-in or late check-out is strictly subject to availability and may incur additional charges. Please inform us at least 24 hours in advance if you require an adjusted schedule.</p>
        <p><strong className="text-foreground">Identification:</strong> In accordance with local government regulations, all guests must present a valid government-issued photo ID (Aadhaar, Passport, or Driving License) upon check-in. Foreign nationals must present a valid Passport and Visa/e-Visa.</p>
      </div>
    ),
  },
  {
    value: 'payment',
    title: 'Payment Terms',
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p><strong className="text-foreground">Guarantee Policy:</strong> A 100% advance payment (or a designated deposit specified at booking) is required to secure your stay.</p>
        <p><strong className="text-foreground">Accepted Methods:</strong> We accept all major credit/debit cards, UPI, and net banking via Razorpay.</p>
        <p><strong className="text-foreground">Currency:</strong> All transactions are processed in Indian Rupees (INR).</p>
        <p><strong className="text-foreground">GST:</strong> Applicable taxes will be added as per government regulations.</p>
      </div>
    ),
  },
  {
    value: 'conduct',
    title: 'Guest Conduct',
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p><strong className="text-foreground">Quiet Hours:</strong> To honor the peaceful tranquility of the Ghiyagi valley, Quiet Hours are observed from 11:00 PM to 7:00 AM. Loud music or disruptive outdoor gatherings are prohibited during these hours.</p>
        <p><strong className="text-foreground">Damages:</strong> Guests are liable for any physical damage caused to the cottage structures, furniture, custom linens, or decor items during their stay. Damages will be assessed by management and settled prior to check-out.</p>
        <p><strong className="text-foreground">Visitors:</strong> Only registered guests are permitted on the property. Day visitors are not allowed without prior management approval.</p>
        <p><strong className="text-foreground">Environment:</strong> Please help us preserve the natural beauty of our surroundings. Dispose of waste responsibly and avoid disturbing local wildlife.</p>
      </div>
    ),
  },
  {
    value: 'privacy',
    title: 'Privacy Policy',
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                    <p>At The Vedara Retreat, we are committed to protecting your privacy. Any personal information collected during booking – including name, contact details, and payment information – is used solely for the purpose of facilitating your stay and improving our services.</p>
        <p><strong className="text-foreground">Data Security:</strong> We implement reasonable security measures to protect your information. Payment processing is handled securely through Razorpay.</p>
        <p><strong className="text-foreground">Information Sharing:</strong> We do not sell, trade, or share your personal information with third parties except as required by law or with your explicit consent.</p>
        <p><strong className="text-foreground">Photography:</strong> We may capture photographs during your stay for promotional purposes. Please inform us at check-in if you prefer not to be photographed.</p>
      </div>
    ),
  },
  {
    value: 'smoking-pets',
    title: 'Smoking & Pets',
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        <p><strong className="text-foreground">Strictly Non-Smoking Rooms:</strong> To maintain our pristine Himalayan indoor environment and ensure guest safety, all cottages are strictly non-smoking. This includes cigarettes, e-cigarettes, vapes, cigars, and sheesha/hookah.</p>
        <p><strong className="text-foreground">Balconies & Cafe:</strong> While you can smoke in the balconies and cafe, we have designated smoking areas for wider safety.</p>
        <p><strong className="text-foreground">Hazardous Items:</strong> Due to the timber and stone architecture of our cottages, the use of candles, incense sticks (agarbatti), personal room heaters, or cooking appliances inside the rooms is strictly prohibited.</p>
        <p><strong className="text-foreground">Pet Policy:</strong> To maintain an allergen-free environment and ensure the comfort of all visitors, The Vedara is currently a pet-free property. We are unable to accommodate pets of any size.</p>
      </div>
    ),
  },
  {
    value: 'safety',
    title: 'Safety & Liability',
    content: (
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                        <p><strong className="text-foreground">Mountain Terrain:</strong> The Vedara is located in a high-altitude Himalayan terrain. Guests are advised to exercise caution while navigating uneven paths, stairs, and natural surfaces around the property.</p>
        <p><strong className="text-foreground">Weather:</strong> Mountain weather can be unpredictable. Please carry appropriate clothing and footwear. Management reserves the right to restrict outdoor activities during severe weather.</p>
                        <p><strong className="text-foreground">Liability:</strong> The Vedara Retreat is not liable for any loss, injury, or damage to personal property during your stay. We recommend guests obtain appropriate travel insurance.</p>
        <p><strong className="text-foreground">Emergency:</strong> A first-aid kit is available at the reception. In case of medical emergencies, the nearest healthcare facility is approximately 20 km away.</p>
      </div>
    ),
  },
];

export default function PoliciesPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [policyValue, setPolicyValue] = useState<string | undefined>(undefined);

  useEffect(() => {
    api.get('/cms/faqs').then((res: any) => setFaqs(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash && policySections.some(s => s.value === hash)) {
      setPolicyValue(hash);
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, []);

  const displayFaqs = faqs.length > 0 ? faqs : [
    { id: '1', question: 'What is the check-in and check-out time?', answer: 'Check-in is at 2:00 PM and check-out is at 11:00 AM.', category: null, sortOrder: 1 },
    { id: '2', question: 'Is breakfast included?', answer: 'A complimentary farm-style breakfast is served daily from 7:30 AM to 10:00 AM at our cafe.', category: null, sortOrder: 2 },
    { id: '3', question: 'Is there WiFi available?', answer: 'Yes, all cottages and common areas have complimentary high-speed WiFi.', category: null, sortOrder: 3 },
    { id: '4', question: 'What payment methods do you accept?', answer: 'We accept all major credit/debit cards, UPI, and net banking via Razorpay.', category: null, sortOrder: 4 },
    { id: '5', question: 'Is the cafe open to outside visitors?', answer: 'Absolutely! Our cafe is open to all from 7:00 AM to 9:00 PM. Non-guests are welcome.', category: null, sortOrder: 5 },
    { id: '6', question: 'Can I modify or cancel my booking?', answer: 'Yes, subject to our cancellation policy. Please refer to the <a href="/policies#cancellation" class="text-forest-600 dark:text-forest-400 underline hover:no-underline">Cancellation Policy section</a> for detailed terms.', category: null, sortOrder: 6 },
  ];

  return (
    <>
      <section className="pt-32 pb-20 bg-cream-50 dark:bg-earth-900">
        <div className="vintage-container">
          <BackButton />
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
              <h2 id="policies" className="font-serif text-2xl text-foreground mb-8">Hotel Policies</h2>
              <Accordion.Root type="single" collapsible value={policyValue} onValueChange={setPolicyValue} className="space-y-3">
                {policySections.map((section, i) => (
                  <ScrollReveal key={section.value} delay={i * 0.05}>
                    <Accordion.Item value={section.value} className="vintage-card overflow-hidden" id={section.value}>
                      <Accordion.Header className="flex">
                        <Accordion.Trigger className="w-full p-5 flex items-center justify-between text-left group">
                          <span className="font-medium text-foreground text-sm pr-4">{section.title}</span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                        </Accordion.Trigger>
                      </Accordion.Header>
                      <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                        <div className="px-5 pb-5">
                          {section.content}
                        </div>
                      </Accordion.Content>
                    </Accordion.Item>
                  </ScrollReveal>
                ))}
              </Accordion.Root>
            </div>

            <div id="faqs">
              <h2 className="font-serif text-2xl text-foreground mb-8">Frequently Asked Questions</h2>
              <Accordion.Root type="single" collapsible className="space-y-3">
                {displayFaqs.map((faq, i) => (
                  <ScrollReveal key={faq.id} delay={i * 0.05}>
                    <Accordion.Item value={faq.id} className="vintage-card overflow-hidden">
                      <Accordion.Header className="flex">
                        <Accordion.Trigger className="w-full p-5 flex items-center justify-between text-left group">
                          <span className="flex items-center gap-3 font-medium text-foreground text-sm pr-4">
                            <HelpCircle className="w-4 h-4 text-clay-400 flex-shrink-0" />
                            {faq.question}
                          </span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                        </Accordion.Trigger>
                      </Accordion.Header>
                      <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
                        <div className="px-5 pb-5">
                          <FormattedText text={faq.answer} />
                        </div>
                      </Accordion.Content>
                    </Accordion.Item>
                  </ScrollReveal>
                ))}
              </Accordion.Root>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
