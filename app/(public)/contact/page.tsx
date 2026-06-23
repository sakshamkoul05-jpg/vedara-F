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
      <section className="pt-32 pb-20 bg-background">
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

      <section className="pb-20 bg-background">
        <div className="vintage-container">
          <div className="grid lg:grid-cols-2 gap-12">
            <ScrollReveal direction="left">
              <article className="space-y-6">
                {submitted ? (
                  <div className="bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-2xl p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-gold-100 dark:bg-gold-800 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-6 h-6 text-gold-600 dark:text-gold-400" />
                    </div>
                    <h3 className="font-serif text-xl text-foreground mb-2">Message Sent!</h3>
                    <p className="text-muted-foreground text-sm">We will get back to you soon.</p>
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
                      <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d+\-\s]/g, '') })} placeholder="+91 99999 99999" />
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
              </article>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.2}>
              <aside className="space-y-5">
                <div className="glass-card-light rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Email</h3>
                      <a href="mailto:vedararetreat@gmail.com" className="text-muted-foreground text-sm hover:text-gold-600 transition-colors duration-500">vedararetreat@gmail.com</a>
                    </div>
                  </div>
                </div>
                <div className="glass-card-light rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Phone</h3>
                      <a href="tel:+919118882242" className="text-muted-foreground text-sm hover:text-gold-600 transition-colors duration-500">+91-91188-82242</a>
                    </div>
                  </div>
                </div>
                <div className="glass-card-light rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Address</h3>
                      <p className="text-muted-foreground text-sm">Ghiyagi, Jibhi, Himachal Pradesh – 175123</p>
                    </div>
                  </div>
                </div>
                <div className="glass-card-light rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">Reception Hours</h3>
                      <p className="text-muted-foreground text-sm">Daily: 8:00 AM – 11:00 PM</p>
                      <h3 className="font-medium text-foreground mt-2">Café Charade</h3>
                      <p className="text-muted-foreground text-sm">Breakfast: 7:30 AM – 10:00 AM</p>
                      <p className="text-muted-foreground text-sm">Lunch: 12:00 PM – 3:30 PM</p>
                      <p className="text-muted-foreground text-sm">Dinner: 7:00 PM – 10:00 PM</p>
                    </div>
                  </div>
                </div>
              </aside>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
