'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { endpoints } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Namaste! I am Vedara\'s mountain concierge. How can I help you today? Ask me about our cottages, cafe, or anything about your stay.' },
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
        { role: 'assistant', content: 'I apologize, I am having trouble connecting. Please try again or contact our team directly.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (text: string) => {
    setInput(text);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-forest-600 text-cream-50 shadow-lg hover:bg-forest-700 transition-all hover:scale-105 flex items-center justify-center"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <a
        href="https://wa.me/919118882242"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-20 z-40 w-14 h-14 rounded-full bg-emerald-500 text-cream-50 shadow-lg hover:bg-emerald-600 transition-all hover:scale-105 flex items-center justify-center"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-6 z-40 w-80 sm:w-96 h-[500px] bg-cream-50 dark:bg-earth-800 rounded-2xl shadow-2xl border border-earth-200 dark:border-earth-700 flex flex-col overflow-hidden"
          >
            <div className="bg-forest-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-cream-100" />
                <span className="font-serif text-cream-50 font-semibold">Mountain Concierge</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-cream-100 hover:text-cream-50 transition-transform hover:rotate-90">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-forest-700/10 px-4 py-2 flex gap-2 overflow-x-auto">
              <button onClick={() => handleQuickAction('Show me cottages')} className="text-xs bg-white dark:bg-earth-700 px-3 py-1.5 rounded-full whitespace-nowrap border border-earth-200 dark:border-earth-600 text-earth-700 dark:text-cream-200 hover:bg-forest-600 hover:text-cream-50 hover:border-forest-600 transition-colors">
                Cottages
              </button>
              <button onClick={() => handleQuickAction('Cafe menu')} className="text-xs bg-white dark:bg-earth-700 px-3 py-1.5 rounded-full whitespace-nowrap border border-earth-200 dark:border-earth-600 text-earth-700 dark:text-cream-200 hover:bg-forest-600 hover:text-cream-50 hover:border-forest-600 transition-colors">
                Café Menu
              </button>
              <button onClick={() => handleQuickAction('Booking info')} className="text-xs bg-white dark:bg-earth-700 px-3 py-1.5 rounded-full whitespace-nowrap border border-earth-200 dark:border-earth-600 text-earth-700 dark:text-cream-200 hover:bg-forest-600 hover:text-cream-50 hover:border-forest-600 transition-colors">
                Booking
              </button>
              <button onClick={() => handleQuickAction('Talk to a human')} className="text-xs bg-white dark:bg-earth-700 px-3 py-1.5 rounded-full whitespace-nowrap border border-earth-200 dark:border-earth-600 text-earth-700 dark:text-cream-200 hover:bg-forest-600 hover:text-cream-50 hover:border-forest-600 transition-colors">
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
                    <div className="flex items-center gap-1.5 mb-1">
                      {msg.role === 'assistant' ? (
                        <Bot className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      <span className="text-xs opacity-70">
                        {msg.role === 'assistant' ? 'Vedara AI' : 'You'}
                      </span>
                    </div>
                    <p className="leading-relaxed">{msg.content}</p>
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
