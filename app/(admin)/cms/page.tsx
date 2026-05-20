'use client';

import { useState, useEffect } from 'react';
import { ScrollReveal } from '@/components/animations/ScrollReveal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function CMSPage() {
  const { token } = useAuthStore();
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      api.get('/cms/settings', token).catch(() => ({ data: {} })),
      api.get('/cms/faqs', token).catch(() => ({ data: [] })),
    ]).then(([settingsRes, faqsRes]) => {
      setSettings(settingsRes.data || {});
      setFaqs(faqsRes.data || []);
      setLoading(false);
    });
  }, [token]);

  const handleSaveSetting = async (key: string, value: any) => {
    setSaving(true);
    try {
      await api.put('/cms/settings', { key, value }, token);
      setSettings({ ...settings, [key]: value });
    } catch (err) {
      alert('Failed to save setting');
    } finally {
      setSaving(false);
    }
  };

  const handleAddFAQ = async () => {
    if (!newFAQ.question || !newFAQ.answer) return;
    try {
      await api.post('/cms/faqs', newFAQ, token);
      setNewFAQ({ question: '', answer: '' });
      const res = await api.get('/cms/faqs', token);
      setFaqs(res.data);
    } catch {
      alert('Failed to add FAQ');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-earth-900 pt-20">
        <div className="vintage-container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-earth-200 rounded w-1/3" />
            <div className="h-32 bg-earth-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-earth-900 pt-20">
      <div className="vintage-container py-8">
        <h1 className="font-serif text-3xl text-foreground mb-8">CMS Settings</h1>

        <div className="space-y-8">
          <ScrollReveal>
            <div className="vintage-card p-6">
              <h2 className="font-serif text-xl text-foreground mb-6">Site Information</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {['siteName', 'siteDescription', 'contactEmail', 'contactPhone', 'address'].map((field) => (
                  <div key={field}>
                    <label className="vintage-label capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                    <div className="flex gap-2">
                      <Input
                        value={settings[field] || ''}
                        onChange={(e) => setSettings({ ...settings, [field]: e.target.value })}
                      />
                      <Button variant="primary" size="sm" onClick={() => handleSaveSetting(field, settings[field])}>
                        <Save className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="vintage-card p-6">
              <h2 className="font-serif text-xl text-foreground mb-6">FAQs</h2>
              <div className="space-y-4 mb-6">
                {faqs.map((faq, i) => (
                  <div key={faq.id} className="bg-earth-50 dark:bg-earth-800 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-foreground text-sm">{faq.question}</p>
                        <p className="text-muted-foreground text-xs mt-1">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Add New FAQ</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  <Input
                    value={newFAQ.question}
                    onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                    placeholder="Question"
                  />
                  <Input
                    value={newFAQ.answer}
                    onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                    placeholder="Answer"
                  />
                  <Button variant="primary" onClick={handleAddFAQ}>
                    <Plus className="w-4 h-4 mr-2" /> Add FAQ
                  </Button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
