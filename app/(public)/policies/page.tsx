'use client';

import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { FAQ } from '@/types';
import { ChevronDown } from 'lucide-react';

const policies = [
  {
    title: 'Booking & Reservations',
    content: 'All bookings are confirmed only after full payment is received. A valid government ID is required at check-in. Early check-in and late check-out are subject to availability.'
  },
  {
    title: 'Cancellation Policy',
    content: 'Free cancellation up to 48 hours before check-in. 50% charge within 48 hours. No-shows will be charged the full amount. In case of early departure, no refund will be provided.'
  },
  {
    title: 'Check-in & Check-out',
    content: 'Check-in time: 2:00 PM. Check-out time: 11:00 AM. Luggage storage is available for early arrivals and late departures.'
  },
  {
    title: 'Payment Policy',
    content: 'We accept all major credit/debit cards, UPI, and net banking via Razorpay. All prices are inclusive of applicable taxes.'
  },
  {
    title: 'Guest Conduct',
    content: 'We maintain a peaceful environment. Loud music and parties are not permitted. Quiet hours are from 10:00 PM to 7:00 AM.'
  },
  {
    title: 'Pet Policy',
    content: 'Well-behaved pets are welcome in select cottages (The Cedar Nook and Willow Cabin). Please inform us at the time of booking. Additional cleaning charges may apply.'
  },
  {
    title: 'Smoking Policy',
    content: 'Smoking is prohibited inside all cottages and indoor areas. Designated smoking areas are available.'
  },
  {
    title: 'Privacy Policy',
    content: 'We respect your privacy. Personal information collected during booking is used solely for operational purposes and is never shared with third parties without your consent.'
  },
];

export default function PoliciesPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  useEffect(() => {
    api.cms?.getFAQs?.().then((res: any) => setFaqs(res.data)).catch(() => {});
  }, []);

  return (
    <>
      <section className="pt-32 pb-20 bg-cream-50 dark:bg-earth-900">
        <div className="vintage-container">
          <ScrollReveal>
            <p className="text-clay-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Information</p>
            <TextReveal as="h1" className="section-title max-w-3xl">
              Policies & Frequently Asked Questions
            </TextReveal>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-20">
        <div className="vintage-container">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-serif text-2xl text-foreground mb-8">Hotel Policies</h2>
              <div className="space-y-4">
                {policies.map((policy, i) => (
                  <ScrollReveal key={policy.title} delay={i * 0.05}>
                    <div className="vintage-card p-6">
                      <h3 className="font-medium text-foreground mb-2">{policy.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{policy.content}</p>
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
                  { id: '2', question: 'Is breakfast included?', answer: 'A complimentary farm-style breakfast is served daily from 7:30 AM to 10:00 AM.', category: null, sortOrder: 2 },
                  { id: '3', question: 'Do you allow pets?', answer: 'Yes! Well-behaved pets are welcome in select cottages.', category: null, sortOrder: 3 },
                  { id: '4', question: 'Is there WiFi available?', answer: 'Yes, all cottages and common areas have complimentary high-speed WiFi.', category: null, sortOrder: 4 },
                  { id: '5', question: 'Is the cafe open to outside visitors?', answer: 'Absolutely! Our cafe is open to all from 7:00 AM to 9:00 PM.', category: null, sortOrder: 5 },
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
