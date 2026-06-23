'use client';

import { useState } from 'react';
import { BackButton } from '@/components/layout/BackButton';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { TextReveal } from '@/components/animations/TextReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { endpoints } from '@/lib/api';
import { Mail, Phone, MapPin, Clock, Send, Check } from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

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
      <section className="pt-32 pb-20 bg-[#F5F2EE]">
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

      <section className="pb-20 bg-[#F5F2EE]">
        <div className="vintage-container">
          <div className="grid lg:grid-cols-2 gap-12">
            <ScrollReveal direction="left">
              <div className="space-y-6">
                {submitted ? (
                  <div className="bg-gold-50 border border-gold-200 rounded-2xl p-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center mx-auto mb-4">
                      <Check className="w-6 h-6 text-gold-600" />
                    </div>
                    <h3 className="font-serif text-xl text-[#1C2B3A] mb-2">Message Sent!</h3>
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
                      <PhoneInput
                        country="in"
                        value={form.phone}
                        onChange={(phone) => setForm({ ...form, phone })}
                        inputProps={{ className: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2' }}
                        containerClass="!w-full"
                        inputClass="!w-full !h-10 !text-sm"
                        buttonClass="!border-input !bg-background"
                      />
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
              <div className="space-y-5">
                <div className="glass-card-light rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#1C2B3A]">Email</h3>
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
                      <h3 className="font-medium text-[#1C2B3A]">Phone</h3>
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
                      <h3 className="font-medium text-[#1C2B3A]">Address</h3>
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
                      <h3 className="font-medium text-[#1C2B3A]">Reception Hours</h3>
                      <p className="text-muted-foreground text-sm">Daily: 7:30 AM – 10:00 PM</p>
                      <h3 className="font-medium text-[#1C2B3A] mt-2">Café Charade</h3>
                      <p className="text-muted-foreground text-sm">Breakfast: 7:30 AM – 10:00 AM</p>
                      <p className="text-muted-foreground text-sm">Lunch: 12:00 PM – 3:30 PM</p>
                      <p className="text-muted-foreground text-sm">Dinner: 7:00 PM – 10:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <ScrollReveal>
        <section className="px-4 pb-16">
          <div className="vintage-container">
            <div className="text-center mb-8">
              <p className="text-primary text-sm tracking-[0.2em] uppercase mb-3 font-sans">Find Us</p>
              <h2 className="font-serif text-2xl md:text-3xl text-foreground">Our Location</h2>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg border border-border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3360.5!2d77.3!3d31.55!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sGhiyagi%2C+Jibhi%2C+Himachal+Pradesh!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="The Vedara – Ghiyagi, Jibhi, Himachal Pradesh"
              />
            </div>
          </div>
        </section>
      </ScrollReveal>
    </>
  );
}
