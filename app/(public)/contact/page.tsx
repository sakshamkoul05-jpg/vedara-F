'use client';

import { useState } from 'react';
import { BackButton } from '@/components/layout/BackButton';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { endpoints } from '@/lib/api';
import { Mail, Phone, MapPin, Clock, Send, Check } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await endpoints.contact.submit(form);
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="pt-32 pb-20 bg-alabaster">
        <div className="vintage-container">
          <BackButton />
          <ScrollReveal>
            <p className="text-gold-500 text-sm tracking-[0.2em] uppercase mb-4 font-sans">Get in Touch</p>
            <TextReveal as="h1" className="section-title max-w-3xl">
              We Would Love to Hear From You
            </TextReveal>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-20 bg-alabaster">
        <div className="vintage-container">
          <div className="grid lg:grid-cols-2 gap-12">
            <ScrollReveal direction="left">
              <div className="space-y-6">
                {submitted ? (
                  <div className="bg-gold-50 border border-gold-200 rounded-2xl p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-6 h-6 text-gold-600" />
                    </div>
                    <h3 className="font-serif text-xl text-vedara-900 mb-2">Message Sent!</h3>
                    <p className="text-charcoal/60 text-sm">We will get back to you soon.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="vintage-label">Name *</label>
                        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                      </div>
                      <div>
                        <label className="vintage-label">Email *</label>
                        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                      </div>
                    </div>
                    <div>
                      <label className="vintage-label">Phone</label>
                      <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div>
                      <label className="vintage-label">Subject *</label>
                      <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
                    </div>
                    <div>
                      <label className="vintage-label">Message *</label>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        required
                        rows={5}
                        className="vintage-input resize-none"
                      />
                    </div>
                    <Button variant="primary" size="lg" type="submit" disabled={loading} className="w-full">
                      {loading ? 'Sending...' : 'Send Message'} <Send className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2}>
              <div className="space-y-6">
                <div className="vintage-card p-6">
                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-gold-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-vedara-900">Email</h3>
                      <a href="mailto:vedararetreat@gmail.com" className="text-charcoal/60 text-sm hover:text-gold-600 transition-colors duration-500">vedararetreat@gmail.com</a>
                    </div>
                  </div>
                </div>
                <div className="vintage-card p-6">
                  <div className="flex items-start gap-4">
                    <Phone className="w-5 h-5 text-gold-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-vedara-900">Phone</h3>
                      <a href="tel:+919118882242" className="text-charcoal/60 text-sm hover:text-gold-600 transition-colors duration-500">+91-91188-82242</a>
                    </div>
                  </div>
                </div>
                <div className="vintage-card p-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-gold-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-vedara-900">Address</h3>
                      <p className="text-charcoal/60 text-sm">Ghiyagi, Jibhi, Himachal Pradesh \u2013 175123</p>
                    </div>
                  </div>
                </div>
                <div className="vintage-card p-6">
                  <div className="flex items-start gap-4">
                    <Clock className="w-5 h-5 text-gold-500 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-vedara-900">Reception Hours</h3>
                      <p className="text-charcoal/60 text-sm">Daily: 8:00 AM \u2013 11:00 PM</p>
                      <h3 className="font-medium text-vedara-900 mt-2">Caf\u00e9 Charade</h3>
                      <p className="text-charcoal/60 text-sm">Breakfast: 7:30 AM \u2013 10:00 AM</p>
                      <p className="text-charcoal/60 text-sm">Lunch: 12:00 PM \u2013 3:30 PM</p>
                      <p className="text-charcoal/60 text-sm">Dinner: 7:00 PM \u2013 10:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
