'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { endpoints } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Namaste! I\'m Vedara\'s mountain concierge. Ask me about our cottages, café, or anything about your stay.' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
      const res = await endpoints.chatbot.chat(userMessage, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I\'m having trouble connecting. You can call us at +91-91188-82242 or message us on WhatsApp.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (text: string) => {
    if (text === 'Live Support') {
      window.open('https://wa.me/919118882242?text=Hello%20Vedara%2C%20I%20need%20assistance', '_blank');
      return;
    }
    setInput(text);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-forest-600 text-cream-50 shadow-lg hover:bg-forest-700 transition-all hover:scale-105 flex items-center justify-center"
        aria-label="Open chatbot"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <a
        href="https://wa.me/919118882242"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-24 z-40 w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600 transition-all hover:scale-105 flex items-center justify-center"
        title="Chat on WhatsApp"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon className="w-7 h-7" />
      </a>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-6 z-50 w-80 sm:w-96 h-[500px] bg-cream-50 dark:bg-earth-800 rounded-2xl shadow-2xl border border-earth-200 dark:border-earth-700 flex flex-col overflow-hidden"
          >
            <div className="bg-forest-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-cream-100" />
                <span className="font-serif text-cream-50 font-semibold">Mountain Concierge</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-cream-100 hover:text-cream-50 transition-transform hover:rotate-90 p-1"
                aria-label="Close chatbot"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-forest-700/10 px-4 py-2 flex gap-2 overflow-x-auto">
              <button onClick={() => handleQuickAction('Show me cottages')} className="text-xs bg-white dark:bg-earth-700 px-3 py-1.5 rounded-full whitespace-nowrap border border-earth-200 dark:border-earth-600 text-earth-700 dark:text-cream-200 hover:bg-forest-600 hover:text-cream-50 hover:border-forest-600 transition-colors">
                Cottages
              </button>
              <button onClick={() => handleQuickAction('Café menu')} className="text-xs bg-white dark:bg-earth-700 px-3 py-1.5 rounded-full whitespace-nowrap border border-earth-200 dark:border-earth-600 text-earth-700 dark:text-cream-200 hover:bg-forest-600 hover:text-cream-50 hover:border-forest-600 transition-colors">
                Café Menu
              </button>
              <button onClick={() => handleQuickAction('Booking info')} className="text-xs bg-white dark:bg-earth-700 px-3 py-1.5 rounded-full whitespace-nowrap border border-earth-200 dark:border-earth-600 text-earth-700 dark:text-cream-200 hover:bg-forest-600 hover:text-cream-50 hover:border-forest-600 transition-colors">
                Booking
              </button>
              <button onClick={() => handleQuickAction('Live Support')} className="text-xs bg-white dark:bg-earth-700 px-3 py-1.5 rounded-full whitespace-nowrap border border-earth-200 dark:border-earth-600 text-earth-700 dark:text-cream-200 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors">
                Live Support
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.role === 'user'
                        ? 'bg-forest-600 text-cream-50 rounded-br-sm'
                        : 'bg-earth-100 dark:bg-earth-700 text-earth-800 dark:text-cream-200 rounded-bl-sm'
                    }`}
                  >
                    {msg.role === 'assistant' ? <p className="leading-relaxed whitespace-pre-line">{msg.content}</p> : <p className="leading-relaxed">{msg.content}</p>}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-earth-100 dark:bg-earth-700 rounded-2xl rounded-bl-sm px-4 py-2.5">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-earth-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-earth-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-earth-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t border-earth-200 dark:border-earth-700">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask me anything..."
                  className="flex-1 rounded-xl border border-earth-200 dark:border-earth-600 bg-white dark:bg-earth-700 px-3 py-2 text-sm text-earth-900 dark:text-cream-100 placeholder:text-earth-400 focus:outline-none focus:border-forest-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-xl bg-forest-600 text-cream-50 hover:bg-forest-700 disabled:opacity-50 transition-colors"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
